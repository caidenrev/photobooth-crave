export type LdrMessageType =
  | "PEER_JOIN"
  | "PEER_READY"
  | "SYNC_SHUTTER"
  | "SYNC_FRAME_THEME"
  | "SYNC_PHOTO"
  | "PAYMENT_SUCCESS"
  | "PEER_LEAVE";

export interface LdrMessage {
  type: LdrMessageType;
  senderId: string;
  senderName: string;
  payload?: any;
  timestamp: number;
}

export type LdrMessageListener = (msg: LdrMessage) => void;

class LdrSignalingService {
  private channel: BroadcastChannel | null = null;
  private roomId: string | null = null;
  private userId: string;
  private userName: string;
  private listeners: Set<LdrMessageListener> = new Set();
  private simulatedPartnerTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.userId = "user_" + Math.random().toString(36).substring(2, 8);
    this.userName = "Kamu";
  }

  public initRoom(roomId: string, userName: string = "Kamu"): void {
    if (this.channel) {
      this.channel.close();
    }

    this.roomId = roomId;
    this.userName = userName;

    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      this.channel = new BroadcastChannel(`snapbond_ldr_${roomId}`);
      this.channel.onmessage = (event: MessageEvent<LdrMessage>) => {
        const msg = event.data;
        if (msg.senderId !== this.userId) {
          this.notifyListeners(msg);
        }
      };

      // Broadcast self join
      this.broadcastMessage("PEER_JOIN", { name: this.userName });
    }
  }

  public subscribe(listener: LdrMessageListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(msg: LdrMessage): void {
    this.listeners.forEach((listener) => {
      try {
        listener(msg);
      } catch (err) {
        console.error("Error in LDR listener:", err);
      }
    });
  }

  public broadcastMessage(type: LdrMessageType, payload?: any): void {
    const message: LdrMessage = {
      type,
      senderId: this.userId,
      senderName: this.userName,
      payload,
      timestamp: Date.now(),
    };

    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (err) {
        console.warn("BroadcastChannel error:", err);
      }
    }
  }

  // Trigger countdown sync on both devices
  public triggerSyncShutter(slotIndex: number): void {
    this.broadcastMessage("SYNC_SHUTTER", { slotIndex });
  }

  // Sync selected frame theme across room
  public syncFrameTheme(themeId: string): void {
    this.broadcastMessage("SYNC_FRAME_THEME", { themeId });
  }

  // Send captured photo to partner
  public sendCapturedPhoto(slotIndex: number, photoDataUrl: string): void {
    this.broadcastMessage("SYNC_PHOTO", { slotIndex, photoDataUrl });
  }

  // Simulated Mock Partner (For single-device testing)
  public simulatePartnerConnection(partnerName: string = "Pasangan Kamu"): void {
    // Notify local listeners that mock partner has joined
    setTimeout(() => {
      this.notifyListeners({
        type: "PEER_JOIN",
        senderId: "mock_partner_99",
        senderName: partnerName,
        payload: { simulated: true },
        timestamp: Date.now(),
      });
    }, 200);
  }

  public disconnect(): void {
    if (this.simulatedPartnerTimer) {
      clearTimeout(this.simulatedPartnerTimer);
    }
    this.broadcastMessage("PEER_LEAVE");
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners.clear();
  }
}

export const ldrSignaling = new LdrSignalingService();
export const ldrSignalingService = ldrSignaling;

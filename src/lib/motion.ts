/**
 * Dipasang di <head>: tahan animasi masuk sejak HTML pertama dirender agar konten
 * di bawah layar belum "habis" beranimasi sebelum hydration. Jika MotionObserver
 * tidak berjalan dalam 3 detik, semua konten dilepas agar tidak tersembunyi.
 */
export const MOTION_BOOT_SCRIPT = `(function(){var d=document.documentElement;d.classList.add("sb-motion");setTimeout(function(){if(!d.classList.contains("sb-motion-ready"))d.classList.remove("sb-motion")},3000)})();`;

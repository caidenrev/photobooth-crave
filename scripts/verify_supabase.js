// Script untuk verifikasi koneksi Supabase & Storage
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Baca .env.local
const envPath = path.join(__dirname, '..', '.env.local');
let env = {};
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      env[match[1]] = (match[2] || '').trim();
    }
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('=== SNAPBONED SUPABASE HEALTH CHECK ===');

if (!supabaseUrl || !supabaseKey) {
  console.log('STATUS: SUPABASE ENVIRONMENT VARIABLES EMPTY');
  console.log('Aplikasi saat ini berjalan dengan High-Speed Local Persistence Fallback (.data/payments.json).');
  console.log('Untuk mengaktifkan Supabase:');
  console.log('1. Buka Supabase Dashboard -> SQL Editor');
  console.log('2. Jalankan seluruh query di file: supabase_schema.sql');
  console.log('3. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local');
  process.exit(0);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log(`Menghubungkan ke: ${supabaseUrl}...`);
    const { data, error } = await supabase.from('frames').select('count', { count: 'exact' });
    if (error) {
      console.error('Koneksi Gagal:', error.message);
    } else {
      console.log('Koneksi Database Berhasil! Jumlah frames terdaftar:', data);
    }

    // Check buckets
    const { data: buckets, error: bError } = await supabase.storage.listBuckets();
    if (bError) {
      console.error('Koneksi Storage Gagal:', bError.message);
    } else {
      console.log('Buckets ditemukan:', buckets.map(b => b.name));
    }
  } catch (err) {
    console.error('Error pengujian:', err.message);
  }
}

testConnection();

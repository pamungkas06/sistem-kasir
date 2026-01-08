# Sistem Kasir Web dengan MySQL

Aplikasi kasir berbasis web yang mobile-friendly dengan database MySQL untuk penyimpanan data transaksi.

## Fitur

- ✅ **Mobile-Friendly**: Desain responsif yang mudah digunakan di smartphone
- ✅ **Pilih Menu**: Interface sederhana untuk memilih menu dan menghitung total
- ✅ **Database MySQL**: Semua transaksi disimpan di database MySQL
- ✅ **Print Nota Thermal**: Print nota dengan lebar 8cm untuk printer thermal Bluetooth
- ✅ **Laporan Bulanan**: Lihat total pemasukan per bulan dengan detail transaksi
- ✅ **Lihat & Print Nota**: Lihat dan print ulang nota dari halaman laporan
- ✅ **Export Excel**: Export data laporan bulanan ke Excel untuk analisis lebih lanjut

## Teknologi

- **Backend**: Node.js + Express
- **Database**: MySQL
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Library**: SheetJS (xlsx.js) untuk export Excel

## Instalasi

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Database

**Untuk Laragon:**
- Lihat panduan lengkap di `SETUP_LARAGON.md`
- Default Laragon MySQL: username `root`, password biasanya kosong

**Untuk XAMPP/WAMP/MySQL Standalone:**
1. Pastikan MySQL sudah terinstall dan berjalan
2. Buat file `.env` di root folder:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=kasir_db
   PORT=3000
   ```
3. Sesuaikan konfigurasi database sesuai setup MySQL Anda

### 3. Jalankan Server

```bash
npm start
```

Atau untuk development mode:
```bash
npm run dev
```

### 4. Akses Aplikasi

Buka browser dan akses:
- **Kasir**: http://localhost:3000
- **Laporan**: http://localhost:3000/laporan.html

## Cara Menggunakan

1. **Pengaturan Awal**
   - Klik tombol ⚙️ di pojok kanan bawah
   - Isi nama toko, alamat, dan nomor telepon
   - Klik "Simpan Pengaturan"

2. **Menggunakan Kasir**
   - Pilih menu yang ingin dibeli dengan mengetuk item menu
   - Item akan masuk ke keranjang
   - Gunakan tombol +/- untuk mengubah jumlah
   - Klik "Bayar & Print" untuk menyelesaikan transaksi dan print nota

3. **Print Nota**
   - Setelah klik "Bayar & Print", nota akan otomatis muncul untuk print
   - Pastikan printer thermal sudah terhubung via Bluetooth di HP
   - Pilih printer thermal saat dialog print muncul
   - Nota akan dicetak dengan lebar 8cm
   - Transaksi otomatis tersimpan ke database MySQL

4. **Laporan Bulanan**
   - Klik tombol 📊 untuk membuka halaman laporan
   - Pilih bulan dan tahun, lalu klik "Lihat Laporan"
   - Lihat total pemasukan dan detail semua transaksi
   - Klik "Lihat Nota" untuk melihat nota transaksi
   - Klik "Print Nota" untuk print ulang nota
   - Klik "Export ke Excel" untuk export data ke Excel

## Menambah/Mengubah Menu

Edit file `public/menu-data.js` untuk menambah atau mengubah menu:

```javascript
const menuData = [
    { id: 1, name: 'Nasi Goreng', price: 15000 },
    { id: 2, name: 'Mie Goreng', price: 12000 },
    // Tambahkan menu lain di sini
];
```

## Database Schema

Aplikasi akan otomatis membuat database dan tabel:

- **settings**: Pengaturan toko
- **transactions**: Data transaksi
- **transaction_items**: Detail item per transaksi

## API Endpoints

- `GET /api/settings` - Get pengaturan toko
- `PUT /api/settings` - Update pengaturan toko
- `POST /api/transactions` - Create transaksi baru
- `GET /api/transactions?month=X&year=Y` - Get transaksi per bulan
- `GET /api/transactions/:id` - Get detail transaksi
- `GET /api/reports/total?month=X&year=Y` - Get total pemasukan per bulan

## Troubleshooting

- **Pakai Laragon?** → Lihat `SETUP_LARAGON.md` untuk panduan khusus Laragon
- **Pakai XAMPP/WAMP?** → Lihat `SETUP.md` untuk panduan troubleshooting lengkap

## Lisensi

Free to use untuk keperluan komersial dan non-komersial.

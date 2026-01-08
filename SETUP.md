# Setup Sistem Kasir dengan MySQL

## Persyaratan

1. **Node.js** (v14 atau lebih baru)
   - Download: https://nodejs.org/
   
2. **MySQL** (v5.7 atau lebih baru)
   - Download: https://dev.mysql.com/downloads/mysql/
   - Atau gunakan XAMPP/WAMP yang sudah include MySQL

## Langkah Instalasi

### 1. Install Dependencies

Buka terminal/command prompt di folder project, lalu jalankan:

```bash
npm install
```

### 2. Konfigurasi Database

1. Buat file `.env` di root folder (copy dari `.env.example`):
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=kasir_db
   PORT=3000
   ```

2. Sesuaikan konfigurasi:
   - `DB_HOST`: Host MySQL (biasanya `localhost`)
   - `DB_USER`: Username MySQL (biasanya `root`)
   - `DB_PASSWORD`: Password MySQL (kosongkan jika tidak ada password)
   - `DB_NAME`: Nama database (akan dibuat otomatis)
   - `PORT`: Port server (default: 3000)

### 3. Pastikan MySQL Berjalan

- Jika pakai XAMPP: Start MySQL dari XAMPP Control Panel
- Jika pakai WAMP: Start MySQL dari WAMP Control Panel
- Jika pakai MySQL standalone: Pastikan MySQL service berjalan

### 4. Jalankan Server

```bash
npm start
```

Atau untuk development mode (auto-restart saat ada perubahan):

```bash
npm run dev
```

Server akan berjalan di: `http://localhost:3000`

### 5. Akses Aplikasi

Buka browser dan akses:
- **Kasir**: http://localhost:3000
- **Laporan**: http://localhost:3000/laporan.html

## Database Schema

Aplikasi akan otomatis membuat database dan tabel berikut:

### Tabel `settings`
- Menyimpan pengaturan toko (nama, alamat, telepon)

### Tabel `transactions`
- Menyimpan data transaksi (tanggal, total)

### Tabel `transaction_items`
- Menyimpan detail item per transaksi (nama item, harga, jumlah, subtotal)

## Troubleshooting

### Error: "Cannot connect to MySQL"
- Pastikan MySQL service berjalan
- Cek username dan password di file `.env`
- Pastikan MySQL port (default: 3306) tidak terblokir firewall

### Error: "Access denied for user"
- Cek username dan password MySQL di file `.env`
- Pastikan user MySQL memiliki permission untuk create database

### Port 3000 sudah digunakan
- Ubah `PORT` di file `.env` ke port lain (misalnya 3001, 8080)

### Database tidak terbuat otomatis
- Pastikan user MySQL memiliki permission `CREATE DATABASE`
- Atau buat database manual: `CREATE DATABASE kasir_db;`

## Production Deployment

Untuk production, disarankan:
1. Gunakan environment variable yang aman
2. Setup MySQL dengan user khusus (bukan root)
3. Enable SSL untuk koneksi database
4. Setup reverse proxy (nginx/apache)
5. Gunakan PM2 untuk process management

## Backup Database

Untuk backup database MySQL:
```bash
mysqldump -u root -p kasir_db > backup.sql
```

Untuk restore:
```bash
mysql -u root -p kasir_db < backup.sql
```

# Setup Sistem Kasir dengan Laragon

Panduan khusus untuk menggunakan Laragon sebagai environment development.

## Persyaratan

1. **Laragon** (sudah terinstall)
   - Download: https://laragon.org/
   - Pastikan versi Laragon sudah include MySQL

2. **Node.js** (untuk menjalankan server)
   - Download: https://nodejs.org/
   - Install Node.js v14 atau lebih baru

## Langkah Setup

### 1. Start Laragon

1. Buka aplikasi **Laragon**
2. Klik tombol **Start All** (atau tekan `Ctrl + Alt + S`)
3. Pastikan **MySQL** sudah berjalan (ikon hijau)

### 2. Cek Konfigurasi MySQL Laragon

Default konfigurasi MySQL di Laragon:
- **Host**: `localhost`
- **Port**: `3306`
- **Username**: `root`
- **Password**: (kosong/blank) - **atau cek di Laragon settings**

**Cara cek password MySQL Laragon:**
1. Buka Laragon
2. Klik menu **Menu** → **MySQL** → **Change root password**
3. Atau cek di file: `C:\laragon\bin\mysql\mysql-8.x.x\data\mysql\user.MYD` (tidak disarankan)
4. Biasanya password kosong atau `root`

### 3. Install Dependencies Node.js

Buka terminal/command prompt di folder project:

```bash
npm install
```

### 4. Konfigurasi Database

**Opsi 1: Pakai file `.env` (Recommended)**

Buat file `.env` di root folder:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=kasir_db
PORT=3000
```

**Jika MySQL Laragon pakai password, isi di `DB_PASSWORD`:**
```env
DB_PASSWORD=root
```

**Opsi 2: Langsung di `server.js`**

Edit file `server.js`, sesuaikan di bagian `dbConfig`:
```javascript
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',  // Isi jika MySQL Laragon pakai password
    database: 'kasir_db',
    // ...
};
```

### 5. Jalankan Server

```bash
npm start
```

Atau untuk development mode:
```bash
npm run dev
```

Server akan berjalan di: `http://localhost:3000`

### 6. Akses Aplikasi

Buka browser:
- **Kasir**: http://localhost:3000
- **Laporan**: http://localhost:3000/laporan.html

## Verifikasi MySQL Laragon

### Cek MySQL berjalan:
1. Buka Laragon
2. Pastikan ikon MySQL hijau (running)
3. Atau klik **Menu** → **MySQL** → **Open Console** untuk test koneksi

### Test koneksi manual:
1. Buka Laragon
2. Klik **Menu** → **MySQL** → **Open Console**
3. Ketik: `SHOW DATABASES;`
4. Jika muncul list database, berarti MySQL berjalan dengan baik

## Troubleshooting

### Error: "Cannot connect to MySQL"
**Solusi:**
1. Pastikan Laragon sudah **Start All**
2. Cek ikon MySQL di Laragon (harus hijau)
3. Cek password MySQL di Laragon settings
4. Coba restart Laragon: **Stop All** → **Start All**

### Error: "Access denied for user 'root'"
**Solusi:**
1. Cek password MySQL di Laragon
2. Update password di file `.env` atau `server.js`
3. Atau reset password MySQL di Laragon:
   - **Menu** → **MySQL** → **Change root password**
   - Set password baru (atau kosongkan)

### Port 3000 sudah digunakan
**Solusi:**
1. Cek aplikasi lain yang pakai port 3000
2. Atau ubah port di `.env`:
   ```env
   PORT=3001
   ```
3. Akses aplikasi di: `http://localhost:3001`

### Database tidak terbuat otomatis
**Solusi:**
1. Pastikan user `root` punya permission create database
2. Atau buat manual via Laragon MySQL Console:
   ```sql
   CREATE DATABASE kasir_db;
   ```

## Tips Laragon

1. **Auto Start Laragon**: 
   - Settings → General → Auto Start → Centang "Start All"

2. **MySQL Port**: 
   - Default Laragon MySQL port: `3306`
   - Jika diubah, update di `.env`: `DB_PORT=3307` (contoh)

3. **Backup Database**:
   - Gunakan Laragon MySQL Console atau phpMyAdmin
   - Atau pakai command: `mysqldump` via terminal

4. **phpMyAdmin** (jika perlu):
   - Laragon sudah include phpMyAdmin
   - Akses: http://localhost/phpmyadmin
   - Login dengan: username `root`, password (sesuai setting Laragon)

## Perbedaan dengan XAMPP/WAMP

- **Laragon**: Lebih modern, auto virtual host, include Redis/Memcached
- **XAMPP**: Traditional, lebih banyak digunakan
- **WAMP**: Windows-specific, mirip XAMPP

Semua bisa digunakan, yang penting MySQL berjalan dan konfigurasi sesuai!

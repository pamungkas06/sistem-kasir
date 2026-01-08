# Panduan Hosting Gratis Sistem Kasir

Panduan lengkap untuk hosting aplikasi Node.js + MySQL secara gratis.

## Opsi Hosting Gratis

### 1. **Render.com** (Recommended) ⭐
- ✅ Free tier untuk Node.js
- ✅ Free PostgreSQL (bisa pakai MySQL juga)
- ✅ Auto deploy dari GitHub
- ✅ SSL gratis
- ✅ Custom domain

### 2. **Railway.app**
- ✅ Free tier $5 credit/bulan
- ✅ MySQL gratis
- ✅ Auto deploy
- ✅ SSL gratis

### 3. **PlanetScale** (Database MySQL Gratis)
- ✅ MySQL database gratis
- ✅ Branching database
- ✅ Auto scaling

### 4. **Cyclic.sh**
- ✅ Free tier untuk Node.js
- ✅ Auto deploy dari GitHub

---

## Cara Hosting di Render.com (Paling Mudah)

### Langkah 1: Siapkan GitHub Repository

1. Buat akun GitHub: https://github.com
2. Buat repository baru (misalnya: `sistem-kasir`)
3. Upload semua file ke GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/USERNAME/sistem-kasir.git
   git push -u origin main
   ```

### Langkah 2: Setup Database di Render

1. Daftar di **Render.com**: https://render.com
2. Klik **New +** → **PostgreSQL** (atau MySQL jika tersedia)
3. Isi:
   - **Name**: `kasir-db`
   - **Database**: `kasir_db`
   - **User**: `kasir_user`
   - **Region**: Pilih yang terdekat (Singapore)
   - **Plan**: Free
4. Klik **Create Database**
5. **Copy connection string** yang diberikan (akan seperti: `postgresql://user:pass@host:5432/dbname`)

### Langkah 3: Deploy Web Service

1. Di Render dashboard, klik **New +** → **Web Service**
2. Connect ke GitHub repository Anda
3. Pilih repository `sistem-kasir`
4. Isi konfigurasi:
   - **Name**: `sistem-kasir`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

5. **Environment Variables** (Add):
   ```
   DB_HOST=your-db-host.render.com
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   DB_NAME=kasir_db
   PORT=10000
   NODE_ENV=production
   ```

6. Klik **Create Web Service**
7. Tunggu deploy selesai (sekitar 5-10 menit)

### Langkah 4: Update Server untuk PostgreSQL (Jika pakai PostgreSQL)

Jika Render hanya menyediakan PostgreSQL, update `server.js`:

```bash
npm install pg
```

Update `server.js`:
```javascript
const { Pool } = require('pg');
// Ganti mysql2 dengan pg
```

**ATAU** tetap pakai MySQL dengan setup terpisah.

---

## Cara Hosting di Railway.app

### Langkah 1: Setup Railway

1. Daftar di **Railway**: https://railway.app
2. Login dengan GitHub
3. Klik **New Project** → **Deploy from GitHub repo**

### Langkah 2: Setup Database

1. Di project, klik **+ New** → **Database** → **MySQL**
2. Railway otomatis buat MySQL database
3. Copy connection details dari **Variables** tab

### Langkah 3: Setup Web Service

1. Klik **+ New** → **GitHub Repo**
2. Pilih repository Anda
3. Railway otomatis detect Node.js
4. Add **Environment Variables**:
   ```
   DB_HOST=containers-us-west-xxx.railway.app
   DB_USER=root
   DB_PASSWORD=xxx
   DB_NAME=railway
   PORT=3000
   ```
5. Railway otomatis deploy

### Langkah 4: Setup Custom Domain (Opsional)

1. Di service settings → **Settings** → **Generate Domain**
2. Atau add custom domain di **Custom Domain**

---

## Opsi: Pakai PlanetScale untuk MySQL Gratis

### Setup PlanetScale

1. Daftar di **PlanetScale**: https://planetscale.com
2. Buat database baru:
   - **Name**: `kasir-db`
   - **Region**: Singapore (terdekat)
   - **Plan**: Free (Hobby)
3. Copy connection string:
   ```
   mysql://user:pass@host/database?sslaccept=strict
   ```

### Update Server untuk PlanetScale

PlanetScale menggunakan MySQL dengan SSL. Update `server.js`:

```javascript
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    },
    // ...
};
```

---

## Setup untuk Production

### 1. Update `.env` untuk Production

Jangan commit `.env` ke GitHub! Gunakan environment variables di hosting.

### 2. Update `server.js` untuk Production

Tambahkan di `server.js`:
```javascript
// CORS untuk production
const allowedOrigins = process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com']
    : ['http://localhost:3000'];

app.use(cors({
    origin: allowedOrigins
}));
```

### 3. Update Frontend API URL

Di `public/app.js`, pastikan:
```javascript
const API_BASE_URL = window.location.origin; // Otomatis detect
```

### 4. Security Headers

Tambahkan di `server.js`:
```javascript
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});
```

---

## Checklist Sebelum Deploy

- [ ] Semua file sudah di GitHub
- [ ] `.env` tidak di-commit (ada di `.gitignore`)
- [ ] Environment variables sudah diset di hosting
- [ ] Database sudah dibuat
- [ ] Test koneksi database
- [ ] Build command benar: `npm install`
- [ ] Start command benar: `node server.js`

---

## Troubleshooting

### Error: "Cannot connect to database"
- Cek environment variables di hosting
- Pastikan database sudah running
- Cek firewall/network settings

### Error: "Port already in use"
- Render/Railway otomatis set PORT via env var
- Pastikan `PORT=process.env.PORT || 3000`

### Error: "Module not found"
- Pastikan `package.json` lengkap
- Cek `npm install` berhasil di build log

### Database tidak terbuat otomatis
- Render/Railway biasanya sudah buat database
- Atau buat manual via dashboard

---

## Rekomendasi Setup Terbaik

**Untuk Pemula:**
1. **Render.com** + **PlanetScale** (MySQL gratis)
   - Render untuk hosting Node.js
   - PlanetScale untuk MySQL database

**Alternatif:**
2. **Railway.app** (All-in-one)
   - Railway untuk hosting + database

**Budget Terbatas:**
3. **Cyclic.sh** + **PlanetScale**
   - Cyclic untuk hosting
   - PlanetScale untuk database

---

## Tips

1. **Backup Database**: Setup auto backup di hosting
2. **Monitoring**: Gunakan free tier monitoring (Uptime Robot)
3. **Custom Domain**: Bisa pakai domain gratis (Freenom) atau beli domain murah
4. **SSL**: Hosting gratis biasanya sudah include SSL
5. **Auto Deploy**: Setup auto deploy dari GitHub

---

## Link Penting

- **Render**: https://render.com
- **Railway**: https://railway.app
- **PlanetScale**: https://planetscale.com
- **Cyclic**: https://cyclic.sh
- **GitHub**: https://github.com

---

## Catatan

- Free tier biasanya ada limit (RAM, CPU, storage)
- Database free tier biasanya limited (size, connections)
- Untuk production besar, pertimbangkan upgrade ke paid plan
- Selalu backup data penting!

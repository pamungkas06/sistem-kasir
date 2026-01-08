# Quick Deploy Guide - Sistem Kasir

Panduan cepat deploy ke hosting gratis.

## 🚀 Opsi Tercepat: Railway.app

### Step 1: Upload ke GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/sistem-kasir.git
git push -u origin main
```

### Step 2: Deploy di Railway
1. Buka https://railway.app
2. Login dengan GitHub
3. **New Project** → **Deploy from GitHub repo**
4. Pilih repository Anda
5. Railway otomatis detect dan deploy!

### Step 3: Setup Database
1. Di project Railway, klik **+ New** → **Database** → **MySQL**
2. Railway otomatis buat database
3. Copy connection details dari **Variables** tab

### Step 4: Set Environment Variables
Di web service, tambahkan:
```
DB_HOST=containers-us-west-xxx.railway.app
DB_USER=root
DB_PASSWORD=xxx
DB_NAME=railway
PORT=3000
```

**Selesai!** Aplikasi sudah online di URL yang diberikan Railway.

---

## 🌟 Alternatif: Render.com

### Step 1: Upload ke GitHub (sama seperti di atas)

### Step 2: Deploy di Render
1. Buka https://render.com
2. **New +** → **Web Service**
3. Connect GitHub → Pilih repo
4. Isi:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. Add Environment Variables (sama seperti Railway)
6. **Create Web Service**

### Step 3: Setup Database
1. **New +** → **PostgreSQL** (atau MySQL jika ada)
2. Copy connection string
3. Update env vars di web service

**Selesai!**

---

## 💡 Tips

- **Free tier biasanya sleep setelah 15 menit tidak aktif**
- **Database free tier limited** (size, connections)
- **Untuk production serius, pertimbangkan upgrade**

---

## 🔗 Link Penting

- Railway: https://railway.app
- Render: https://render.com
- PlanetScale (MySQL gratis): https://planetscale.com

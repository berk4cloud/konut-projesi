# 🚀 Projeyi Çalıştırma Rehberi

## Gereksinimler

Bu proje PostgreSQL veritabanı gerektirir. Aşağıdaki seçeneklerden birini kullanabilirsiniz:

### Seçenek 1: Cloud Database (Önerilen - Hızlı)

1. **Neon Database** (Ücretsiz): https://neon.tech
   - Hesap oluştur
   - Yeni database oluştur
   - Connection string'i kopyala

2. **Supabase** (Ücretsiz): https://supabase.com
   - Hesap oluştur
   - Yeni proje oluştur
   - Settings > Database > Connection string'i kopyala

### Seçenek 2: Yerel PostgreSQL

1. PostgreSQL'i yükle: https://www.postgresql.org/download/windows/
2. Yeni bir database oluştur:
   ```sql
   CREATE DATABASE arpdo_db;
   ```
3. Connection string formatı:
   ```
   postgresql://kullanici_adi:sifre@localhost:5432/arpdo_db
   ```

### Seçenek 3: Docker ile PostgreSQL

```bash
docker run --name arpdo-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=arpdo_db -p 5432:5432 -d postgres:16
```

Connection string:
```
postgresql://postgres:postgres@localhost:5432/arpdo_db
```

## Kurulum Adımları

1. **Bağımlılıkları yükle** (zaten yapıldı):
   ```powershell
   npm install
   ```

2. **Veritabanını başlat**:
   ```powershell
   # init-db.sql dosyasını kullanarak veritabanını doldur
   psql "DATABASE_URL_BURAYA" -f init-db.sql
   ```
   
   Veya PowerShell'de:
   ```powershell
   $env:DATABASE_URL="postgresql://user:pass@host:5432/dbname"
   Get-Content init-db.sql | psql $env:DATABASE_URL
   ```

3. **Environment değişkenini ayarla**:
   
   PowerShell'de (geçici):
   ```powershell
   $env:DATABASE_URL="postgresql://user:pass@host:5432/dbname"
   $env:NODE_ENV="development"
   ```
   
   Veya kalıcı için `.env` dosyası oluştur (proje root'unda):
   ```
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   NODE_ENV=development
   PORT=5000
   ```

4. **Projeyi çalıştır**:
   ```powershell
   npm run dev
   ```

5. **Tarayıcıda aç**:
   ```
   http://localhost:5000
   ```

## Notlar

- Proje **5000** portunda çalışır
- İlk çalıştırmada otomatik olarak demo veriler yüklenir
- Demo kullanıcılar için `server/demo-data.ts` dosyasına bakın

## Sorun Giderme

- **"DATABASE_URL must be set" hatası**: Environment değişkenini ayarladığınızdan emin olun
- **Bağlantı hatası**: Veritabanı sunucusunun çalıştığından emin olun
- **Port kullanımda**: 5000 portu kullanımdaysa, `PORT` environment değişkenini değiştirin


# ARPDO Konut Yönetim Sistemi

Modern, full-stack konut yönetim uygulaması. React, TypeScript ve Mock API ile geliştirilmiştir.

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js 18+ 
- npm veya yarn

### Kurulum

1. **Bağımlılıkları yükle:**
   ```bash
   npm install
   ```

2. **Mock API'yi aktif et:**
   
   `.env` dosyası oluşturun (proje root'unda):
   ```env
   VITE_USE_MOCK_DATA=true
   ```

3. **Uygulamayı çalıştır:**
   ```bash
   npm run dev
   ```

4. **Tarayıcıda aç:**
   ```
   http://localhost:5173
   ```

## 📋 Özellikler

### ✅ Tamamlanan Özellikler

- ✅ **Mock API Sistemi**: Backend bağımlılığı olmadan çalışan tam özellikli API
- ✅ **Authentication**: Mock token tabanlı giriş sistemi
- ✅ **CRUD Operasyonları**: Tüm entity'ler için Create, Read, Update, Delete
- ✅ **Data Persistence**: localStorage ile veri saklama
- ✅ **Multi-tenant**: Çoklu tenant desteği
- ✅ **Worker Management**: İşçi yönetimi ve employment takibi
- ✅ **Housing Management**: Ev, oda ve yatak yönetimi
- ✅ **Reservations**: Rezervasyon ve check-in/out sistemi
- ✅ **QR Code Management**: QR kod oluşturma ve yönetimi
- ✅ **Assignments**: Konaklama atamaları
- ✅ **Charges & Payments**: Ücretlendirme ve ödeme takibi
- ✅ **Internationalization**: 7 dil desteği (TR, EN, DE, NL, FR, PL, BG)
- ✅ **Dark Mode**: Tema desteği

## 🏗️ Proje Yapısı

```
Arpdo-Konut/
├── client/
│   ├── src/
│   │   ├── components/      # React bileşenleri
│   │   ├── pages/           # Sayfa bileşenleri
│   │   ├── services/        # Mock API servisi
│   │   ├── mocks/          # Mock data
│   │   ├── utils/          # Yardımcı fonksiyonlar
│   │   ├── contexts/       # React context'ler
│   │   └── lib/            # Kütüphaneler (queryClient, etc.)
│   └── public/             # Statik dosyalar
├── shared/                 # Paylaşılan type'lar
└── package.json
```

## 🔧 Mock API Kullanımı

### Aktif Etme

Mock API varsayılan olarak aktif. `.env` dosyasında:

```env
VITE_USE_MOCK_DATA=true
```

### Mock Data

Mock data `client/src/mocks/data/` klasöründe:

- `auth.ts` - Platform admins, users
- `countries.ts` - Ülkeler
- `tenants.ts` - Tenant'lar
- `workers.ts` - Worker profiles, employments
- `houses.ts` - Houses, rooms, beds
- `reservations.ts` - Reservations, room reservations
- `qrCodes.ts` - QR codes
- `assignments.ts` - Assignments, notes
- `charges.ts` - Charges
- `payments.ts` - Payments

### Mock Kullanıcılar

**Platform Admin:**
- Email: `admin@platform.com`
- Password: `admin123`

**Tenant Users:**
- Email: Mock data'daki herhangi bir user email'i
- Password: `password123`

### API Endpoint'leri

Tüm endpoint'ler `client/src/services/mockApi.ts` dosyasında tanımlı:

- **Authentication**: `/api/login`, `/api/logout`, `/api/login/confirm`
- **Workers**: `/api/workers`, `/api/workers/:id`
- **Houses**: `/api/houses`, `/api/houses/:id`
- **Reservations**: `/api/reservations`, `/api/beds/:id/check-in`
- **QR Codes**: `/api/qr-codes`, `/api/qr-codes/:id`
- **Assignments**: `/api/tenants/:id/assignments`
- **Charges**: `/api/tenants/:id/charges`
- **Payments**: `/api/tenants/:id/payments`

Detaylı bilgi için: [MOCK_API_README.md](./client/MOCK_API_README.md)

## 📱 Sayfalar

- **Login** (`/`) - Giriş sayfası
- **Dashboard** (`/dashboard`) - Konut özeti
- **Houses** (`/houses`) - Ev yönetimi
- **Workers** (`/workers`) - İşçi yönetimi
- **Assignments** (`/assignments`) - Konaklama atamaları
- **QR Management** (`/qr-management`) - QR kod yönetimi
- **Settings** (`/settings`) - Ayarlar
- **Platform Admin** (`/platform-admin`) - Platform yönetimi

## 🧪 Test

Test case'leri `client/src/__tests__/` klasöründe:

```bash
npm run test
```

Test kapsamı:
- ✅ Authentication
- ✅ CRUD operasyonları
- ✅ Filtering & Sorting
- ✅ Error handling
- ✅ Data persistence

## 🛠️ Geliştirme

### Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
npm run check    # TypeScript type check
```

### Environment Variables

```env
# Mock API (varsayılan: true)
VITE_USE_MOCK_DATA=true

# API URL (gerçek API kullanılıyorsa)
VITE_API_URL=http://localhost:3000
```

## 📦 Bağımlılıklar

### Frontend

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TanStack Query** - Data fetching
- **Wouter** - Routing
- **Radix UI** - Component library
- **Tailwind CSS** - Styling
- **i18next** - Internationalization

### Mock API

- localStorage - Data persistence
- Custom mock API service - Backend simulation

## 🔐 Authentication

Mock authentication sistemi:

- Token tabanlı authentication
- localStorage'da session yönetimi
- Multi-tenant ve multi-role desteği
- Platform admin ve tenant user rolleri

## 📊 Veri Yönetimi

### localStorage Keys

- `mock_platform_admins` - Platform admin'ler
- `mock_users` - Kullanıcılar
- `mock_tenants` - Tenant'lar
- `mock_worker_profiles` - Worker profilleri
- `mock_employments` - Employment'lar
- `mock_houses` - Evler
- `mock_rooms` - Odalar
- `mock_beds` - Yataklar
- `mock_reservations` - Rezervasyonlar
- `mock_qr_codes` - QR kodlar
- `mock_assignments` - Atamalar
- `mock_charges` - Ücretler
- `mock_payments` - Ödemeler

### Veri Temizleme

```javascript
// Tüm mock data'yı temizle
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('mock_')) {
    localStorage.removeItem(key);
  }
});
```

## 🌍 Internationalization

Desteklenen diller:
- 🇹🇷 Türkçe (TR)
- 🇬🇧 İngilizce (EN)
- 🇩🇪 Almanca (DE)
- 🇳🇱 Flemenkçe (NL)
- 🇫🇷 Fransızca (FR)
- 🇵🇱 Lehçe (PL)
- 🇧🇬 Bulgarca (BG)

Dil dosyaları: `client/src/locales/`

## 🐛 Sorun Giderme

### Mock API Çalışmıyor

1. `.env` dosyasında `VITE_USE_MOCK_DATA=true` olduğundan emin olun
2. Uygulamayı yeniden başlatın
3. Browser console'da hata mesajlarını kontrol edin

### Veriler Görünmüyor

1. localStorage'ı kontrol edin (DevTools > Application > Local Storage)
2. Mock data'nın yüklendiğinden emin olun
3. Sayfayı yenileyin

### Endpoint Bulunamadı

Eğer "Endpoint not implemented" hatası alıyorsanız:

1. `client/src/lib/queryClient.ts` dosyasındaki `callMockApi` fonksiyonuna endpoint ekleyin
2. `client/src/services/mockApi.ts` dosyasına ilgili fonksiyonu ekleyin

## 📝 Notlar

- **Backend Bağımlılığı Yok**: Proje tamamen frontend odaklı, backend gerektirmez
- **Mock Data**: İlk çalıştırmada otomatik yüklenir
- **Data Persistence**: Veriler localStorage'da saklanır
- **Production Ready**: Mock API production'da da kullanılabilir

## 📄 Lisans

MIT

## 👥 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📞 İletişim

Sorularınız veya önerileriniz için proje yöneticisine başvurun.

---

**Not**: Bu proje mock API kullanarak backend bağımlılığı olmadan çalışır. Gerçek backend entegrasyonu için `VITE_USE_MOCK_DATA=false` ayarlayın ve backend API URL'ini yapılandırın.


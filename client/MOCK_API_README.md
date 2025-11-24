# Mock API Kullanım Kılavuzu

Bu proje, geliştirme ve test amaçlı olarak mock API desteği içermektedir. Mock API, gerçek backend API'ye ihtiyaç duymadan uygulamayı çalıştırmanıza olanak sağlar.

## Özellikler

- ✅ Tüm backend endpoint'leri mock edildi (50+ endpoint)
- ✅ localStorage ile veri persist edilir
- ✅ Gerçekçi network gecikmesi simülasyonu (100-500ms)
- ✅ Hata senaryoları desteği (400, 401, 403, 404, 500)
- ✅ Foreign key ilişkileri korunur
- ✅ CRUD operasyonları tam desteklenir

## Kurulum

### 1. Environment Variable Ayarlama

Mock API'yi aktif etmek için `.env` dosyası oluşturun veya mevcut dosyaya şu satırı ekleyin:

```env
VITE_USE_MOCK_DATA=true
```

Veya gerçek API kullanmak için:

```env
VITE_USE_MOCK_DATA=false
```

### 2. Mock Data İlk Yükleme

Mock API ilk çalıştığında otomatik olarak mock data'yı localStorage'a yükler. Veriler tarayıcıda kalıcı olarak saklanır.

## Kullanım

### Mock API'yi Aktif Etme

1. `.env` dosyasında `VITE_USE_MOCK_DATA=true` ayarlayın
2. Uygulamayı yeniden başlatın
3. Tüm API çağrıları otomatik olarak mock API'ye yönlendirilir

### Mock API'yi Devre Dışı Bırakma

1. `.env` dosyasında `VITE_USE_MOCK_DATA=false` ayarlayın veya değişkeni silin
2. Uygulamayı yeniden başlatın
3. Tüm API çağrıları gerçek backend'e yönlendirilir

## Mock Data Yapısı

Mock data şu dosyalarda tanımlanmıştır:

```
src/mocks/data/
├── index.ts          # Tüm mock data export'ları
├── types.ts          # TypeScript interface'leri
├── auth.ts           # Platform admins, users
├── countries.ts      # Ülkeler
├── tenants.ts        # Tenant'lar
├── workers.ts        # Worker profiles, employments
├── houses.ts         # Houses, rooms, beds
├── reservations.ts   # Reservations, room reservations
├── qrCodes.ts        # QR codes
├── assignments.ts    # Assignments, assignment notes
├── charges.ts        # Charges
└── payments.ts       # Payments
```

## Mock API Endpoint'leri

### Authentication
- `POST /api/login` - Akıllı login (multi-tenant, multi-role)
- `POST /api/tenant/login` - Tenant user login
- `POST /api/platform/login` - Platform admin login
- `POST /api/login/confirm` - Tenant/role seçimini onayla
- `POST /api/logout` - Logout

### Workers
- `GET /api/workers` - Tüm worker'ları getir
- `GET /api/workers-with-accommodation` - Konaklama detayları ile worker'lar
- `GET /api/workers/:employmentId` - Tek worker getir
- `POST /api/workers` - Yeni worker oluştur
- `PATCH /api/employments/:id` - Employment güncelle
- `GET /api/worker-profiles/:email` - Email ile worker profile
- `GET /api/employments/worker/:workerProfileId` - Worker'ın tüm employment'ları

### Countries
- `GET /api/countries` - Tüm aktif ülkeleri getir

### Tenants
- `GET /api/tenants/:id` - Tenant detaylarını getir
- `PATCH /api/tenants/:id` - Tenant ayarlarını güncelle

### Houses
- `GET /api/houses` - Tüm evleri getir (rooms, beds, reservations ile)
- `POST /api/houses` - Yeni ev oluştur
- `PATCH /api/houses/:id` - Ev güncelle
- `DELETE /api/houses/:id` - Ev sil
- `GET /api/houses/:houseId/availability-conflicts` - Müsaitlik çakışmalarını kontrol et

### Reservations
- `POST /api/beds/:bedId/check-in` - Yatağa check-in yap
- `POST /api/rooms/:roomId/check-in` - Odaya check-in yap
- `GET /api/beds/:bedId/future-reservations` - Gelecek rezervasyonları getir
- `GET /api/reservations` - Rezervasyonları getir
- `PATCH /api/reservations/:id/check-out` - Check-out yap
- `POST /api/reservations/:id/notes` - Rezervasyona not ekle
- `GET /api/reservations/:id/notes` - Rezervasyon notlarını getir

### QR Codes
- `GET /api/qr-codes` - Tüm QR kodlarını getir
- `POST /api/qr-codes` - Yeni QR kodu oluştur
- `PATCH /api/qr-codes/:id` - QR kodu güncelle
- `DELETE /api/qr-codes/:id` - QR kodu sil
- `POST /api/qr-codes/:code/use` - QR kod kullanım sayısını artır

### Assignments
- `GET /api/tenants/:tenantId/assignments` - Tüm assignment'ları getir
- `GET /api/assignments/:id` - Tek assignment getir
- `POST /api/tenants/:tenantId/assignments` - Assignment oluştur
- `PATCH /api/assignments/:id` - Assignment güncelle
- `DELETE /api/assignments/:id` - Assignment sil
- `GET /api/tenants/:tenantId/assignments/:assignmentId/notes` - Assignment notlarını getir
- `POST /api/tenants/:tenantId/assignments/:assignmentId/notes` - Assignment notu oluştur

### Charges
- `GET /api/tenants/:tenantId/charges` - Tüm charge'ları getir
- `GET /api/charges/:id` - Tek charge getir
- `POST /api/tenants/:tenantId/charges` - Charge oluştur
- `PATCH /api/charges/:id` - Charge güncelle
- `DELETE /api/charges/:id` - Charge sil

### Payments
- `GET /api/tenants/:tenantId/payments` - Tüm payment'ları getir
- `GET /api/payments/:id` - Tek payment getir
- `POST /api/tenants/:tenantId/payments` - Payment oluştur
- `DELETE /api/payments/:id` - Payment sil

## Mock Kullanıcı Bilgileri

### Platform Admin
- Email: `admin@platform.com`
- Password: `admin123`

### Tenant Users
- Email: Mock data'daki herhangi bir user email'i
- Password: `password123`

## Veri Yönetimi

### localStorage Temizleme

Mock data localStorage'da saklanır. Temizlemek için:

```javascript
// Tüm mock data'yı temizle
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('mock_')) {
    localStorage.removeItem(key);
  }
});
```

### Mock Data'yı Sıfırlama

1. localStorage'ı temizleyin (yukarıdaki kod ile)
2. Sayfayı yenileyin
3. Mock data otomatik olarak yeniden yüklenecek

## Teknik Detaylar

### API Yönlendirme

Mock API yönlendirmesi `src/lib/queryClient.ts` dosyasında yapılır:

- `apiRequest()` fonksiyonu - Mutation'lar için
- `getQueryFn()` fonksiyonu - React Query query'leri için
- Global `fetch` wrapper - Direkt fetch çağrıları için

### Response Formatı

Mock API, gerçek API ile aynı response formatını döndürür:

```typescript
// Başarılı response
{
  data: {...},
  status: 200
}

// Hata response
{
  error: "Error message",
  status: 400 | 401 | 403 | 404 | 500
}
```

## Sorun Giderme

### Mock API Çalışmıyor

1. `.env` dosyasında `VITE_USE_MOCK_DATA=true` olduğundan emin olun
2. Uygulamayı yeniden başlatın
3. Browser console'da hata mesajlarını kontrol edin

### Veriler Görünmüyor

1. localStorage'ı kontrol edin (DevTools > Application > Local Storage)
2. Mock data'nın yüklendiğinden emin olun
3. Sayfayı yenileyin

### Endpoint Bulunamadı Hatası

Eğer "Endpoint not implemented" hatası alıyorsanız:

1. `src/lib/queryClient.ts` dosyasındaki `callMockApi` fonksiyonuna endpoint ekleyin
2. `src/services/mockApi.ts` dosyasına ilgili fonksiyonu ekleyin

## Geliştirme Notları

- Mock API, gerçek API ile %100 uyumlu olacak şekilde tasarlandı
- Tüm endpoint'ler aynı parametreleri ve response formatını kullanır
- Error handling gerçek API ile aynı şekilde çalışır
- Foreign key ilişkileri korunur ve tutarlıdır

## İletişim

Sorularınız veya önerileriniz için proje yöneticisine başvurun.


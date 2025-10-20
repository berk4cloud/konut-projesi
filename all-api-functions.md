# ARPDO HABITAT API & Functions Documentation

Bu döküman, ARPDO HABITAT sistemindeki tüm API endpoint'leri ve önemli backend fonksiyonlarını açıklar.

---

## 📋 İçindekiler

1. [Authentication (Kimlik Doğrulama)](#authentication)
2. [Workers (İşçi Yönetimi)](#workers)
3. [Houses (Konaklama Yönetimi)](#houses)
4. [Availability & Conflict Detection (Müsaitlik Kontrolü)](#availability)
5. [Reservations & Check-in/out (Rezervasyon & Giriş/Çıkış)](#reservations)
6. [Assignments (Atamalar)](#assignments)
7. [Charges & Payments (Ücretlendirme & Ödemeler)](#charges-payments)
8. [QR Codes (QR Kod Sistemi)](#qr-codes)
9. [Countries & Tenant Settings (Ülkeler & Tenant Ayarları)](#countries-settings)
10. [Storage Functions (Backend Fonksiyonları)](#storage-functions)

---

## <a name="authentication"></a>🔐 Authentication (Kimlik Doğrulama)

### `POST /api/login`
**Açıklama:** Akıllı giriş endpoint'i - multi-tenant ve multi-role desteği ile kullanıcı girişi yapar.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response Types:**
- `redirect`: Tek tenant + tek role → Direkt yönlendirme
- `select_role`: Tek tenant + multi role → Role seçim ekranı
- `select_tenant`: Multi tenant → Tenant seçim ekranı
- `select_tenant_role`: Multi tenant + multi role → Hem tenant hem role seçimi
- `platform_admin`: Platform admin girişi

**İşlevi:**
1. Email ile platform admin kontrolü
2. Email ile tüm tenant kullanıcı kayıtlarını bulma
3. Şifre doğrulama
4. Aktif tenant-role context'lerini filtreleme
5. Karar ağacı ile uygun response tipini belirleme

---

### `POST /api/tenant/login`
**Açıklama:** Belirli bir tenant için kullanıcı girişi (subdomain bazlı).

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Middleware:** `requireTenant` - Subdomain'den tenant bilgisini çıkarır

**İşlevi:**
- Tenant ID + email ile kullanıcı bulma
- Kullanıcı aktiflik kontrolü
- Şifre doğrulama
- JWT token üretme
- Kullanıcı + tenant bilgilerini döndürme

---

### `POST /api/login/confirm`
**Açıklama:** Tenant/role seçimini onaylar ve JWT token üretir.

**Request Body:**
```json
{
  "userId": "user-id",
  "tenantId": "tenant-id",
  "role": "accommodation_manager"
}
```

**İşlevi:**
- Seçilen tenant/role kombinasyonunu doğrulama
- JWT token üretme
- Kullanıcıyı yönlendirme için gerekli bilgileri döndürme

---

### `POST /api/logout`
**Açıklama:** Kullanıcı çıkışı (client-side token temizleme).

**İşlevi:**
- Başarılı çıkış mesajı döndürme
- Token client tarafında temizlenir

---

## <a name="workers"></a>👷 Workers (İşçi Yönetimi)

### `GET /api/workers`
**Açıklama:** Tenant'a ait tüm aktif işçileri listeler (federated worker identity model).

**Query Parameters:**
- `includeInactive` (optional): `true` ise pasif işçiler de gelir

**Response:**
```json
[
  {
    "id": "emp-123",
    "employmentId": "emp-123",
    "profileId": "profile-456",
    "firstName": "Ahmet",
    "lastName": "Yılmaz",
    "email": "ahmet@example.com",
    "phone": "+31612345678",
    "gender": "male",
    "dateOfBirth": "1990-01-15",
    "nationality": "TR",
    "status": "active",
    "jobTitle": "Warehouse Worker",
    "department": "Logistics",
    "startDate": "2024-01-01",
    "endDate": null
  }
]
```

**İşlevi:**
- Employment records ile worker profiles birleştirme
- Tenant'a özel filtreleme
- Federated model ile global + local bilgileri birleştirme

---

### `GET /api/workers-with-accommodation`
**Açıklama:** İşçileri mevcut konaklama bilgileri ile birlikte getirir.

**Response:**
Worker bilgisi + konaklama assignment'ları

**İşlevi:**
- Worker profiles + employments + assignments JOIN
- Her işçinin mevcut konaklama durumunu gösterme

---

### `POST /api/workers`
**Açıklama:** Yeni işçi kaydı oluşturur (profile + employment + private data).

**Request Body:**
```json
{
  "tenantId": "tenant-123",
  "firstName": "Mehmet",
  "lastName": "Kaya",
  "email": "mehmet@example.com",
  "phone": "+31687654321",
  "gender": "male",
  "dateOfBirth": "1995-03-20",
  "nationality": "TR",
  "jobTitle": "Production Worker",
  "department": "Manufacturing",
  "startDate": "2025-02-01",
  "salary": 2500,
  "contractType": "temporary"
}
```

**İşlevi:**
1. Worker profile oluşturma (global)
2. Employment kaydı oluşturma (tenant-specific)
3. Employment private data oluşturma (sensitive data)
4. 3 katmanlı federated identity model

---

### `PATCH /api/employments/:id`
**Açıklama:** İşçinin employment bilgilerini günceller.

**Request Body:**
```json
{
  "jobTitle": "Senior Warehouse Worker",
  "department": "Logistics",
  "status": "active"
}
```

**İşlevi:**
- Tenant-specific employment bilgilerini güncelleme
- Global worker profile değişmez
- Private data ayrı güncellenir

---

## <a name="houses"></a>🏠 Houses (Konaklama Yönetimi)

### `GET /api/houses`
**Açıklama:** Tenant'a ait tüm evleri, odaları, yatakları ve aktif rezervasyonları getirir.

**Query Parameters:**
- `date` (optional): Belirli bir tarih için durum (default: bugün)

**Response:**
```json
[
  {
    "id": "house-123",
    "name": "Test Street 123",
    "address": "Test Street 123",
    "city": "Amsterdam",
    "country": "NL",
    "ownershipType": "rent",
    "status": "active",
    "totalBeds": 12,
    "occupiedBeds": 8,
    "rooms": [
      {
        "id": "room-456",
        "roomNumber": "101",
        "floor": 1,
        "beds": [
          {
            "id": "bed-789",
            "bedNumber": 1,
            "status": "occupied",
            "worker": {
              "employmentId": "emp-123",
              "name": "Ahmet Yılmaz",
              "gender": "male"
            },
            "checkInDate": "2025-10-19",
            "checkOutDate": null,
            "expectedMoveOutDate": null,
            "hasFutureReservation": false
          }
        ]
      }
    ]
  }
]
```

**İşlevi:**
- House → Room → Bed hiyerarşisi ile veri getirme
- Her bed için aktif rezervasyon kontrolü
- İşçi bilgileri ile zenginleştirme
- Gelecek rezervasyonları işaretleme
- Toplam/dolu yatak sayıları hesaplama

---

### `POST /api/houses`
**Açıklama:** Yeni ev oluşturur (opsiyonel olarak oda ve yataklar ile).

**Request Body:**
```json
{
  "tenantId": "tenant-123",
  "name": "New House",
  "address": "Main Street 456",
  "city": "Rotterdam",
  "country": "NL",
  "ownershipType": "rent",
  "rooms": [
    {
      "roomNumber": "201",
      "floor": 2,
      "beds": 4
    },
    {
      "roomNumber": "202",
      "floor": 2,
      "beds": 2
    }
  ]
}
```

**İşlevi:**
1. House kaydı oluşturma
2. Her oda için room kaydı oluşturma
3. Her oda için belirtilen sayıda bed oluşturma
4. Oluşturulan tüm veriyi döndürme

---

### `PATCH /api/houses/:id`
**Açıklama:** Mevcut evi günceller (oda ve yatak değişiklikleri dahil).

**Request Body:**
```json
{
  "name": "Updated House Name",
  "address": "Main Street 456",
  "city": "Rotterdam",
  "rooms": [
    {
      "id": "existing-room-id",
      "roomNumber": "201",
      "beds": [...]
    },
    {
      "roomNumber": "NEW ROOM",
      "beds": 3
    }
  ]
}
```

**İşlevi:**
- House bilgilerini güncelleme
- Silinmiş odaları tespit edip silme (cascade)
- Mevcut odaları güncelleme
- Yeni oda ekleme
- Yatak sayısı değişikliklerini yönetme

---

### `DELETE /api/houses/:id`
**Açıklama:** Evi ve tüm oda/yataklarını siler (cascade delete).

**İşlevi:**
1. Tüm odaları bulma
2. Her odadaki yatakları silme
3. Odaları silme
4. Evi silme

---

## <a name="availability"></a>🔍 Availability & Conflict Detection (Müsaitlik Kontrolü)

### `GET /api/houses/:houseId/availability-conflicts`
**Açıklama:** ⭐ **YENİ FEATURE** - Belirtilen tarih aralığında ev içindeki tüm yatakların müsaitlik durumunu ve çakışmaları kontrol eder.

**Query Parameters:**
- `startDate` (required): Başlangıç tarihi (YYYY-MM-DD)
- `endDate` (optional): Bitiş tarihi (YYYY-MM-DD) - Boş bırakılırsa ucu açık

**Response:**
```json
{
  "houseId": "house-123",
  "houseName": "Test Street 123",
  "startDate": "2025-10-01",
  "endDate": "2025-10-31",
  "rooms": [
    {
      "id": "room-456",
      "roomNumber": "101",
      "floor": 1,
      "beds": [
        {
          "id": "bed-789",
          "bedNumber": 1,
          "status": "available",
          "availability": {
            "available": false,
            "conflictType": "partial",
            "conflicts": [
              {
                "reservationId": "res-999",
                "checkInDate": "2025-10-22",
                "checkOutDate": null,
                "employmentId": "emp-123",
                "workerName": "Ahmet Yılmaz"
              }
            ]
          }
        },
        {
          "id": "bed-790",
          "bedNumber": 2,
          "status": "available",
          "availability": {
            "available": true,
            "conflictType": "none",
            "conflicts": []
          }
        }
      ]
    }
  ]
}
```

**Conflict Types:**
- `none`: Çakışma yok, tamamen müsait
- `partial`: Kısmi çakışma - başlangıçta müsait ama ortada dolu
- `full`: Tam çakışma - baştan sona dolu

**İşlevi:**
1. Belirtilen house için tüm room ve bed'leri getirme
2. Her bed için `checkBedAvailability()` fonksiyonunu çağırma
3. Çakışma varsa detaylarını döndürme (tarih, işçi adı)
4. UI'da kullanıcıya çakışma nedenini gösterme için veri sağlama

**Kullanım Senaryosu:**
```
Kullanıcı check-in wizard'da tarih seçti:
- Başlangıç: 1 Ekim 2025
- Bitiş: 31 Ekim 2025

Frontend bu endpoint'i çağırır ve her yatak için:
- ✅ Yeşil badge: Tamamen müsait
- ⚠️ Sarı badge: "1-21 Ekim müsait, 22 Ekim'den itibaren Ahmet Yılmaz rezerve"
- ❌ Kırmızı/disabled: Tamamen dolu
```

---

## <a name="reservations"></a>📅 Reservations & Check-in/out (Rezervasyon & Giriş/Çıkış)

### `POST /api/beds/:bedId/check-in`
**Açıklama:** İşçiyi belirli bir yatağa check-in yapar (rezervasyon + assignment oluşturur).

**Request Body:**
```json
{
  "employmentId": "emp-123",
  "startDate": "2025-10-20",
  "endDate": null,
  "tenantId": "tenant-123",
  "monthlyRate": 600,
  "depositAmount": 500,
  "depositCollected": true,
  "depositCollector": "Manager Name"
}
```

**İşlevi:**
1. Employment ve bed doğrulaması
2. Tenant ownership kontrolü
3. Aktif rezervasyon kontrolü (çakışma kontrolü)
4. Reservation kaydı oluşturma
5. Assignment kaydı oluşturma (ücretlendirme için)
6. Deposit kaydı oluşturma (eğer toplandıysa)
7. İlk aylık charge kaydı oluşturma (prorated hesaplama)

**Business Logic:**
- Gender conflict kontrolü
- Bed availability kontrolü
- Prorated monthly charge hesaplama (ilk ay)
- Deposit tracking

---

### `POST /api/rooms/:roomId/check-in`
**Açıklama:** Tüm odayı kiralama (room reservation) - birden fazla sakin için.

**Request Body:**
```json
{
  "tenantId": "tenant-123",
  "startDate": "2025-11-01",
  "endDate": "2025-12-31",
  "monthlyRate": 2000,
  "depositAmount": 1500,
  "depositCollected": true,
  "depositCollector": "Manager",
  "occupants": [
    {
      "employmentId": "emp-123",
      "workerName": "Ahmet Yılmaz"
    },
    {
      "guestName": "Mehmet Kaya",
      "guestGender": "male"
    }
  ]
}
```

**İşlevi:**
1. Room doğrulaması ve availability kontrolü
2. Tüm bed'lerin müsaitlik kontrolü
3. Room reservation kaydı oluşturma
4. Her occupant için occupant kaydı oluşturma
5. Tüm bed'leri "reserved" statüsüne çekme
6. Deposit ve ücretlendirme yönetimi

---

### `PATCH /api/reservations/:id/check-out`
**Açıklama:** Rezervasyonu sonlandırır (check-out).

**Request Body:**
```json
{
  "checkOutDate": "2025-10-25",
  "checkOutType": "planned"
}
```

**Check-out Types:**
- `planned`: Planlı çıkış
- `early`: Erken çıkış
- `emergency`: Acil çıkış

**İşlevi:**
1. Reservation güncelleme (check-out date)
2. Assignment sonlandırma
3. Bed durumunu "available" yapma
4. Son aylık charge hesaplama (prorated)

---

### `GET /api/reservations`
**Açıklama:** Rezervasyonları filtreler ve listeler.

**Query Parameters:**
- `bedId` (optional): Belirli bir yatağın rezervasyonları
- `active=true` (optional): Sadece aktif rezervasyonlar

**İşlevi:**
- Filtreleme kriterleri ile rezervasyon listesi
- İşçi bilgileri ile zenginleştirme

---

## <a name="assignments"></a>📋 Assignments (Atamalar)

### `GET /api/tenants/:tenantId/assignments`
**Açıklama:** Tenant'ın tüm konaklama atamalarını listeler.

**Response:**
Assignment + worker + house + room + bed bilgileri birleşik

**İşlevi:**
- Tüm aktif/geçmiş atamaları listeleme
- Dashboard için istatistikler
- Ödeme takibi için gerekli bilgiler

---

### `POST /api/tenants/:tenantId/assignments`
**Açıklama:** Yeni atama oluşturur.

**İşlevi:**
- Konaklama ataması oluşturma
- Başlangıç tarihi, ücret, depozito bilgileri

---

### `PATCH /api/assignments/:id`
**Açıklama:** Mevcut atamayı günceller.

**İşlevi:**
- Aylık ücret değişikliği
- Çıkış tarihi güncelleme
- Status değişiklikleri

---

### `DELETE /api/assignments/:id`
**Açıklama:** Atamayı siler (cascade: charges, payments, notes).

---

## <a name="charges-payments"></a>💰 Charges & Payments (Ücretlendirme & Ödemeler)

### `GET /api/tenants/:tenantId/charges`
**Açıklama:** Tenant'ın tüm aylık ücret kayıtlarını getirir.

**Response:**
Charge + worker bilgisi + payment durumu

**İşlevi:**
- Aylık charge listesi
- Ödeme durumu takibi
- Gecikmiş ödemeler filtreleme

---

### `POST /api/tenants/:tenantId/charges`
**Açıklama:** Yeni aylık ücret kaydı oluşturur.

**İşlevi:**
- Manuel veya otomatik charge oluşturma
- Prorated hesaplama (partial month)
- Charge period tracking

---

### `GET /api/tenants/:tenantId/payments`
**Açıklama:** Tenant'ın tüm ödeme kayıtlarını getirir.

**İşlevi:**
- Payment history
- Charge'lara bağlı ödemeler
- Ödeme metodları takibi

---

### `POST /api/tenants/:tenantId/payments`
**Açıklama:** Yeni ödeme kaydı oluşturur.

**Request Body:**
```json
{
  "chargeId": "charge-123",
  "amount": 600,
  "paymentMethod": "bank_transfer",
  "paymentDate": "2025-10-05",
  "notes": "Bank transfer ref: 12345"
}
```

**İşlevi:**
- Ödeme kaydı oluşturma
- Charge ile ilişkilendirme
- Payment status güncelleme (partial/paid)

---

## <a name="qr-codes"></a>📱 QR Codes (QR Kod Sistemi)

### `GET /api/qr-codes`
**Açıklama:** Tenant'ın tüm QR kodlarını listeler.

**İşlevi:**
- QR kod yönetimi
- Task delegation için QR linkler

---

### `POST /api/qr-codes`
**Açıklama:** Yeni QR kod oluşturur.

**QR Code Types:**
- `worker_registration`: İşçi self-kayıt
- `meter_reading`: Sayaç okuma
- `document_upload`: Doküman yükleme

**İşlevi:**
- Benzersiz QR kod üretme
- Expiry date ve usage limit ayarlama
- Task delegation için link oluşturma

---

### `POST /api/qr-codes/:code/use`
**Açıklama:** QR kodu kullanıldığında usage count artırır.

**İşlevi:**
- Kullanım sayısı tracking
- Limit kontrolü
- Expiry kontrolü

---

## <a name="countries-settings"></a>🌍 Countries & Tenant Settings (Ülkeler & Tenant Ayarları)

### `GET /api/countries`
**Açıklama:** Aktif ülkeleri getirir (7 dilde çeviri).

**Response:**
```json
[
  {
    "isoCode": "NL",
    "nameTr": "Hollanda",
    "nameEn": "Netherlands",
    "nameDe": "Niederlande",
    "flagEmoji": "🇳🇱",
    "phoneCode": "+31"
  }
]
```

**İşlevi:**
- 7 dilde ülke isimleri
- Bayrak emoji
- Telefon kodu
- Global reference data

---

### `PATCH /api/tenants/:id`
**Açıklama:** Tenant ayarlarını günceller.

**Request Body:**
```json
{
  "favoriteCountries": ["NL", "TR", "DE"],
  "defaultCountry": "NL",
  "timezone": "Europe/Amsterdam",
  "currency": "EUR"
}
```

**İşlevi:**
- Favori ülkeler yönetimi
- Timezone ayarı (17 timezone)
- Currency ayarı (20 para birimi)
- Dropdown sıralaması için favorite countries

---

## <a name="storage-functions"></a>⚙️ Storage Functions (Backend Fonksiyonları)

### `checkBedAvailability(bedId, startDate, endDate)`
**Açıklama:** ⭐ **YENİ FEATURE** - Belirli bir yatağın tarih aralığında müsaitlik durumunu kontrol eder.

**Parameters:**
- `bedId`: Bed ID
- `startDate`: Başlangıç tarihi (YYYY-MM-DD)
- `endDate`: Bitiş tarihi (YYYY-MM-DD) veya `null` (ucu açık)

**Return:**
```typescript
{
  available: boolean;
  conflictType: 'none' | 'partial' | 'full';
  conflicts: Array<{
    reservationId: string;
    checkInDate: string;
    checkOutDate: string | null;
    employmentId: string;
    workerName: string;
  }>;
}
```

**İşlevi:**
1. Bed için tüm aktif/gelecek rezervasyonları bulma
2. Rezervasyonların worker bilgileri ile JOIN
3. Tarih aralığı overlap kontrolü
4. Conflict type belirleme:
   - `none`: Hiç çakışma yok
   - `partial`: Başlangıçta boş ama ortada dolu (örn: 1-21 Ekim boş, 22-31 Ekim dolu)
   - `full`: Baştan sona dolu
5. Çakışma detaylarını döndürme

**Algoritma:**
```typescript
// Overlap detection
const startsBeforeOurEnd = endDate === null || resStart < endDate;
const endsAfterOurStart = resEnd === null || resEnd > startDate;
const hasOverlap = startsBeforeOurEnd && endsAfterOurStart;

// Conflict type
if (conflicts.some(c => c.checkInDate <= startDate)) {
  conflictType = 'full'; // Baştan itibaren dolu
} else {
  conflictType = 'partial'; // Ortada dolu
}
```

---

### `getActiveReservationForBed(bedId)`
**Açıklama:** Yatağın mevcut aktif rezervasyonunu getirir.

**İşlevi:**
- Bugün itibariyle aktif rezervasyon
- Timezone-aware "today" hesaplama
- Tenant timezone desteği

---

### `getFutureReservationsForBed(bedId, afterDate)`
**Açıklama:** Belirli bir tarihten sonraki gelecek rezervasyonları getirir.

**İşlevi:**
- Gelecek rezervasyon kontrolü
- Dashboard'da future reservation badge için

---

### `getActiveReservationsByTenant(tenantId)`
**Açıklama:** Tenant'ın tüm aktif rezervasyonlarını getirir.

**İşlevi:**
- Dashboard istatistikleri
- Occupancy rate hesaplama
- Reporting

---

### `getTodayInTimezone(timezone)`
**Açıklama:** Belirtilen timezone'da bugünün tarihini döndürür (YYYY-MM-DD).

**İşlevi:**
- Multi-timezone desteği
- Tenant'a özel "bugün" hesaplama
- Date comparisons için tutarlılık

---

## 📊 API Endpoint Özeti

### Toplam Endpoint Sayısı: **45+**

**Kategori Dağılımı:**
- Authentication: 5
- Workers: 4
- Houses: 5
- Reservations: 6
- Assignments: 5
- Charges: 5
- Payments: 4
- QR Codes: 5
- Countries/Settings: 3
- Availability (YENİ): 1

---

## 🔧 Kullanım Notları

### Authentication Flow
1. `POST /api/login` ile giriş
2. Response type'a göre yönlendirme
3. JWT token localStorage'da saklanır
4. Her request'te `Authorization: Bearer <token>` header'ı

### Timezone Handling
- Tüm tarih hesaplamaları tenant timezone'unda
- `getTodayInTimezone()` fonksiyonu kullanılır
- Frontend'de `dateToString()` ve `stringToDate()` helper'ları

### Error Handling
- 400: Bad Request (eksik parametre)
- 401: Unauthorized (geçersiz credentials)
- 403: Forbidden (yetkisiz erişim)
- 404: Not Found
- 500: Internal Server Error

### Best Practices
- Pagination için `limit` ve `offset` kullan
- Filtering için query parameters
- Sorting için `orderBy` parameter
- Cache invalidation için query keys dikkatli seç

---

## 🆕 Son Güncellemeler

### 20 Ekim 2025
- ✅ **Conflict Detection API** eklendi
- ✅ `checkBedAvailability()` backend fonksiyonu
- ✅ `GET /api/houses/:houseId/availability-conflicts` endpoint
- 🚧 Frontend entegrasyonu (devam ediyor)

---

## 📞 İletişim

Bu API dökümanı hakkında sorularınız için: geliştirme ekibi ile iletişime geçin.

**Son Güncelleme:** 20 Ekim 2025  
**Versiyon:** 1.0

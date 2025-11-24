# Devre Dışı Bırakılmış Alanlar

Bu dokümantasyon, projede devre dışı bırakılmış veya henüz implement edilmemiş özelliklerin listesini içermektedir.

## 1. MemStorage - Devre Dışı Fonksiyonlar

**Konum:** `server/storage.ts`

MemStorage sınıfında aşağıdaki fonksiyonlar "Not implemented in MemStorage" hatası veriyor:

### Ev/Oda/Yatak İşlemleri
- `getHouse()` - Ev bilgisi getirme
- `getHousesByTenant()` - Tenant'a ait evleri getirme
- `createHouse()` - Yeni ev oluşturma
- `updateHouse()` - Ev güncelleme
- `deleteHouse()` - Ev silme
- `getRoom()` - Oda bilgisi getirme
- `getRoomsByHouse()` - Eve ait odaları getirme
- `createRoom()` - Yeni oda oluşturma
- `updateRoom()` - Oda güncelleme
- `deleteRoom()` - Oda silme
- `getBed()` - Yatak bilgisi getirme
- `getBedsByRoom()` - Odaya ait yatakları getirme
- `createBed()` - Yeni yatak oluşturma
- `updateBed()` - Yatak güncelleme
- `deleteBed()` - Yatak silme

### Rezervasyon İşlemleri
- `getReservation()` - Rezervasyon bilgisi getirme
- `getReservationsByBed()` - Yatağa ait rezervasyonları getirme
- `getActiveReservationsByTenant()` - Tenant'a ait aktif rezervasyonları getirme
- `getActiveReservationForBed()` - Yatak için aktif rezervasyon getirme
- `getFutureReservationsForBed()` - Yatak için gelecek rezervasyonları getirme
- `createReservation()` - Yeni rezervasyon oluşturma
- `updateReservation()` - Rezervasyon güncelleme
- `completeReservation()` - Rezervasyonu tamamlama

### Oda Rezervasyon İşlemleri
- `getRoomReservation()` - Oda rezervasyon bilgisi getirme
- `getRoomReservationsByTenant()` - Tenant'a ait oda rezervasyonlarını getirme
- `getActiveRoomReservationForRoom()` - Oda için aktif rezervasyon getirme
- `createRoomReservation()` - Yeni oda rezervasyonu oluşturma
- `updateRoomReservation()` - Oda rezervasyonu güncelleme
- `completeRoomReservation()` - Oda rezervasyonunu tamamlama
- `getRoomReservationOccupants()` - Oda rezervasyon konaklayanlarını getirme
- `createRoomReservationOccupant()` - Oda rezervasyonuna konaklayan ekleme
- `deleteRoomReservationOccupant()` - Oda rezervasyon konaklayanını silme
- `getActiveRoomReservationWithOccupants()` - Konaklayanlarla aktif oda rezervasyonu getirme
- `getWorkerHousingInfo()` - İşçi konaklama bilgisi getirme
- `checkRoomReservationForCheckout()` - Checkout için oda rezervasyon kontrolü

### QR Kod İşlemleri
- `getQRCode()` - QR kod bilgisi getirme
- `getQRCodeByCode()` - Kod ile QR kod getirme
- `getQRCodesByTenant()` - Tenant'a ait QR kodları getirme
- `createQRCode()` - Yeni QR kod oluşturma
- `updateQRCode()` - QR kod güncelleme
- `deleteQRCode()` - QR kod silme
- `incrementQRUsage()` - QR kod kullanım sayısını artırma

**Not:** Bu fonksiyonlar DbStorage'da implement edilmiş durumda, ancak MemStorage'da kullanılamıyor.

---

## 2. V2'ye Ertelenmiş Özellikler

### Fiyatlandırma/Abonelik (Pricing/Subscription)
**Durum:** Şu an gerekli değil (MVP)  
**Plan:** V2'de eklenecek  
**Açıklama:** Kullanıcı fiyatlandırma ve abonelik yönetimi özellikleri gelecek versiyonda eklenecek.

### Harita ve Konum (Maps & Location)
**Durum:** Veritabanında latitude/longitude mevcut, ancak UI'de harita gösterimi yok  
**Plan:** V2'de Google Maps entegrasyonu eklenecek  
**Açıklama:** Konutların harita üzerinde gösterilmesi özelliği gelecek versiyonda eklenecek.

### Raporlar
**Durum:** MVP'de yok  
**Plan:** V2'de eklenecek  
**Açıklama:** Detaylı raporlama özellikleri gelecek versiyonda eklenecek.

### Tatil Yönetimi
**Durum:** MVP'de yok  
**Plan:** V2'de eklenecek  
**Açıklama:** Tatil ve izin yönetimi özellikleri gelecek versiyonda eklenecek.

---

## 3. TODO Olarak İşaretlenmiş Özellikler

### Session'dan createdBy Bilgisi
**Konum:** `server/routes.ts` (satır 433)  
**Durum:** `createdBy: null, // TODO: Get from session`  
**Açıklama:** Worker oluşturulurken `createdBy` alanı session'dan alınması gerekiyor, şu an null olarak kaydediliyor.

### Check-Out API Çağrısı
**Konum:** `client/src/components/CheckOutWizard.tsx` (satır 122)  
**Durum:** `// TODO: API call to check-out worker`  
**Açıklama:** Check-out işlemi için API çağrısı yapılması gerekiyor, şu an sadece veri hazırlanıyor.

---

## 4. Kullanılmayan Backend Klasörü

**Konum:** `/server` klasörü  
**Durum:** Mevcut ama aktif olarak kullanılmıyor  
**Açıklama:** Proje şu an Mock API kullanıyor. Backend klasörü mevcut ancak `VITE_USE_MOCK_DATA=true` ayarı ile Mock API aktif. Gerçek backend kullanımı için `VITE_USE_MOCK_DATA=false` yapılması gerekiyor.

---

## 5. Devre Dışı QR Kod Durumu

**Durum:** QR kodlar için "disabled" durumu mevcut  
**Açıklama:** QR kodlar `active`, `disabled`, `expired` durumlarına sahip. Disabled durumundaki QR kodlar kullanılamaz.

---

## Özet

- **MemStorage:** 40+ fonksiyon devre dışı (DbStorage'da mevcut)
- **V2 Özellikleri:** 4 ana özellik (Pricing, Maps, Reports, Vacation Management)
- **TODO'lar:** 2 özellik (Session'dan createdBy, Check-out API)
- **Backend:** Mevcut ama Mock API kullanılıyor
- **QR Kodlar:** Disabled durumu destekleniyor

---

**Son Güncelleme:** 2025-01-27


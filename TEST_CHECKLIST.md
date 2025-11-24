# Test Checklist

Bu dokümanda uygulamanın tüm özelliklerinin test edilmesi için bir checklist bulunmaktadır.

## 🔐 Authentication

### Login
- [ ] Platform admin ile giriş yap
- [ ] Tenant user ile giriş yap
- [ ] Geçersiz email/şifre ile hata mesajı göster
- [ ] Multi-tenant kullanıcı için tenant seçimi göster
- [ ] Multi-role kullanıcı için role seçimi göster
- [ ] Demo login butonu çalışıyor

### Logout
- [ ] Logout butonu çalışıyor
- [ ] Logout sonrası login sayfasına yönlendiriliyor
- [ ] Session temizleniyor

## 👥 Workers (İşçi Yönetimi)

### Listeleme
- [ ] Tüm worker'lar listeleniyor
- [ ] Worker'lar tenant'a göre filtreleniyor
- [ ] Worker bilgileri doğru görünüyor (isim, email, departman)
- [ ] Konaklama bilgisi gösteriliyor (varsa)

### Oluşturma
- [ ] Yeni worker oluşturma formu açılıyor
- [ ] Form validation çalışıyor (required fields)
- [ ] Email format kontrolü çalışıyor
- [ ] Worker başarıyla oluşturuluyor
- [ ] Başarı mesajı gösteriliyor

### Güncelleme
- [ ] Worker bilgileri güncellenebiliyor
- [ ] Employment status değiştirilebiliyor
- [ ] Job title ve department güncellenebiliyor
- [ ] End date ayarlanabiliyor

### Filtreleme
- [ ] Tenant'a göre filtreleme çalışıyor
- [ ] Status'e göre filtreleme çalışıyor

## 🏠 Houses (Ev Yönetimi)

### Listeleme
- [ ] Tüm evler listeleniyor
- [ ] Ev bilgileri doğru görünüyor (adres, şehir, ülke)
- [ ] Oda ve yatak sayıları gösteriliyor
- [ ] Dolu/boş yatak sayıları doğru

### Oluşturma
- [ ] Yeni ev oluşturma formu açılıyor
- [ ] Form validation çalışıyor
- [ ] Oda eklenebiliyor
- [ ] Her oda için yatak sayısı belirlenebiliyor
- [ ] Oda fiyatlandırması yapılabiliyor
- [ ] Ev başarıyla oluşturuluyor

### Güncelleme
- [ ] Ev bilgileri güncellenebiliyor
- [ ] Oda eklenebiliyor/çıkarılabiliyor
- [ ] Yatak sayıları güncellenebiliyor
- [ ] Fiyatlandırma güncellenebiliyor

### Silme
- [ ] Ev silinebiliyor
- [ ] Silme onayı gösteriliyor
- [ ] Ev ve bağlı odalar/yataklar siliniyor

### Müsaitlik Kontrolü
- [ ] Tarih seçildiğinde müsaitlik kontrolü yapılıyor
- [ ] Çakışma durumunda uyarı gösteriliyor
- [ ] Çakışma detayları gösteriliyor

## 📅 Reservations (Rezervasyonlar)

### Check-in (Yatak)
- [ ] Check-in wizard açılıyor
- [ ] Tarih seçimi yapılabiliyor
- [ ] Worker seçimi yapılabiliyor
- [ ] Yatak seçimi yapılabiliyor
- [ ] Fiyatlandırma ayarlanabiliyor
- [ ] Deposit bilgileri girilebiliyor
- [ ] Check-in başarıyla tamamlanıyor
- [ ] Yatak durumu "occupied" oluyor

### Check-in (Oda)
- [ ] Oda check-in wizard açılıyor
- [ ] Lead tenant seçimi yapılabiliyor
- [ ] Occupant'lar eklenebiliyor
- [ ] Guest bilgileri girilebiliyor
- [ ] Oda başarıyla kiralanıyor
- [ ] Tüm yataklar "occupied" oluyor

### Check-out
- [ ] Check-out wizard açılıyor
- [ ] Check-out tarihi seçilebiliyor
- [ ] Check-out type seçilebiliyor
- [ ] Notlar eklenebiliyor
- [ ] Vacation tarihleri girilebiliyor
- [ ] Check-out başarıyla tamamlanıyor
- [ ] Yatak durumu "available" oluyor

### Rezervasyon Notları
- [ ] Notlar görüntülenebiliyor
- [ ] Yeni not eklenebiliyor
- [ ] Notlar tarih sırasına göre gösteriliyor

## 🎫 QR Codes

### Listeleme
- [ ] Tüm QR kodlar listeleniyor
- [ ] QR kod bilgileri doğru görünüyor
- [ ] Status gösteriliyor (active, disabled, expired)
- [ ] Usage count gösteriliyor

### Oluşturma
- [ ] Yeni QR kodu oluşturma formu açılıyor
- [ ] QR code type seçilebiliyor
- [ ] Code unique kontrolü yapılıyor
- [ ] Usage limit ayarlanabiliyor
- [ ] Expiry date ayarlanabiliyor
- [ ] QR kodu başarıyla oluşturuluyor

### Güncelleme
- [ ] QR kodu güncellenebiliyor
- [ ] Status değiştirilebiliyor

### Silme
- [ ] QR kodu silinebiliyor
- [ ] Silme onayı gösteriliyor

### Kullanım
- [ ] QR kodu kullanıldığında usage count artıyor
- [ ] Limit aşıldığında hata gösteriliyor

## 📋 Assignments (Atamalar)

### Listeleme
- [ ] Tüm atamalar listeleniyor
- [ ] Atama bilgileri doğru görünüyor
- [ ] Worker bilgileri gösteriliyor
- [ ] Ev/oda/yatak bilgileri gösteriliyor
- [ ] Status gösteriliyor

### Oluşturma
- [ ] Yeni atama oluşturulabiliyor
- [ ] Worker seçimi yapılabiliyor
- [ ] Ev/oda/yatak seçimi yapılabiliyor
- [ ] Tarih aralığı belirlenebiliyor
- [ ] Monthly rate ayarlanabiliyor
- [ ] Deposit bilgileri girilebiliyor

### Güncelleme
- [ ] Atama güncellenebiliyor
- [ ] Status değiştirilebiliyor
- [ ] Deposit durumu güncellenebiliyor

### Notlar
- [ ] Atama notları görüntülenebiliyor
- [ ] Yeni not eklenebiliyor

## 💰 Charges (Ücretler)

### Listeleme
- [ ] Tüm ücretler listeleniyor
- [ ] Ücret bilgileri doğru görünüyor
- [ ] Worker bilgileri gösteriliyor
- [ ] Status gösteriliyor (pending, partial, paid)
- [ ] Remaining amount gösteriliyor

### Oluşturma
- [ ] Yeni ücret oluşturulabiliyor
- [ ] Assignment seçimi yapılabiliyor
- [ ] Month seçilebiliyor
- [ ] Amount hesaplanabiliyor
- [ ] Calculation type seçilebiliyor
- [ ] Due date ayarlanabiliyor

### Güncelleme
- [ ] Ücret güncellenebiliyor
- [ ] Status değiştirilebiliyor

## 💳 Payments (Ödemeler)

### Listeleme
- [ ] Tüm ödemeler listeleniyor
- [ ] Ödeme bilgileri doğru görünüyor
- [ ] Worker bilgileri gösteriliyor
- [ ] Payment method gösteriliyor
- [ ] Payment date gösteriliyor

### Oluşturma
- [ ] Yeni ödeme oluşturulabiliyor
- [ ] Charge seçimi yapılabiliyor
- [ ] Amount girilebiliyor
- [ ] Payment method seçilebiliyor
- [ ] Payment date seçilebiliyor
- [ ] Ödeme başarıyla kaydediliyor
- [ ] Charge remaining amount güncelleniyor

### Silme
- [ ] Ödeme silinebiliyor
- [ ] Silme onayı gösteriliyor

## ⚙️ Settings (Ayarlar)

### Tenant Settings
- [ ] Tenant bilgileri görüntülenebiliyor
- [ ] Favorite countries seçilebiliyor
- [ ] Default country ayarlanabiliyor
- [ ] Timezone ayarlanabiliyor
- [ ] Currency ayarlanabiliyor
- [ ] Pricing settings güncellenebiliyor
- [ ] Değişiklikler kaydediliyor

### Countries
- [ ] Ülkeler listeleniyor
- [ ] Ülke seçimi yapılabiliyor
- [ ] Çoklu dil desteği gösteriliyor

## 🌐 Internationalization

- [ ] Dil değiştirme çalışıyor
- [ ] Tüm sayfalar çevrilmiş içerik gösteriyor
- [ ] 7 dil desteği var (TR, EN, DE, NL, FR, PL, BG)
- [ ] Dil tercihi localStorage'da saklanıyor

## 🎨 UI/UX

### Loading States
- [ ] Veri yüklenirken loading gösteriliyor
- [ ] Form submit sırasında loading gösteriliyor
- [ ] Loading state'leri doğru çalışıyor

### Error Handling
- [ ] Hata mesajları gösteriliyor
- [ ] Network hataları yakalanıyor
- [ ] Validation hataları gösteriliyor
- [ ] 404 hataları yakalanıyor
- [ ] 401/403 hataları yakalanıyor

### Toast Notifications
- [ ] Başarı mesajları gösteriliyor
- [ ] Hata mesajları gösteriliyor
- [ ] Toast'lar otomatik kapanıyor

### Responsive Design
- [ ] Mobil görünüm çalışıyor
- [ ] Tablet görünüm çalışıyor
- [ ] Desktop görünüm çalışıyor

### Dark Mode
- [ ] Dark mode toggle çalışıyor
- [ ] Tema tercihi localStorage'da saklanıyor
- [ ] Tüm sayfalar dark mode'u destekliyor

## 🔍 Data Persistence

- [ ] Veriler localStorage'da saklanıyor
- [ ] Sayfa yenilendiğinde veriler korunuyor
- [ ] CRUD işlemleri localStorage'a yansıyor
- [ ] Veri tutarlılığı korunuyor

## 📊 Dashboard

- [ ] Dashboard açılıyor
- [ ] Tarih seçimi çalışıyor
- [ ] Evler listeleniyor
- [ ] Oda ve yatak durumları gösteriliyor
- [ ] Worker bilgileri gösteriliyor
- [ ] Check-in wizard çalışıyor
- [ ] Check-out wizard çalışıyor

## 🧪 Test Senaryoları

### Senaryo 1: Yeni Worker Ekleme ve Check-in
1. Workers sayfasına git
2. Yeni worker oluştur
3. Dashboard'a git
4. Worker'ı bir yatağa check-in yap
5. Yatağın "occupied" olduğunu doğrula

### Senaryo 2: Ev Oluşturma ve Rezervasyon
1. Houses sayfasına git
2. Yeni ev oluştur (oda ve yataklarla)
3. Dashboard'a git
4. Yeni oluşturulan evi gör
5. Bir yatağa check-in yap
6. Rezervasyonun oluşturulduğunu doğrula

### Senaryo 3: QR Code Oluşturma ve Kullanım
1. QR Management sayfasına git
2. Yeni QR kodu oluştur
3. QR kodun listelendiğini doğrula
4. QR kodunu kullan (use endpoint)
5. Usage count'un arttığını doğrula

### Senaryo 4: Charge ve Payment
1. Assignments sayfasına git
2. Bir assignment seç
3. Charge oluştur
4. Payment ekle
5. Charge remaining amount'un güncellendiğini doğrula

## ✅ Test Sonuçları

Test tarihi: _______________
Test eden: _______________

### Genel Durum
- [ ] Tüm testler başarılı
- [ ] Kritik hatalar yok
- [ ] Minor hatalar var (liste: _______________)
- [ ] Uygulama production'a hazır

### Notlar
_________________________________________________
_________________________________________________
_________________________________________________


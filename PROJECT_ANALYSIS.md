# Proje Analiz Raporu

Bu belge, ARPDO Konut Projesi'nin kapsamlı bir analizini içermektedir.

**Oluşturulma Tarihi:** 2025-01-27  
**Proje:** ARPDO Konut Yönetim Sistemi  
**Teknoloji Stack:** Node.js, Express, React, TypeScript, PostgreSQL, Drizzle ORM

---

## İçindekiler

1. [Backend API Endpoint'leri](#1-backend-api-endpointleri)
2. [Response Schema'ları](#2-response-schemaları)
3. [Veritabanı Yapısı](#3-veritabani-yapisi)
4. [Frontend API Çağrıları](#4-frontend-api-çağrıları)
5. [Authentication & Authorization](#5-authentication--authorization)

---

## 1. Backend API Endpoint'leri

Tüm endpoint'ler `/api` prefix'i ile başlar.

### 1.1. Authentication Endpoints

#### POST `/api/login`
**Açıklama:** Akıllı login endpoint'i - multi-tenant ve multi-role desteği  
**Method:** POST  
**Auth Gereksinimi:** Hayır  
**Parametreler:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response Tipleri:**
- `platform_admin`: Platform admin girişi
- `redirect`: Tek tenant + tek role → direkt yönlendirme
- `select_role`: Tek tenant + çoklu role → role seçimi gerekli
- `select_tenant`: Çoklu tenant → tenant seçimi gerekli

#### POST `/api/tenant/login`
**Açıklama:** Tenant user login (subdomain bazlı)  
**Method:** POST  
**Auth Gereksinimi:** Hayır (requireTenant middleware)  
**Parametreler:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

#### POST `/api/platform/login`
**Açıklama:** Platform admin login  
**Method:** POST  
**Auth Gereksinimi:** Hayır  
**Parametreler:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

#### POST `/api/login/confirm`
**Açıklama:** Tenant/role seçimini onayla ve token al  
**Method:** POST  
**Auth Gereksinimi:** Hayır  
**Parametreler:**
```json
{
  "email": "string (required)",
  "tenantId": "string (required)",
  "role": "string (required)"
}
```

#### POST `/api/logout`
**Açıklama:** Logout (client-side token kaldırma)  
**Method:** POST  
**Auth Gereksinimi:** Hayır

---

### 1.2. Worker Management Endpoints

#### POST `/api/workers`
**Açıklama:** Yeni worker oluştur (profile + employment + private data)  
**Method:** POST  
**Auth Gereksinimi:** Evet (JWT)  
**Parametreler:**
```json
{
  "email": "string (required, email format)",
  "firstName": "string (required, min 1)",
  "lastName": "string (required, min 1)",
  "gender": "male | female (required)",
  "phone": "string (optional)",
  "nationality": "string (optional)",
  "dateOfBirth": "string (optional, ISO date)",
  "jobTitle": "string (optional)",
  "department": "string (optional)",
  "startDate": "string (optional, ISO date)",
  "salary": "string (optional)",
  "salaryFrequency": "string (optional)",
  "contractType": "string (optional)"
}
```

#### GET `/api/workers`
**Açıklama:** Tenant için tüm aktif worker'ları getir  
**Method:** GET  
**Auth Gereksinimi:** Evet (JWT)  
**Query Parametreleri:**
- `tenantId` (otomatik JWT'den alınır)

#### GET `/api/workers-with-accommodation`
**Açıklama:** Konaklama detayları ile birlikte tüm worker'ları getir  
**Method:** GET  
**Auth Gereksinimi:** Evet (JWT)

#### GET `/api/workers/:employmentId`
**Açıklama:** Belirli bir worker'ı employmentId ile getir  
**Method:** GET  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `employmentId`: string (required)

#### PATCH `/api/employments/:id`
**Açıklama:** Employment güncelle  
**Method:** PATCH  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `id`: string (required)  
**Body Parametreleri:**
```json
{
  "status": "active | inactive | former | invited (optional)",
  "endDate": "string | null (optional, ISO date)",
  "jobTitle": "string | null (optional)",
  "department": "string | null (optional)"
}
```

#### GET `/api/worker-profiles/:email`
**Açıklama:** Email ile worker profile kontrolü  
**Method:** GET  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `email`: string (required)

#### GET `/api/employments/worker/:workerProfileId`
**Açıklama:** Bir worker'ın tüm employment'larını getir  
**Method:** GET  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `workerProfileId`: string (required)

---

### 1.3. Countries Endpoints

#### GET `/api/countries`
**Açıklama:** Tüm aktif ülkeleri getir  
**Method:** GET  
**Auth Gereksinimi:** Hayır

---

### 1.4. Tenant Settings Endpoints

#### GET `/api/tenants/:id`
**Açıklama:** Tenant detaylarını getir  
**Method:** GET  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `id`: string (required)

#### PATCH `/api/tenants/:id`
**Açıklama:** Tenant ayarlarını güncelle (ülke yönetimi, timezone vb.)  
**Method:** PATCH  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `id`: string (required)  
**Body Parametreleri:**
```json
{
  "favoriteCountries": "string[] (optional, ISO codes)",
  "defaultCountry": "string (optional, ISO code)",
  "timezone": "string (optional, IANA timezone)",
  "currency": "string (optional)",
  "pricingSettings": "object (optional)"
}
```

---

### 1.5. Houses Endpoints

#### GET `/api/houses`
**Açıklama:** Tenant için tüm evleri getir (rooms, beds, active reservations ile)  
**Method:** GET  
**Auth Gereksinimi:** Evet (JWT)  
**Query Parametreleri:**
- `date`: string (optional, ISO date format, default: today)

#### POST `/api/houses`
**Açıklama:** Yeni ev oluştur (rooms ile birlikte)  
**Method:** POST  
**Auth Gereksinimi:** Evet (JWT)  
**Body Parametreleri:**
```json
{
  "tenantId": "string (required)",
  "name": "string (optional, defaults to address)",
  "address": "string (required)",
  "city": "string (optional)",
  "country": "string (optional)",
  "ownershipType": "Kiralık | Mülk (optional, maps to rent | owned)",
  "rooms": [
    {
      "roomNumber": "string (required)",
      "useFloor": "boolean (optional)",
      "floor": "number (optional)",
      "canRentAsRoom": "boolean (optional)",
      "beds": "number | array (required)",
      "pricing": {
        "useCustomPricing": "boolean (optional)",
        "roomDailyPrice": "number (optional)",
        "roomMonthlyPrice": "number (optional)"
      }
    }
  ]
}
```

#### PATCH `/api/houses/:id`
**Açıklama:** Ev güncelle (rooms ile birlikte)  
**Method:** PATCH  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `id`: string (required)  
**Body Parametreleri:** (POST ile aynı yapı)

#### DELETE `/api/houses/:id`
**Açıklama:** Ev sil (cascade delete rooms)  
**Method:** DELETE  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `id`: string (required)

#### GET `/api/houses/:houseId/availability-conflicts`
**Açıklama:** Yatak müsaitlik çakışmalarını kontrol et  
**Method:** GET  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `houseId`: string (required)  
**Query Parametreleri:**
- `startDate`: string (required, ISO date)
- `endDate`: string (optional, ISO date)

---

### 1.6. Reservations / Check-in/out Endpoints

#### POST `/api/beds/:bedId/check-in`
**Açıklama:** Worker'ı yatağa check-in yap (reservation + assignment oluşturur)  
**Method:** POST  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `bedId`: string (required)  
**Body Parametreleri:**
```json
{
  "employmentId": "string (required)",
  "startDate": "string (required, ISO date)",
  "endDate": "string (optional, ISO date)",
  "checkInDate": "string (optional, ISO date, defaults to startDate)",
  "tenantId": "string (required)",
  "monthlyRate": "number (optional, default: 600)",
  "depositAmount": "number (optional)",
  "depositCollected": "boolean (optional, default: false)",
  "depositCollector": "string (optional)"
}
```

#### POST `/api/rooms/:roomId/check-in`
**Açıklama:** Tüm odaya check-in yap (oda kiralama)  
**Method:** POST  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `roomId`: string (required)  
**Body Parametreleri:**
```json
{
  "leadEmploymentId": "string (optional, primary worker/contact)",
  "occupants": [
    {
      "employmentId": "string (optional, worker için)",
      "guestName": "string (optional, guest için)",
      "guestGender": "male | female (optional, guest için)",
      "notes": "string (optional)"
    }
  ],
  "startDate": "string (required, ISO date)",
  "endDate": "string (optional, ISO date)",
  "checkInDate": "string (optional, ISO date)",
  "tenantId": "string (required)",
  "monthlyRate": "number (optional)",
  "depositAmount": "number (optional)",
  "depositCollected": "boolean (optional)",
  "depositCollector": "string (optional)"
}
```

#### GET `/api/beds/:bedId/future-reservations`
**Açıklama:** Bir yatak için gelecek rezervasyonları getir  
**Method:** GET  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `bedId`: string (required)  
**Query Parametreleri:**
- `afterDate`: string (required, ISO date)

#### GET `/api/reservations`
**Açıklama:** Filtrelere göre rezervasyonları getir  
**Method:** GET  
**Auth Gereksinimi:** Evet (JWT)  
**Query Parametreleri:**
- `tenantId`: string (required)
- `bedId`: string (optional)
- `active`: "true" | "false" (optional)

#### PATCH `/api/reservations/:id/check-out`
**Açıklama:** Rezervasyon checkout tarihini güncelle  
**Method:** PATCH  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `id`: string (required)  
**Body Parametreleri:**
```json
{
  "checkOutDate": "string (required, ISO date)",
  "checkOutType": "string (optional)",
  "notes": "string (optional)",
  "vacationStart": "string (optional, ISO date)",
  "vacationEnd": "string (optional, ISO date)"
}
```

#### POST `/api/reservations/:id/notes`
**Açıklama:** Rezervasyona not ekle  
**Method:** POST  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `id`: string (required)  
**Body Parametreleri:**
```json
{
  "note": "string (required)"
}
```

#### GET `/api/reservations/:id/notes`
**Açıklama:** Rezervasyon notlarını getir  
**Method:** GET  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `id`: string (required)

---

### 1.7. QR Codes Endpoints

#### GET `/api/qr-codes`
**Açıklama:** Tenant için tüm QR kodlarını getir  
**Method:** GET  
**Auth Gereksinimi:** Evet (JWT)  
**Query Parametreleri:**
- `tenantId`: string (required)

#### POST `/api/qr-codes`
**Açıklama:** Yeni QR kodu oluştur  
**Method:** POST  
**Auth Gereksinimi:** Evet (JWT)  
**Body Parametreleri:**
```json
{
  "tenantId": "string (required)",
  "type": "worker_registration | meter_reading | document_upload (required)",
  "code": "string (required, max 20 chars, unique)",
  "title": "string (required)",
  "status": "active | disabled | expired (optional, default: active)",
  "usageLimit": "number (optional, null = unlimited)",
  "expiryDate": "string (optional, ISO timestamp)"
}
```

#### PATCH `/api/qr-codes/:id`
**Açıklama:** QR kodu güncelle  
**Method:** PATCH  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `id`: string (required)

#### DELETE `/api/qr-codes/:id`
**Açıklama:** QR kodu sil  
**Method:** DELETE  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `id`: string (required)

#### POST `/api/qr-codes/:code/use`
**Açıklama:** QR kod kullanım sayısını artır  
**Method:** POST  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `code`: string (required)

---

### 1.8. Assignment Management Endpoints

#### GET `/api/tenants/:tenantId/assignments`
**Açıklama:** Tenant için tüm assignment'ları getir  
**Method:** GET  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `tenantId`: string (required)

#### GET `/api/assignments/:id`
**Açıklama:** Tek bir assignment getir  
**Method:** GET  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `id`: string (required)

#### POST `/api/tenants/:tenantId/assignments`
**Açıklama:** Assignment oluştur  
**Method:** POST  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `tenantId`: string (required)

#### PATCH `/api/assignments/:id`
**Açıklama:** Assignment güncelle  
**Method:** PATCH  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `id`: string (required)

#### DELETE `/api/assignments/:id`
**Açıklama:** Assignment sil  
**Method:** DELETE  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `id`: string (required)

#### GET `/api/tenants/:tenantId/assignments/:assignmentId/notes`
**Açıklama:** Assignment notlarını getir  
**Method:** GET  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `tenantId`: string (required)
- `assignmentId`: string (required)

#### POST `/api/tenants/:tenantId/assignments/:assignmentId/notes`
**Açıklama:** Assignment notu oluştur  
**Method:** POST  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `tenantId`: string (required)
- `assignmentId`: string (required)

---

### 1.9. Charges Endpoints

#### GET `/api/tenants/:tenantId/charges`
**Açıklama:** Tenant için tüm charge'ları getir  
**Method:** GET  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `tenantId`: string (required)

#### GET `/api/charges/:id`
**Açıklama:** Tek bir charge getir  
**Method:** GET  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `id`: string (required)

#### POST `/api/tenants/:tenantId/charges`
**Açıklama:** Charge oluştur  
**Method:** POST  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `tenantId`: string (required)

#### PATCH `/api/charges/:id`
**Açıklama:** Charge güncelle  
**Method:** PATCH  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `id`: string (required)

#### DELETE `/api/charges/:id`
**Açıklama:** Charge sil  
**Method:** DELETE  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `id`: string (required)

---

### 1.10. Payments Endpoints

#### GET `/api/tenants/:tenantId/payments`
**Açıklama:** Tenant için tüm payment'ları getir  
**Method:** GET  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `tenantId`: string (required)

#### GET `/api/payments/:id`
**Açıklama:** Tek bir payment getir  
**Method:** GET  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `id`: string (required)

#### POST `/api/tenants/:tenantId/payments`
**Açıklama:** Payment oluştur  
**Method:** POST  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `tenantId`: string (required)

#### DELETE `/api/payments/:id`
**Açıklama:** Payment sil  
**Method:** DELETE  
**Auth Gereksinimi:** Evet (JWT)  
**Path Parametreleri:**
- `id`: string (required)

---

## 2. Response Schema'ları

### 2.1. Authentication Responses

#### POST `/api/login` - Success Response (redirect)
```json
{
  "type": "redirect",
  "token": "string (JWT)",
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string"
  },
  "tenant": {
    "id": "string",
    "name": "string",
    "slug": "string",
    "favoriteCountries": "string[]",
    "defaultCountry": "string | null"
  },
  "role": "string"
}
```

#### POST `/api/login` - Success Response (select_role)
```json
{
  "type": "select_role",
  "tenant": {
    "id": "string",
    "name": "string",
    "slug": "string",
    "favoriteCountries": "string[]",
    "defaultCountry": "string | null"
  },
  "roles": "string[]",
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string"
  }
}
```

#### POST `/api/login` - Success Response (select_tenant)
```json
{
  "type": "select_tenant",
  "tenants": [
    {
      "tenant": {
        "id": "string",
        "name": "string",
        "slug": "string",
        "type": "direct_employer | staffing_agency"
      },
      "roles": "string[]"
    }
  ],
  "user": {
    "email": "string",
    "firstName": "string",
    "lastName": "string"
  }
}
```

#### POST `/api/tenant/login` - Success Response
```json
{
  "token": "string (JWT)",
  "user": {
    "id": "string",
    "tenantId": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "roles": "string[]",
    "selectedRole": "string",
    "status": "active | invited | inactive"
  },
  "tenant": {
    "id": "string",
    "name": "string",
    "slug": "string",
    "type": "direct_employer | staffing_agency",
    "status": "trial | active | suspended | cancelled",
    "plan": "basic | professional | enterprise",
    "modules": "object",
    "favoriteCountries": "string[]",
    "defaultCountry": "string | null"
  }
}
```

### 2.2. Worker Responses

#### GET `/api/workers` - Response
```json
[
  {
    "id": "string (employmentId)",
    "employmentId": "string",
    "profileId": "string",
    "tenantId": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "gender": "male | female",
    "phone": "string | null",
    "nationality": "string | null",
    "dateOfBirth": "string | null (ISO date)",
    "photo": "string | null",
    "status": "active | inactive | former | invited",
    "jobTitle": "string | null",
    "department": "string | null",
    "startDate": "string (ISO date)",
    "endDate": "string | null (ISO date)",
    "housing": {
      "type": "room | bed | null",
      "houseId": "string",
      "houseName": "string",
      "roomId": "string",
      "roomNumber": "string",
      "bedId": "string",
      "bedNumber": "string",
      "isLeadTenant": "boolean",
      "leadTenantName": "string",
      "monthlyRate": "number"
    } | null
  }
]
```

#### POST `/api/workers` - Response
```json
{
  "id": "string (employmentId)",
  "employmentId": "string",
  "profileId": "string",
  "tenantId": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "gender": "male | female",
  "phone": "string | null",
  "nationality": "string | null",
  "status": "active",
  "jobTitle": "string | null",
  "department": "string | null",
  "startDate": "string (ISO date)"
}
```

### 2.3. Houses Responses

#### GET `/api/houses` - Response
```json
[
  {
    "id": "string",
    "tenantId": "string",
    "name": "string",
    "address": "string",
    "city": "string | null",
    "country": "string | null",
    "ownershipType": "rent | owned",
    "status": "active | inactive | maintenance",
    "totalBeds": "number",
    "occupiedBeds": "number",
    "rooms": [
      {
        "id": "string",
        "roomNumber": "string",
        "floor": "number | null",
        "canRentAsRoom": "boolean",
        "useFloor": "boolean",
        "pricing": {
          "useCustomPricing": "boolean",
          "roomDailyPrice": "number | null",
          "roomMonthlyPrice": "number | null"
        },
        "beds": [
          {
            "id": "string",
            "bedNumber": "number",
            "status": "available | occupied | reserved | out_of_service",
            "worker": {
              "employmentId": "string",
              "name": "string",
              "gender": "male | female"
            } | undefined,
            "hasFutureReservation": "boolean",
            "checkInDate": "string | undefined (ISO date)",
            "checkOutDate": "string | undefined (ISO date)",
            "expectedMoveOutDate": "string | undefined (ISO date)",
            "expectedMoveInDate": "string | undefined (ISO date)",
            "reservationId": "string | undefined",
            "roomNumber": "string",
            "houseName": "string"
          }
        ],
        "roomReservation": {
          "leadTenant": {
            "employmentId": "string",
            "name": "string"
          } | null,
          "occupants": [
            {
              "employmentId": "string | null",
              "name": "string",
              "guestName": "string | null"
            }
          ],
          "monthlyRate": "string | null",
          "checkInDate": "string (ISO date)"
        } | null
      }
    ]
  }
]
```

### 2.4. Reservations Responses

#### POST `/api/beds/:bedId/check-in` - Response
```json
{
  "reservation": {
    "id": "string",
    "employmentId": "string",
    "houseId": "string",
    "roomId": "string",
    "bedId": "string",
    "tenantId": "string",
    "startDate": "string (ISO date)",
    "endDate": "string | null (ISO date)",
    "checkInDate": "string (ISO date)",
    "checkOutDate": "string | null (ISO date)",
    "status": "checked_in"
  },
  "assignment": {
    "id": "string",
    "tenantId": "string",
    "employmentId": "string",
    "houseId": "string",
    "roomId": "string",
    "bedId": "string",
    "startDate": "string (ISO date)",
    "endDate": "string | null (ISO date)",
    "monthlyRate": "string",
    "status": "active",
    "depositCollected": "boolean",
    "depositAmount": "string",
    "depositCollector": "string | null",
    "depositStatus": "pending | collected | refunded | partially_refunded"
  }
}
```

#### POST `/api/rooms/:roomId/check-in` - Response
```json
{
  "roomReservation": {
    "id": "string",
    "tenantId": "string",
    "houseId": "string",
    "roomId": "string",
    "leadEmploymentId": "string | null",
    "startDate": "string (ISO date)",
    "endDate": "string | null (ISO date)",
    "checkInDate": "string (ISO date)",
    "checkOutDate": "string | null (ISO date)",
    "status": "active",
    "monthlyRate": "string | null",
    "depositAmount": "string | null",
    "depositCollected": "boolean",
    "depositDate": "string | null (ISO date)"
  },
  "occupants": [
    {
      "id": "string",
      "roomReservationId": "string",
      "employmentId": "string | null",
      "guestName": "string | null",
      "guestGender": "male | female | null",
      "notes": "string | null"
    }
  ],
  "bedsUpdated": "number",
  "message": "string"
}
```

### 2.5. Error Responses

Tüm endpoint'ler hata durumunda aşağıdaki formatı kullanır:

```json
{
  "error": "string (error message)",
  "message": "string (optional, detailed message)"
}
```

**HTTP Status Kodları:**
- `400`: Bad Request (validation errors, missing parameters)
- `401`: Unauthorized (invalid/missing token)
- `403`: Forbidden (insufficient permissions, account inactive)
- `404`: Not Found (resource not found)
- `409`: Conflict (e.g., bed already reserved)
- `500`: Internal Server Error

---

## 3. Veritabanı Yapısı

### 3.1. Platform Level Tables

#### `countries`
**Açıklama:** Global ülke referans verisi (7 dilde çeviri)  
**Primary Key:** `iso_code` (varchar(2))

| Column | Type | Description |
|--------|------|-------------|
| iso_code | varchar(2) | ISO 3166-1 alpha-2 (PK) |
| name_tr | text | Turkish name |
| name_en | text | English name |
| name_de | text | German name |
| name_nl | text | Dutch name |
| name_fr | text | French name |
| name_pl | text | Polish name |
| name_bg | text | Bulgarian name |
| flag_emoji | text | Flag emoji |
| phone_code | text | Phone code (e.g., "+49") |
| is_active | boolean | Active status |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

#### `platform_admins`
**Açıklama:** Platform admin kullanıcıları (ARPDO ekibi)  
**Primary Key:** `id` (varchar)

| Column | Type | Description |
|--------|------|-------------|
| id | varchar | UUID (PK) |
| email | text | Unique email |
| password | text | Hashed password |
| first_name | text | First name |
| last_name | text | Last name |
| role | enum | super_admin, admin, support |
| last_login_at | timestamp | Last login time |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

#### `tenants`
**Açıklama:** Müşteri şirketleri (multi-tenant)  
**Primary Key:** `id` (varchar)  
**Unique:** `slug`

| Column | Type | Description |
|--------|------|-------------|
| id | varchar | UUID (PK) |
| name | text | Company name |
| slug | text | Subdomain slug (unique) |
| type | enum | direct_employer, staffing_agency |
| status | enum | trial, active, suspended, cancelled |
| contact_email | text | Contact email |
| contact_phone | text | Contact phone |
| plan | enum | basic, professional, enterprise |
| trial_ends_at | timestamp | Trial end date |
| subscription_starts_at | timestamp | Subscription start |
| modules | jsonb | Feature flags |
| currency | enum | EUR, USD, TRY, etc. |
| timezone | text | IANA timezone string |
| pricing_settings | jsonb | Pricing configuration |
| favorite_countries | text[] | ISO codes array |
| default_country | varchar(2) | ISO code |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |
| created_by | varchar | Platform admin ID |

### 3.2. Tenant Level Tables

#### `users`
**Açıklama:** Tenant kullanıcıları (multi-role support)  
**Primary Key:** `id` (varchar)  
**Unique:** `(tenant_id, email)`

| Column | Type | Description |
|--------|------|-------------|
| id | varchar | UUID (PK) |
| tenant_id | varchar | FK to tenants |
| email | text | Email (unique per tenant) |
| password | text | Hashed password (nullable) |
| first_name | text | First name |
| last_name | text | Last name |
| roles | text[] | Array of roles |
| status | enum | invited, active, inactive |
| invited_at | timestamp | Invitation timestamp |
| invited_by | varchar | User/Admin ID |
| activated_at | timestamp | Activation timestamp |
| invitation_token | text | Invitation token |
| last_login_at | timestamp | Last login |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

#### `user_preferences`
**Açıklama:** Kullanıcı tercihleri (login flow için)  
**Primary Key:** `email` (text)

| Column | Type | Description |
|--------|------|-------------|
| email | text | Email (PK) |
| last_tenant_id | varchar | Last selected tenant |
| last_selections | jsonb | {"tenant-id": "role"} |
| updated_at | timestamp | Update timestamp |

### 3.3. Federated Worker Identity Model

#### `worker_profiles`
**Açıklama:** Global worker profilleri (tenant'lar arası taşınabilir)  
**Primary Key:** `id` (varchar)  
**Unique:** `email`

| Column | Type | Description |
|--------|------|-------------|
| id | varchar | UUID (PK) |
| email | text | Unique email |
| password | text | Hashed password (nullable) |
| first_name | text | First name |
| last_name | text | Last name |
| gender | enum | male, female |
| phone | text | Phone number |
| nationality | text | Nationality |
| date_of_birth | date | Date of birth |
| photo | text | Profile photo URL |
| bio | text | Biography |
| address | text | Personal address |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

#### `employments`
**Açıklama:** Tenant-specific employment relationships  
**Primary Key:** `id` (varchar)

| Column | Type | Description |
|--------|------|-------------|
| id | varchar | UUID (PK) |
| worker_profile_id | varchar | FK to worker_profiles |
| tenant_id | varchar | FK to tenants |
| status | enum | active, inactive, former, invited |
| start_date | date | Employment start |
| end_date | date | Employment end (nullable) |
| snapshot_gender | enum | Gender snapshot |
| snapshot_photo | text | Photo snapshot |
| snapshot_first_name | text | First name snapshot |
| snapshot_last_name | text | Last name snapshot |
| job_title | text | Job title |
| department | text | Department |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |
| created_by | varchar | User ID |

#### `employment_private_data`
**Açıklama:** Hassas employment verileri (tenant-specific, asla paylaşılmaz)  
**Primary Key:** `id` (varchar)  
**Unique:** `employment_id`

| Column | Type | Description |
|--------|------|-------------|
| id | varchar | UUID (PK) |
| employment_id | varchar | FK to employments (unique) |
| salary | numeric | Salary amount |
| salary_frequency | text | hourly, monthly, yearly |
| currency | enum | EUR, USD, etc. |
| contract_type | text | full_time, part_time, etc. |
| contract_start_date | date | Contract start |
| contract_end_date | date | Contract end |
| internal_notes | text | Internal notes |
| performance_rating | numeric | 1-5 scale |
| manager_id | varchar | FK to users |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

### 3.4. Housing Tables

#### `houses`
**Açıklama:** Evler (tenant-specific)  
**Primary Key:** `id` (varchar)

| Column | Type | Description |
|--------|------|-------------|
| id | varchar | UUID (PK) |
| tenant_id | varchar | FK to tenants |
| name | text | House name |
| address | text | Address |
| house_number | text | House number |
| house_number_addition | text | Addition |
| postal_code | text | Postal code |
| city | text | City |
| country | text | Country |
| latitude | numeric | Latitude |
| longitude | numeric | Longitude |
| total_rooms | integer | Total rooms |
| total_beds | integer | Total beds |
| cost_per_week | numeric | Weekly cost |
| cost_per_bed_per_day | numeric | Daily bed cost |
| ownership_type | enum | rent, owned |
| status | enum | active, inactive, maintenance |
| description | text | Description |
| internal_notes | text | Internal notes |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

#### `rooms`
**Açıklama:** Odalar (house-specific)  
**Primary Key:** `id` (varchar)

| Column | Type | Description |
|--------|------|-------------|
| id | varchar | UUID (PK) |
| house_id | varchar | FK to houses |
| room_number | text | Room number |
| floor | integer | Floor number (nullable) |
| room_type | enum | single, double, triple, quad, dormitory |
| bed_count | integer | Number of beds |
| gender_restriction | enum | male, female, mixed, none |
| is_family_room | boolean | Family room flag |
| available_for_room_rental | boolean | Can rent as whole room |
| status | text | active, inactive |
| cost_per_day | numeric | Daily room cost |
| cost_per_month | numeric | Monthly room cost |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

#### `beds`
**Açıklama:** Yataklar (room-specific)  
**Primary Key:** `id` (varchar)

| Column | Type | Description |
|--------|------|-------------|
| id | varchar | UUID (PK) |
| room_id | varchar | FK to rooms |
| bed_number | integer | Bed number |
| status | enum | available, occupied, reserved, out_of_service |
| room_reservation_id | varchar | FK to room_reservations (nullable) |
| last_occupied_by | varchar | Last employment ID |
| last_occupied_at | timestamp | Last occupied timestamp |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

### 3.5. Reservation Tables

#### `reservations`
**Açıklama:** Yatak rezervasyonları (bed-level)  
**Primary Key:** `id` (varchar)

| Column | Type | Description |
|--------|------|-------------|
| id | varchar | UUID (PK) |
| employment_id | varchar | FK to employments |
| house_id | varchar | FK to houses |
| room_id | varchar | FK to rooms |
| bed_id | varchar | FK to beds |
| tenant_id | varchar | FK to tenants |
| start_date | date | Start date |
| end_date | date | End date (nullable) |
| check_in_date | date | Check-in date |
| check_out_date | date | Check-out date (nullable) |
| status | enum | pending, confirmed, checked_in, checked_out, cancelled |
| daily_rate | numeric | Daily rate |
| total_cost | numeric | Total cost |
| on_vacation | boolean | On vacation flag |
| belongings_in_room | boolean | Belongings flag |
| description | text | Description |
| internal_notes | text | Internal notes |
| notes | text[] | Notes array |
| confirmed_by | varchar | User ID |
| confirmed_at | timestamp | Confirmation timestamp |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |
| created_by | varchar | User ID |

#### `room_reservations`
**Açıklama:** Oda rezervasyonları (whole room rentals)  
**Primary Key:** `id` (varchar)

| Column | Type | Description |
|--------|------|-------------|
| id | varchar | UUID (PK) |
| tenant_id | varchar | FK to tenants |
| house_id | varchar | FK to houses |
| room_id | varchar | FK to rooms |
| lead_employment_id | varchar | FK to employments (nullable) |
| start_date | date | Start date |
| end_date | date | End date (nullable) |
| check_in_date | date | Check-in date |
| check_out_date | date | Check-out date (nullable) |
| status | enum | active, checked_out, cancelled |
| monthly_rate | numeric | Monthly rate |
| daily_rate | numeric | Daily rate |
| total_cost | numeric | Total cost |
| deposit_amount | numeric | Deposit amount |
| deposit_collected | boolean | Deposit collected |
| deposit_date | date | Deposit date |
| description | text | Description |
| internal_notes | text | Internal notes |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |
| created_by | varchar | User ID |

#### `room_reservation_occupants`
**Açıklama:** Oda rezervasyonu sakinleri  
**Primary Key:** `id` (varchar)

| Column | Type | Description |
|--------|------|-------------|
| id | varchar | UUID (PK) |
| room_reservation_id | varchar | FK to room_reservations |
| employment_id | varchar | FK to employments (nullable) |
| guest_name | text | Guest name (nullable) |
| guest_gender | enum | male, female (nullable) |
| notes | text | Notes |
| created_at | timestamp | Creation timestamp |

### 3.6. Assignment Management Tables

#### `assignments`
**Açıklama:** Worker-to-bed assignments (accommodation management)  
**Primary Key:** `id` (varchar)

| Column | Type | Description |
|--------|------|-------------|
| id | varchar | UUID (PK) |
| tenant_id | varchar | FK to tenants |
| employment_id | varchar | FK to employments |
| house_id | varchar | FK to houses |
| room_id | varchar | FK to rooms |
| bed_id | varchar | FK to beds |
| start_date | date | Start date |
| end_date | date | End date (nullable) |
| monthly_rate | numeric | Monthly rate |
| status | enum | active, ending_soon, ended |
| deposit_collected | boolean | Deposit collected |
| deposit_amount | numeric | Deposit amount |
| deposit_date | date | Deposit date |
| deposit_collector | varchar | Collector ID |
| deposit_status | enum | pending, collected, refunded, partially_refunded |
| deposit_refund_date | date | Refund date |
| deposit_refund_amount | numeric | Refund amount |
| damage_amount | numeric | Damage amount |
| damage_note | text | Damage note |
| agreement_notes | text | Agreement notes |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |
| created_by | varchar | User ID |

#### `charges`
**Açıklama:** Aylık konaklama ücretleri  
**Primary Key:** `id` (varchar)

| Column | Type | Description |
|--------|------|-------------|
| id | varchar | UUID (PK) |
| tenant_id | varchar | FK to tenants |
| assignment_id | varchar | FK to assignments |
| month | varchar(7) | Month (YYYY-MM format) |
| amount | numeric | Total charge |
| expected_amount | numeric | Expected amount |
| remaining_amount | numeric | Remaining amount |
| days | integer | Number of days |
| calculation_type | enum | full_month, partial, prorated |
| due_date | date | Due date |
| status | enum | pending, partial, paid, overdue |
| notes | text | Notes |
| created_at | timestamp | Creation timestamp |
| updated_at | timestamp | Update timestamp |

#### `payments`
**Açıklama:** Charge ödemeleri  
**Primary Key:** `id` (varchar)

| Column | Type | Description |
|--------|------|-------------|
| id | varchar | UUID (PK) |
| tenant_id | varchar | FK to tenants |
| charge_id | varchar | FK to charges |
| amount | numeric | Payment amount |
| payment_date | date | Payment date |
| payment_method | enum | cash, bank_transfer, pos, other |
| collector_name | varchar | Collector name |
| recorded_at | timestamp | Recording timestamp |
| reference | varchar | Reference number |
| notes | text | Notes |
| created_at | timestamp | Creation timestamp |
| created_by | varchar | User ID |

#### `assignment_notes`
**Açıklama:** Assignment notları (conversation/activity)  
**Primary Key:** `id` (varchar)

| Column | Type | Description |
|--------|------|-------------|
| id | varchar | UUID (PK) |
| tenant_id | varchar | FK to tenants |
| assignment_id | varchar | FK to assignments |
| note | text | Note content |
| created_by | varchar | User ID (required) |
| created_at | timestamp | Creation timestamp |

### 3.7. QR Codes Table

#### `qr_codes`
**Açıklama:** QR kodlar (task delegation system)  
**Primary Key:** `id` (varchar)  
**Unique:** `code`

| Column | Type | Description |
|--------|------|-------------|
| id | varchar | UUID (PK) |
| tenant_id | varchar | FK to tenants |
| type | enum | worker_registration, meter_reading, document_upload |
| code | varchar(20) | Unique code |
| title | text | Title |
| status | enum | active, disabled, expired |
| usage_limit | integer | Usage limit (nullable = unlimited) |
| used_count | integer | Used count |
| expiry_date | timestamp | Expiry date |
| created_at | timestamp | Creation timestamp |
| created_by | varchar | User ID |

### 3.8. Database Relationships

```
tenants (1) ──< (N) users
tenants (1) ──< (N) houses
tenants (1) ──< (N) employments
tenants (1) ──< (N) reservations
tenants (1) ──< (N) room_reservations
tenants (1) ──< (N) assignments
tenants (1) ──< (N) charges
tenants (1) ──< (N) payments
tenants (1) ──< (N) qr_codes

worker_profiles (1) ──< (N) employments
employments (1) ──< (1) employment_private_data
employments (1) ──< (N) reservations
employments (1) ──< (N) assignments

houses (1) ──< (N) rooms
rooms (1) ──< (N) beds
rooms (1) ──< (N) room_reservations

beds (1) ──< (N) reservations
beds (N) ──> (1) room_reservations (via room_reservation_id)

room_reservations (1) ──< (N) room_reservation_occupants
room_reservation_occupants (N) ──> (1) employments (nullable)

assignments (1) ──< (N) charges
charges (1) ──< (N) payments
assignments (1) ──< (N) assignment_notes
```

---

## 4. Frontend API Çağrıları

Frontend, React Query (`@tanstack/react-query`) kullanarak API çağrıları yapar. Tüm çağrılar `apiRequest` helper fonksiyonu veya `useQuery`/`useMutation` hooks ile yapılır.

### 4.1. API Client Setup

**Dosya:** `client/src/lib/queryClient.ts`

```typescript
// API Request Helper
export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response>

// Query Function
export const getQueryFn: <T>(options: {
  on401: "returnNull" | "throw"
}) => QueryFunction<T>
```

**Authentication:** Tüm isteklerde `Authorization: Bearer <token>` header'ı eklenir. Token `localStorage.getItem("token")` ile alınır.

### 4.2. Frontend API Call List

#### Authentication Calls

**LoginForm.tsx:**
- `POST /api/login` - Smart login
- `POST /api/login/confirm` - Confirm tenant/role selection
- `POST /api/logout` - Logout

**Header.tsx:**
- `POST /api/logout` - Logout

**PlatformAdminDashboard.tsx:**
- `POST /api/logout` - Logout

#### Worker Management Calls

**Workers.tsx:**
- `GET /api/workers?tenantId={tenantId}` - Get all workers
- `POST /api/workers` - Create worker
- `PATCH /api/employments/{id}` - Update employment
- `GET /api/houses?tenantId={tenantId}` - Get houses (for dropdown)

**HousingDashboard.tsx:**
- `GET /api/workers?tenantId={tenantId}` - Get all workers
- `POST /api/workers` - Create worker (if not exists)
- `POST /api/beds/{bedId}/check-in` - Check-in to bed
- `POST /api/rooms/{roomId}/check-in` - Check-in to room
- `GET /api/houses/{houseId}/availability-conflicts` - Check availability

**EnhancedBedActionModal.tsx:**
- `GET /api/workers` - Get workers list

**CheckOutWizard.tsx:**
- `GET /api/workers-with-accommodation` - Get workers with accommodation

#### Houses Management Calls

**Houses.tsx:**
- `GET /api/countries` - Get all countries
- `GET /api/tenants/{tenantId}` - Get tenant settings
- `GET /api/houses?tenantId={tenantId}` - Get all houses
- `POST /api/houses` - Create house
- `PATCH /api/houses/{id}` - Update house
- `DELETE /api/houses/{id}` - Delete house

**HousingDashboard.tsx:**
- `GET /api/houses?tenantId={tenantId}&date={date}` - Get houses with date filter

#### Reservations Calls

**BedDetailsModal.tsx:**
- `GET /api/reservations/{id}/notes` - Get reservation notes
- `PATCH /api/reservations/{id}/check-out` - Check-out reservation
- `POST /api/reservations/{id}/notes` - Add note to reservation

#### Tenant Settings Calls

**Settings.tsx:**
- `GET /api/countries` - Get all countries
- `GET /api/tenants/{tenantId}` - Get tenant details
- `PATCH /api/tenants/{tenantId}` - Update tenant settings

#### Assignment Management Calls

**Assignments.tsx:**
- `GET /api/tenants/{tenantId}/assignments` - Get all assignments
- `GET /api/tenants/{tenantId}/charges` - Get all charges
- `GET /api/tenants/{tenantId}/payments` - Get all payments
- `POST /api/tenants/{tenantId}/payments` - Create payment
- `PATCH /api/charges/{id}` - Update charge
- `PATCH /api/assignments/{id}` - Update assignment
- `GET /api/tenants/{tenantId}/assignments/{assignmentId}/notes` - Get assignment notes
- `POST /api/tenants/{tenantId}/assignments/{assignmentId}/notes` - Create assignment note

#### QR Codes Calls

**QRManagement.tsx:**
- `GET /api/qr-codes?tenantId={tenantId}` - Get all QR codes
- `POST /api/qr-codes` - Create QR code
- `PATCH /api/qr-codes/{id}` - Update QR code
- `DELETE /api/qr-codes/{id}` - Delete QR code

### 4.3. React Query Usage Pattern

```typescript
// Query (GET requests)
const { data, isLoading, error } = useQuery<DataType>({
  queryKey: ['/api/endpoint', param1, param2],
  enabled: !!condition, // Optional condition
});

// Mutation (POST/PATCH/DELETE)
const mutation = useMutation({
  mutationFn: async (data) => apiRequest('POST', '/api/endpoint', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['/api/endpoint'] });
  },
});
```

---

## 5. Authentication & Authorization

### 5.1. Authentication Mechanism

Proje **JWT (JSON Web Token)** tabanlı authentication kullanır.

#### Token Generation

**Dosya:** `server/auth.ts`

```typescript
// Platform Admin Token
generatePlatformAdminToken(admin: PlatformAdmin): string

// Tenant User Token
generateTenantUserToken(user: User, tenant: Tenant, selectedRole: string): string
```

**JWT Payload Yapısı:**

**Platform Admin:**
```json
{
  "type": "platform_admin",
  "adminId": "string",
  "email": "string",
  "role": "string"
}
```

**Tenant User:**
```json
{
  "type": "tenant_user",
  "userId": "string",
  "tenantId": "string",
  "email": "string",
  "role": "string"
}
```

**Token Ayarları:**
- **Secret:** `process.env.JWT_SECRET` (default: "ARPDO_HABITAT_DEV_SECRET_CHANGE_IN_PRODUCTION")
- **Expiry:** 7 days
- **Algorithm:** HS256 (default JWT)

#### Password Hashing

**Dosya:** `server/auth.ts`

- **Library:** `bcryptjs`
- **Salt Rounds:** 10
- **Functions:**
  - `hashPassword(plainPassword: string): Promise<string>`
  - `verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>`

### 5.2. Authorization Middleware

#### `authenticateTenantUser`

**Dosya:** `server/middleware/auth.ts`

**Açıklama:** JWT token doğrulama middleware'i

**Kullanım:**
```typescript
apiRouter.use(authenticateTenantUser); // Tüm route'lar için
```

**İşlev:**
1. `Authorization: Bearer <token>` header'ını kontrol eder
2. Token'ı verify eder
3. `req.user` objesini oluşturur:
   ```typescript
   {
     id: string,
     email: string,
     tenantId?: string, // tenant_user için
     role: string,
     type: "platform_admin" | "tenant_user"
   }
   ```

**Hata Durumları:**
- `401`: Token yok veya geçersiz

#### `requireTenant`

**Dosya:** `server/middleware/tenant.ts`

**Açıklama:** Subdomain'den tenant yükleme middleware'i

**İşlev:**
1. Hostname'den tenant slug'ını çıkarır (örn: `cova-bv.arpdo.com` → `cova-bv`)
2. Tenant'ı veritabanından yükler
3. Tenant durumunu kontrol eder (suspended/cancelled)
4. `req.tenant` objesini oluşturur

**Hata Durumları:**
- `400`: Tenant context gerekli
- `404`: Tenant bulunamadı
- `403`: Tenant suspended
- `410`: Tenant cancelled

### 5.3. Multi-Tenant Architecture

#### Tenant Detection

**Subdomain Bazlı:**
- `cova-bv.arpdo.com` → tenant slug: `cova-bv`
- `localhost:5000` → tenant yok (local dev)
- `arpdo.com` → tenant yok (platform admin)

**Reserved Subdomains:**
- `www`, `api`, `admin`, `platform`, `app` → tenant olarak algılanmaz

#### Tenant Isolation

Tüm tenant-level veriler `tenantId` ile filtrelenir:
- Workers (via employments)
- Houses
- Reservations
- Assignments
- Charges
- Payments
- QR Codes

### 5.4. Multi-Role System

#### Role Types

**Tenant Roles:**
- `owner`
- `admin`
- `hr_manager`
- `planner`
- `accommodation_manager`
- `transport_manager`
- `finance`
- `viewer`

**Platform Admin Roles:**
- `super_admin`
- `admin`
- `support`

#### Role Selection Flow

1. **Single Tenant + Single Role:** Direkt login, token oluşturulur
2. **Single Tenant + Multiple Roles:** Role seçimi ekranı gösterilir
3. **Multiple Tenants:** Tenant seçimi ekranı gösterilir, sonra role seçimi

#### Current Role

JWT token'da sadece **seçili role** saklanır. Kullanıcı birden fazla role sahip olsa bile, token'da tek bir role vardır.

### 5.5. Frontend Authentication

#### Auth Context

**Dosya:** `client/src/contexts/AuthContext.tsx`

**State:**
- `user`: Current user object
- `token`: JWT token
- `isAuthenticated`: boolean
- `isPlatformAdmin`: boolean

**Functions:**
- `login(userData, token)`: Login ve token kaydet
- `logout()`: Logout ve token temizle
- `setUser(userData)`: User güncelle

#### Token Storage

- **Location:** `localStorage.getItem("token")`
- **Format:** JWT string
- **Usage:** Tüm API isteklerinde `Authorization: Bearer <token>` header'ı ile gönderilir

#### Protected Routes

Frontend'de route koruması component seviyesinde yapılır:

```typescript
if (!isAuthenticated || !user) {
  return null; // veya redirect to login
}
```

### 5.6. Security Considerations

1. **Password Hashing:** bcryptjs ile 10 salt rounds
2. **JWT Secret:** Environment variable'dan alınır (production'da değiştirilmeli)
3. **Token Expiry:** 7 gün (configurable)
4. **HTTPS:** Production'da zorunlu (token'lar plain text gönderilir)
5. **Tenant Isolation:** Tüm queries tenantId ile filtrelenir
6. **Role-Based Access:** Frontend'de role kontrolü yapılır (backend'de şu an tam implement edilmemiş)

---

## Sonuç

Bu analiz belgesi, ARPDO Konut Projesi'nin tüm teknik detaylarını içermektedir:

- ✅ **50+ Backend API Endpoint**
- ✅ **Detaylı Response Schema'ları**
- ✅ **20+ Veritabanı Tablosu ve İlişkileri**
- ✅ **Frontend API Çağrı Haritası**
- ✅ **JWT-based Authentication & Authorization**

**Not:** Bu belge, projenin mevcut durumunu yansıtmaktadır. Geliştirme sürecinde değişiklikler olabilir.


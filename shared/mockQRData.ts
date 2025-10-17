export type QRCodeType = "worker_registration" | "meter_reading" | "document_upload";
export type QRStatus = "active" | "disabled" | "expired";

export type QRCodeData = {
  id: string;
  type: QRCodeType;
  code: string;
  title: string;
  status: QRStatus;
  usageLimit: number | null;
  usedCount: number;
  expiryDate: string | null;
  createdAt: string;
};

export const mockQRCodes: QRCodeData[] = [
  {
    id: "1",
    type: "worker_registration",
    code: "Kts3542MMA",
    title: "Geilenkirchen Evleri Kayıt Formu",
    status: "active",
    usageLimit: null,
    usedCount: 15,
    expiryDate: null,
    createdAt: "2025-10-01T10:00:00",
  },
  {
    id: "2",
    type: "meter_reading",
    code: "Br9Xm2pQwE",
    title: "Aylık Elektrik Sayaç Okuma",
    status: "active",
    usageLimit: 50,
    usedCount: 28,
    expiryDate: "2025-11-30",
    createdAt: "2025-10-05T14:30:00",
  },
  {
    id: "3",
    type: "document_upload",
    code: "Pq4Hn8TyLk",
    title: "Kimlik Belgesi Yükleme",
    status: "active",
    usageLimit: 100,
    usedCount: 67,
    expiryDate: "2025-12-31",
    createdAt: "2025-09-20T09:15:00",
  },
  {
    id: "4",
    type: "worker_registration",
    code: "DISABLED01",
    title: "Devre Dışı Form",
    status: "disabled",
    usageLimit: null,
    usedCount: 5,
    expiryDate: null,
    createdAt: "2025-08-15T11:00:00",
  },
  {
    id: "5",
    type: "meter_reading",
    code: "EXPIRED123",
    title: "Süresi Dolmuş Sayaç Okuma",
    status: "expired",
    usageLimit: 10,
    usedCount: 10,
    expiryDate: "2025-09-30",
    createdAt: "2025-08-01T08:00:00",
  },
  {
    id: "6",
    type: "meter_reading",
    code: "Dj3Ks9FmYu",
    title: "Su Sayacı Okuma - Hauptstrasse",
    status: "active",
    usageLimit: 30,
    usedCount: 12,
    expiryDate: "2025-12-15",
    createdAt: "2025-10-10T08:00:00",
  },
  {
    id: "7",
    type: "document_upload",
    code: "Zx8Pw3NqRt",
    title: "Sözleşme Dökümanı Upload",
    status: "active",
    usageLimit: null,
    usedCount: 3,
    expiryDate: null,
    createdAt: "2025-10-12T16:00:00",
  },
];

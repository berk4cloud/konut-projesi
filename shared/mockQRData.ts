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
  workerId?: string | null;
  houseId?: string | null;
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
];

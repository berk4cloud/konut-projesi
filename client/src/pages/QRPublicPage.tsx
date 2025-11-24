import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Building2, Upload, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { type QRCodeData, type QRCodeType, type QRStatus } from "@shared/mockQRData";
import { useTranslation } from "react-i18next";
import type { GuestRegistrationRequest } from "@/mocks/data/types";

export default function QRPublicPage() {
  const [, params] = useRoute("/qr/:code");
  const { toast } = useToast();
  const { t } = useTranslation();
  const code = params?.code || "";
  
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [existingRequest, setExistingRequest] = useState<GuestRegistrationRequest | null>(null);
  const [validationReason, setValidationReason] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [guestForm, setGuestForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "" as "male" | "female" | "",
    nationality: "",
    email: "",
    phone: "",
    startDate: "",
    jobTitle: "",
    department: "",
  });

  // Meter Reading Form
  const [meterForm, setMeterForm] = useState({
    house: "",
    meterType: "",
    value: "",
    notes: "",
    photo: null as File | null,
  });

  // Document Upload Form
  const [documentForm, setDocumentForm] = useState({
    workerName: "",
    documentType: "",
    file: null as File | null,
  });

  useEffect(() => {
    let isMounted = true;

    const validateQrCode = async () => {
      setIsValid(null);
      setValidationReason(null);
      setExistingRequest(null);

      try {
        const response = await fetch(`/api/qr-codes/${code}/validate`);
        
        if (!response.ok) {
          // Response başarısızsa, JSON parse etmeyi dene
          try {
            const errorData = await response.json();
            if (isMounted) {
              setQrData(errorData.qrCode || null);
              setExistingRequest(errorData.existingRequest || null);
              setValidationReason(errorData.reason || "not_found");
              setIsValid(false);
            }
          } catch {
            // JSON parse edilemezse
            if (isMounted) {
              setQrData(null);
              setValidationReason("not_found");
              setIsValid(false);
            }
          }
          return;
        }

        const data = await response.json();

        if (!data.valid) {
          if (isMounted) {
            setQrData(data.qrCode || null);
            setExistingRequest(data.existingRequest || null);
            setValidationReason(data.reason || "not_found");
            setIsValid(false);
          }
          return;
        }

        if (isMounted) {
          setQrData(data.qrCode);
          setIsValid(true);
        }

        // One-time protection double-check - sadece 1 kerelik QR kodlar için
        // Sınırsız veya çoklu kullanım için bu kontrol yapılmamalı
        // Not: usedCount >= usageLimit kontrolü zaten validateQRCode'da yapılıyor,
        // bu double-check sadece ekstra güvenlik için
        if (data.qrCode && data.qrCode.usageLimit === 1) {
          const requestResponse = await fetch(`/api/guest-registration-requests/by-code/${code}`);
          if (requestResponse.ok) {
            const requestData: GuestRegistrationRequest | null = await requestResponse.json();
            if (requestData && isMounted && requestData.status !== "REJECTED") {
              const reasonMap: Record<GuestRegistrationRequest["status"], string> = {
                PENDING: "pending_request",
                APPROVED: "already_used",
                REJECTED: "rejected_request",
              };
              setExistingRequest(requestData);
              setValidationReason(reasonMap[requestData.status]);
              setIsValid(false);
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          setIsValid(false);
          setValidationReason("network");
        }
      }
    };

    if (code) {
      validateQrCode();
    }

    return () => {
      isMounted = false;
    };
  }, [code]);

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrData) return;

    // Validation - Workers sayfasındaki gibi
    if (!guestForm.firstName || !guestForm.lastName || !guestForm.gender || !guestForm.email) {
      toast({
        title: t("qrPublic.validationError") || "Hata",
        description: t("qrPublic.requiredFields") || "Lütfen zorunlu alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Workers formundan Guest Registration Request formatına dönüştür
      const fullName = `${guestForm.firstName} ${guestForm.lastName}`.trim();
      const visitStartDate = guestForm.startDate || new Date().toISOString().split('T')[0];
      // Varsayılan olarak 30 gün sonra bitiş tarihi
      const visitEndDate = guestForm.startDate 
        ? new Date(new Date(guestForm.startDate).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        : new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const response = await fetch("/api/guest-registration-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrCode: code,
          fullName,
          country: guestForm.nationality || "",
          phone: guestForm.phone || "",
          email: guestForm.email,
          visitStartDate,
          visitEndDate,
          apartment: null,
          notes: guestForm.jobTitle || guestForm.department 
            ? `Pozisyon: ${guestForm.jobTitle || '-'}, Departman: ${guestForm.department || '-'}` 
            : null,
          gender: guestForm.gender || null,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Request failed");
      }

      toast({
        title: t("qrPublic.submitSuccessTitle"),
        description: t("qrPublic.submitSuccessDescription"),
      });
      setExistingRequest(payload);
      setIsSubmitted(true);
    } catch (error: any) {
      toast({
        title: t("qrPublic.submitErrorTitle") || "Hata",
        description: error?.message || t("qrPublic.submitErrorDescription"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMeterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Başarılı!",
      description: "Sayaç okuma bilgileriniz kaydedildi.",
    });
    setIsSubmitted(true);
  };

  const handleDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Başarılı!",
      description: "Dökümanınız başarıyla yüklendi.",
    });
    setIsSubmitted(true);
  };

  if (isValid === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isValid || !qrData) {
    const invalidDescription = () => {
      switch (validationReason) {
        case "status":
          return t("qrPublic.errors.disabled");
        case "expired":
          return t("qrPublic.errors.expired");
        case "limit":
          return t("qrPublic.errors.limit");
        case "pending_request":
          return t("qrPublic.status.pending");
        case "already_used":
          return t("qrPublic.status.approved");
        case "rejected_request":
          return t("qrPublic.status.rejected");
        case "network":
          return t("qrPublic.errors.network");
        case "not_found":
          return t("qrPublic.errors.notFound");
        default:
          return t("qrPublic.errors.notFound");
      }
    };

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl">{t("qrPublic.invalidTitle")}</CardTitle>
            <CardDescription className="text-base">
              {invalidDescription()}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            {t("qrPublic.contactAdmin")}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <CardTitle className="text-2xl">{t("qrPublic.submitSuccessTitle")}</CardTitle>
            <CardDescription className="text-base">
              {qrData.type === "worker_registration" && t("qrPublic.submitSuccessDescription")}
              {qrData.type === "meter_reading" && t("qrPublic.meterSuccess")}
              {qrData.type === "document_upload" && t("qrPublic.documentSuccess")}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Building2 className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">ARPDO HABITAT</h1>
          <p className="text-muted-foreground">{qrData.title}</p>
        </div>

        {/* Worker Registration Form */}
        {qrData.type === "worker_registration" && (
          <Card>
            <CardHeader>
              <CardTitle>{t("qrPublic.formTitle")}</CardTitle>
              <CardDescription>
                {t("qrPublic.formDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGuestSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">{t("workers.addDialog.firstName")}</Label>
                    <Input
                      id="firstName"
                      placeholder="John"
                      value={guestForm.firstName}
                      onChange={(e) => setGuestForm({ ...guestForm, firstName: e.target.value })}
                      required
                      data-testid="input-guest-firstname"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">{t("workers.addDialog.lastName")}</Label>
                    <Input
                      id="lastName"
                      placeholder="Doe"
                      value={guestForm.lastName}
                      onChange={(e) => setGuestForm({ ...guestForm, lastName: e.target.value })}
                      required
                      data-testid="input-guest-lastname"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">{t("workers.addDialog.birthDate")}</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={guestForm.dateOfBirth}
                      onChange={(e) => setGuestForm({ ...guestForm, dateOfBirth: e.target.value })}
                      data-testid="input-guest-dateOfBirth"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">{t("workers.addDialog.gender")}</Label>
                    <Select
                      value={guestForm.gender}
                      onValueChange={(value: "male" | "female") => setGuestForm({ ...guestForm, gender: value })}
                    >
                      <SelectTrigger id="gender" data-testid="select-guest-gender">
                        <SelectValue placeholder={t('workers.gender.selectPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{t('workers.gender.male')}</SelectItem>
                        <SelectItem value="female">{t('workers.gender.female')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nationality">{t("workers.addDialog.nationality")}</Label>
                    <Input
                      id="nationality"
                      placeholder="Türkiye"
                      value={guestForm.nationality}
                      onChange={(e) => setGuestForm({ ...guestForm, nationality: e.target.value })}
                      data-testid="input-guest-nationality"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t("workers.addDialog.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ornek@example.com"
                      value={guestForm.email}
                      onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                      required
                      data-testid="input-guest-email"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("workers.addDialog.phone")}</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+31 6 12345678"
                      value={guestForm.phone}
                      onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                      data-testid="input-guest-phone"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="startDate">{t("workers.addDialog.startDate")}</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={guestForm.startDate}
                      onChange={(e) => setGuestForm({ ...guestForm, startDate: e.target.value })}
                      data-testid="input-guest-startDate"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">{t("workers.addDialog.position")}</Label>
                    <Input
                      id="jobTitle"
                      placeholder="Temizlik Görevlisi"
                      value={guestForm.jobTitle}
                      onChange={(e) => setGuestForm({ ...guestForm, jobTitle: e.target.value })}
                      data-testid="input-guest-jobTitle"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="department">{t("workers.addDialog.department")}</Label>
                    <Input
                      id="department"
                      placeholder="Operasyon"
                      value={guestForm.department}
                      onChange={(e) => setGuestForm({ ...guestForm, department: e.target.value })}
                      data-testid="input-guest-department"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" data-testid="button-submit-guest" disabled={isSubmitting}>
                  {isSubmitting ? t("qrPublic.submitting") : t("qrPublic.submitButton")}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Meter Reading Form */}
        {qrData.type === "meter_reading" && (
          <Card>
            <CardHeader>
              <CardTitle>Sayaç Okuma Formu</CardTitle>
              <CardDescription>
                Sayaç bilgilerini girin ve fotoğraf ekleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMeterSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="house">Ev Adresi *</Label>
                  <Input
                    id="house"
                    value={meterForm.house}
                    onChange={(e) => setMeterForm({ ...meterForm, house: e.target.value })}
                    placeholder="Örn: Geldernstrasse 13"
                    required
                    data-testid="input-meter-house"
                  />
                </div>

                <div>
                  <Label htmlFor="meterType">Sayaç Tipi *</Label>
                  <Select
                    value={meterForm.meterType}
                    onValueChange={(value) => setMeterForm({ ...meterForm, meterType: value })}
                    required
                  >
                    <SelectTrigger id="meterType" data-testid="select-meter-type">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Elektrik">Elektrik</SelectItem>
                      <SelectItem value="Su">Su</SelectItem>
                      <SelectItem value="Gaz">Gaz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="value">Sayaç Değeri *</Label>
                  <Input
                    id="value"
                    type="number"
                    value={meterForm.value}
                    onChange={(e) => setMeterForm({ ...meterForm, value: e.target.value })}
                    placeholder="Örn: 12450"
                    required
                    data-testid="input-meter-value"
                  />
                </div>

                <div>
                  <Label htmlFor="photo">Sayaç Fotoğrafı *</Label>
                  <div className="mt-2">
                    <label
                      htmlFor="photo"
                      className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed rounded-lg cursor-pointer hover-elevate"
                    >
                      <Camera className="w-5 h-5" />
                      <span>{meterForm.photo ? meterForm.photo.name : "Fotoğraf Ekle"}</span>
                    </label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setMeterForm({ ...meterForm, photo: e.target.files?.[0] || null })}
                      className="hidden"
                      required
                      data-testid="input-meter-photo"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notlar (Opsiyonel)</Label>
                  <Textarea
                    id="notes"
                    value={meterForm.notes}
                    onChange={(e) => setMeterForm({ ...meterForm, notes: e.target.value })}
                    placeholder="Varsa ek bilgiler..."
                    data-testid="input-meter-notes"
                  />
                </div>

                <Button type="submit" className="w-full" data-testid="button-submit-meter">
                  Gönder
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Document Upload Form */}
        {qrData.type === "document_upload" && (
          <Card>
            <CardHeader>
              <CardTitle>Döküman Yükleme</CardTitle>
              <CardDescription>
                Gerekli belgeleri yükleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDocumentSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="workerName">İsim Soyisim *</Label>
                  <Input
                    id="workerName"
                    value={documentForm.workerName}
                    onChange={(e) => setDocumentForm({ ...documentForm, workerName: e.target.value })}
                    required
                    data-testid="input-document-worker-name"
                  />
                </div>

                <div>
                  <Label htmlFor="documentType">Döküman Tipi *</Label>
                  <Select
                    value={documentForm.documentType}
                    onValueChange={(value) => setDocumentForm({ ...documentForm, documentType: value })}
                    required
                  >
                    <SelectTrigger id="documentType" data-testid="select-document-type">
                      <SelectValue placeholder="Seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kimlik Kartı">Kimlik Kartı</SelectItem>
                      <SelectItem value="Pasaport">Pasaport</SelectItem>
                      <SelectItem value="İkamet İzni">İkamet İzni</SelectItem>
                      <SelectItem value="Diğer">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="file">Dosya *</Label>
                  <div className="mt-2">
                    <label
                      htmlFor="file"
                      className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed rounded-lg cursor-pointer hover-elevate"
                    >
                      <Upload className="w-5 h-5" />
                      <span>{documentForm.file ? documentForm.file.name : "Dosya Seç (PDF, JPG, PNG)"}</span>
                    </label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setDocumentForm({ ...documentForm, file: e.target.files?.[0] || null })}
                      className="hidden"
                      required
                      data-testid="input-document-file"
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" data-testid="button-submit-document">
                  Yükle
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

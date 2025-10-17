import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileText, Upload, X, Calendar, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { differenceInDays, format } from "date-fns";
import { tr } from "date-fns/locale";

type LeaseContractData = {
  startDate: string;
  endDate: string;
  monthlyRent: number;
  paymentDay: number;
  pdfFile?: string; // base64 encoded PDF
  pdfFileName?: string;
};

type LeaseContractDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  houseName: string;
  existingContract?: LeaseContractData;
  onSave: (contract: LeaseContractData) => void;
};

export default function LeaseContractDialog({
  open,
  onOpenChange,
  houseName,
  existingContract,
  onSave,
}: LeaseContractDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<LeaseContractData>(
    existingContract || {
      startDate: "",
      endDate: "",
      monthlyRent: 0,
      paymentDay: 1,
    }
  );

  // Reset form when dialog opens or house changes
  useEffect(() => {
    if (open) {
      // Try to load from localStorage first
      const contractKey = `lease_contract_${houseName.replace(/\s+/g, "_")}`;
      const savedContract = localStorage.getItem(contractKey);
      
      if (savedContract) {
        setFormData(JSON.parse(savedContract));
      } else if (existingContract) {
        setFormData(existingContract);
      } else {
        setFormData({
          startDate: "",
          endDate: "",
          monthlyRent: 0,
          paymentDay: 1,
        });
      }
    }
  }, [open, houseName, existingContract]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if PDF
    if (file.type !== "application/pdf") {
      toast({
        title: "Hatalı Dosya Tipi",
        description: "Sadece PDF dosyaları yüklenebilir",
        variant: "destructive",
      });
      return;
    }

    // Convert to base64 and store in localStorage
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData({
        ...formData,
        pdfFile: base64,
        pdfFileName: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setFormData({
      ...formData,
      pdfFile: undefined,
      pdfFileName: undefined,
    });
  };

  const handleSave = () => {
    // Validation
    if (!formData.startDate || !formData.endDate || !formData.monthlyRent) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm zorunlu alanları doldurun",
        variant: "destructive",
      });
      return;
    }

    // Save to localStorage
    const contractKey = `lease_contract_${houseName.replace(/\s+/g, "_")}`;
    localStorage.setItem(contractKey, JSON.stringify(formData));

    onSave(formData);
    onOpenChange(false);
    toast({
      title: "Sözleşme Kaydedildi",
      description: "Kira sözleşmesi başarıyla güncellendi",
    });
  };

  const handleViewPDF = () => {
    if (formData.pdfFile) {
      // Open PDF in new tab
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(
          `<iframe src="${formData.pdfFile}" width="100%" height="100%" style="border:none;"></iframe>`
        );
      }
    }
  };

  // Calculate days until end
  const daysUntilEnd = formData.endDate
    ? differenceInDays(new Date(formData.endDate), new Date())
    : null;

  const getExpiryBadge = () => {
    if (daysUntilEnd === null) return null;
    
    if (daysUntilEnd < 0) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="w-3 h-3" />
          Süresi dolmuş
        </Badge>
      );
    } else if (daysUntilEnd <= 30) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertCircle className="w-3 h-3" />
          {daysUntilEnd} gün kaldı
        </Badge>
      );
    } else if (daysUntilEnd <= 90) {
      return (
        <Badge className="gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20">
          <Calendar className="w-3 h-3" />
          {daysUntilEnd} gün kaldı
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="gap-1">
          <Calendar className="w-3 h-3" />
          {daysUntilEnd} gün kaldı
        </Badge>
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl" data-testid="dialog-lease-contract">
        <DialogHeader>
          <DialogTitle>Kira Sözleşmesi Bilgileri</DialogTitle>
          <DialogDescription>{houseName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Expiry Warning */}
          {formData.endDate && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sözleşme Bitiş Uyarısı:</span>
              {getExpiryBadge()}
            </div>
          )}

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-date">Başlangıç Tarihi *</Label>
              <Input
                id="start-date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                data-testid="input-start-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end-date">Bitiş Tarihi *</Label>
              <Input
                id="end-date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                data-testid="input-end-date"
              />
            </div>
          </div>

          {/* Monthly Rent & Payment Day */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthly-rent">Aylık Kira (EUR) *</Label>
              <Input
                id="monthly-rent"
                type="number"
                placeholder="2500"
                value={formData.monthlyRent || ""}
                onChange={(e) =>
                  setFormData({ ...formData, monthlyRent: Number(e.target.value) })
                }
                data-testid="input-monthly-rent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-day">Ödeme Günü *</Label>
              <Input
                id="payment-day"
                type="number"
                min="1"
                max="31"
                placeholder="Her ayın 1. günü"
                value={formData.paymentDay || ""}
                onChange={(e) =>
                  setFormData({ ...formData, paymentDay: Number(e.target.value) })
                }
                data-testid="input-payment-day"
              />
            </div>
          </div>

          {/* PDF Upload */}
          <div className="space-y-2">
            <Label>Kira Sözleşmesi (PDF)</Label>
            {formData.pdfFile ? (
              <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                <FileText className="w-8 h-8 text-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{formData.pdfFileName}</p>
                  <p className="text-xs text-muted-foreground">PDF dosyası</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleViewPDF}
                    data-testid="button-view-pdf"
                  >
                    Görüntüle
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    data-testid="button-remove-pdf"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  id="pdf-upload"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <label htmlFor="pdf-upload" className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    PDF dosyası yüklemek için tıklayın
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Sadece PDF dosyaları</p>
                </label>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-lease"
            >
              İptal
            </Button>
            <Button onClick={handleSave} data-testid="button-save-lease">
              Kaydet
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, QrCode, Copy, Eye, Edit, Trash2, Power, PowerOff, Users, Gauge, FileUp, Check } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { type QRCodeData, type QRCodeType, type QRStatus } from "@shared/mockQRData";

export default function QRManagement() {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const qrCodesQueryKey = user?.tenantId
    ? [`/api/qr-codes?tenantId=${user.tenantId}`]
    : ['/api/qr-codes'];
  
  // Fetch QR codes from API
  const { data: qrCodes = [], isLoading } = useQuery<QRCodeData[]>({
    queryKey: qrCodesQueryKey,
    enabled: !!user?.tenantId,
  });
  
  // Fetch houses from API
  type House = {
    id: string;
    name: string;
    address?: string;
  };
  const { data: houses = [] } = useQuery<House[]>({
    queryKey: [`/api/houses?tenantId=${user?.tenantId}`],
    enabled: !!user?.tenantId,
  });
  
  // Fetch workers from API (for document upload)
  type Worker = {
    id: string;
    firstName: string;
    lastName: string;
  };
  const { data: workers = [] } = useQuery<Worker[]>({
    queryKey: [`/api/workers?tenantId=${user?.tenantId}`],
    enabled: !!user?.tenantId,
  });
  
  // Create QR Dialog States
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: "worker_registration" as QRCodeType,
    title: "",
    usageLimit: "unlimited" as string,
    customLimit: "",
    expiryDays: "30" as string,
    houseId: "" as string,
    workerId: "" as string,
  });
  const [generatedCode, setGeneratedCode] = useState("");
  const publicBaseUrl = typeof window !== "undefined" ? window.location.origin : "https://apdohabitat.app";
  
  // View QR Dialog States
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedQR, setSelectedQR] = useState<QRCodeData | null>(null);
  
  // Fetch selected worker for document upload QR codes
  const { data: allWorkersForDialog = [] } = useQuery<Worker[]>({
    queryKey: [`/api/workers?tenantId=${user?.tenantId}`],
    enabled: !!selectedQR?.workerId && !!user?.tenantId && selectedQR.type === "document_upload",
  });
  const selectedWorker = selectedQR?.workerId 
    ? allWorkersForDialog.find((w: Worker) => w.id === selectedQR.workerId)
    : undefined;

  // Create QR mutation
  const createQRMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/qr-codes', data);
      return await response.json();
    },
    onSuccess: async () => {
      // Invalidate and refetch queries
      await queryClient.invalidateQueries({ queryKey: qrCodesQueryKey });
      // Also try to refetch explicitly
      await queryClient.refetchQueries({ queryKey: qrCodesQueryKey });
      toast({
        title: t('qrManagement.toasts.created.title'),
        description: t('qrManagement.toasts.created.description'),
      });
    },
    onError: (error: any) => {
      console.error('Error creating QR code:', error);
      toast({
        title: t('qrManagement.toasts.error.title') || 'Error',
        description: error?.message || t('qrManagement.toasts.error.description') || 'Failed to create QR code',
        variant: 'destructive',
      });
    },
  });

  // Update QR mutation
  const updateQRMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest('PATCH', `/api/qr-codes/${id}`, data);
      return await response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: qrCodesQueryKey });
      await queryClient.refetchQueries({ queryKey: qrCodesQueryKey });
    },
    onError: (error: any) => {
      console.error('Error updating QR code:', error);
      toast({
        title: t('qrManagement.toasts.error.title') || 'Error',
        description: error?.message || t('qrManagement.toasts.error.description') || 'Failed to update QR code',
        variant: 'destructive',
      });
    },
  });

  // Delete QR mutation
  const deleteQRMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest('DELETE', `/api/qr-codes/${id}`);
      return await response.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: qrCodesQueryKey });
      await queryClient.refetchQueries({ queryKey: qrCodesQueryKey });
      toast({
        title: t('qrManagement.toasts.deleted.title'),
        description: t('qrManagement.toasts.deleted.description'),
        variant: "destructive",
      });
    },
    onError: (error: any) => {
      console.error('Error deleting QR code:', error);
      toast({
        title: t('qrManagement.toasts.error.title') || 'Error',
        description: error?.message || t('qrManagement.toasts.error.description') || 'Failed to delete QR code',
        variant: 'destructive',
      });
    },
  });

  const filteredQRCodes = qrCodes.filter((qr) =>
    qr.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    qr.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeLabel = (type: QRCodeType) => {
    const labels = {
      worker_registration: t('qrManagement.types.workerRegistration'),
      meter_reading: t('qrManagement.types.meterReading'),
      document_upload: t('qrManagement.types.documentUpload'),
    };
    return labels[type];
  };

  const getTypeVariant = (type: QRCodeType) => {
    const variants = {
      worker_registration: "default",
      meter_reading: "secondary",
      document_upload: "outline",
    };
    return variants[type] as "default" | "secondary" | "outline";
  };

  const getStatusBadge = (status: QRStatus) => {
    const config = {
      active: { label: t('qrManagement.status.active'), variant: "default" as const },
      disabled: { label: t('qrManagement.status.disabled'), variant: "secondary" as const },
      expired: { label: t('qrManagement.status.expired'), variant: "destructive" as const },
    };
    return config[status];
  };

  const handleCopyLink = (code: string) => {
    const link = `${publicBaseUrl}/qr/${code}`;
    navigator.clipboard.writeText(link);
    toast({
      title: t('qrManagement.toasts.linkCopied.title'),
      description: t('qrManagement.toasts.linkCopied.description'),
    });
  };

  const handleToggleStatus = (id: string, currentStatus: QRStatus) => {
    if (currentStatus === "expired") return;
    
    const newStatus = currentStatus === "active" ? "disabled" : "active";
    updateQRMutation.mutate({ 
      id, 
      data: { status: newStatus } 
    }, {
      onSuccess: () => {
        toast({
          title: t('qrManagement.toasts.statusChanged.title'),
          description: t('qrManagement.toasts.statusChanged.description'),
        });
      }
    });
  };

  const handleDelete = (id: string) => {
    deleteQRMutation.mutate(id);
  };

  const getUsageText = (qr: QRCodeData) => {
    if (qr.usageLimit === null) {
      return `${qr.usedCount} / ${t('qrManagement.usage.unlimited')}`;
    }
    return `${qr.usedCount} / ${qr.usageLimit}`;
  };

  const getExpiryText = (expiryDate: string | null) => {
    if (!expiryDate) return t('qrManagement.usage.unlimited');
    const locale = i18n.language.split('-')[0];
    return new Date(expiryDate).toLocaleDateString(locale);
  };

  const generateQRCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < 10; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleOpenCreateDialog = () => {
    setStep(1);
    setFormData({
      type: "worker_registration",
      title: "",
      usageLimit: "unlimited",
      customLimit: "",
      expiryDays: "30",
      houseId: "",
      workerId: "",
    });
    setGeneratedCode("");
    setIsCreateDialogOpen(true);
  };

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      // Validate: If meter_reading is selected, houseId is required
      if (formData.type === "meter_reading" && !formData.houseId) {
        toast({
          title: t('qrManagement.createDialog.step2.validationError.title'),
          description: t('qrManagement.createDialog.step2.validationError.houseRequired'),
          variant: 'destructive',
        });
        return;
      }
      
      // Validate: If document_upload is selected, workerId is required
      if (formData.type === "document_upload" && !formData.workerId) {
        toast({
          title: t('qrManagement.createDialog.step2.validationError.title'),
          description: t('qrManagement.createDialog.step2.validationError.workerRequired'),
          variant: 'destructive',
        });
        return;
      }
      
      const code = generateQRCode();
      setGeneratedCode(code);
      
      const usageLimit = formData.usageLimit === "unlimited" 
        ? null 
        : formData.usageLimit === "custom"
        ? parseInt(formData.customLimit)
        : parseInt(formData.usageLimit);
      
      const expiryDate = formData.expiryDays === "unlimited"
        ? null
        : new Date(Date.now() + parseInt(formData.expiryDays) * 24 * 60 * 60 * 1000).toISOString();
      
      createQRMutation.mutate({
        tenantId: user?.tenantId,
        code,
        type: formData.type,
        title: formData.title || getTypeLabel(formData.type),
        usageLimit,
        expiryDate,
        status: "active",
        houseId: formData.houseId || undefined,
        workerId: formData.workerId || undefined,
      }, {
        onSuccess: async (data) => {
          console.log('QR code created successfully:', data);
          
          // Add workerId and houseId to the response data (backend doesn't return these)
          const qrCodeWithRelations: QRCodeData = {
            ...data,
            workerId: formData.workerId || undefined,
            houseId: formData.houseId || undefined,
          };
          
          // Update the query cache with the new QR code including workerId/houseId
          queryClient.setQueryData<QRCodeData[]>(qrCodesQueryKey, (oldData = []) => {
            // Remove the old entry if it exists (by id)
            const filtered = oldData.filter(qr => qr.id !== qrCodeWithRelations.id);
            // Add the new entry with workerId/houseId
            return [...filtered, qrCodeWithRelations];
          });
          
          // Refetch and merge to preserve workerId/houseId
          await queryClient.refetchQueries({ 
            queryKey: qrCodesQueryKey,
            exact: true 
          });
          
          // After refetch, update again to preserve workerId/houseId (backend doesn't return these)
          queryClient.setQueryData<QRCodeData[]>(qrCodesQueryKey, (oldData = []) => {
            return oldData.map(qr => {
              if (qr.id === qrCodeWithRelations.id) {
                return {
                  ...qr,
                  workerId: formData.workerId || undefined,
                  houseId: formData.houseId || undefined,
                };
              }
              return qr;
            });
          });
          
          setStep(3);
          toast({
            title: t('qrManagement.toasts.qrCreated.title'),
            description: t('qrManagement.toasts.qrCreated.description'),
          });
        },
        onError: (error: any) => {
          console.error('Error creating QR code in handleNextStep:', error);
          // Error handling is already done in createQRMutation.onError
        }
      });
    }
  };

  const handleCloseDialog = () => {
    setIsCreateDialogOpen(false);
    setStep(1);
  };

  const handleViewQR = (qr: QRCodeData) => {
    setSelectedQR(qr);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header tenantName="Cova B.V." userName="Admin" />

      <main className="container mx-auto p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-2xl font-bold mb-2">{t('qrManagement.pageTitle')}</h2>
              <p className="text-muted-foreground">{t('qrManagement.pageSubtitle')}</p>
            </div>
            <Button onClick={handleOpenCreateDialog} data-testid="button-create-qr">
              <Plus className="w-4 h-4 mr-2" />
              {t('qrManagement.createButton')}
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t('qrManagement.card.title')}</CardTitle>
              <CardDescription>
                {t('qrManagement.card.description', {
                  total: qrCodes.length,
                  active: qrCodes.filter(q => q.status === "active").length
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={t('qrManagement.search.placeholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-qr"
                />
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('qrManagement.table.type')}</TableHead>
                      <TableHead>{t('qrManagement.table.title')}</TableHead>
                      <TableHead>{t('qrManagement.table.code')}</TableHead>
                      <TableHead>{t('qrManagement.table.usage')}</TableHead>
                      <TableHead>{t('qrManagement.table.validity')}</TableHead>
                      <TableHead>{t('qrManagement.table.status')}</TableHead>
                      <TableHead className="text-right">{t('qrManagement.table.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQRCodes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          {t('qrManagement.table.empty')}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredQRCodes.map((qr) => (
                        <TableRow key={qr.id} data-testid={`qr-row-${qr.id}`}>
                          <TableCell>
                            <Badge variant={getTypeVariant(qr.type)}>
                              {getTypeLabel(qr.type)}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{qr.title}</TableCell>
                          <TableCell>
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {qr.code}
                            </code>
                          </TableCell>
                          <TableCell>{getUsageText(qr)}</TableCell>
                          <TableCell>{getExpiryText(qr.expiryDate)}</TableCell>
                          <TableCell>
                            <Badge variant={getStatusBadge(qr.status).variant}>
                              {getStatusBadge(qr.status).label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCopyLink(qr.code)}
                                data-testid={`button-copy-${qr.id}`}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewQR(qr)}
                                data-testid={`button-view-qr-${qr.id}`}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              {qr.status !== "expired" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleToggleStatus(qr.id, qr.status)}
                                  data-testid={`button-toggle-${qr.id}`}
                                >
                                  {qr.status === "active" ? (
                                    <PowerOff className="w-4 h-4" />
                                  ) : (
                                    <Power className="w-4 h-4" />
                                  )}
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(qr.id)}
                                data-testid={`button-delete-${qr.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Create QR Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {step === 1 && t('qrManagement.createDialog.step1.title')}
              {step === 2 && t('qrManagement.createDialog.step2.title')}
              {step === 3 && t('qrManagement.createDialog.step3.title')}
            </DialogTitle>
            <DialogDescription>
              {step === 1 && t('qrManagement.createDialog.step1.description')}
              {step === 2 && t('qrManagement.createDialog.step2.description')}
              {step === 3 && t('qrManagement.createDialog.step3.description')}
            </DialogDescription>
          </DialogHeader>

          {/* Step 1: Type Selection */}
          {step === 1 && (
            <div className="space-y-6 py-4">
              <RadioGroup
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as QRCodeType })}
              >
                <div className="space-y-3">
                  <label className="flex items-start gap-4 p-4 border rounded-lg hover-elevate cursor-pointer">
                    <RadioGroupItem value="worker_registration" id="type-worker" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-5 h-5 text-primary" />
                        <h4 className="font-medium">{t('qrManagement.createDialog.step1.workerType.title')}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t('qrManagement.createDialog.step1.workerType.description')}
                      </p>
                    </div>
                  </label>

                  {/* Sayaç Okuma ve Döküman Upload seçenekleri geçici olarak gizlendi - geri açmak için yorumları kaldırın */}
                  {/* <label className="flex items-start gap-4 p-4 border rounded-lg hover-elevate cursor-pointer">
                    <RadioGroupItem value="meter_reading" id="type-meter" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Gauge className="w-5 h-5 text-primary" />
                        <h4 className="font-medium">{t('qrManagement.createDialog.step1.meterType.title')}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t('qrManagement.createDialog.step1.meterType.description')}
                      </p>
                    </div>
                  </label> */}

                  {/* <label className="flex items-start gap-4 p-4 border rounded-lg hover-elevate cursor-pointer">
                    <RadioGroupItem value="document_upload" id="type-document" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <FileUp className="w-5 h-5 text-primary" />
                        <h4 className="font-medium">{t('qrManagement.createDialog.step1.documentType.title')}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t('qrManagement.createDialog.step1.documentType.description')}
                      </p>
                    </div>
                  </label> */}
                </div>
              </RadioGroup>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  {t('qrManagement.createDialog.step1.cancel')}
                </Button>
                <Button onClick={handleNextStep} data-testid="button-next-step-1">
                  {t('qrManagement.createDialog.step1.next')}
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Settings */}
          {step === 2 && (
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="qr-title">{t('qrManagement.createDialog.step2.titleLabel')}</Label>
                <Input
                  id="qr-title"
                  placeholder={t('qrManagement.createDialog.step2.titlePlaceholder')}
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  data-testid="input-qr-title"
                />
              </div>

              {/* House selection - required for meter_reading */}
              {formData.type === "meter_reading" && (
                <div className="space-y-2">
                  <Label htmlFor="house-select">
                    {t('qrManagement.createDialog.step2.houseLabel')} *
                  </Label>
                  <Select
                    value={formData.houseId}
                    onValueChange={(value) => setFormData({ ...formData, houseId: value })}
                  >
                    <SelectTrigger id="house-select" data-testid="select-house">
                      <SelectValue placeholder={t('qrManagement.createDialog.step2.housePlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {houses.map((house: any) => (
                        <SelectItem key={house.id} value={house.id}>
                          {house.name} {house.address ? `- ${house.address}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!formData.houseId && (
                    <p className="text-sm text-destructive">
                      {t('qrManagement.createDialog.step2.houseRequired')}
                    </p>
                  )}
                </div>
              )}

              {/* Worker selection - required for document_upload */}
              {formData.type === "document_upload" && (
                <div className="space-y-2">
                  <Label htmlFor="worker-select">
                    {t('qrManagement.createDialog.step2.workerLabel')} *
                  </Label>
                  <Select
                    value={formData.workerId}
                    onValueChange={(value) => setFormData({ ...formData, workerId: value })}
                  >
                    <SelectTrigger id="worker-select" data-testid="select-worker">
                      <SelectValue placeholder={t('qrManagement.createDialog.step2.workerPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {workers.map((worker) => (
                        <SelectItem key={worker.id} value={worker.id}>
                          {worker.firstName} {worker.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!formData.workerId && (
                    <p className="text-sm text-destructive">
                      {t('qrManagement.createDialog.step2.workerRequired')}
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="usage-limit">{t('qrManagement.createDialog.step2.usageLimitLabel')}</Label>
                <Select
                  value={formData.usageLimit}
                  onValueChange={(value) => setFormData({ ...formData, usageLimit: value })}
                >
                  <SelectTrigger id="usage-limit" data-testid="select-usage-limit">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unlimited">{t('qrManagement.createDialog.step2.usageLimitOptions.unlimited')}</SelectItem>
                    <SelectItem value="1">{t('qrManagement.createDialog.step2.usageLimitOptions.1')}</SelectItem>
                    <SelectItem value="5">{t('qrManagement.createDialog.step2.usageLimitOptions.5')}</SelectItem>
                    <SelectItem value="10">{t('qrManagement.createDialog.step2.usageLimitOptions.10')}</SelectItem>
                    <SelectItem value="50">{t('qrManagement.createDialog.step2.usageLimitOptions.50')}</SelectItem>
                    <SelectItem value="100">{t('qrManagement.createDialog.step2.usageLimitOptions.100')}</SelectItem>
                    <SelectItem value="custom">{t('qrManagement.createDialog.step2.usageLimitOptions.custom')}</SelectItem>
                  </SelectContent>
                </Select>
                {formData.usageLimit === "custom" && (
                  <Input
                    type="number"
                    placeholder={t('qrManagement.createDialog.step2.customPlaceholder')}
                    value={formData.customLimit}
                    onChange={(e) => setFormData({ ...formData, customLimit: e.target.value })}
                    className="mt-2"
                    data-testid="input-custom-limit"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiry-days">{t('qrManagement.createDialog.step2.expiryLabel')}</Label>
                <Select
                  value={formData.expiryDays}
                  onValueChange={(value) => setFormData({ ...formData, expiryDays: value })}
                >
                  <SelectTrigger id="expiry-days" data-testid="select-expiry-days">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unlimited">{t('qrManagement.createDialog.step2.expiryOptions.unlimited')}</SelectItem>
                    <SelectItem value="1">{t('qrManagement.createDialog.step2.expiryOptions.1')}</SelectItem>
                    <SelectItem value="3">{t('qrManagement.createDialog.step2.expiryOptions.3')}</SelectItem>
                    <SelectItem value="7">{t('qrManagement.createDialog.step2.expiryOptions.7')}</SelectItem>
                    <SelectItem value="30">{t('qrManagement.createDialog.step2.expiryOptions.30')}</SelectItem>
                    <SelectItem value="180">{t('qrManagement.createDialog.step2.expiryOptions.180')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  {t('qrManagement.createDialog.step2.back')}
                </Button>
                <Button 
                  onClick={handleNextStep} 
                  data-testid="button-create-qr-submit"
                  disabled={
                    (formData.type === "meter_reading" && !formData.houseId) ||
                    (formData.type === "document_upload" && !formData.workerId)
                  }
                >
                  {t('qrManagement.createDialog.step2.create')}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-600 dark:text-green-500" />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">{t('qrManagement.createDialog.step3.success')}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t('qrManagement.createDialog.step3.successDescription')}
                  </p>
                </div>

                <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center border">
                  <QrCode className="w-32 h-32 text-muted-foreground" />
                </div>

                <div className="w-full p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">{t('qrManagement.createDialog.step3.link')}</p>
                  <code className="text-sm break-all">
                    {publicBaseUrl}/qr/{generatedCode}
                  </code>
                </div>

                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleCopyLink(generatedCode)}
                    data-testid="button-copy-generated-link"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {t('qrManagement.createDialog.step3.copyLink')}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    data-testid="button-download-qr"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    {t('qrManagement.createDialog.step3.downloadQR')}
                  </Button>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleCloseDialog} data-testid="button-close-success">
                  {t('qrManagement.createDialog.step3.done')}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* View QR Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t('qrManagement.viewDialog.title')}</DialogTitle>
            <DialogDescription>
              {selectedQR?.title || getTypeLabel(selectedQR?.type || "worker_registration")}
            </DialogDescription>
          </DialogHeader>

          {selectedQR && (
            <div className="space-y-6 py-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-64 h-64 bg-muted rounded-lg flex items-center justify-center border">
                  <QrCode className="w-48 h-48 text-muted-foreground" />
                </div>

                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="text-xs text-muted-foreground">{t('qrManagement.viewDialog.link')}</p>
                      <code className="text-sm">{publicBaseUrl}/qr/{selectedQR.code}</code>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopyLink(selectedQR.code)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">{t('qrManagement.viewDialog.type')}</p>
                      <Badge variant={getTypeVariant(selectedQR.type)}>
                        {getTypeLabel(selectedQR.type)}
                      </Badge>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">{t('qrManagement.viewDialog.status')}</p>
                      <Badge variant={getStatusBadge(selectedQR.status).variant}>
                        {getStatusBadge(selectedQR.status).label}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">{t('qrManagement.viewDialog.usage')}</p>
                      <p className="text-sm font-medium">{getUsageText(selectedQR)}</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">{t('qrManagement.viewDialog.validity')}</p>
                      <p className="text-sm font-medium">{getExpiryText(selectedQR.expiryDate)}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">{t('qrManagement.viewDialog.createdAt')}</p>
                    <p className="text-sm font-medium">
                      {new Date(selectedQR.createdAt).toLocaleDateString(i18n.language.split('-')[0])}
                    </p>
                  </div>

                  {/* Show worker info for document_upload type */}
                  {selectedQR.type === "document_upload" && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        {t('qrManagement.viewDialog.worker') || 'Konaklayan'}
                      </p>
                      <p className="text-sm font-medium">
                        {selectedQR.workerId ? (
                          selectedWorker 
                            ? `${selectedWorker.firstName} ${selectedWorker.lastName}`
                            : t('qrManagement.viewDialog.loading') || 'Yükleniyor...'
                        ) : (
                          <span className="text-muted-foreground">
                            {t('qrManagement.viewDialog.notSelected') || 'Seçilmemiş'}
                          </span>
                        )}
                      </p>
                    </div>
                  )}

                  {/* Show house info for meter_reading type */}
                  {selectedQR.type === "meter_reading" && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">
                        {t('qrManagement.viewDialog.house') || 'Konut'}
                      </p>
                      <p className="text-sm font-medium">
                        {selectedQR.houseId ? (
                          houses.find((h: House) => h.id === selectedQR.houseId)?.name || 
                          t('qrManagement.viewDialog.loading') || 'Yükleniyor...'
                        ) : (
                          <span className="text-muted-foreground">
                            {t('qrManagement.viewDialog.notSelected') || 'Seçilmemiş'}
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 w-full pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleCopyLink(selectedQR.code)}
                    data-testid="button-copy-qr-link"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {t('qrManagement.viewDialog.copyLink')}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    data-testid="button-download-qr-view"
                  >
                    <QrCode className="w-4 h-4 mr-2" />
                    {t('qrManagement.viewDialog.downloadQR')}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

import { useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Globe, Star, Save, DollarSign, Languages } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { systemSettings, saveSystemSettings } from "./Houses";

interface Country {
  name: string;
  isDefault: boolean;
}

type CurrencyType = "EUR" | "USD" | "TRY" | "GBP" | "CHF" | "CAD" | "MXN" | "CNY" | "JPY" | "RUB" | "SEK" | "NOK" | "DKK" | "HUF" | "PLN" | "CZK" | "RON" | "BGN" | "RSD" | "UAH";

const currencyOptions: { value: CurrencyType; label: string; symbol: string }[] = [
  { value: "EUR", label: "Euro (EUR)", symbol: "€" },
  { value: "USD", label: "Amerikan Doları (USD)", symbol: "$" },
  { value: "GBP", label: "İngiliz Sterlini (GBP)", symbol: "£" },
  { value: "CHF", label: "İsviçre Frangı (CHF)", symbol: "CHF" },
  { value: "CAD", label: "Kanada Doları (CAD)", symbol: "C$" },
  { value: "MXN", label: "Meksika Pesosu (MXN)", symbol: "$" },
  { value: "CNY", label: "Çin Yuanı (CNY)", symbol: "¥" },
  { value: "JPY", label: "Japon Yeni (JPY)", symbol: "¥" },
  { value: "TRY", label: "Türk Lirası (TRY)", symbol: "₺" },
  { value: "RUB", label: "Rus Rublesi (RUB)", symbol: "₽" },
  { value: "SEK", label: "İsveç Kronu (SEK)", symbol: "kr" },
  { value: "NOK", label: "Norveç Kronu (NOK)", symbol: "kr" },
  { value: "DKK", label: "Danimarka Kronu (DKK)", symbol: "kr" },
  { value: "HUF", label: "Macar Forinti (HUF)", symbol: "Ft" },
  { value: "PLN", label: "Polonya Zlotisi (PLN)", symbol: "zł" },
  { value: "CZK", label: "Çek Korunası (CZK)", symbol: "Kč" },
  { value: "RON", label: "Romanya Leyi (RON)", symbol: "lei" },
  { value: "BGN", label: "Bulgar Levası (BGN)", symbol: "лв" },
  { value: "RSD", label: "Sırp Dinarı (RSD)", symbol: "дин" },
  { value: "UAH", label: "Ukrayna Hryvnyası (UAH)", symbol: "₴" },
];

const languageOptions = [
  { value: "tr", label: "Türkçe" },
  { value: "en", label: "English" },
  { value: "de", label: "Deutsch" },
  { value: "nl", label: "Nederlands" },
  { value: "fr", label: "Français" },
  { value: "pl", label: "Polski" },
  { value: "bg", label: "Български" },
];

export default function Settings() {
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  
  // Language settings - use resolvedLanguage to normalize region codes (en-US -> en)
  const currentLang = i18n.resolvedLanguage || i18n.language.split('-')[0] || 'tr';
  const [language, setLanguage] = useState(currentLang);
  const [hasLanguageChanges, setHasLanguageChanges] = useState(false);
  
  // Currency settings - initialize from systemSettings
  const [currency, setCurrency] = useState<CurrencyType>(systemSettings.currency);
  const [hasCurrencyChanges, setHasCurrencyChanges] = useState(false);
  
  const [countries, setCountries] = useState<Country[]>([
    { name: "Hollanda", isDefault: true },
    { name: "Almanya", isDefault: false },
    { name: "Polonya", isDefault: false },
    { name: "Romanya", isDefault: false },
  ]);
  const [newCountry, setNewCountry] = useState("");
  
  // Pricing settings state
  const [dailyRentalEnabled, setDailyRentalEnabled] = useState(systemSettings.dailyRentalEnabled);
  const [bedDailyPrice, setBedDailyPrice] = useState(systemSettings.standardPricing.bedDailyPrice.toString());
  const [bedMonthlyPrice, setBedMonthlyPrice] = useState(systemSettings.standardPricing.bedMonthlyPrice.toString());
  const [roomDailyPrice, setRoomDailyPrice] = useState(systemSettings.standardPricing.roomDailyPrice.toString());
  const [roomMonthlyPrice, setRoomMonthlyPrice] = useState(systemSettings.standardPricing.roomMonthlyPrice.toString());

  const handleAddCountry = () => {
    if (newCountry.trim() && !countries.some(c => c.name === newCountry.trim())) {
      setCountries([...countries, { name: newCountry.trim(), isDefault: false }]);
      setNewCountry("");
    }
  };

  const handleRemoveCountry = (countryName: string) => {
    setCountries(countries.filter((c) => c.name !== countryName));
  };

  const handleSetDefault = (countryName: string) => {
    setCountries(countries.map(c => ({
      ...c,
      isDefault: c.name === countryName
    })));
  };
  
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    setHasLanguageChanges(true);
  };
  
  const handleSaveLanguage = () => {
    i18n.changeLanguage(language);
    toast({
      title: t("settings.changesSaved"),
      description: `${languageOptions.find(l => l.value === language)?.label}`,
    });
    setHasLanguageChanges(false);
  };
  
  const handleCurrencyChange = (value: CurrencyType) => {
    setCurrency(value);
    setHasCurrencyChanges(true);
  };
  
  const handleSaveCurrency = () => {
    // Update global settings and persist to localStorage
    systemSettings.currency = currency;
    saveSystemSettings(systemSettings);
    
    toast({
      title: "Para Birimi Güncellendi",
      description: `Sistem para birimi ${currency} olarak ayarlandı.`,
    });
    setHasCurrencyChanges(false);
  };
  
  const handleSavePricing = () => {
    // Validation
    const prices = {
      bedDaily: parseFloat(bedDailyPrice),
      bedMonthly: parseFloat(bedMonthlyPrice),
      roomDaily: parseFloat(roomDailyPrice),
      roomMonthly: parseFloat(roomMonthlyPrice),
    };

    if (dailyRentalEnabled) {
      if (isNaN(prices.bedDaily) || prices.bedDaily <= 0 ||
          isNaN(prices.roomDaily) || prices.roomDaily <= 0) {
        toast({
          title: "Hata",
          description: "Günlük fiyatlar geçerli olmalıdır",
          variant: "destructive",
        });
        return;
      }
    }

    if (isNaN(prices.bedMonthly) || prices.bedMonthly <= 0 ||
        isNaN(prices.roomMonthly) || prices.roomMonthly <= 0) {
      toast({
        title: "Hata",
        description: "Aylık fiyatlar geçerli olmalıdır",
        variant: "destructive",
      });
      return;
    }

    // Update global settings and persist to localStorage
    systemSettings.dailyRentalEnabled = dailyRentalEnabled;
    if (dailyRentalEnabled) {
      systemSettings.standardPricing.bedDailyPrice = prices.bedDaily;
      systemSettings.standardPricing.roomDailyPrice = prices.roomDaily;
    }
    systemSettings.standardPricing.bedMonthlyPrice = prices.bedMonthly;
    systemSettings.standardPricing.roomMonthlyPrice = prices.roomMonthly;
    saveSystemSettings(systemSettings);

    toast({
      title: "Kaydedildi",
      description: "Standart fiyatlar güncellendi",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header tenantName="Cova B.V." userName="Admin" />

      <main className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">{t("settings.title")}</h2>
            <p className="text-muted-foreground">{t("settings.subtitle")}</p>
          </div>

          {/* Language Settings Card */}
          <Card data-testid="card-language-settings">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="w-5 h-5" />
                {t("settings.language")}
              </CardTitle>
              <CardDescription>
                {t("settings.selectLanguage")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language-select">{t("settings.selectLanguage")}</Label>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger id="language-select" data-testid="select-language" className="w-full sm:w-[360px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languageOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} data-testid={`option-language-${option.value}`}>
                        <div className="flex items-center gap-3">
                          <Globe className="w-4 h-4" />
                          <span className="font-medium">{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Current Selection Display */}
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center gap-3">
                  <Globe className="w-6 h-6 text-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">{t("languages." + language)}</p>
                    <p className="text-2xl font-bold" data-testid="text-selected-language">
                      {languageOptions.find(l => l.value === language)?.label}
                    </p>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSaveLanguage}
                  disabled={!hasLanguageChanges}
                  data-testid="button-save-language"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {t("common.save")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Currency Settings Card */}
          <Card data-testid="card-currency-settings">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Para Birimi
              </CardTitle>
              <CardDescription>
                Sistemde kullanılacak para birimini belirleyin. Bu ayar tüm fiyatlandırma ve faturalandırma işlemlerinde kullanılacaktır.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency-select">Para Birimi Seçin</Label>
                <Select value={currency} onValueChange={handleCurrencyChange}>
                  <SelectTrigger id="currency-select" data-testid="select-currency" className="w-full sm:w-[360px]">
                    <SelectValue placeholder="Para birimi seçin" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {currencyOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} data-testid={`option-currency-${option.value}`}>
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-semibold text-primary min-w-[32px]">{option.symbol}</span>
                          <span className="font-medium">{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Current Selection Display */}
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Seçili Para Birimi</p>
                    <p className="text-2xl font-bold" data-testid="text-selected-currency">
                      {currencyOptions.find(o => o.value === currency)?.symbol} {currency}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {currencyOptions.find(o => o.value === currency)?.label.replace(/\s*\([A-Z]{3}\)/, '')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSaveCurrency}
                  disabled={!hasCurrencyChanges}
                  data-testid="button-save-currency"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Para Birimini Kaydet
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Ülke Yönetimi
              </CardTitle>
              <CardDescription>
                Filtrelerde kullanılacak ülkeleri ekleyin veya kaldırın. ⭐ Varsayılan ülke, filtrelerde otomatik seçilir ve yeni veri girişlerinde (konut, çalışan) varsayılan değer olarak kullanılır.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newCountry">Yeni Ülke Ekle</Label>
                <div className="flex gap-2">
                  <Input
                    id="newCountry"
                    placeholder="Ülke adı..."
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddCountry()}
                    data-testid="input-new-country"
                  />
                  <Button onClick={handleAddCountry} data-testid="button-add-country">
                    <Plus className="w-4 h-4 mr-2" />
                    Ekle
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Mevcut Ülkeler ({countries.length})</Label>
                <div className="flex flex-wrap gap-2">
                  {countries.map((country) => (
                    <Badge
                      key={country.name}
                      variant={country.isDefault ? "default" : "secondary"}
                      className="px-3 py-2 text-sm flex items-center gap-2"
                      data-testid={`country-badge-${country.name}`}
                    >
                      {country.isDefault ? (
                        <Star className="w-3 h-3 fill-current" />
                      ) : (
                        <Globe className="w-3 h-3" />
                      )}
                      {country.name}
                      {country.isDefault && (
                        <span className="text-xs opacity-80">(Varsayılan)</span>
                      )}
                      <div className="flex items-center gap-1 ml-1">
                        {!country.isDefault && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 hover:bg-transparent"
                            onClick={() => handleSetDefault(country.name)}
                            data-testid={`button-set-default-${country.name}`}
                            title="Varsayılan yap"
                          >
                            <Star className="w-3 h-3 text-yellow-500" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-auto p-0 hover:bg-transparent"
                          onClick={() => handleRemoveCountry(country.name)}
                          data-testid={`button-remove-${country.name}`}
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  ⭐ Varsayılan ülke filtrelerde otomatik seçili gelir
                </p>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-pricing-settings">
            <CardHeader>
              <CardTitle>Standart Fiyatlandırma</CardTitle>
              <CardDescription>
                Tüm konutlar için varsayılan fiyatlar. Konut veya oda bazında özelleştirilebilir.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Daily Rental Mode Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="daily-rental-mode" className="text-base font-semibold">
                    Günlük Kiralama Modu
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Açık olduğunda hem günlük hem aylık fiyatlar gösterilir
                  </p>
                </div>
                <Switch
                  id="daily-rental-mode"
                  data-testid="switch-daily-rental-mode"
                  checked={dailyRentalEnabled}
                  onCheckedChange={setDailyRentalEnabled}
                />
              </div>

              {/* Bed Pricing */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Yatak Fiyatları</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {dailyRentalEnabled && (
                      <div className="space-y-2">
                        <Label htmlFor="bed-daily-price">Günlük Fiyat (€)</Label>
                        <Input
                          id="bed-daily-price"
                          data-testid="input-bed-daily-price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={bedDailyPrice}
                          onChange={(e) => setBedDailyPrice(e.target.value)}
                          placeholder="25.00"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="bed-monthly-price">Aylık Fiyat (€)</Label>
                      <Input
                        id="bed-monthly-price"
                        data-testid="input-bed-monthly-price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={bedMonthlyPrice}
                        onChange={(e) => setBedMonthlyPrice(e.target.value)}
                        placeholder="600.00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Room Pricing */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Oda Fiyatları (Tüm Oda)</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {dailyRentalEnabled && (
                      <div className="space-y-2">
                        <Label htmlFor="room-daily-price">Günlük Fiyat (€)</Label>
                        <Input
                          id="room-daily-price"
                          data-testid="input-room-daily-price"
                          type="number"
                          step="0.01"
                          min="0"
                          value={roomDailyPrice}
                          onChange={(e) => setRoomDailyPrice(e.target.value)}
                          placeholder="60.00"
                        />
                      </div>
                    )}
                    <div className="space-y-2">
                      <Label htmlFor="room-monthly-price">Aylık Fiyat (€)</Label>
                      <Input
                        id="room-monthly-price"
                        data-testid="input-room-monthly-price"
                        type="number"
                        step="0.01"
                        min="0"
                        value={roomMonthlyPrice}
                        onChange={(e) => setRoomMonthlyPrice(e.target.value)}
                        placeholder="1500.00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button
                  onClick={handleSavePricing}
                  data-testid="button-save-pricing"
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Fiyatları Kaydet
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Info Card */}
          <Card data-testid="card-pricing-info">
            <CardHeader>
              <CardTitle>Fiyatlandırma Hiyerarşisi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <p className="font-medium">Fiyatlar şu öncelik sırasına göre uygulanır:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2 text-muted-foreground">
                  <li>Oda bazında özel fiyat (en yüksek öncelik)</li>
                  <li>Konut bazında özel fiyat</li>
                  <li>Standart sistem fiyatı (yukarıda)</li>
                </ol>
              </div>
              <div className="space-y-2 text-sm pt-2 border-t">
                <p className="font-medium">Hesaplama Mantığı:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                  <li>30 günden az: Günlük fiyat × gün sayısı</li>
                  <li>30 gün ve üzeri: (Tam aylar × aylık fiyat) + (kalan günler × günlük fiyat)</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

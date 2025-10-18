import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Plus, Trash2, Globe, Star, Save, DollarSign, Languages, Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Country {
  isoCode: string;
  nameTr: string;
  nameEn: string;
  nameDe: string;
  nameNl: string;
  nameFr: string;
  namePl: string;
  nameBg: string;
  flagEmoji: string | null;
  phoneCode: string | null;
  isActive: boolean;
}

interface Tenant {
  id: string;
  name: string;
  slug: string;
  currency: CurrencyType;
  pricingSettings: {
    dailyRentalEnabled: boolean;
    standardPricing: {
      bedDailyPrice: number;
      bedMonthlyPrice: number;
      roomDailyPrice: number;
      roomMonthlyPrice: number;
    };
  };
  favoriteCountries?: string[];
  defaultCountry?: string | null;
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
  const { user, isAuthenticated } = useAuth();
  
  // Auth guard
  if (!isAuthenticated || !user) {
    return null;
  }
  
  // Language settings - use resolvedLanguage to normalize region codes (en-US -> en)
  const currentLang = i18n.resolvedLanguage || i18n.language.split('-')[0] || 'tr';
  const [language, setLanguage] = useState(currentLang);
  const [hasLanguageChanges, setHasLanguageChanges] = useState(false);
  
  // State for settings
  const [currency, setCurrency] = useState<CurrencyType>("EUR");
  const [hasCurrencyChanges, setHasCurrencyChanges] = useState(false);
  
  const [favoriteCountries, setFavoriteCountries] = useState<string[]>([]);
  const [defaultCountry, setDefaultCountry] = useState<string | null>(null);
  const [hasCountryChanges, setHasCountryChanges] = useState(false);
  
  const [dailyRentalEnabled, setDailyRentalEnabled] = useState(false);
  const [bedDailyPrice, setBedDailyPrice] = useState("25");
  const [bedMonthlyPrice, setBedMonthlyPrice] = useState("600");
  const [roomDailyPrice, setRoomDailyPrice] = useState("70");
  const [roomMonthlyPrice, setRoomMonthlyPrice] = useState("1700");

  // Fetch countries
  const { data: countries = [], isLoading: isLoadingCountries } = useQuery<Country[]>({
    queryKey: ["/api/countries"],
  });

  // Fetch current tenant data
  const { data: tenantData, isLoading: isLoadingTenant } = useQuery<Tenant>({
    queryKey: [`/api/tenants/${user.tenantId}`],
    enabled: !!user.tenantId,
  });

  // Update state when tenant data is fetched
  useEffect(() => {
    if (tenantData) {
      setCurrency(tenantData.currency);
      setFavoriteCountries(tenantData.favoriteCountries || []);
      setDefaultCountry(tenantData.defaultCountry || null);
      setDailyRentalEnabled(tenantData.pricingSettings.dailyRentalEnabled);
      setBedDailyPrice(tenantData.pricingSettings.standardPricing.bedDailyPrice.toString());
      setBedMonthlyPrice(tenantData.pricingSettings.standardPricing.bedMonthlyPrice.toString());
      setRoomDailyPrice(tenantData.pricingSettings.standardPricing.roomDailyPrice.toString());
      setRoomMonthlyPrice(tenantData.pricingSettings.standardPricing.roomMonthlyPrice.toString());
    }
  }, [tenantData]);

  // Update tenant mutation
  const updateTenantMutation = useMutation({
    mutationFn: async (updates: Partial<Tenant>) => {
      return await apiRequest("PATCH", `/api/tenants/${user.tenantId}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tenants/${user.tenantId}`] });
      toast({
        title: t("settings.changesSaved"),
        description: t("settings.saved"),
      });
    },
    onError: () => {
      toast({
        title: t("common.error"),
        description: t("settings.saveFailed"),
        variant: "destructive",
      });
    },
  });

  // Helper to get country name in current language
  const getCountryName = (country: Country) => {
    const langMap: Record<string, keyof Country> = {
      tr: "nameTr",
      en: "nameEn",
      de: "nameDe",
      nl: "nameNl",
      fr: "nameFr",
      pl: "namePl",
      bg: "nameBg",
    };
    const nameKey = langMap[i18n.language] || "nameEn";
    return country[nameKey] as string;
  };

  const handleToggleFavorite = (isoCode: string) => {
    setFavoriteCountries(prev => 
      prev.includes(isoCode) 
        ? prev.filter(c => c !== isoCode)
        : [...prev, isoCode]
    );
    setHasCountryChanges(true);
  };

  const handleSetDefaultCountry = (isoCode: string) => {
    setDefaultCountry(isoCode);
    // Also add to favorites if not already there
    if (!favoriteCountries.includes(isoCode)) {
      setFavoriteCountries(prev => [...prev, isoCode]);
    }
    setHasCountryChanges(true);
  };

  const handleSaveCountrySettings = () => {
    updateTenantMutation.mutate({
      favoriteCountries,
      defaultCountry,
    });
    setHasCountryChanges(false);
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
    updateTenantMutation.mutate({ currency });
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
                {t("settings.currency")}
              </CardTitle>
              <CardDescription>
                {t("settings.currencyDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currency-select">{t("settings.selectCurrency")}</Label>
                <Select value={currency} onValueChange={handleCurrencyChange}>
                  <SelectTrigger id="currency-select" data-testid="select-currency" className="w-full sm:w-[360px]">
                    <SelectValue placeholder={t("settings.selectCurrencyPrompt")} />
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
                  {t("common.save")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-country-settings">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                {t("settings.countryManagement")}
              </CardTitle>
              <CardDescription>
                {t("settings.countryManagementDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Favorite Countries */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">
                  {t("settings.favoriteCountries")} ({favoriteCountries.length})
                </Label>
                <div className="rounded-lg border bg-muted/30 p-4 max-h-[400px] overflow-y-auto space-y-2">
                  {isLoadingCountries ? (
                    <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
                  ) : (
                    countries.map((country) => (
                      <div
                        key={country.isoCode}
                        className="flex items-center justify-between p-2 rounded hover-elevate"
                        data-testid={`country-item-${country.isoCode}`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={`country-${country.isoCode}`}
                            checked={favoriteCountries.includes(country.isoCode)}
                            onCheckedChange={() => handleToggleFavorite(country.isoCode)}
                            data-testid={`checkbox-country-${country.isoCode}`}
                          />
                          <label
                            htmlFor={`country-${country.isoCode}`}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            {country.flagEmoji && (
                              <span className="text-xl">{country.flagEmoji}</span>
                            )}
                            <span className="font-medium">{getCountryName(country)}</span>
                            <span className="text-xs text-muted-foreground">({country.isoCode})</span>
                          </label>
                        </div>
                        <div className="flex items-center gap-2">
                          {defaultCountry === country.isoCode && (
                            <Badge variant="default" className="gap-1">
                              <Star className="w-3 h-3 fill-current" />
                              {t("settings.default")}
                            </Badge>
                          )}
                          {favoriteCountries.includes(country.isoCode) && defaultCountry !== country.isoCode && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetDefaultCountry(country.isoCode)}
                              data-testid={`button-set-default-${country.isoCode}`}
                              title={t("settings.makeDefault")}
                            >
                              <Star className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  ⭐ {t('settings.defaultCountryInfo')}
                </p>
              </div>

              {/* Current Favorites Display */}
              {favoriteCountries.length > 0 && (
                <div className="rounded-lg border bg-muted/50 p-4">
                  <Label className="text-sm font-medium text-muted-foreground mb-2 block">
                    {t("settings.selectedFavorites")}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {countries
                      .filter(c => favoriteCountries.includes(c.isoCode))
                      .map((country) => (
                        <Badge
                          key={country.isoCode}
                          variant={defaultCountry === country.isoCode ? "default" : "secondary"}
                          className="gap-1"
                        >
                          {country.flagEmoji} {getCountryName(country)}
                          {defaultCountry === country.isoCode && (
                            <Star className="w-3 h-3 fill-current" />
                          )}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="flex justify-end pt-2">
                <Button
                  onClick={handleSaveCountrySettings}
                  disabled={!hasCountryChanges || updateTenantMutation.isPending}
                  data-testid="button-save-countries"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateTenantMutation.isPending ? t("common.saving") : t("common.save")}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-pricing-settings">
            <CardHeader>
              <CardTitle>{t("settings.standardPricing")}</CardTitle>
              <CardDescription>
                {t("settings.standardPricingDesc")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Daily Rental Mode Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <Label htmlFor="daily-rental-mode" className="text-base font-semibold">
                    {t("settings.dailyRentalMode")}
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.dailyRentalModeDesc")}
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
                  <h3 className="text-lg font-semibold mb-3">{t("settings.bedPricing")}</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {dailyRentalEnabled && (
                      <div className="space-y-2">
                        <Label htmlFor="bed-daily-price">{t("settings.dailyPrice")}</Label>
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
                      <Label htmlFor="bed-monthly-price">{t("settings.monthlyPrice")}</Label>
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
                  <h3 className="text-lg font-semibold mb-3">{t("settings.roomPricing")}</h3>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {dailyRentalEnabled && (
                      <div className="space-y-2">
                        <Label htmlFor="room-daily-price">{t("settings.dailyPrice")}</Label>
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
                      <Label htmlFor="room-monthly-price">{t("settings.monthlyPrice")}</Label>
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
                  {t("settings.savePricing")}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Info Card */}
          <Card data-testid="card-pricing-info">
            <CardHeader>
              <CardTitle>{t("settings.pricingHierarchy")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <p className="font-medium">{t("settings.pricingHierarchyDesc")}</p>
                <ol className="list-decimal list-inside space-y-1 ml-2 text-muted-foreground">
                  <li>{t("settings.hierarchy1")}</li>
                  <li>{t("settings.hierarchy2")}</li>
                  <li>{t("settings.hierarchy3")}</li>
                </ol>
              </div>
              <div className="space-y-2 text-sm pt-2 border-t">
                <p className="font-medium">{t("settings.calculationLogic")}</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-muted-foreground">
                  <li>{t("settings.calculation1")}</li>
                  <li>{t("settings.calculation2")}</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

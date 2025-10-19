import { useState } from "react";
import { Building2, MapPin, Globe, Filter, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const countryLabels: Record<string, string> = {
  nl: "Hollanda",
  de: "Almanya",
  pl: "Polonya",
  ro: "Romanya",
  tr: "Türkiye",
};

interface FilterPanelProps {
  selectedHouse: string;
  setSelectedHouse: (house: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  showEmptyOnly: boolean;
  setShowEmptyOnly: (show: boolean) => void;
  houses: Array<{ id: string; name: string; city: string; country: string }>;
}

export default function FilterPanel({
  selectedHouse,
  setSelectedHouse,
  selectedCity,
  setSelectedCity,
  selectedCountry,
  setSelectedCountry,
  showEmptyOnly,
  setShowEmptyOnly,
  houses: allHouses,
}: FilterPanelProps) {
  const { t } = useTranslation();
  
  const [houseOpen, setHouseOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);

  // Extract unique values from houses
  const houses = [
    { value: "all", label: t('filters.allHouses') },
    ...allHouses.map((h) => ({ value: h.id, label: h.name })),
  ];

  const cities = [
    { value: "all", label: t('filters.allCities') },
    ...Array.from(new Set(allHouses.map((h) => h.city.toLowerCase())))
      .map((city) => ({
        value: city,
        label: allHouses.find((h) => h.city.toLowerCase() === city)?.city || city,
      })),
  ];

  const countries = [
    { value: "all", label: t('filters.allCountries') },
    ...Array.from(new Set(allHouses.map((h) => h.country)))
      .map((country) => ({
        value: country,
        label: countryLabels[country] || country,
      })),
  ];

  return (
    <div className="bg-card rounded-lg p-6 space-y-6 border">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{t('filters.title')}</h3>
        <Filter className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="space-y-4">
        {/* Date filter moved to page header - it's now the "zero point" for all date calculations */}
        
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            {t('filters.house')}
          </Label>
          <Popover open={houseOpen} onOpenChange={setHouseOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={houseOpen}
                className="w-full justify-between"
                data-testid="select-filter-house"
              >
                {selectedHouse
                  ? houses.find((house) => house.value === selectedHouse)?.label
                  : t('filters.selectHouse')}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder={t('filters.searchHouse')} />
                <CommandList>
                  <CommandEmpty>{t('filters.noHouseFound')}</CommandEmpty>
                  <CommandGroup>
                    {houses.map((house) => (
                      <CommandItem
                        key={house.value}
                        value={house.label}
                        onSelect={() => {
                          setSelectedHouse(house.value);
                          setHouseOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedHouse === house.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {house.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {t('filters.city')}
          </Label>
          <Popover open={cityOpen} onOpenChange={setCityOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={cityOpen}
                className="w-full justify-between"
                data-testid="select-filter-city"
              >
                {selectedCity
                  ? cities.find((city) => city.value === selectedCity)?.label
                  : t('filters.selectCity')}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder={t('filters.searchCity')} />
                <CommandList>
                  <CommandEmpty>{t('filters.noCityFound')}</CommandEmpty>
                  <CommandGroup>
                    {cities.map((city) => (
                      <CommandItem
                        key={city.value}
                        value={city.label}
                        onSelect={() => {
                          setSelectedCity(city.value);
                          setCityOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCity === city.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {city.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {t('filters.country')}
          </Label>
          <Popover open={countryOpen} onOpenChange={setCountryOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={countryOpen}
                className="w-full justify-between"
                data-testid="select-filter-country"
              >
                {selectedCountry
                  ? countries.find((country) => country.value === selectedCountry)?.label
                  : t('filters.selectCountry')}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder={t('filters.searchCountry')} />
                <CommandList>
                  <CommandEmpty>{t('filters.noCountryFound')}</CommandEmpty>
                  <CommandGroup>
                    {countries.map((country) => (
                      <CommandItem
                        key={country.value}
                        value={country.label}
                        onSelect={() => {
                          setSelectedCountry(country.value);
                          setCountryOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedCountry === country.value ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {country.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Checkbox
            id="emptyOnly"
            checked={showEmptyOnly}
            onCheckedChange={(checked) => setShowEmptyOnly(checked as boolean)}
            data-testid="checkbox-empty-only"
          />
          <Label
            htmlFor="emptyOnly"
            className="text-sm font-medium cursor-pointer"
          >
            {t('filters.showEmptyOnly')}
          </Label>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setSelectedHouse("all");
            setSelectedCity("all");
            setSelectedCountry("all");
            setShowEmptyOnly(false);
          }}
          data-testid="button-clear-filters"
        >
          {t('filters.clearFilters')}
        </Button>
      </div>
    </div>
  );
}

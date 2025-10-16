import { useState } from "react";
import { Calendar as CalendarIcon, Building2, MapPin, Globe, Filter, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
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
import { format } from "date-fns";
import { tr } from "date-fns/locale";

const countryLabels: Record<string, string> = {
  nl: "Hollanda",
  de: "Almanya",
  pl: "Polonya",
  ro: "Romanya",
  tr: "Türkiye",
};

interface FilterPanelProps {
  dateString: string;
  setDateString: (date: string) => void;
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
  dateString,
  setDateString,
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
  
  const [houseOpen, setHouseOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);

  const selectedDate = dateString ? new Date(dateString) : undefined;

  // Extract unique values from houses
  const houses = [
    { value: "all", label: "Tüm Evler" },
    ...allHouses.map((h) => ({ value: h.id, label: h.name })),
  ];

  const cities = [
    { value: "all", label: "Tüm Şehirler" },
    ...Array.from(new Set(allHouses.map((h) => h.city.toLowerCase())))
      .map((city) => ({
        value: city,
        label: allHouses.find((h) => h.city.toLowerCase() === city)?.city || city,
      })),
  ];

  const countries = [
    { value: "all", label: "Tüm Ülkeler" },
    ...Array.from(new Set(allHouses.map((h) => h.country)))
      .map((country) => ({
        value: country,
        label: countryLabels[country] || country,
      })),
  ];

  return (
    <div className="bg-card rounded-lg p-6 space-y-6 border">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filtreler</h3>
        <Filter className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" />
            Tarih
          </Label>
          <Popover open={dateOpen} onOpenChange={setDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
                data-testid="button-filter-date"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP", { locale: tr }) : "Tarih seçin"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3 border-b flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDateString(new Date().toISOString().split("T")[0]);
                    setDateOpen(false);
                  }}
                  data-testid="button-today"
                >
                  Bugün
                </Button>
              </div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(newDate) => {
                  if (newDate) {
                    setDateString(newDate.toISOString().split("T")[0]);
                    setDateOpen(false);
                  }
                }}
                numberOfMonths={2}
                locale={tr}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Ev
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
                  : "Ev seçin..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Ev ara..." />
                <CommandList>
                  <CommandEmpty>Ev bulunamadı.</CommandEmpty>
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
            Şehir
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
                  : "Şehir seçin..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Şehir ara..." />
                <CommandList>
                  <CommandEmpty>Şehir bulunamadı.</CommandEmpty>
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
            Ülke
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
                  : "Ülke seçin..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Ülke ara..." />
                <CommandList>
                  <CommandEmpty>Ülke bulunamadı.</CommandEmpty>
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
            Sadece boş yatakları göster
          </Label>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setDateString(new Date().toISOString().split("T")[0]);
            setSelectedHouse("all");
            setSelectedCity("all");
            setSelectedCountry("all");
            setShowEmptyOnly(false);
          }}
          data-testid="button-clear-filters"
        >
          Filtreleri Temizle
        </Button>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Calendar, Building2, MapPin, Globe, Filter, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const houses = [
  { value: "all", label: "Tüm Evler" },
  { value: "h1", label: "Geldernstrasse 13" },
  { value: "h2", label: "Hauptstrasse 45" },
  { value: "h3", label: "Marktplatz 7" },
];

const cities = [
  { value: "all", label: "Tüm Şehirler" },
  { value: "geilenkirchen", label: "Geilenkirchen" },
  { value: "venlo", label: "Venlo" },
  { value: "roermond", label: "Roermond" },
];

const countries = [
  { value: "all", label: "Tüm Ülkeler" },
  { value: "nl", label: "Hollanda" },
  { value: "de", label: "Almanya" },
  { value: "pl", label: "Polonya" },
  { value: "ro", label: "Romanya" },
];

export default function FilterPanel() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedHouse, setSelectedHouse] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [showEmptyOnly, setShowEmptyOnly] = useState(false);
  
  const [houseOpen, setHouseOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);

  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filtreler</h3>
        <Filter className="w-4 h-4 text-gray-500" />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Tarih
          </Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            data-testid="input-filter-date"
          />
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
                        value={house.value}
                        onSelect={(currentValue) => {
                          setSelectedHouse(currentValue === selectedHouse ? "all" : currentValue);
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
                        value={city.value}
                        onSelect={(currentValue) => {
                          setSelectedCity(currentValue === selectedCity ? "all" : currentValue);
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
                        value={country.value}
                        onSelect={(currentValue) => {
                          setSelectedCountry(currentValue === selectedCountry ? "all" : currentValue);
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
          onClick={() => console.log("Clear filters")}
          data-testid="button-clear-filters"
        >
          Filtreleri Temizle
        </Button>
      </div>
    </div>
  );
}

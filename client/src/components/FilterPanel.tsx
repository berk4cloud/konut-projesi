import { useState } from "react";
import { Calendar, Building2, MapPin, Globe, Filter } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";

export default function FilterPanel() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedHouse, setSelectedHouse] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [showEmptyOnly, setShowEmptyOnly] = useState(false);

  return (
    <div className="bg-gray-50 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Filters</h3>
        <Filter className="w-4 h-4 text-gray-500" />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Date
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
          <Label htmlFor="house" className="flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            House
          </Label>
          <Select value={selectedHouse} onValueChange={setSelectedHouse}>
            <SelectTrigger id="house" data-testid="select-filter-house">
              <SelectValue placeholder="All Houses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Houses</SelectItem>
              <SelectItem value="h1">Geldernstrasse 13</SelectItem>
              <SelectItem value="h2">Hauptstrasse 45</SelectItem>
              <SelectItem value="h3">Marktplatz 7</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            City
          </Label>
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger id="city" data-testid="select-filter-city">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              <SelectItem value="geilenkirchen">Geilenkirchen</SelectItem>
              <SelectItem value="venlo">Venlo</SelectItem>
              <SelectItem value="roermond">Roermond</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Country
          </Label>
          <Select>
            <SelectTrigger data-testid="select-filter-country">
              <SelectValue placeholder="All Countries" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Countries</SelectItem>
              <SelectItem value="nl">Netherlands</SelectItem>
              <SelectItem value="de">Germany</SelectItem>
              <SelectItem value="pl">Poland</SelectItem>
              <SelectItem value="ro">Romania</SelectItem>
            </SelectContent>
          </Select>
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
            Show only empty beds
          </Label>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => console.log("Clear filters")}
          data-testid="button-clear-filters"
        >
          Clear Filters
        </Button>
      </div>
    </div>
  );
}

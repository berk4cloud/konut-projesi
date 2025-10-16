import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Globe, Star } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Country {
  name: string;
  isDefault: boolean;
}

export default function Settings() {
  const [countries, setCountries] = useState<Country[]>([
    { name: "Hollanda", isDefault: true },
    { name: "Almanya", isDefault: false },
    { name: "Polonya", isDefault: false },
    { name: "Romanya", isDefault: false },
  ]);
  const [newCountry, setNewCountry] = useState("");

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

  return (
    <div className="min-h-screen bg-background">
      <Header tenantName="Cova B.V." userName="Admin" />

      <main className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Ayarlar</h2>
            <p className="text-muted-foreground">Sistem ayarlarını yönetin</p>
          </div>

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

          <Card>
            <CardHeader>
              <CardTitle>Genel Ayarlar</CardTitle>
              <CardDescription>
                Uygulama genel ayarları (Yakında)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Diğer ayarlar geliştirilme aşamasında...
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

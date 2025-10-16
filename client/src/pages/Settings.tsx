import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Globe } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Settings() {
  const [countries, setCountries] = useState([
    "Hollanda",
    "Almanya",
    "Polonya",
    "Romanya",
  ]);
  const [newCountry, setNewCountry] = useState("");

  const handleAddCountry = () => {
    if (newCountry.trim() && !countries.includes(newCountry.trim())) {
      setCountries([...countries, newCountry.trim()]);
      setNewCountry("");
    }
  };

  const handleRemoveCountry = (country: string) => {
    setCountries(countries.filter((c) => c !== country));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header tenantName="Cova B.V." userName="Admin" />

      <main className="p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Ayarlar</h2>
            <p className="text-gray-600">Sistem ayarlarını yönetin</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Ülke Yönetimi
              </CardTitle>
              <CardDescription>
                Filtrelerde kullanılacak ülkeleri ekleyin veya kaldırın
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
                      key={country}
                      variant="secondary"
                      className="px-3 py-2 text-sm"
                      data-testid={`country-badge-${country}`}
                    >
                      <Globe className="w-3 h-3 mr-2" />
                      {country}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto p-0 ml-2 hover:bg-transparent"
                        onClick={() => handleRemoveCountry(country)}
                        data-testid={`button-remove-${country}`}
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </Button>
                    </Badge>
                  ))}
                </div>
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
              <p className="text-sm text-gray-500">
                Diğer ayarlar geliştirilme aşamasında...
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

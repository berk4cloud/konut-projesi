import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Building2, MapPin, Edit, Bed } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Initial mock data
const initialMockHouses = [
  {
    id: "h1",
    name: "Geldernstrasse 13",
    address: "Geldernstrasse 13, 52511",
    city: "Geilenkirchen",
    country: "Almanya",
    totalRooms: 3,
    totalBeds: 18,
    occupiedBeds: 12,
    ownershipType: "Kiralık",
  },
  {
    id: "h2",
    name: "Hauptstrasse 45",
    address: "Hauptstrasse 45, 5911",
    city: "Venlo",
    country: "Hollanda",
    totalRooms: 2,
    totalBeds: 24,
    occupiedBeds: 18,
    ownershipType: "Mülk",
  },
  {
    id: "h3",
    name: "Marktplatz 7",
    address: "Marktplatz 7, 6041",
    city: "Roermond",
    country: "Hollanda",
    totalRooms: 2,
    totalBeds: 12,
    occupiedBeds: 8,
    ownershipType: "3. Taraf",
  },
];

export default function Houses() {
  const [houses, setHouses] = useState(initialMockHouses);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState<typeof initialMockHouses[0] | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    country: "Hollanda", // Default from settings
    totalRooms: "",
    totalBeds: "",
    ownershipType: "Kiralık",
  });

  const filteredHouses = houses.filter(
    (house) =>
      house.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      house.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      house.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddNew = () => {
    setEditingHouse(null);
    setFormData({
      name: "",
      address: "",
      city: "",
      country: "Hollanda",
      totalRooms: "",
      totalBeds: "",
      ownershipType: "Kiralık",
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (house: typeof initialMockHouses[0]) => {
    setEditingHouse(house);
    setFormData({
      name: house.name,
      address: house.address,
      city: house.city,
      country: house.country,
      totalRooms: house.totalRooms.toString(),
      totalBeds: house.totalBeds.toString(),
      ownershipType: house.ownershipType,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    console.log("Saving house:", formData);
    
    if (editingHouse) {
      // Update existing house
      setHouses(houses.map(h => 
        h.id === editingHouse.id 
          ? {
              ...h,
              name: formData.name,
              address: formData.address,
              city: formData.city,
              country: formData.country,
              totalRooms: parseInt(formData.totalRooms) || 0,
              totalBeds: parseInt(formData.totalBeds) || 0,
              ownershipType: formData.ownershipType,
            }
          : h
      ));
    } else {
      // Add new house (mock - no occupiedBeds data)
      const newHouse = {
        id: `h${houses.length + 1}`,
        name: formData.name,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        totalRooms: parseInt(formData.totalRooms) || 0,
        totalBeds: parseInt(formData.totalBeds) || 0,
        occupiedBeds: 0, // Default to 0 for new houses
        ownershipType: formData.ownershipType,
      };
      setHouses([...houses, newHouse]);
    }
    
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header tenantName="Cova B.V." userName="Admin" />

      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Konutlar</h2>
              <p className="text-gray-600">Tüm konutları görüntüleyin ve yönetin</p>
            </div>
            <Button onClick={handleAddNew} data-testid="button-add-house">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Konut Ekle
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Konut ara (adres, şehir)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-house"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHouses.map((house) => {
              const occupancyRate = ((house.occupiedBeds / house.totalBeds) * 100).toFixed(0);
              const emptyBeds = house.totalBeds - house.occupiedBeds;

              return (
                <Card key={house.id} className="hover:shadow-lg transition-shadow" data-testid={`house-card-${house.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg" data-testid={`text-house-name-${house.id}`}>
                            {house.name}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-1 mt-1" data-testid={`text-house-city-${house.id}`}>
                            <MapPin className="w-3 h-3" />
                            {house.city}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge variant="outline" data-testid={`text-ownership-type-${house.id}`}>
                        {house.ownershipType}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-gray-600">
                      <p data-testid={`text-house-address-${house.id}`}>{house.address}</p>
                      <p className="text-xs mt-1" data-testid={`text-house-country-${house.id}`}>
                        {house.country}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-3 border-t border-b">
                      <div>
                        <p className="text-xs text-gray-500">Oda Sayısı</p>
                        <p className="text-lg font-semibold" data-testid={`text-room-count-${house.id}`}>
                          {house.totalRooms}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Toplam Yatak</p>
                        <p className="text-lg font-semibold flex items-center gap-1" data-testid={`text-total-beds-${house.id}`}>
                          <Bed className="w-4 h-4" />
                          {house.totalBeds}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Doluluk</span>
                        <span className="font-semibold" data-testid={`text-occupancy-rate-${house.id}`}>
                          {occupancyRate}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 transition-all duration-300"
                          style={{ width: `${occupancyRate}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span data-testid={`text-occupied-beds-${house.id}`}>
                          Dolu: {house.occupiedBeds}
                        </span>
                        <span data-testid={`text-empty-beds-${house.id}`}>
                          Boş: {emptyBeds}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleEdit(house)}
                      data-testid={`button-edit-house-${house.id}`}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Düzenle
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredHouses.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500" data-testid="text-no-houses">
                Konut bulunamadı
              </p>
            </div>
          )}
        </div>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingHouse ? "Konut Düzenle" : "Yeni Konut Ekle"}
            </DialogTitle>
            <DialogDescription>
              {editingHouse 
                ? "Konut bilgilerini güncelleyin" 
                : "Yeni konut bilgilerini girin. Varsayılan ülke ayarlardan otomatik seçilir."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Konut Adı *</Label>
              <Input
                id="name"
                placeholder="örn: Geldernstrasse 13"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                data-testid="input-house-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adres *</Label>
              <Input
                id="address"
                placeholder="örn: Geldernstrasse 13, 52511"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                data-testid="input-house-address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Şehir *</Label>
                <Input
                  id="city"
                  placeholder="örn: Geilenkirchen"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  data-testid="input-house-city"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Ülke *</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData({ ...formData, country: value })}
                >
                  <SelectTrigger id="country" data-testid="select-house-country">
                    <SelectValue placeholder="Ülke seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Hollanda">Hollanda</SelectItem>
                    <SelectItem value="Almanya">Almanya</SelectItem>
                    <SelectItem value="Polonya">Polonya</SelectItem>
                    <SelectItem value="Romanya">Romanya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ownershipType">Mülkiyet Tipi *</Label>
              <Select
                value={formData.ownershipType}
                onValueChange={(value) => setFormData({ ...formData, ownershipType: value })}
              >
                <SelectTrigger id="ownershipType" data-testid="select-ownership-type">
                  <SelectValue placeholder="Mülkiyet tipi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kiralık">Kiralık</SelectItem>
                  <SelectItem value="Mülk">Mülk</SelectItem>
                  <SelectItem value="3. Taraf">3. Taraf</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalRooms">Oda Sayısı *</Label>
                <Input
                  id="totalRooms"
                  type="number"
                  placeholder="örn: 3"
                  value={formData.totalRooms}
                  onChange={(e) => setFormData({ ...formData, totalRooms: e.target.value })}
                  data-testid="input-total-rooms"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalBeds">Toplam Yatak *</Label>
                <Input
                  id="totalBeds"
                  type="number"
                  placeholder="örn: 18"
                  value={formData.totalBeds}
                  onChange={(e) => setFormData({ ...formData, totalBeds: e.target.value })}
                  data-testid="input-total-beds"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              data-testid="button-cancel"
            >
              İptal
            </Button>
            <Button onClick={handleSave} data-testid="button-save-house">
              {editingHouse ? "Güncelle" : "Kaydet"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

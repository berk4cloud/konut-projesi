import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, User, Info } from "lucide-react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type Worker = {
  id: string;
  name: string;
  birthDate: string;
  gender: string;
  country: string;
  house: string;
  room: string;
  bed: string;
};

// Mock houses for dropdowns
const mockHouses = [
  { id: "h1", name: "Geldernstrasse 13", rooms: ["45", "46", "47"] },
  { id: "h2", name: "Hauptstrasse 45", rooms: ["101", "102"] },
  { id: "h3", name: "Marktplatz 7", rooms: ["201", "202"] },
];

export default function Workers() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [workers, setWorkers] = useState<Worker[]>([
    { id: "1", name: "John Doe", birthDate: "1980-10-22", gender: "Erkek", country: "Hollanda", house: "Geldernstrasse 13", room: "45", bed: "1" },
    { id: "2", name: "Jane Smith", birthDate: "1992-05-15", gender: "Kadın", country: "Almanya", house: "Geldernstrasse 13", room: "45", bed: "3" },
    { id: "3", name: "Mike Johnson", birthDate: "1985-11-30", gender: "Erkek", country: "Polonya", house: "Geldernstrasse 13", room: "47", bed: "1" },
    { id: "4", name: "Sarah Williams", birthDate: "1988-03-08", gender: "Kadın", country: "Romanya", house: "Hauptstrasse 45", room: "101", bed: "2" },
    { id: "5", name: "Tom Brown", birthDate: "1995-07-12", gender: "Erkek", country: "Hollanda", house: "Hauptstrasse 45", room: "102", bed: "1" },
  ]);
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    gender: "",
    country: "",
    house: "",
    room: "",
    bed: "",
  });

  const filteredWorkers = workers.filter((worker) =>
    worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.house.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.birthDate.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleOpenAddDialog = () => {
    setFormData({
      name: "",
      birthDate: "",
      gender: "",
      country: "",
      house: "",
      room: "",
      bed: "",
    });
    setIsAddDialogOpen(true);
  };
  
  const handleOpenEditDialog = (worker: Worker) => {
    setSelectedWorker(worker);
    setFormData({
      name: worker.name,
      birthDate: worker.birthDate,
      gender: worker.gender,
      country: worker.country,
      house: worker.house,
      room: worker.room,
      bed: worker.bed,
    });
    setIsEditDialogOpen(true);
  };
  
  const handleSaveWorker = () => {
    if (!formData.name || !formData.birthDate || !formData.gender || !formData.country) {
      toast({
        title: "Hata",
        description: "Lütfen tüm zorunlu alanları doldurun",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedWorker) {
      // Edit mode
      setWorkers(workers.map((w) => 
        w.id === selectedWorker.id ? { ...w, ...formData } : w
      ));
      toast({
        title: "Başarılı",
        description: "Çalışan bilgileri güncellendi",
      });
      setIsEditDialogOpen(false);
    } else {
      // Add mode
      const newWorker: Worker = {
        id: Date.now().toString(),
        ...formData,
      };
      setWorkers([...workers, newWorker]);
      toast({
        title: "Başarılı",
        description: "Yeni çalışan eklendi",
      });
      setIsAddDialogOpen(false);
    }
    
    setSelectedWorker(null);
  };
  
  const selectedHouseData = mockHouses.find(h => h.name === formData.house);
  const availableRooms = selectedHouseData?.rooms || [];

  return (
    <div className="min-h-screen bg-background">
      <Header tenantName="Cova B.V." userName="Admin" />

      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Çalışanlar</h2>
              <p className="text-muted-foreground">Tüm çalışanları görüntüleyin ve yönetin</p>
            </div>
            <Button onClick={handleOpenAddDialog} data-testid="button-add-worker">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Çalışan Ekle
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Çalışan ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10"
              data-testid="input-search-worker"
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground cursor-help" data-testid="icon-search-info" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">İsim, ev, doğum tarihi veya ülke ile arama yapabilirsiniz</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="bg-card rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Çalışan</TableHead>
                  <TableHead>Cinsiyet</TableHead>
                  <TableHead>Ülke</TableHead>
                  <TableHead>Konaklama</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkers.map((worker) => (
                  <TableRow key={worker.id} data-testid={`worker-row-${worker.id}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <div data-testid={`text-worker-name-${worker.id}`}>
                            {worker.name}
                          </div>
                          <div 
                            className="text-xs text-muted-foreground mt-0.5" 
                            data-testid={`text-worker-birthdate-${worker.id}`}
                          >
                            {worker.birthDate}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{worker.gender}</TableCell>
                    <TableCell>{worker.country}</TableCell>
                    <TableCell className="text-sm">
                      {worker.house ? (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-foreground">{worker.house}</span>
                          <span className="text-muted-foreground text-xs">
                            Oda {worker.room} • Yatak {worker.bed}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Atanmamış</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleOpenEditDialog(worker)}
                        data-testid={`button-edit-${worker.id}`}
                      >
                        Düzenle
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredWorkers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Çalışan bulunamadı</p>
            </div>
          )}
        </div>
      </main>

      {/* Add Worker Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Çalışan Ekle</DialogTitle>
            <DialogDescription>
              Yeni bir çalışan kaydı oluşturun
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-name">İsim Soyisim *</Label>
                <Input
                  id="add-name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="input-worker-name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="add-birthdate">Doğum Tarihi *</Label>
                <Input
                  id="add-birthdate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  data-testid="input-worker-birthdate"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-gender">Cinsiyet *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger id="add-gender" data-testid="select-worker-gender">
                    <SelectValue placeholder="Cinsiyet seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Erkek">Erkek</SelectItem>
                    <SelectItem value="Kadın">Kadın</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="add-country">Ülke *</Label>
                <Input
                  id="add-country"
                  placeholder="Hollanda"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  data-testid="input-worker-country"
                />
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Konaklama Bilgileri (İsteğe Bağlı)</h4>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="add-house">Ev</Label>
                  <Select
                    value={formData.house}
                    onValueChange={(value) => {
                      setFormData({ ...formData, house: value, room: "", bed: "" });
                    }}
                  >
                    <SelectTrigger id="add-house" data-testid="select-worker-house">
                      <SelectValue placeholder="Ev seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockHouses.map((house) => (
                        <SelectItem key={house.id} value={house.name}>
                          {house.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="add-room">Oda</Label>
                  <Select
                    value={formData.room}
                    onValueChange={(value) => setFormData({ ...formData, room: value })}
                    disabled={!formData.house}
                  >
                    <SelectTrigger id="add-room" data-testid="select-worker-room">
                      <SelectValue placeholder="Oda seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRooms.map((room) => (
                        <SelectItem key={room} value={room}>
                          Oda {room}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="add-bed">Yatak</Label>
                  <Input
                    id="add-bed"
                    placeholder="1"
                    value={formData.bed}
                    onChange={(e) => setFormData({ ...formData, bed: e.target.value })}
                    data-testid="input-worker-bed"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
                data-testid="button-cancel-add"
              >
                İptal
              </Button>
              <Button
                onClick={handleSaveWorker}
                data-testid="button-save-worker"
              >
                Kaydet
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Worker Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Çalışan Düzenle</DialogTitle>
            <DialogDescription>
              {selectedWorker?.name} bilgilerini güncelleyin
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">İsim Soyisim *</Label>
                <Input
                  id="edit-name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  data-testid="input-edit-worker-name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-birthdate">Doğum Tarihi *</Label>
                <Input
                  id="edit-birthdate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  data-testid="input-edit-worker-birthdate"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-gender">Cinsiyet *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger id="edit-gender" data-testid="select-edit-worker-gender">
                    <SelectValue placeholder="Cinsiyet seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Erkek">Erkek</SelectItem>
                    <SelectItem value="Kadın">Kadın</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-country">Ülke *</Label>
                <Input
                  id="edit-country"
                  placeholder="Hollanda"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  data-testid="input-edit-worker-country"
                />
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Konaklama Bilgileri (İsteğe Bağlı)</h4>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-house">Ev</Label>
                  <Select
                    value={formData.house}
                    onValueChange={(value) => {
                      setFormData({ ...formData, house: value, room: "", bed: "" });
                    }}
                  >
                    <SelectTrigger id="edit-house" data-testid="select-edit-worker-house">
                      <SelectValue placeholder="Ev seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockHouses.map((house) => (
                        <SelectItem key={house.id} value={house.name}>
                          {house.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-room">Oda</Label>
                  <Select
                    value={formData.room}
                    onValueChange={(value) => setFormData({ ...formData, room: value })}
                    disabled={!formData.house}
                  >
                    <SelectTrigger id="edit-room" data-testid="select-edit-worker-room">
                      <SelectValue placeholder="Oda seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRooms.map((room) => (
                        <SelectItem key={room} value={room}>
                          Oda {room}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-bed">Yatak</Label>
                  <Input
                    id="edit-bed"
                    placeholder="1"
                    value={formData.bed}
                    onChange={(e) => setFormData({ ...formData, bed: e.target.value })}
                    data-testid="input-edit-worker-bed"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                data-testid="button-cancel-edit"
              >
                İptal
              </Button>
              <Button
                onClick={handleSaveWorker}
                data-testid="button-update-worker"
              >
                Güncelle
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

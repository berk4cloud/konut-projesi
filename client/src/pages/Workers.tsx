import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Mock data
const mockWorkers = [
  { id: "1", name: "John Doe", birthDate: "1980-10-22", gender: "Erkek", country: "Hollanda", house: "Geldernstrasse 13", room: "45", bed: "1" },
  { id: "2", name: "Jane Smith", birthDate: "1992-05-15", gender: "Kadın", country: "Almanya", house: "Geldernstrasse 13", room: "45", bed: "3" },
  { id: "3", name: "Mike Johnson", birthDate: "1985-11-30", gender: "Erkek", country: "Polonya", house: "Geldernstrasse 13", room: "47", bed: "1" },
  { id: "4", name: "Sarah Williams", birthDate: "1988-03-08", gender: "Kadın", country: "Romanya", house: "Hauptstrasse 45", room: "101", bed: "2" },
  { id: "5", name: "Tom Brown", birthDate: "1995-07-12", gender: "Erkek", country: "Hollanda", house: "Hauptstrasse 45", room: "102", bed: "1" },
];

export default function Workers() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWorkers = mockWorkers.filter((worker) =>
    worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
    worker.house.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header tenantName="Cova B.V." userName="Admin" />

      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Çalışanlar</h2>
              <p className="text-gray-600">Tüm çalışanları görüntüleyin ve yönetin</p>
            </div>
            <Button data-testid="button-add-worker">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Çalışan Ekle
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Çalışan ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-worker"
            />
          </div>

          <div className="bg-white rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Çalışan</TableHead>
                  <TableHead>Cinsiyet</TableHead>
                  <TableHead>Ülke</TableHead>
                  <TableHead>Ev</TableHead>
                  <TableHead>Oda</TableHead>
                  <TableHead>Yatak</TableHead>
                  <TableHead>İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkers.map((worker) => (
                  <TableRow key={worker.id} data-testid={`worker-row-${worker.id}`}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
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
                    <TableCell className="text-sm">{worker.house}</TableCell>
                    <TableCell>Oda {worker.room}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Yatak {worker.bed}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" data-testid={`button-edit-${worker.id}`}>
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
              <p className="text-gray-500">Çalışan bulunamadı</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

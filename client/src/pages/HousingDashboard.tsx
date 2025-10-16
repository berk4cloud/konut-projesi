import { useState } from "react";
import Header from "@/components/Header";
import FilterPanel from "@/components/FilterPanel";
import CapacityWidget from "@/components/CapacityWidget";
import HouseCard from "@/components/HouseCard";
import WorkerAssignmentModal from "@/components/WorkerAssignmentModal";
import GenderWarningModal from "@/components/GenderWarningModal";
import { Button } from "@/components/ui/button";
import { FileText, Bell, Calendar, AlertCircle, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Lease contract type (for rented properties)
type LeaseContract = {
  startDate: string;
  endDate?: string;
  monthlyRent: number;
  currency: string;
  paymentDay: number;
};

// Reminder/Alert type
type Reminder = {
  id: string;
  type: "maintenance" | "lease_end" | "meter_reading" | "inspection" | "other";
  title: string;
  date: string;
  alertDaysBefore: number;
  note?: string;
  recurring?: "monthly" | "yearly" | "none";
};

// TODO: Remove mock data when implementing real API
const mockHouses = [
  {
    id: "h1",
    name: "Geldernstrasse 13",
    city: "Geilenkirchen",
    country: "de",
    totalBeds: 18,
    occupiedBeds: 12,
    ownershipType: "Kiralık",
    leaseContract: {
      startDate: "2023-01-15",
      endDate: "2025-01-14",
      monthlyRent: 2500,
      currency: "EUR",
      paymentDay: 1,
    },
    reminders: [
      {
        id: "r1",
        type: "lease_end" as const,
        title: "Kira sözleşmesi bitiyor",
        date: "2025-01-14",
        alertDaysBefore: 30,
        note: "Yenileme görüşmesi yapılmalı",
        recurring: "none" as const,
      },
      {
        id: "r2",
        type: "maintenance" as const,
        title: "Yıllık bakım",
        date: "2025-03-15",
        alertDaysBefore: 10,
        note: "Kalorifer bakımı",
        recurring: "yearly" as const,
      },
    ],
    rooms: [
      {
        id: "r1",
        roomNumber: "45",
        floor: 2,
        beds: [
          {
            id: "b1",
            bedNumber: 1,
            status: "occupied" as const,
            worker: { id: "w1", name: "Canny", gender: "male" as const },
          },
          { id: "b2", bedNumber: 2, status: "available" as const },
          {
            id: "b3",
            bedNumber: 3,
            status: "occupied" as const,
            worker: { id: "w2", name: "Sarah", gender: "female" as const },
          },
        ],
      },
      {
        id: "r2",
        roomNumber: "46",
        floor: 2,
        beds: [
          { id: "b4", bedNumber: 1, status: "available" as const },
          { id: "b5", bedNumber: 2, status: "reserved" as const },
        ],
      },
      {
        id: "r3",
        roomNumber: "47",
        floor: 3,
        beds: [
          {
            id: "b6",
            bedNumber: 1,
            status: "occupied" as const,
            worker: { id: "w3", name: "Mike", gender: "male" as const },
          },
          { id: "b7", bedNumber: 2, status: "oos" as const },
        ],
      },
    ],
  },
  {
    id: "h2",
    name: "Hauptstrasse 45",
    city: "Venlo",
    country: "nl",
    totalBeds: 24,
    occupiedBeds: 18,
    ownershipType: "Mülk",
    reminders: [
      {
        id: "r3",
        type: "inspection" as const,
        title: "Yangın güvenlik kontrolü",
        date: "2025-02-20",
        alertDaysBefore: 7,
        recurring: "yearly" as const,
      },
    ],
    rooms: [
      {
        id: "r4",
        roomNumber: "101",
        floor: 1,
        beds: [
          {
            id: "b8",
            bedNumber: 1,
            status: "occupied" as const,
            worker: { id: "w4", name: "John", gender: "male" as const },
          },
          {
            id: "b9",
            bedNumber: 2,
            status: "occupied" as const,
            worker: { id: "w5", name: "Emma", gender: "female" as const },
          },
          { id: "b10", bedNumber: 3, status: "available" as const },
          { id: "b11", bedNumber: 4, status: "available" as const },
        ],
      },
      {
        id: "r5",
        roomNumber: "102",
        floor: 1,
        beds: [
          {
            id: "b12",
            bedNumber: 1,
            status: "occupied" as const,
            worker: { id: "w6", name: "Tom", gender: "male" as const },
          },
          { id: "b13", bedNumber: 2, status: "available" as const },
        ],
      },
    ],
  },
  {
    id: "h3",
    name: "Marktplatz 7",
    city: "Roermond",
    country: "nl",
    totalBeds: 12,
    occupiedBeds: 8,
    ownershipType: "3. Taraf",
    leaseContract: {
      startDate: "2024-06-01",
      monthlyRent: 1800,
      currency: "EUR",
      paymentDay: 5,
    },
    reminders: [
      {
        id: "r4",
        type: "other" as const,
        title: "Bina toplantısı",
        date: "2025-01-25",
        alertDaysBefore: 5,
        note: "Yönetim kurulu toplantısı",
        recurring: "none" as const,
      },
    ],
    rooms: [
      {
        id: "r6",
        roomNumber: "201",
        floor: 2,
        beds: [
          {
            id: "b14",
            bedNumber: 1,
            status: "occupied" as const,
            worker: { id: "w7", name: "Lisa", gender: "female" as const },
          },
          { id: "b15", bedNumber: 2, status: "available" as const },
          {
            id: "b16",
            bedNumber: 3,
            status: "occupied" as const,
            worker: { id: "w8", name: "Paul", gender: "male" as const },
          },
        ],
      },
      {
        id: "r7",
        roomNumber: "202",
        floor: 2,
        beds: [
          { id: "b17", bedNumber: 1, status: "available" as const },
          { id: "b18", bedNumber: 2, status: "reserved" as const },
        ],
      },
    ],
  },
  {
    id: "h4",
    name: "Bahnhofstrasse 22",
    city: "Berlin",
    country: "de",
    totalBeds: 15,
    occupiedBeds: 10,
    rooms: [
      {
        id: "r8",
        roomNumber: "301",
        floor: 3,
        beds: [
          {
            id: "b19",
            bedNumber: 1,
            status: "occupied" as const,
            worker: { id: "w9", name: "Anna", gender: "female" as const },
          },
          { id: "b20", bedNumber: 2, status: "available" as const },
          {
            id: "b21",
            bedNumber: 3,
            status: "occupied" as const,
            worker: { id: "w10", name: "Klaus", gender: "male" as const },
          },
        ],
      },
      {
        id: "r9",
        roomNumber: "302",
        floor: 3,
        beds: [
          { id: "b22", bedNumber: 1, status: "available" as const },
          { id: "b23", bedNumber: 2, status: "reserved" as const },
        ],
      },
    ],
  },
];

export default function HousingDashboard() {
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState<any>(null);

  // Filter states
  const [dateString, setDateString] = useState(new Date().toISOString().split("T")[0]);
  const [selectedHouse, setSelectedHouse] = useState("all");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [showEmptyOnly, setShowEmptyOnly] = useState(false);
  
  // Lease contract state
  const [isLeaseDialogOpen, setIsLeaseDialogOpen] = useState(false);
  const [selectedHouseForLease, setSelectedHouseForLease] = useState<typeof mockHouses[0] | null>(null);
  
  // Reminders state
  const [isRemindersDialogOpen, setIsRemindersDialogOpen] = useState(false);
  const [selectedHouseForReminders, setSelectedHouseForReminders] = useState<typeof mockHouses[0] | null>(null);

  // Filter houses based on selected filters
  const filteredHouses = mockHouses.filter((house) => {
    // Filter by house
    if (selectedHouse !== "all" && house.id !== selectedHouse) {
      return false;
    }

    // Filter by city
    if (selectedCity !== "all" && house.city.toLowerCase() !== selectedCity) {
      return false;
    }

    // Filter by country
    if (selectedCountry !== "all" && house.country !== selectedCountry) {
      return false;
    }

    // Filter by empty beds only (has at least one empty bed)
    if (showEmptyOnly && house.totalBeds === house.occupiedBeds) {
      return false;
    }

    return true;
  });

  const totalBeds = filteredHouses.reduce((sum, house) => sum + house.totalBeds, 0);
  const occupiedBeds = filteredHouses.reduce((sum, house) => sum + house.occupiedBeds, 0);
  const emptyBeds = totalBeds - occupiedBeds;

  const handleBedClick = (bed: any) => {
    setSelectedBed(bed);
    if (bed.status === "available") {
      setAssignmentModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header tenantName="Cova B.V." userName="Admin" />

      <div className="flex">
        <aside className="w-80 border-r bg-muted/30 min-h-[calc(100vh-4rem)] p-6 sticky top-16 overflow-y-auto">
          <div className="space-y-6">
            <CapacityWidget
              totalBeds={totalBeds}
              occupiedBeds={occupiedBeds}
              emptyBeds={emptyBeds}
              oosBeds={1}
            />
            <FilterPanel
              dateString={dateString}
              setDateString={setDateString}
              selectedHouse={selectedHouse}
              setSelectedHouse={setSelectedHouse}
              selectedCity={selectedCity}
              setSelectedCity={setSelectedCity}
              selectedCountry={selectedCountry}
              setSelectedCountry={setSelectedCountry}
              showEmptyOnly={showEmptyOnly}
              setShowEmptyOnly={setShowEmptyOnly}
              houses={mockHouses}
            />
          </div>
        </aside>

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Konaklama Genel Bakış</h2>
              <p className="text-muted-foreground">
                Tüm mülklerdeki çalışan konaklamalarını yönetin
              </p>
            </div>

            <div className="space-y-6">
              {filteredHouses.length > 0 ? (
                filteredHouses.map((house) => (
                  <div key={house.id} className="space-y-3">
                    <HouseCard
                      name={house.name}
                      city={house.city}
                      totalBeds={house.totalBeds}
                      occupiedBeds={house.occupiedBeds}
                      rooms={house.rooms}
                      onBedClick={handleBedClick}
                    />
                    
                    <div className="flex gap-2 px-2">
                      {(house.ownershipType === "Kiralık" || house.ownershipType === "3. Taraf") && house.leaseContract && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedHouseForLease(house);
                            setIsLeaseDialogOpen(true);
                          }}
                          data-testid={`button-lease-${house.id}`}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Kira Detayları
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedHouseForReminders(house);
                          setIsRemindersDialogOpen(true);
                        }}
                        data-testid={`button-reminders-${house.id}`}
                      >
                        <Bell className="w-4 h-4 mr-2" />
                        Hatırlatıcılar
                        {house.reminders && house.reminders.length > 0 && (
                          <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                            {house.reminders.length}
                          </Badge>
                        )}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-card rounded-lg border" data-testid="text-no-houses">
                  <p className="text-muted-foreground">Seçilen filtrelere uygun konut bulunamadı</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <WorkerAssignmentModal
        open={assignmentModalOpen}
        onClose={() => setAssignmentModalOpen(false)}
        bedNumber={selectedBed?.bedNumber}
        roomNumber="45"
      />

      <GenderWarningModal
        open={warningModalOpen}
        onClose={() => setWarningModalOpen(false)}
        onMarkAsCouple={() => {
          console.log("Marked as couple");
          setWarningModalOpen(false);
        }}
        onReassign={() => {
          console.log("Reassigning");
          setWarningModalOpen(false);
        }}
        onContinueAnyway={() => {
          console.log("Continuing");
          setWarningModalOpen(false);
        }}
        workerName="Jane Smith"
        roomNumber="45"
      />

      {/* Lease Contract Dialog */}
      <Dialog open={isLeaseDialogOpen} onOpenChange={setIsLeaseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Kira Sözleşmesi Bilgileri</DialogTitle>
            <DialogDescription>
              {selectedHouseForLease?.name}
            </DialogDescription>
          </DialogHeader>
          
          {selectedHouseForLease?.leaseContract ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Başlangıç Tarihi</p>
                  <p className="font-medium" data-testid="text-lease-start">
                    {new Date(selectedHouseForLease.leaseContract.startDate).toLocaleDateString("tr-TR")}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Bitiş Tarihi</p>
                  <p className="font-medium" data-testid="text-lease-end">
                    {selectedHouseForLease.leaseContract.endDate 
                      ? new Date(selectedHouseForLease.leaseContract.endDate).toLocaleDateString("tr-TR")
                      : "Belirsiz"}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Aylık Kira</p>
                  <p className="text-2xl font-semibold" data-testid="text-lease-rent">
                    {selectedHouseForLease.leaseContract.monthlyRent.toLocaleString()} {selectedHouseForLease.leaseContract.currency}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Ödeme Günü</p>
                  <p className="font-medium" data-testid="text-lease-payment-day">
                    Her ayın {selectedHouseForLease.leaseContract.paymentDay}. günü
                  </p>
                </div>
              </div>
              
              {selectedHouseForLease.leaseContract.endDate && (
                <div className="p-4 bg-muted/50 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Sözleşme Bitiş Uyarısı</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Sözleşme {Math.ceil(
                          (new Date(selectedHouseForLease.leaseContract.endDate).getTime() - new Date().getTime()) / 
                          (1000 * 60 * 60 * 24)
                        )} gün sonra bitiyor
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Bu konut için kira sözleşmesi bilgisi bulunamadı</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reminders Dialog */}
      <Dialog open={isRemindersDialogOpen} onOpenChange={setIsRemindersDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Hatırlatıcılar</DialogTitle>
            <DialogDescription>
              {selectedHouseForReminders?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedHouseForReminders?.reminders && selectedHouseForReminders.reminders.length > 0 ? (
              <div className="space-y-3">
                {selectedHouseForReminders.reminders.map((reminder) => {
                  const daysUntil = Math.ceil(
                    (new Date(reminder.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  const shouldAlert = daysUntil <= reminder.alertDaysBefore && daysUntil >= 0;
                  
                  const typeLabels = {
                    maintenance: "Bakım",
                    lease_end: "Kira Sonu",
                    meter_reading: "Sayaç Okuma",
                    inspection: "Denetim",
                    other: "Diğer",
                  };
                  
                  const typeColors = {
                    maintenance: "bg-blue-100 text-blue-700",
                    lease_end: "bg-purple-100 text-purple-700",
                    meter_reading: "bg-green-100 text-green-700",
                    inspection: "bg-amber-100 text-amber-700",
                    other: "bg-gray-100 text-gray-700",
                  };
                  
                  return (
                    <div
                      key={reminder.id}
                      className={cn(
                        "p-4 rounded-lg border",
                        shouldAlert ? "bg-amber-50 border-amber-300" : "bg-card"
                      )}
                      data-testid={`reminder-${reminder.id}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={typeColors[reminder.type]} variant="secondary">
                              {typeLabels[reminder.type]}
                            </Badge>
                            {reminder.recurring && reminder.recurring !== "none" && (
                              <Badge variant="outline" className="text-xs">
                                {reminder.recurring === "monthly" ? "Aylık" : "Yıllık"}
                              </Badge>
                            )}
                            {shouldAlert && (
                              <Badge variant="default" className="bg-amber-600">
                                <AlertCircle className="w-3 h-3 mr-1" />
                                Yaklaşıyor
                              </Badge>
                            )}
                          </div>
                          
                          <h4 className="font-semibold mb-1" data-testid={`text-reminder-title-${reminder.id}`}>
                            {reminder.title}
                          </h4>
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(reminder.date).toLocaleDateString("tr-TR")}
                            </div>
                            <div>
                              {daysUntil > 0 ? `${daysUntil} gün sonra` : daysUntil === 0 ? "Bugün" : `${Math.abs(daysUntil)} gün önce`}
                            </div>
                          </div>
                          
                          {reminder.note && (
                            <p className="text-sm text-muted-foreground mt-2" data-testid={`text-reminder-note-${reminder.id}`}>
                              {reminder.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Henüz hatırlatıcı eklenmedi</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

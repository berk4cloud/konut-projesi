import { useState } from "react";
import Header from "@/components/Header";
import FilterPanel from "@/components/FilterPanel";
import CapacityWidget from "@/components/CapacityWidget";
import HouseCard from "@/components/HouseCard";
import WorkerAssignmentModal from "@/components/WorkerAssignmentModal";
import GenderWarningModal from "@/components/GenderWarningModal";

// TODO: Remove mock data when implementing real API
const mockHouses = [
  {
    id: "h1",
    name: "Geldernstrasse 13",
    city: "Geilenkirchen",
    country: "de",
    totalBeds: 18,
    occupiedBeds: 12,
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
                  <HouseCard
                    key={house.id}
                    name={house.name}
                    city={house.city}
                    totalBeds={house.totalBeds}
                    occupiedBeds={house.occupiedBeds}
                    rooms={house.rooms}
                    onBedClick={handleBedClick}
                  />
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
    </div>
  );
}

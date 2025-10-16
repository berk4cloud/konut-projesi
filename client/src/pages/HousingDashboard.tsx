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
];

export default function HousingDashboard() {
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState<any>(null);

  const totalBeds = mockHouses.reduce((sum, house) => sum + house.totalBeds, 0);
  const occupiedBeds = mockHouses.reduce((sum, house) => sum + house.occupiedBeds, 0);
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
        <aside className="w-80 border-r border-gray-200 bg-gray-50 min-h-[calc(100vh-4rem)] p-6 sticky top-16 overflow-y-auto">
          <div className="space-y-6">
            <CapacityWidget
              totalBeds={totalBeds}
              occupiedBeds={occupiedBeds}
              emptyBeds={emptyBeds}
              oosBeds={1}
            />
            <FilterPanel />
          </div>
        </aside>

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Konaklama Genel Bakış</h2>
              <p className="text-gray-600">
                Tüm mülklerdeki çalışan konaklamalarını yönetin
              </p>
            </div>

            <div className="space-y-6">
              {mockHouses.map((house) => (
                <HouseCard
                  key={house.id}
                  name={house.name}
                  city={house.city}
                  totalBeds={house.totalBeds}
                  occupiedBeds={house.occupiedBeds}
                  rooms={house.rooms}
                  onBedClick={handleBedClick}
                />
              ))}
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

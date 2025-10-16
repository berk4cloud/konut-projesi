import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import FilterPanel from "@/components/FilterPanel";
import CapacityWidget from "@/components/CapacityWidget";
import HouseCard from "@/components/HouseCard";
import WorkerAssignmentModal from "@/components/WorkerAssignmentModal";
import GenderWarningModal from "@/components/GenderWarningModal";
import { Skeleton } from "@/components/ui/skeleton";

export default function HousingDashboard() {
  const { user, tenant, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [selectedBed, setSelectedBed] = useState<any>(null);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [selectedHouse, setSelectedHouse] = useState<any>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  // Fetch houses
  const { data: housesData, isLoading, refetch } = useQuery({
    queryKey: ["/api/houses"],
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return null;
  }

  const handleBedClick = (bed: any, room: any, house: any) => {
    setSelectedBed(bed);
    setSelectedRoom(room);
    setSelectedHouse(house);
    if (bed.status === "available") {
      setAssignmentModalOpen(true);
    }
  };

  const handleAssignmentSuccess = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header tenantName={tenant?.name || ""} userName={user?.name || ""} />
        <div className="flex">
          <aside className="w-80 border-r bg-muted/30 min-h-[calc(100vh-4rem)] p-6 sticky top-16 overflow-y-auto">
            <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </aside>
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-5 w-96" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const houses = (housesData as any)?.data?.houses || [];
  const totalBeds = (housesData as any)?.data?.totalBeds || 0;
  const occupiedBeds = (housesData as any)?.data?.occupiedBeds || 0;
  const emptyBeds = (housesData as any)?.data?.emptyBeds || 0;
  const oosBeds = (housesData as any)?.data?.oosBeds || 0;

  return (
    <div className="min-h-screen bg-background">
      <Header tenantName={tenant?.name || ""} userName={user?.name || ""} />

      <div className="flex">
        <aside className="w-80 border-r bg-muted/30 min-h-[calc(100vh-4rem)] p-6 sticky top-16 overflow-y-auto">
          <div className="space-y-6">
            <CapacityWidget
              totalBeds={totalBeds}
              occupiedBeds={occupiedBeds}
              emptyBeds={emptyBeds}
              oosBeds={oosBeds}
            />
            <FilterPanel />
          </div>
        </aside>

        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Housing Overview</h2>
              <p className="text-muted-foreground">
                Manage worker accommodation across all properties
              </p>
            </div>

            <div className="space-y-6">
              {houses.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No houses found</p>
                </div>
              ) : (
                houses.map((house: any) => (
                  <HouseCard
                    key={house.id}
                    name={house.name}
                    city={house.city}
                    totalBeds={house.totalBeds}
                    occupiedBeds={house.occupiedBeds}
                    rooms={house.rooms}
                    onBedClick={(bed, room) => handleBedClick(bed, room, house)}
                  />
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      <WorkerAssignmentModal
        open={assignmentModalOpen}
        onClose={() => setAssignmentModalOpen(false)}
        bedNumber={selectedBed?.bedNumber}
        roomNumber={selectedRoom?.roomNumber}
        bedId={selectedBed?.id}
        roomId={selectedRoom?.id}
        houseId={selectedHouse?.id}
        onSuccess={handleAssignmentSuccess}
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

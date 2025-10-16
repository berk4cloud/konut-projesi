import RoomCard from "../RoomCard";

export default function RoomCardExample() {
  const mockBeds = [
    { id: "1", bedNumber: 1, status: "occupied" as const, worker: { id: "w1", name: "John", gender: "male" as const } },
    { id: "2", bedNumber: 2, status: "available" as const },
    { id: "3", bedNumber: 3, status: "occupied" as const, worker: { id: "w2", name: "Jane", gender: "female" as const } },
    { id: "4", bedNumber: 4, status: "available" as const },
  ];

  return (
    <div className="p-6 max-w-md">
      <RoomCard
        roomNumber="45"
        floor={2}
        beds={mockBeds}
        onBedClick={(bed) => console.log("Bed clicked:", bed)}
      />
    </div>
  );
}

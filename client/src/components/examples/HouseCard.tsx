import HouseCard from "../HouseCard";

export default function HouseCardExample() {
  const mockRooms = [
    {
      id: "r1",
      roomNumber: "45",
      floor: 2,
      beds: [
        { id: "b1", bedNumber: 1, status: "occupied" as const, worker: { id: "w1", name: "John", gender: "male" as const } },
        { id: "b2", bedNumber: 2, status: "available" as const },
      ],
    },
    {
      id: "r2",
      roomNumber: "46",
      floor: 2,
      beds: [
        { id: "b3", bedNumber: 1, status: "available" as const },
        { id: "b4", bedNumber: 2, status: "occupied" as const, worker: { id: "w2", name: "Jane", gender: "female" as const } },
      ],
    },
  ];

  return (
    <div className="p-6">
      <HouseCard
        name="Geldernstrasse 13"
        city="Geilenkirchen"
        totalBeds={4}
        occupiedBeds={2}
        rooms={mockRooms}
        onBedClick={(bed) => console.log("Bed clicked:", bed)}
      />
    </div>
  );
}

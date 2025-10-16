import BedCard from "../BedCard";

export default function BedCardExample() {
  return (
    <div className="p-6 flex flex-wrap gap-4">
      <BedCard bedNumber={1} status="available" />
      <BedCard
        bedNumber={2}
        status="occupied"
        worker={{ id: "1", name: "John Doe", gender: "male" }}
      />
      <BedCard
        bedNumber={3}
        status="occupied"
        worker={{ id: "2", name: "Jane Smith", gender: "female" }}
      />
      <BedCard bedNumber={4} status="reserved" />
      <BedCard bedNumber={5} status="oos" />
    </div>
  );
}

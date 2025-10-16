import CapacityWidget from "../CapacityWidget";

export default function CapacityWidgetExample() {
  return (
    <div className="p-6 max-w-md">
      <CapacityWidget
        totalBeds={397}
        occupiedBeds={224}
        emptyBeds={173}
        oosBeds={0}
      />
    </div>
  );
}

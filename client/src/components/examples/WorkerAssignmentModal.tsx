import { useState } from "react";
import WorkerAssignmentModal from "../WorkerAssignmentModal";
import { Button } from "@/components/ui/button";

export default function WorkerAssignmentModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-6">
      <Button onClick={() => setOpen(true)}>Open Assignment Modal</Button>
      <WorkerAssignmentModal
        open={open}
        onClose={() => setOpen(false)}
        bedNumber={3}
        roomNumber="45"
      />
    </div>
  );
}

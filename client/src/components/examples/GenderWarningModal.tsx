import { useState } from "react";
import GenderWarningModal from "../GenderWarningModal";
import { Button } from "@/components/ui/button";

export default function GenderWarningModalExample() {
  const [open, setOpen] = useState(false);

  return (
    <div className="p-6">
      <Button onClick={() => setOpen(true)}>Show Gender Warning</Button>
      <GenderWarningModal
        open={open}
        onClose={() => setOpen(false)}
        onMarkAsCouple={() => {
          console.log("Marked as couple");
          setOpen(false);
        }}
        onReassign={() => {
          console.log("Reassigning");
          setOpen(false);
        }}
        onContinueAnyway={() => {
          console.log("Continuing anyway");
          setOpen(false);
        }}
        workerName="Jane Smith"
        roomNumber="45"
      />
    </div>
  );
}

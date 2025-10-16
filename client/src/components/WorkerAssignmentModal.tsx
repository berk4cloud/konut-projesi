import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkerAssignmentModalProps {
  open: boolean;
  onClose: () => void;
  bedNumber?: number;
  roomNumber?: string;
  bedId?: string;
  roomId?: string;
  houseId?: string;
  onSuccess?: () => void;
}

export default function WorkerAssignmentModal({
  open,
  onClose,
  bedNumber,
  roomNumber,
  bedId,
  roomId,
  houseId,
  onSuccess,
}: WorkerAssignmentModalProps) {
  const { toast } = useToast();
  const [selectedWorker, setSelectedWorker] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch workers
  const { data: workersData } = useQuery({
    queryKey: ["/api/workers"],
    enabled: open,
  });

  const workers = workersData?.data || [];

  const handleAssign = async () => {
    if (!selectedWorker || !startDate || !bedId) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select a worker and start date",
      });
      return;
    }

    setIsLoading(true);
    try {
      await api.createReservation({
        workerId: selectedWorker,
        bedId,
        startDate,
        endDate: endDate || undefined,
      });

      toast({
        title: "Success",
        description: "Worker assigned successfully",
      });

      onSuccess?.();
      onClose();
      setSelectedWorker("");
      setStartDate(new Date().toISOString().split("T")[0]);
      setEndDate("");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Assignment failed",
        description: error.message || "Failed to assign worker",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-worker-assignment">
        <DialogHeader>
          <DialogTitle>Assign Worker to Bed</DialogTitle>
          <DialogDescription>
            {roomNumber && bedNumber
              ? `Assigning to Room ${roomNumber}, Bed ${bedNumber}`
              : "Select a worker and date range"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="worker">Worker</Label>
            <Select value={selectedWorker} onValueChange={setSelectedWorker}>
              <SelectTrigger id="worker" data-testid="select-worker">
                <SelectValue placeholder="Select worker" />
              </SelectTrigger>
              <SelectContent>
                {workers.map((worker: any) => (
                  <SelectItem key={worker.id} value={worker.id}>
                    {worker.firstName} {worker.lastName} ({worker.gender})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                data-testid="input-start-date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                data-testid="input-end-date"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            data-testid="button-cancel-assignment"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedWorker || !startDate || isLoading}
            data-testid="button-confirm-assignment"
          >
            {isLoading ? "Assigning..." : "Assign Worker"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

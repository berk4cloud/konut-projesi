import { useState } from "react";
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
}

export default function WorkerAssignmentModal({
  open,
  onClose,
  bedNumber,
  roomNumber,
}: WorkerAssignmentModalProps) {
  const [selectedWorker, setSelectedWorker] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");

  const handleAssign = () => {
    console.log("Worker assigned:", {
      worker: selectedWorker,
      startDate,
      endDate,
      bed: bedNumber,
      room: roomNumber,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-worker-assignment">
        <DialogHeader>
          <DialogTitle>Çalışanı Yatağa Ata</DialogTitle>
          <DialogDescription>
            {roomNumber && bedNumber
              ? `Oda ${roomNumber}, Yatak ${bedNumber} için atama yapılıyor`
              : "Bir çalışan ve tarih aralığı seçin"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="worker">Çalışan</Label>
            <Select value={selectedWorker} onValueChange={setSelectedWorker}>
              <SelectTrigger id="worker" data-testid="select-worker">
                <SelectValue placeholder="Çalışan seçin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="w1">John Doe (Erkek)</SelectItem>
                <SelectItem value="w2">Jane Smith (Kadın)</SelectItem>
                <SelectItem value="w3">Mike Johnson (Erkek)</SelectItem>
                <SelectItem value="w4">Sarah Williams (Kadın)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Başlangıç Tarihi</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                data-testid="input-start-date"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Bitiş Tarihi</Label>
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
            data-testid="button-cancel-assignment"
          >
            İptal
          </Button>
          <Button
            onClick={handleAssign}
            disabled={!selectedWorker || !startDate}
            data-testid="button-confirm-assignment"
          >
            Çalışanı Ata
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

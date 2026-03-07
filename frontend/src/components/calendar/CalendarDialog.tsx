import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { WORK_TYPES } from "./constants";

interface Event {
  work_type: string;
  date: string;
  changed_work_type: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedEvent: Event | undefined;
  selected: string;
  setSelected: (value: string) => void;
  handleEditShift: (title: string, date: string) => void;
}

export default function CalendarDialog({
  open,
  onOpenChange,
  selectedEvent,
  selected,
  setSelected,
  handleEditShift,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-500 border-gray-500 w-80 md:w-80">
        <DialogHeader>
          <DialogTitle>
            <span className="text-white">{selectedEvent?.date}</span>
            <p className="text-white text-sm">
              본근무 : {selectedEvent?.work_type}
            </p>
            {selectedEvent?.changed_work_type &&
            selectedEvent?.changed_work_type !== selectedEvent.work_type ? (
              <p className="text-red-400 text-sm flex items-center gap-1">
                변경됨 : {selectedEvent.changed_work_type}
                <span className="w-2 h-2 rounded-full bg-red-500" />
              </p>
            ) : null}
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-3 items-center">
          {WORK_TYPES.map((button) => (
            <button
              key={button.id}
              className={`flex items-center justify-center rounded-full w-7 h-7 hover:opacity-80 cursor-pointer font-bold text-sm ${
                selected === button.id ? "ring-3 ring-blue-400" : ""
              }`}
              style={{ backgroundColor: button.color, color: button.textColor }}
              onClick={() => setSelected(button.id)}
            >
              {button.id}
            </button>
          ))}
        </div>

        <div className="flex justify-end">
          <Button
            className="w-12.5 bg-gray-900"
            onClick={() => {
              if (selected && selectedEvent?.date) {
                handleEditShift(selected, selectedEvent.date);
              }
              setSelected("");
              onOpenChange(false);
            }}
            disabled={
              selected === "" ||
              selected ===
                (selectedEvent?.changed_work_type || selectedEvent?.work_type)
            }
          >
            변경
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

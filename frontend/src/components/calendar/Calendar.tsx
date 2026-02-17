import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Shift } from "../../api/shift";
import KoLocal from "@fullcalendar/core/locales/ko";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";

interface Props {
  data: Shift[];
  handleEditShift: (title: string, date: string) => void;
  isLoggedIn: boolean;
}

interface Event {
  work_type: string;
  date: string;
  changed_work_type: string | null;
}

export default function Calendar({ data, handleEditShift, isLoggedIn }: Props) {
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<Event | undefined>();

  const calendarEvents = data.map((item) => ({
    title: item.changed_work_type || item.work_type,
    start: item.date,
    extendedProps: {
      isChanged:
        item.changed_work_type && item.changed_work_type !== item.work_type,
      originalType: item.work_type,
      changedType: item.changed_work_type,
    },
  }));

  const WORK_TYPES = [
    { id: "주", color: "#ffd600", textColor: "#3c3c3c" },
    { id: "야", color: "#424242", textColor: "#ffffff" },
    { id: "휴", color: "#ffffff", textColor: "#f05a6e" },
  ] as const;

  return (
    <div className="w-full h-full md:h-[480px] md:w-[800px] md:mx-auto flex flex-col">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={calendarEvents}
        height="100%"
        contentHeight="auto"
        locale={KoLocal}
        fixedWeekCount={false}
        eventClick={(eventInfo) => {
          if (!isLoggedIn) {
            alert("로그인이 필요합니다.");
            return;
          }
          const shiftData = data.find(
            (s) => s.date === eventInfo.event.startStr,
          );
          setDialogOpen(true);
          setSelectedEvent({
            work_type: shiftData?.work_type || "",
            date: eventInfo.event.startStr,
            changed_work_type: shiftData?.changed_work_type || null,
          });
          setSelected(shiftData?.changed_work_type || "");
        }}
        eventContent={(eventInfo) => {
          const title = eventInfo.event.title;
          const isChanged = eventInfo.event.extendedProps.isChanged;

          const colorClass =
            WORK_TYPES.find((b) => b.id === title)?.color || "";
          const textClass =
            WORK_TYPES.find((b) => b.id === title)?.textColor || "";

          return (
            <div
              className={`flex justify-center w-full h-full items-center flex-col hover:cursor-pointer`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold`}
                style={{
                  backgroundColor: colorClass,
                  color: textClass,
                }}
              >
                {title.charAt(0)}
              </div>
              {isChanged && (
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-0.5"></div>
              )}
            </div>
          );
        }}
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-gray-500 border-gray-500 w-80 md:w-80 ">
          <DialogHeader>
            <DialogTitle>
              <span className="text-white">{selectedEvent?.date}</span>
              <p className="text-white text-sm">
                본근무 : {selectedEvent?.work_type}
              </p>
              {selectedEvent?.changed_work_type &&
              selectedEvent?.changed_work_type != selectedEvent.work_type ? (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  변경됨 : {selectedEvent.changed_work_type}
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
                </p>
              ) : (
                ""
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="flex gap-3 items-center">
            {WORK_TYPES.map((button) => (
              <button
                key={button.id}
                className={`flex items-center justify-center rounded-full w-7 h-7 hover:opacity-80 cursor-pointer ${
                  selected == button.id ? "ring-3 ring-blue-400" : ""
                } disabled:opacity-50 ring-offset-0 font-bold text-sm`}
                style={{
                  backgroundColor: button.color,
                  color: button.textColor,
                }}
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
                setDialogOpen(false);
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
    </div>
  );
}

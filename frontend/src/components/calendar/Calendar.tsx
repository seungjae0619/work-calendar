import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Shift } from "../../api/shift";
import KoLocal from "@fullcalendar/core/locales/ko";
import { useState } from "react";
import { isHoliday } from "@hyunbinseo/holidays-kr";
import CalendarStyles from "./CalendarStyles";
import CalendarDialog from "./CalendarDialog";
import { getWorkTypeStyle } from "./constants";

interface Props {
  data: Shift[];
  handleEditShift: (title: string, date: string) => void;
  isLoggedIn: boolean;
  isLoading: boolean;
  setCurrentDate: ({
    year,
    month,
    startDate,
    endDate,
  }: {
    year: string;
    month: string;
    startDate: string;
    endDate: string;
  }) => void;
}

interface Event {
  work_type: string;
  date: string;
  changed_work_type: string | null;
}

export default function Calendar({
  data,
  handleEditShift,
  isLoggedIn,
  isLoading,
  setCurrentDate,
}: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState("");
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

  return (
    <>
      <CalendarStyles />
      <div className="w-full h-full md:h-[480px] md:w-[800px] md:mx-auto flex flex-col relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 rounded-lg">
            <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          </div>
        )}
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={calendarEvents}
          height="100%"
          contentHeight="auto"
          locale={KoLocal}
          fixedWeekCount={false}
          datesSet={(info) => {
            const year = info.view.currentStart.getFullYear();
            const month = info.view.currentStart.getMonth();
            const startDate = new Date(year, month, 2);
            const endDate = new Date(year, month + 1, 1);
            const format = (date: Date) => date.toISOString().split("T")[0];
            setCurrentDate({
              year: year.toString(),
              month: (month + 1).toString().padStart(2, "0"),
              startDate: format(startDate),
              endDate: format(endDate),
            });
          }}
          dayCellClassNames={(arg) => {
            const year = arg.date.getFullYear();
            const month = String(arg.date.getMonth() + 1).padStart(2, "0");
            const day = String(arg.date.getDate()).padStart(2, "0");
            const kstDate = new Date(`${year}-${month}-${day}T00:00:00+09:00`);
            return isHoliday(kstDate) ? ["fc-day-holiday"] : [];
          }}
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
            const { color, textColor } = getWorkTypeStyle(title);

            return (
              <div className="flex justify-center w-full h-full items-center flex-col hover:cursor-pointer">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold"
                  style={{ backgroundColor: color, color: textColor }}
                >
                  {title.charAt(0)}
                </div>
                {isChanged && (
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-0.5" />
                )}
              </div>
            );
          }}
        />
        <CalendarDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          selectedEvent={selectedEvent}
          selected={selected}
          setSelected={setSelected}
          handleEditShift={handleEditShift}
        />
      </div>
    </>
  );
}

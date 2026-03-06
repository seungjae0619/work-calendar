import { createFileRoute } from "@tanstack/react-router";
import { Shift, getShifts, updateShift } from "../api/shift";
import { useEffect, useState } from "react";
import Calendar from "../components/calendar/Calendar";
import LoginDialog from "../components/auth/LoginDialog";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/")({
  component: CalendarPage,
});

interface CurrentDate {
  year: string;
  month: string;
  startDate: string;
  endDate: string;
}

function CalendarPage() {
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState<boolean>(false);
  const [currentDate, setCurrentDate] = useState<CurrentDate | null>(null);
  const queryClient = useQueryClient();

  const { data: shifts = [], isLoading } = useQuery({
    queryKey: ["shifts", currentDate?.startDate, currentDate?.endDate],
    queryFn: () => getShifts(currentDate!.startDate, currentDate!.endDate),
    enabled: !!currentDate,
    staleTime: 1000 * 60 * 5,
  });

  const getMonthRange = (year: number, month: number) => {
    const startDate = new Date(year, month, 2).toISOString().split("T")[0];
    const endDate = new Date(year, month + 1, 1).toISOString().split("T")[0];
    return { startDate, endDate };
  };

  useEffect(() => {
    if (!currentDate) return;

    const cur = new Date(
      parseInt(currentDate.year),
      parseInt(currentDate.month) - 1,
      1,
    );

    const prevRange = getMonthRange(cur.getFullYear(), cur.getMonth() - 1);
    const nextRange = getMonthRange(cur.getFullYear(), cur.getMonth() + 1);

    queryClient.prefetchQuery({
      queryKey: ["shifts", prevRange.startDate, prevRange.endDate],
      queryFn: () => getShifts(prevRange.startDate, prevRange.endDate),
      staleTime: 1000 * 60 * 5,
    });

    queryClient.prefetchQuery({
      queryKey: ["shifts", nextRange.startDate, nextRange.endDate],
      queryFn: () => getShifts(nextRange.startDate, nextRange.endDate),
      staleTime: 1000 * 60 * 5,
    });
  }, [currentDate, queryClient]);

  const handleLogin = async () => {
    setLoginDialogOpen(true);
  };

  const handleLoginSuccess = () => {
    setLoggedIn(true);
  };

  const handleEditShift = async (title?: string, date?: string) => {
    if (!title || !date) return;
    const sessionId = sessionStorage.getItem("sessionId");
    console.log("Current session ID:", sessionId);
    try {
      const result = await updateShift(date, title);

      queryClient.setQueryData(
        ["shifts", currentDate?.startDate, currentDate?.endDate],
        (oldData: Shift[] | undefined) =>
          oldData?.map((shift) =>
            shift.date === date
              ? { ...shift, changed_work_type: result.changed_work_type }
              : shift,
          ) ?? [],
      );
    } catch (error) {
      console.error("Error updating shift:", error);
      alert("근무 변경에 실패했습니다.");
    }
  };

  return (
    <div className="flex flex-col w-screen h-screen md:h-auto">
      <div className="w-full md:w-[800px] mb-2 flex justify-between md:mx-auto px-3 md:px-0 py-3">
        <h2 className="text-lg md:text-2xl">근무표</h2>

        {loggedIn ? (
          <Button
            onClick={() => {
              sessionStorage.removeItem("sessionId");
              setLoggedIn(false);
            }}
            className="text-sm md:text-base"
          >
            로그아웃
          </Button>
        ) : (
          <Button onClick={handleLogin} className="text-sm md:text-base">
            로그인
          </Button>
        )}
      </div>

      <div className="flex-1 p-2 md:flex-none">
        <Calendar
          data={shifts}
          handleEditShift={handleEditShift}
          isLoggedIn={loggedIn}
          setCurrentDate={setCurrentDate}
          isLoading={isLoading}
        />
      </div>

      <LoginDialog
        open={loginDialogOpen}
        onOpenChange={setLoginDialogOpen}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

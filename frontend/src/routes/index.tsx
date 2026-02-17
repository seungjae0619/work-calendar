import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { getShifts, updateShift } from "../api/shift";
import { Shift } from "../api/shift";
import Calendar from "../components/calendar/Calendar";
import LoginDialog from "../components/auth/LoginDialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  component: CalendarPage,
});

function CalendarPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loggedIn, setLoggedIn] = useState<boolean>(false);
  const [loginDialogOpen, setLoginDialogOpen] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    try {
      const shifts = await getShifts();
      setShifts(shifts);
    } catch (error) {
      console.error("Error fetching shifts:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
      setShifts((prevShifts) =>
        prevShifts.map((shift) =>
          shift.date === date
            ? { ...shift, changed_work_type: result.changed_work_type }
            : shift,
        ),
      );
    } catch (error) {
      console.error("Error updating shift:", error);
      alert("근무 변경에 실패했습니다.");
    } finally {
      // 클리업업 작업이 필요하면 여기에 추가
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

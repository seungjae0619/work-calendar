import { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { apiClient } from "@/api/client";

interface LoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginSuccess: () => void;
}

export default function LoginDialog({
  open,
  onOpenChange,
  onLoginSuccess,
}: LoginDialogProps) {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!password.trim()) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await apiClient.post("/auth/login", { password });
      const sessionId = response.headers["x-session-id"];

      if (sessionId) {
        sessionStorage.setItem("sessionId", sessionId);
        setPassword("");
        onLoginSuccess();
        onOpenChange(false);
      } else {
        setError("로그인 처리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("비밀번호가 잘못되었습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isLoading) {
      handleLogin();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-500 border-gray-500 w-80">
        <DialogHeader>
          <DialogTitle>
            <span className="text-white">관리자 로그인</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            className="px-3 py-2 bg-gray-600 text-white border border-gray-400 rounded placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setPassword("");
                setError("");
                onOpenChange(false);
              }}
              disabled={isLoading}
              className="bg-gray-700 hover:bg-gray-600"
            >
              취소
            </Button>
            <Button
              onClick={handleLogin}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-500"
            >
              {isLoading ? "로그인 중..." : "로그인"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

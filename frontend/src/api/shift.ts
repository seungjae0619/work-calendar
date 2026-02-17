import { apiClient } from "./client";

export interface Shift {
  id?: number;
  date: string;
  work_type: string;
  changed_work_type: string | null;
  isChanged?: boolean;
}

export const getShifts = async () => {
  const response = await apiClient.get<Shift[]>(
    "/shifts/?start=2025-08-11&end=2027-04-21",
  );
  return response.data;
};

export const updateShift = async (date: string, workType: string) => {
  const response = await apiClient.patch<Shift>(`/shifts/${date}/${workType}`);
  return response.data;
};

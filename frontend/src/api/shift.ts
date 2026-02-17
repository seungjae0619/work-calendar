import { apiClient } from "./client";

export interface Shift {
  id?: number;
  date: string;
  work_type: string;
  changed_work_type: string | null;
  isChanged?: boolean;
}

export const getShifts = async (startDate: string, endDate: string) => {
  const response = await apiClient.get<Shift[]>(
    `/shifts/?start=${startDate}&end=${endDate}`,
  );
  return response.data;
};

export const updateShift = async (date: string, workType: string) => {
  const response = await apiClient.patch<Shift>(`/shifts/${date}/${workType}`);
  return response.data;
};

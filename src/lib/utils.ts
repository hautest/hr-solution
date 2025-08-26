import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatHours(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.floor((hours % 1) * 60);
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
}

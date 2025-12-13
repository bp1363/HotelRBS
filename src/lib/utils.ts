import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date as DD/MM/YY
 * @param date - Date object to format
 * @returns Formatted date string (DD/MM/YY)
 */
export function formatDateDDMMYY(date: Date | null | undefined): string {
  if (!date) return "";
  return format(date, "dd/MM/yy");
}

/**
 * Format date as DD/MM/YYYY (with 4-digit year)
 * @param date - Date object to format
 * @returns Formatted date string (DD/MM/YYYY)
 */
export function formatDateDDMMYYYY(date: Date | null | undefined): string {
  if (!date) return "";
  return format(date, "dd/MM/yyyy");
}

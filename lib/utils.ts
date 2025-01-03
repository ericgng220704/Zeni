import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseStringify(value: unknown) {
  return JSON.parse(JSON.stringify(value));
}

export function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text; // No truncation needed
  }
  return text.slice(0, maxLength) + "..."; // Truncate and add ellipsis
}

export function truncateTextByWord(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text;
  }

  const truncated = text.slice(0, maxLength + 1).trimEnd();
  return truncated.slice(0, truncated.lastIndexOf(" ")) + "...";
}

export function capitalizeFirstLetter(text: string | null | undefined): string {
  if (!text || typeof text !== "string") return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

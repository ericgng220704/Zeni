import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as FaIcons from "react-icons/fa6";
import { addDays, format, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function parseStringify(value: unknown) {
  return JSON.parse(JSON.stringify(value));
}

export function handleError(error: unknown, message: string) {
  console.log(error, message);
  throw error;
}

export function getInitials(name: string, maxInitials: number): string {
  // Trim the name and split it into words
  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    // If the name is a single word, take the first two characters (or less if the word is shorter)
    return words[0].slice(0, Math.min(maxInitials, 2)).toUpperCase();
  }

  // Get the first letter of each word
  const initials = words.map((word) => word.charAt(0).toUpperCase());

  // Join up to `maxInitials` number of initials
  return initials.slice(0, maxInitials).join("");
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

export function getIconByName(iconName: string) {
  return FaIcons[iconName as keyof typeof FaIcons] || FaIcons.FaQuestion;
}

export function getLastSixMonths(): string[] {
  const months = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(date.toLocaleString("default", { month: "long" }));
  }

  return months;
}

export function getLast30Days() {
  const today = new Date();
  return Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(today.getDate() - i);
    return date.toISOString().split("T")[0]; // Format as "YYYY-MM-DD"
  }).reverse();
}

export function generateRandomColor(): string {
  const randomValue = () => Math.floor(Math.random() * 56) + 250;
  const r = randomValue();
  const g = randomValue();
  const b = randomValue();
  return `#${((1 << 24) + (r << 16) + (g << 8) + b)
    .toString(16)
    .slice(1)
    .toUpperCase()}`;
}

export function hexToRgb(hex: string) {
  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `${r}, ${g}, ${b}`;
}

export function formatDate(date: string | null): string {
  if (date === null) return "Indefinite";

  // Parse the date and add one day
  const correctedDate = addDays(parseISO(date), 1);

  // Format the corrected date
  return format(correctedDate, "MMMM d, yyyy");
}

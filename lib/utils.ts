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

export function lightenColor(hex: string): string {
  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    hex = hex.replace(/^#/, "");
    if (hex.length === 3)
      hex = hex
        .split("")
        .map((x) => x + x)
        .join("");
    const bigint = parseInt(hex, 16);
    return {
      r: (bigint >> 16) & 255,
      g: (bigint >> 8) & 255,
      b: bigint & 255,
    };
  };

  // Convert RGB to HSL
  const rgbToHsl = ({ r, g, b }: { r: number; g: number; b: number }) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return { h: h * 360, s, l };
  };

  // Convert HSL to hex
  const hslToHex = ({ h, s, l }: { h: number; s: number; l: number }) => {
    const hueToRgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let r, g, b;
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hueToRgb(p, q, h / 360 + 1 / 3);
      g = hueToRgb(p, q, h / 360);
      b = hueToRgb(p, q, h / 360 - 1 / 3);
    }

    const toHex = (x: number) =>
      Math.round(x * 255)
        .toString(16)
        .padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);

  // Check if it's already light (l > 0.8 is already in Tailwind 100-200 range)
  if (hsl.l > 0.75) {
    return hex; // Already light, return as is
  }

  // Make it lighter but stay within reasonable range
  hsl.l = Math.min(hsl.l + 0.2, 0.85); // Increase lightness but not past 85%
  return hslToHex(hsl);
}

export function getCurrentMonthDates(): { first: Date; last: Date } {
  const now = new Date();
  // First day: day 1 of the current month
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  // Last day: day 0 of the next month gives the last day of the current month
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { first, last };
}

export function getNumberOfDaysInCurrentMonth(): number {
  const now = new Date();
  // The day component of the last date of the month is the number of days in the month.
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

export function getMonthName(monthNumberStr: string) {
  // Convert string to integer, e.g. "03" => 3
  const monthIndex = parseInt(monthNumberStr, 10) - 1;

  // Array of month names (index 0 = January, 1 = February, etc.)
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Return the month name if valid, otherwise return an empty string or handle as needed
  return monthNames[monthIndex] || "";
}

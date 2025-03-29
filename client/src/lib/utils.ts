import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getIntentColor(intentType?: string): string {
  if (!intentType) return "";
  
  switch (intentType) {
    case "COMPARISON":
      return "bg-blue-100 text-blue-800 border-blue-100";
    case "QUESTION":
      return "bg-purple-100 text-purple-800 border-purple-100";
    case "REVIEW":
      return "bg-green-100 text-green-800 border-green-100";
    case "DISCOVERY":
      return "bg-amber-100 text-amber-800 border-amber-100";
    case "DISCUSSION":
      return "bg-indigo-100 text-indigo-800 border-indigo-100";
    default:
      return "bg-gray-100 text-gray-800 border-gray-100";
  }
}

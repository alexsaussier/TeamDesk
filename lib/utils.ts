import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function normalizeDecimalInput(value: string): number {
  // Replace comma with dot for decimal numbers
  const normalized = value.replace(',', '.')
  // Parse as float, defaulting to 0 if invalid
  const parsed = parseFloat(normalized)
  return isNaN(parsed) ? 0 : parsed
}

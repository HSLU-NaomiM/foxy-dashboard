// src/lib/utils.ts
// File Summary:
// This file provides small utility helpers used across the application.
// It currently exposes `cn`, a className utility that composes conditional class strings
// and resolves Tailwind CSS conflicts in a predictable way.
// Key responsibilities:
// - Accepts any number of class values (strings, arrays, conditionals) and normalizes them.
// - Merges Tailwind classes intelligently so later classes override earlier conflicting ones.
// - Reduces duplication and conditional logic inside JSX `className` props.
//
// Dependencies:
// - clsx: builds class strings from conditional/array inputs.
// - tailwind-merge: deduplicates and resolves conflicting Tailwind utility classes.
//
// Folder structure notes:
// - Located in `src/lib/`, which contains shared utilities and helper functions used throughout the app.
//
// Typical usage:
// - Used in UI components to compose `className` props, e.g. `cn("p-2", isActive && "bg-blue-100")`.
// - Helpful when combining base styles with variant states and conditional flags.

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// cn:
// Composes className strings with conditional logic and merges Tailwind utilities.
// Later classes take precedence over earlier conflicting ones (via tailwind-merge).
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export function chunk<T>(array: T[], size: number): T[][] {
  const results: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    results.push(array.slice(i, i + size));
  }
  return results;
}

export function splitIntoGroups<T>(array: T[], groupCount: number): T[][] {
  if (groupCount <= 0) return [array];
  const results: T[][] = Array.from({ length: groupCount }, () => []);
  array.forEach((item, index) => {
    results[index % groupCount].push(item);
  });
  return results;
}

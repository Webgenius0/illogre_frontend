/**
 * Set item in localStorage
 */
export const setLocalStorage = (key: string, value: unknown): void => {
  if (typeof window === "undefined") return;

  try {
    const stringValue =
      typeof value === "object" && value !== null
        ? JSON.stringify(value)
        : String(value);
    localStorage.setItem(key, stringValue);
  } catch (error) {
    console.error(`Error saving to localStorage: ${error}`);
  }
};

/**
 * Get item from localStorage with Generic type support
 */
export const getLocalStorage = <T>(key: string): T | string | null => {
  if (typeof window === "undefined") return null;

  try {
    const storedValue = localStorage.getItem(key);
    if (storedValue === null) return null;

    try {
      return JSON.parse(storedValue) as T;
    } catch {
      return storedValue;
    }
  } catch (error) {
    console.error(`Error retrieving from localStorage: ${error}`);
    return null;
  }
};

/**
 * Remove item from localStorage
 */
export const removeLocalStorage = (key: string): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage: ${error}`);
  }
};

/**
 * Clear all localStorage
 */
export const clearLocalStorage = (): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.clear();
  } catch (error) {
    console.error(`Error clearing localStorage: ${error}`);
  }
};

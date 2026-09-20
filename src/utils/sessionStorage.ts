/**
 * Set item in sessionStorage
 */
export const setSessionStorage = (key: string, value: unknown): void => {
  if (typeof window === "undefined") return;
  try {
    const valueToStore =
      typeof value === "object" && value !== null
        ? JSON.stringify(value)
        : String(value);
    sessionStorage.setItem(key, valueToStore);
  } catch (error) {
    console.error(`Error saving to sessionStorage: ${error}`);
  }
};

/**
 * Get item from sessionStorage with Generic support
 */
export const getSessionStorage = <T>(key: string): T | string | null => {
  if (typeof window === "undefined") return null;
  try {
    const storedValue = sessionStorage.getItem(key);
    if (storedValue === null) return null;

    try {
      // Attempt to parse as JSON and cast to the requested type T
      return JSON.parse(storedValue) as T;
    } catch {
      // If parsing fails, return the raw string
      return storedValue;
    }
  } catch (error) {
    console.error(`Error retrieving from sessionStorage: ${error}`);
    return null;
  }
};

/**
 * Remove item from sessionStorage
 */
export const removeSessionStorage = (key: string): void => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from sessionStorage: ${error}`);
  }
};

/**
 * Clear all sessionStorage
 */
export const clearSessionStorage = (): void => {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.clear();
  } catch (error) {
    console.error(`Error clearing sessionStorage: ${error}`);
  }
};

/**
 * Date Helper Utilities
 * 
 * Provides conversion functions between different date formats used in the application.
 * The backend expects dates in DD-MM-YYYY format while HTML5 inputs use YYYY-MM-DD.
 */

/**
 * Converts API date format (DD-MM-YYYY) to HTML input date format (YYYY-MM-DD)
 * @param dateStr - Date string in DD-MM-YYYY format (e.g., "27-09-2026")
 * @returns Date string in YYYY-MM-DD format (e.g., "2026-09-27") or empty string if invalid
 * 
 * @example
 * apiDateToInputDate("27-09-2026") // Returns "2026-09-27"
 * apiDateToInputDate("") // Returns ""
 */
export function apiDateToInputDate(dateStr?: string): string {
  if (!dateStr) return '';
  
  // Handle both dash and slash formats
  const parts = dateStr.split(/[-/]/);
  if (parts.length !== 3) return '';
  
  const [dd, mm, yyyy] = parts;
  if (!dd || !mm || !yyyy) return '';
  
  return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

/**
 * Converts HTML input date format (YYYY-MM-DD) to API date format (DD-MM-YYYY)
 * @param dateStr - Date string in YYYY-MM-DD format (e.g., "2026-09-27")
 * @returns Date string in DD-MM-YYYY format (e.g., "27-09-2026") or empty string if invalid
 * 
 * @example
 * inputDateToApiDate("2026-09-27") // Returns "27-09-2026"
 * inputDateToApiDate("") // Returns ""
 */
export function inputDateToApiDate(dateStr?: string): string {
  if (!dateStr) return '';
  
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  
  const [yyyy, mm, dd] = parts;
  if (!dd || !mm || !yyyy) return '';
  
  return `${dd}-${mm}-${yyyy}`;
}

/**
 * Formats a date string for display in Arabic context
 * @param dateStr - Date string in YYYY-MM-DD format
 * @returns Formatted date string in DD-MM-YYYY format
 * 
 * @example
 * formatDateArabic("2026-09-27") // Returns "27-09-2026"
 */
export function formatDateArabic(dateStr: string): string {
  const [yyyy, mm, dd] = dateStr.split('-');
  return `${dd}-${mm}-${yyyy}`;
}

/**
 * Gets today's date in API format (DD-MM-YYYY)
 * @returns Today's date as DD-MM-YYYY string
 * 
 * @example
 * getTodayApiDate() // Returns "27-09-2026" (if today is Sept 27, 2026)
 */
export function getTodayApiDate(): string {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, '0');
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const yyyy = today.getFullYear();
  
  return `${dd}-${mm}-${yyyy}`;
}

/**
 * Gets today's date in input format (YYYY-MM-DD)
 * @returns Today's date as YYYY-MM-DD string
 * 
 * @example
 * getTodayInputDate() // Returns "2026-09-27" (if today is Sept 27, 2026)
 */
export function getTodayInputDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Validates if a date string is in valid DD-MM-YYYY format
 * @param dateStr - Date string to validate
 * @returns True if valid, false otherwise
 * 
 * @example
 * isValidApiDate("27-09-2026") // Returns true
 * isValidApiDate("2026-09-27") // Returns false
 * isValidApiDate("32-13-2026") // Returns false
 */
export function isValidApiDate(dateStr: string): boolean {
  if (!dateStr) return false;
  
  const parts = dateStr.split('-');
  if (parts.length !== 3) return false;
  
  const [dd, mm, yyyy] = parts;
  const day = parseInt(dd, 10);
  const month = parseInt(mm, 10);
  const year = parseInt(yyyy, 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  if (day < 1 || day > 31) return false;
  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > 2100) return false;
  
  // Check actual date validity
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year &&
         date.getMonth() === month - 1 &&
         date.getDate() === day;
}

/**
 * Validates if a date string is in valid YYYY-MM-DD format
 * @param dateStr - Date string to validate
 * @returns True if valid, false otherwise
 * 
 * @example
 * isValidInputDate("2026-09-27") // Returns true
 * isValidInputDate("27/09/2026") // Returns false
 * isValidInputDate("2026-13-32") // Returns false
 */
export function isValidInputDate(dateStr: string): boolean {
  if (!dateStr) return false;
  
  const parts = dateStr.split('-');
  if (parts.length !== 3) return false;
  
  const [yyyy, mm, dd] = parts;
  const year = parseInt(yyyy, 10);
  const month = parseInt(mm, 10);
  const day = parseInt(dd, 10);
  
  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  if (day < 1 || day > 31) return false;
  if (month < 1 || month > 12) return false;
  if (year < 1900 || year > 2100) return false;
  
  // Check actual date validity
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year &&
         date.getMonth() === month - 1 &&
         date.getDate() === day;
}

/**
 * Parses a date string in DD-MM-YYYY format to a Date object
 * @param dateStr - Date string in DD-MM-YYYY format
 * @returns Date object or null if invalid
 * 
 * @example
 * parseApiDate("27-09-2026") // Returns Date object for Sept 27, 2026
 * parseApiDate("invalid") // Returns null
 */
export function parseApiDate(dateStr: string): Date | null {
  if (!isValidApiDate(dateStr)) return null;
  
  const [dd, mm, yyyy] = dateStr.split('-');
  return new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10));
}

/**
 * Calculates the difference in days between two dates
 * @param date1 - First date in DD-MM-YYYY format
 * @param date2 - Second date in DD-MM-YYYY format
 * @returns Number of days between dates (positive if date1 is after date2)
 * 
 * @example
 * daysBetween("28-09-2026", "27-09-2026") // Returns 1
 * daysBetween("27-09-2026", "28-09-2026") // Returns -1
 */
export function daysBetween(date1: string, date2: string): number {
  const d1 = parseApiDate(date1);
  const d2 = parseApiDate(date2);
  
  if (!d1 || !d2) return 0;
  
  const diffTime = d1.getTime() - d2.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Gets a date range for the current week
 * @returns Object with startDate and endDate in DD-MM-YYYY format
 * 
 * @example
 * getCurrentWeekRange() 
 * // Returns { startDate: "25-09-2026", endDate: "01-10-2026" }
 */
export function getCurrentWeekRange(): { startDate: string; endDate: string } {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  
  return {
    startDate: inputDateToApiDate(startOfWeek.toISOString().split('T')[0]),
    endDate: inputDateToApiDate(endOfWeek.toISOString().split('T')[0]),
  };
}

/**
 * Gets a date range for the current month
 * @returns Object with startDate and endDate in DD-MM-YYYY format
 * 
 * @example
 * getCurrentMonthRange() 
 * // Returns { startDate: "01-09-2026", endDate: "30-09-2026" }
 */
export function getCurrentMonthRange(): { startDate: string; endDate: string } {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  return {
    startDate: inputDateToApiDate(startOfMonth.toISOString().split('T')[0]),
    endDate: inputDateToApiDate(endOfMonth.toISOString().split('T')[0]),
  };
}

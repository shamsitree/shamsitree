/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

interface SmartDateInputProps {
  value?: string; // can be DD/MM/YYYY or YYYY-MM-DD
  onChange: (formattedDate: string, isoDate?: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}

/**
 * Validate leap year
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Validate day, month, year
 */
export function validateDate(day: number, month: number, year: number): { valid: boolean; error?: string } {
  if (year < 1800 || year > 2100) {
    return { valid: false, error: 'Year must be between 1800 and 2100' };
  }
  if (month < 1 || month > 12) {
    return { valid: false, error: 'Month must be between 01 and 12' };
  }

  const daysInMonths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const maxDays = daysInMonths[month - 1];

  if (day < 1 || day > maxDays) {
    if (month === 2 && day === 29 && !isLeapYear(year)) {
      return { valid: false, error: `${year} is not a leap year (Feb has 28 days)` };
    }
    return { valid: false, error: `Day must be between 01 and ${maxDays} for month ${month}` };
  }

  return { valid: true };
}

/**
 * Normalise any input into DD/MM/YYYY
 */
export function normalizeToDDMMYYYY(val: string): string {
  if (!val) return '';
  // Check if ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
    const [y, m, d] = val.split('-');
    return `${d}/${m}/${y}`;
  }
  return val;
}

export function toISODate(ddmmyyyy: string): string | undefined {
  if (!ddmmyyyy) return undefined;
  const parts = ddmmyyyy.split('/');
  if (parts.length === 3 && parts[0].length === 2 && parts[1].length === 2 && parts[2].length === 4) {
    const [d, m, y] = parts;
    return `${y}-${m}-${d}`;
  }
  return undefined;
}

export const SmartDateInput: React.FC<SmartDateInputProps> = ({
  value = '',
  onChange,
  label,
  placeholder = 'DD/MM/YYYY (e.g. 15081980)',
  required = false,
  className = '',
  disabled = false,
}) => {
  const [displayValue, setDisplayValue] = useState<string>(normalizeToDDMMYYYY(value));
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState<boolean>(false);
  const hiddenDateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const norm = normalizeToDDMMYYYY(value);
    setDisplayValue(norm);
    validateCurrent(norm);
  }, [value]);

  const validateCurrent = (val: string) => {
    if (!val) {
      setValidationError(null);
      setIsValid(false);
      return;
    }
    const digitsOnly = val.replace(/\D/g, '');
    if (digitsOnly.length === 8) {
      const d = parseInt(digitsOnly.slice(0, 2), 10);
      const m = parseInt(digitsOnly.slice(2, 4), 10);
      const y = parseInt(digitsOnly.slice(4, 8), 10);
      const res = validateDate(d, m, y);
      if (!res.valid) {
        setValidationError(res.error || 'Invalid date');
        setIsValid(false);
      } else {
        setValidationError(null);
        setIsValid(true);
      }
    } else if (digitsOnly.length > 0 && digitsOnly.length < 8) {
      setValidationError('Incomplete date');
      setIsValid(false);
    } else {
      setValidationError(null);
      setIsValid(false);
    }
  };

  /**
   * Smart automatic separator insertion
   * User types "15081980" -> formatted automatically to "15/08/1980"
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const digits = rawVal.replace(/\D/g, '').slice(0, 8); // maximum 8 digits DDMMYYYY

    let formatted = '';
    if (digits.length <= 2) {
      formatted = digits;
    } else if (digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    }

    setDisplayValue(formatted);
    validateCurrent(formatted);

    const iso = toISODate(formatted);
    onChange(formatted, iso);
  };

  /**
   * Native calendar picker sync
   */
  const handleCalendarPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isoVal = e.target.value; // YYYY-MM-DD
    if (!isoVal) return;
    const norm = normalizeToDDMMYYYY(isoVal);
    setDisplayValue(norm);
    validateCurrent(norm);
    onChange(norm, isoVal);
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9/]*"
          value={displayValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full rounded-lg border bg-white px-3.5 py-2 pr-16 text-sm font-mono text-slate-800 transition-colors focus:outline-none focus:ring-2 ${
            validationError
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
              : isValid
              ? 'border-emerald-400 focus:border-emerald-500 focus:ring-emerald-200'
              : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
          }`}
        />

        <div className="absolute right-2 flex items-center gap-1.5">
          {isValid && (
            <span title="Valid date" className="text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          )}
          {validationError && (
            <span title={validationError} className="text-rose-500">
              <AlertCircle className="h-4 w-4" />
            </span>
          )}

          {/* Calendar Picker Trigger */}
          <button
            type="button"
            title="Open calendar picker"
            onClick={() => hiddenDateInputRef.current?.showPicker?.() || hiddenDateInputRef.current?.click()}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <Calendar className="h-4 w-4" />
          </button>

          <input
            ref={hiddenDateInputRef}
            type="date"
            tabIndex={-1}
            aria-hidden="true"
            onChange={handleCalendarPick}
            className="pointer-events-none absolute h-0 w-0 opacity-0"
          />
        </div>
      </div>

      {validationError ? (
        <p className="text-[11px] text-rose-500">{validationError}</p>
      ) : (
        <p className="text-[11px] text-slate-600">
          Auto-separates numbers (e.g. type <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-800">15081980</code>)
        </p>
      )}
    </div>
  );
};

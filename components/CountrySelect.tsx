'use client';

import { useMemo, useState } from 'react';
import { COUNTRIES, Country, getCountryByCode, getCountryLabel } from '@/lib/countries';
import { Input } from '@/components/ui/input';

interface CountrySelectProps {
  value?: string | null;
  onSelect: (country: Country) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

const MAX_RESULTS = 80;

export function CountrySelect({ value, onSelect, onBlur, disabled }: CountrySelectProps) {
  const selectedCountry = getCountryByCode(value);
  const selectedLabel = selectedCountry ? getCountryLabel(selectedCountry) : value ?? '';
  const [query, setQuery] = useState(selectedLabel);
  const [open, setOpen] = useState(false);

  const countries = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return COUNTRIES.slice(0, MAX_RESULTS);

    return COUNTRIES.filter((country) =>
      [country.code, country.ru, country.en].some((part) => part.toLocaleLowerCase().includes(normalizedQuery)),
    ).slice(0, MAX_RESULTS);
  }, [query]);

  return (
    <div className="relative">
      <Input
        aria-autocomplete="list"
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
        onBlur={() => {
          window.setTimeout(() => {
            setOpen(false);
            onBlur?.();
          }, 100);
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onFocus={() => {
          setQuery(selectedLabel);
          setOpen(true);
        }}
        placeholder="Начните вводить страну или ISO-код"
        role="combobox"
        value={open ? query : selectedLabel}
      />
      {open && (
        <div className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md" role="listbox">
          {countries.map((country) => (
            <button
              className="flex w-full rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent hover:text-accent-foreground"
              key={country.code}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onSelect(country);
                setOpen(false);
              }}
              aria-selected={country.code === selectedCountry?.code}
              role="option"
              type="button"
            >
              {getCountryLabel(country)}
            </button>
          ))}
          {!countries.length && <p className="px-2 py-1.5 text-sm text-muted-foreground">Страна не найдена</p>}
        </div>
      )}
    </div>
  );
}

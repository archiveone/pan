'use client';

import { useState, useEffect } from 'react';
import * as React from 'react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PriceRangeSliderProps {
  value?: {
    min: number;
    max: number;
    currency: string;
  };
  onChange: (value: {
    min: number;
    max: number;
    currency: string;
  }) => void;
  currency?: string;
  className?: string;
}

interface PriceRange {
  min: number;
  max: number;
}

const CURRENCIES = [
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
];

const DEFAULT_RANGES = {
  property: {
    min: 0,
    max: 2000000,
    step: 5000,
    marks: [
      { value: 0, label: '£0' },
      { value: 500000, label: '£500k' },
      { value: 1000000, label: '£1M' },
      { value: 1500000, label: '£1.5M' },
      { value: 2000000, label: '£2M+' },
    ],
  },
  service: {
    min: 0,
    max: 1000,
    step: 10,
    marks: [
      { value: 0, label: '£0' },
      { value: 250, label: '£250' },
      { value: 500, label: '£500' },
      { value: 750, label: '£750' },
      { value: 1000, label: '£1000+' },
    ],
  },
  leisure: {
    min: 0,
    max: 5000,
    step: 50,
    marks: [
      { value: 0, label: '£0' },
      { value: 1250, label: '£1.25k' },
      { value: 2500, label: '£2.5k' },
      { value: 3750, label: '£3.75k' },
      { value: 5000, label: '£5k+' },
    ],
  },
};

export function PriceRangeSlider({
  value,
  onChange,
  currency = 'GBP',
  className,
}: PriceRangeSliderProps) {
  const [range, setRange] = useState<PriceRange>({
    min: value?.min || 0,
    max: value?.max || DEFAULT_RANGES.property.max,
  });
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [isCustomRange, setIsCustomRange] = useState(false);

  // Detect if we're dealing with properties, services, or leisure based on the max value
  const getRangeType = (max: number) => {
    if (max <= DEFAULT_RANGES.service.max) return 'service';
    if (max <= DEFAULT_RANGES.leisure.max) return 'leisure';
    return 'property';
  };

  const rangeType = getRangeType(range.max);
  const currentRange = DEFAULT_RANGES[rangeType];

  const formatValue = (value: number) => {
    const curr = CURRENCIES.find((c) => c.code === selectedCurrency);
    if (value >= 1000000) {
      return \`\${curr?.symbol}\${(value / 1000000).toFixed(1)}M\`;
    }
    if (value >= 1000) {
      return \`\${curr?.symbol}\${(value / 1000).toFixed(1)}k\`;
    }
    return \`\${curr?.symbol}\${value}\`;
  };

  const handleSliderChange = (newValue: number[]) => {
    const [min, max] = newValue;
    setRange({ min, max });
    onChange({
      min,
      max,
      currency: selectedCurrency,
    });
  };

  const handleInputChange = (
    type: 'min' | 'max',
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newValue = parseInt(event.target.value.replace(/[^0-9]/g, ''), 10);
    if (isNaN(newValue)) return;

    const newRange =
      type === 'min'
        ? { ...range, min: newValue }
        : { ...range, max: newValue };

    // Validate range
    if (newRange.min > newRange.max) {
      if (type === 'min') {
        newRange.max = newRange.min;
      } else {
        newRange.min = newRange.max;
      }
    }

    setRange(newRange);
    onChange({
      ...newRange,
      currency: selectedCurrency,
    });
  };

  const handleCurrencyChange = (newCurrency: string) => {
    setSelectedCurrency(newCurrency);
    onChange({
      ...range,
      currency: newCurrency,
    });
  };

  return (
    <div className={className}>
      <div className="mb-6">
        <Slider
          value={[range.min, range.max]}
          min={currentRange.min}
          max={currentRange.max}
          step={currentRange.step}
          onValueChange={handleSliderChange}
          className="mt-6"
        />
        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
          {currentRange.marks.map((mark) => (
            <span key={mark.value}>{mark.label}</span>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Minimum</label>
          <div className="relative">
            <Input
              type="text"
              value={formatValue(range.min)}
              onChange={(e) => handleInputChange('min', e)}
              className="pl-6"
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
              {CURRENCIES.find((c) => c.code === selectedCurrency)?.symbol}
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-2">
          <label className="text-sm font-medium">Maximum</label>
          <div className="relative">
            <Input
              type="text"
              value={formatValue(range.max)}
              onChange={(e) => handleInputChange('max', e)}
              className="pl-6"
            />
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground">
              {CURRENCIES.find((c) => c.code === selectedCurrency)?.symbol}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Currency</label>
          <Select
            value={selectedCurrency}
            onValueChange={handleCurrencyChange}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CURRENCIES.map((curr) => (
                <SelectItem key={curr.code} value={curr.code}>
                  {curr.code} ({curr.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isCustomRange && (
        <div className="mt-4">
          <label className="text-sm font-medium">Custom Range</label>
          <div className="mt-2 flex items-center gap-4">
            <Input
              type="number"
              placeholder="Min"
              value={range.min}
              onChange={(e) => handleInputChange('min', e)}
              className="flex-1"
            />
            <span>to</span>
            <Input
              type="number"
              placeholder="Max"
              value={range.max}
              onChange={(e) => handleInputChange('max', e)}
              className="flex-1"
            />
          </div>
        </div>
      )}
    </div>
  );
}
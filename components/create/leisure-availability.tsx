'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon,
  Clock,
  ArrowRight,
  Check,
  X,
  Plus,
  Minus,
  AlarmClock,
  Calendar,
  Repeat,
  CalendarDays,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { useListingCreation } from '@/contexts/listing-creation-context';
import { cn } from '@/lib/utils';

type AvailabilityType = 'always' | 'schedule' | 'dates' | 'custom';
type DaySchedule = { start: string; end: string; };
type WeekSchedule = { [key: string]: DaySchedule | null };

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const timeSlots = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minute}`;
});

export function LeisureAvailability() {
  const { state, updateData, nextStep } = useListingCreation();
  const [availabilityType, setAvailabilityType] = useState<AvailabilityType>(
    state.data.leisure?.availability?.type || 'dates'
  );
  const [dateRange, setDateRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: state.data.leisure?.availability?.dates?.start 
      ? new Date(state.data.leisure.availability.dates.start)
      : null,
    end: state.data.leisure?.availability?.dates?.end
      ? new Date(state.data.leisure.availability.dates.end)
      : null,
  });
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule>(
    state.data.leisure?.availability?.schedule || {}
  );
  const [maxBookings, setMaxBookings] = useState(
    state.data.leisure?.maxBookings || 1
  );
  const [error, setError] = useState('');

  const handleDaySchedule = (day: string, type: 'start' | 'end', value: string) => {
    setWeekSchedule(prev => ({
      ...prev,
      [day]: {
        ...(prev[day] || { start: '09:00', end: '17:00' }),
        [type]: value,
      },
    }));
  };

  const toggleDayAvailability = (day: string) => {
    setWeekSchedule(prev => ({
      ...prev,
      [day]: prev[day] ? null : { start: '09:00', end: '17:00' },
    }));
  };

  const copyScheduleToAll = (fromDay: string) => {
    const schedule = weekSchedule[fromDay];
    if (schedule) {
      const newSchedule = daysOfWeek.reduce((acc, day) => ({
        ...acc,
        [day]: { ...schedule },
      }), {});
      setWeekSchedule(newSchedule);
    }
  };

  const validateAvailability = () => {
    if (availabilityType === 'dates') {
      if (!dateRange.start || !dateRange.end) {
        setError('Please select both start and end dates');
        return false;
      }
      if (dateRange.start >= dateRange.end) {
        setError('End date must be after start date');
        return false;
      }
    }

    if (availabilityType === 'schedule') {
      const hasAnyDay = Object.values(weekSchedule).some(schedule => schedule !== null);
      if (!hasAnyDay) {
        setError('Please set availability for at least one day');
        return false;
      }

      // Validate time ranges
      for (const [day, schedule] of Object.entries(weekSchedule)) {
        if (schedule) {
          const start = schedule.start.replace(':', '');
          const end = schedule.end.replace(':', '');
          if (start >= end) {
            setError(`Invalid time range for ${day}`);
            return false;
          }
        }
      }
    }

    if (maxBookings < 1) {
      setError('Maximum bookings must be at least 1');
      return false;
    }

    setError('');
    return true;
  };

  const handleContinue = () => {
    if (validateAvailability()) {
      updateData({
        leisure: {
          ...state.data.leisure,
          availability: {
            type: availabilityType,
            dates: availabilityType === 'dates' ? {
              start: dateRange.start?.toISOString(),
              end: dateRange.end?.toISOString(),
            } : undefined,
            schedule: availabilityType === 'schedule' ? weekSchedule : undefined,
          },
          maxBookings,
        },
      });
      nextStep();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          Set Your Availability
        </h2>
        <p className="text-muted-foreground">
          Choose when your leisure offering is available
        </p>
      </div>

      <div className="space-y-8">
        {/* Availability Type Selection */}
        <Card className="p-6">
          <RadioGroup
            value={availabilityType}
            onValueChange={(value: AvailabilityType) => setAvailabilityType(value)}
            className="grid gap-4"
          >
            <div className="flex items-center space-x-4">
              <RadioGroupItem value="dates" id="dates" />
              <Label htmlFor="dates" className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Specific Dates
              </Label>
            </div>
            <div className="flex items-center space-x-4">
              <RadioGroupItem value="schedule" id="schedule" />
              <Label htmlFor="schedule" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Weekly Schedule
              </Label>
            </div>
            <div className="flex items-center space-x-4">
              <RadioGroupItem value="always" id="always" />
              <Label htmlFor="always" className="flex items-center gap-2">
                <AlarmClock className="w-4 h-4" />
                Always Available
              </Label>
            </div>
          </RadioGroup>
        </Card>

        {/* Date Range Selection */}
        <AnimatePresence>
          {availabilityType === 'dates' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6">
                <div className="grid gap-6">
                  <div>
                    <Label>Select Date Range</Label>
                    <div className="mt-2">
                      <CalendarComponent
                        mode="range"
                        selected={{
                          from: dateRange.start || undefined,
                          to: dateRange.end || undefined,
                        }}
                        onSelect={(range) => {
                          setDateRange({
                            start: range?.from || null,
                            end: range?.to || null,
                          });
                        }}
                        numberOfMonths={2}
                        className="rounded-md border"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Weekly Schedule */}
        <AnimatePresence>
          {availabilityType === 'schedule' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6">
                <div className="space-y-6">
                  {daysOfWeek.map((day) => (
                    <div key={day} className="flex items-center gap-4">
                      <Switch
                        checked={weekSchedule[day] !== null}
                        onCheckedChange={() => toggleDayAvailability(day)}
                      />
                      <div className="w-24 font-medium">{day}</div>
                      {weekSchedule[day] ? (
                        <>
                          <Select
                            value={weekSchedule[day]?.start}
                            onValueChange={(value) => handleDaySchedule(day, 'start', value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span>to</span>
                          <Select
                            value={weekSchedule[day]?.end}
                            onValueChange={(value) => handleDaySchedule(day, 'end', value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyScheduleToAll(day)}
                          >
                            Copy to all
                          </Button>
                        </>
                      ) : (
                        <span className="text-muted-foreground">Unavailable</span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Maximum Bookings */}
        <Card className="p-6">
          <div className="space-y-4">
            <Label>Maximum Bookings per Time Slot</Label>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMaxBookings(prev => Math.max(1, prev - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                value={maxBookings}
                onChange={(e) => setMaxBookings(Number(e.target.value))}
                className="w-20 text-center"
                min={1}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setMaxBookings(prev => prev + 1)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              How many bookings can be made for the same time slot
            </p>
          </div>
        </Card>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-destructive text-sm text-center"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Continue Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleContinue}
            className="bg-green-500 hover:bg-green-600"
          >
            <Check className="mr-2 h-4 w-4" />
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
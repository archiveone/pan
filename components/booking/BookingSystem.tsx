import { useState, useEffect } from 'react';
import { format, addDays, isSameDay, parseISO } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import {
  Clock,
  Calendar as CalendarIcon,
  CreditCard,
  Users,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  available: boolean;
}

interface BookingSystemProps {
  itemId: string;
  itemType: 'property' | 'service' | 'leisure';
  price: number;
  currency: string;
  maxGuests?: number;
  minDuration?: number;
  maxDuration?: number;
}

export function BookingSystem({
  itemId,
  itemType,
  price,
  currency,
  maxGuests = 1,
  minDuration = 1,
  maxDuration = 8,
}: BookingSystemProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [duration, setDuration] = useState(minDuration);
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isInsuranceSelected, setIsInsuranceSelected] = useState(false);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const { toast } = useToast();

  // Fetch available time slots when date changes
  useEffect(() => {
    if (!selectedDate) return;

    const fetchTimeSlots = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(\`/api/availability/\${itemId}\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: format(selectedDate, 'yyyy-MM-dd'),
            itemType,
          }),
        });

        if (!response.ok) throw new Error('Failed to fetch time slots');

        const slots = await response.json();
        setTimeSlots(slots);
      } catch (error) {
        console.error('Error fetching time slots:', error);
        toast({
          title: 'Error',
          description: 'Failed to load available time slots. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimeSlots();
  }, [selectedDate, itemId, itemType, toast]);

  const calculateTotal = () => {
    const basePrice = price * duration;
    const insuranceCost = isInsuranceSelected ? basePrice * 0.1 : 0;
    return basePrice + insuranceCost;
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedSlot) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          itemType,
          date: format(selectedDate, 'yyyy-MM-dd'),
          timeSlot: selectedSlot,
          duration,
          guests,
          specialRequests,
          insurance: isInsuranceSelected,
          total: calculateTotal(),
        }),
      });

      if (!response.ok) throw new Error('Booking failed');

      const booking = await response.json();
      
      toast({
        title: 'Booking Confirmed!',
        description: \`Your booking reference is \${booking.reference}\`,
        duration: 5000,
      });
      
      setIsConfirmationOpen(false);
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Booking Failed',
        description: 'Unable to complete your booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Book Your {itemType}</CardTitle>
        <CardDescription>
          Select your preferred date and time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Calendar */}
        <div className="space-y-2">
          <Label>Select Date</Label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            disabled={(date) => date < new Date() || date > addDays(new Date(), 90)}
            className="rounded-md border"
          />
        </div>

        {/* Time Slots */}
        <div className="space-y-2">
          <Label>Available Times</Label>
          <ScrollArea className="h-32 rounded-md border">
            <div className="grid grid-cols-2 gap-2 p-2">
              {timeSlots.map((slot) => (
                <Button
                  key={slot.id}
                  variant={selectedSlot === slot.id ? 'default' : 'outline'}
                  disabled={!slot.available}
                  onClick={() => setSelectedSlot(slot.id)}
                  className="w-full"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {slot.startTime}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label>Duration ({itemType === 'property' ? 'nights' : 'hours'})</Label>
          <Select
            value={duration.toString()}
            onValueChange={(value) => setDuration(parseInt(value))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from(
                { length: maxDuration - minDuration + 1 },
                (_, i) => i + minDuration
              ).map((value) => (
                <SelectItem key={value} value={value.toString()}>
                  {value} {value === 1 ? 
                    (itemType === 'property' ? 'night' : 'hour') : 
                    (itemType === 'property' ? 'nights' : 'hours')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Guests */}
        {maxGuests > 1 && (
          <div className="space-y-2">
            <Label>Number of Guests</Label>
            <Select
              value={guests.toString()}
              onValueChange={(value) => setGuests(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: maxGuests }, (_, i) => i + 1).map((value) => (
                  <SelectItem key={value} value={value.toString()}>
                    {value} {value === 1 ? 'guest' : 'guests'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Special Requests */}
        <div className="space-y-2">
          <Label>Special Requests</Label>
          <Textarea
            placeholder="Any special requirements..."
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
          />
        </div>

        {/* Insurance Option */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Booking Protection</Label>
            <p className="text-sm text-muted-foreground">
              Add insurance for 10% of booking value
            </p>
          </div>
          <Switch
            checked={isInsuranceSelected}
            onCheckedChange={setIsInsuranceSelected}
          />
        </div>

        {/* Price Breakdown */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Base Price</span>
                <span>
                  {currency} {(price * duration).toFixed(2)}
                </span>
              </div>
              {isInsuranceSelected && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Insurance</span>
                  <span>
                    {currency} {(price * duration * 0.1).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between font-bold pt-2 border-t">
                <span>Total</span>
                <span>
                  {currency} {calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>

      <CardFooter>
        <Dialog open={isConfirmationOpen} onOpenChange={setIsConfirmationOpen}>
          <DialogTrigger asChild>
            <Button
              className="w-full"
              disabled={!selectedDate || !selectedSlot || isLoading}
            >
              {isLoading ? 'Processing...' : 'Continue to Payment'}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Your Booking</DialogTitle>
              <DialogDescription>
                Please review your booking details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>
                  {timeSlots.find(slot => slot.id === selectedSlot)?.startTime}
                </span>
              </div>
              {maxGuests > 1 && (
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{guests} guests</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <CreditCard className="h-4 w-4" />
                <span>
                  Total: {currency} {calculateTotal().toFixed(2)}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsConfirmationOpen(false)}
              >
                Back
              </Button>
              <Button onClick={handleBooking} disabled={isLoading}>
                {isLoading ? 'Processing...' : 'Confirm & Pay'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket,
  Plus,
  Minus,
  Check,
  X,
  Edit2,
  Trash2,
  QrCode,
  UserCheck,
  Clock,
  Euro,
  Calendar,
  Users,
  AlertCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useListingCreation } from '@/contexts/listing-creation-context';
import { cn, formatPrice } from '@/lib/utils';

interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  maxPerBooking: number;
  earlyBird?: {
    enabled: boolean;
    price: number;
    deadline: string;
  };
  groupDiscount?: {
    enabled: boolean;
    threshold: number;
    percentage: number;
  };
}

interface AttendanceOption {
  type: 'qr' | 'manual' | 'both';
  label: string;
  description: string;
  icon: any;
}

const attendanceOptions: AttendanceOption[] = [
  {
    type: 'qr',
    label: 'QR Code Check-in',
    description: 'Attendees scan QR codes for entry',
    icon: QrCode,
  },
  {
    type: 'manual',
    label: 'Manual Check-in',
    description: 'Staff checks attendees manually',
    icon: UserCheck,
  },
  {
    type: 'both',
    label: 'Both Methods',
    description: 'Use both QR and manual check-in',
    icon: Check,
  },
];

export function LeisureTicketing() {
  const { state, updateData, nextStep } = useListingCreation();
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>(
    state.data.leisure?.ticketing?.types || []
  );
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [editingTicket, setEditingTicket] = useState<number | null>(null);
  const [newTicket, setNewTicket] = useState<TicketType>({
    id: '',
    name: '',
    description: '',
    price: 0,
    quantity: 0,
    maxPerBooking: 1,
    earlyBird: {
      enabled: false,
      price: 0,
      deadline: '',
    },
    groupDiscount: {
      enabled: false,
      threshold: 5,
      percentage: 10,
    },
  });
  const [attendanceType, setAttendanceType] = useState(
    state.data.leisure?.ticketing?.attendance || 'qr'
  );
  const [requiresCheckin, setRequiresCheckin] = useState(
    state.data.leisure?.ticketing?.requiresCheckin || true
  );
  const [error, setError] = useState('');

  const validateTicketing = () => {
    if (ticketTypes.length === 0) {
      setError('Please add at least one ticket type');
      return false;
    }

    for (const ticket of ticketTypes) {
      if (ticket.price < 0 || ticket.quantity < 1 || ticket.maxPerBooking < 1) {
        setError('Invalid ticket configuration');
        return false;
      }

      if (ticket.earlyBird?.enabled && (!ticket.earlyBird.price || !ticket.earlyBird.deadline)) {
        setError('Invalid early bird configuration');
        return false;
      }

      if (ticket.groupDiscount?.enabled && 
          (!ticket.groupDiscount.threshold || !ticket.groupDiscount.percentage)) {
        setError('Invalid group discount configuration');
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleAddTicket = () => {
    if (!newTicket.name || !newTicket.description || newTicket.price < 0 || newTicket.quantity < 1) {
      setError('Please fill in all ticket details');
      return;
    }

    if (editingTicket !== null) {
      setTicketTypes(prev => prev.map((t, i) => 
        i === editingTicket ? { ...newTicket, id: t.id } : t
      ));
      setEditingTicket(null);
    } else {
      setTicketTypes(prev => [...prev, {
        ...newTicket,
        id: Math.random().toString(36).substr(2, 9),
      }]);
    }

    setNewTicket({
      id: '',
      name: '',
      description: '',
      price: 0,
      quantity: 0,
      maxPerBooking: 1,
      earlyBird: {
        enabled: false,
        price: 0,
        deadline: '',
      },
      groupDiscount: {
        enabled: false,
        threshold: 5,
        percentage: 10,
      },
    });
    setShowTicketForm(false);
    setError('');
  };

  const handleEditTicket = (index: number) => {
    setNewTicket(ticketTypes[index]);
    setEditingTicket(index);
    setShowTicketForm(true);
  };

  const handleDeleteTicket = (index: number) => {
    setTicketTypes(prev => prev.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    if (validateTicketing()) {
      updateData({
        leisure: {
          ...state.data.leisure,
          ticketing: {
            types: ticketTypes,
            attendance: attendanceType,
            requiresCheckin,
          },
        },
      });
      nextStep();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          Ticket Management
        </h2>
        <p className="text-muted-foreground">
          Set up your tickets and attendance tracking
        </p>
      </div>

      <div className="space-y-8">
        {/* Ticket Types */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Ticket Types</h3>
                <p className="text-sm text-muted-foreground">
                  Create different ticket categories
                </p>
              </div>
              <Button
                onClick={() => setShowTicketForm(true)}
                disabled={showTicketForm}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Ticket Type
              </Button>
            </div>

            <AnimatePresence>
              {showTicketForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 border rounded-lg p-4"
                >
                  <div className="grid gap-4">
                    <div>
                      <Label>Ticket Name</Label>
                      <Input
                        value={newTicket.name}
                        onChange={(e) => setNewTicket(prev => ({
                          ...prev,
                          name: e.target.value,
                        }))}
                        placeholder="e.g., VIP Access"
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input
                        value={newTicket.description}
                        onChange={(e) => setNewTicket(prev => ({
                          ...prev,
                          description: e.target.value,
                        }))}
                        placeholder="What's included with this ticket?"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Price</Label>
                        <div className="flex items-center gap-2">
                          <Euro className="w-5 h-5 text-muted-foreground" />
                          <Input
                            type="number"
                            value={newTicket.price}
                            onChange={(e) => setNewTicket(prev => ({
                              ...prev,
                              price: Number(e.target.value),
                            }))}
                            min={0}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Quantity Available</Label>
                        <Input
                          type="number"
                          value={newTicket.quantity}
                          onChange={(e) => setNewTicket(prev => ({
                            ...prev,
                            quantity: Number(e.target.value),
                          }))}
                          min={1}
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Maximum Per Booking</Label>
                      <Input
                        type="number"
                        value={newTicket.maxPerBooking}
                        onChange={(e) => setNewTicket(prev => ({
                          ...prev,
                          maxPerBooking: Number(e.target.value),
                        }))}
                        min={1}
                      />
                    </div>

                    {/* Early Bird Pricing */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Early Bird Pricing</Label>
                          <p className="text-sm text-muted-foreground">
                            Offer discounted early bird tickets
                          </p>
                        </div>
                        <Switch
                          checked={newTicket.earlyBird?.enabled}
                          onCheckedChange={(checked) => setNewTicket(prev => ({
                            ...prev,
                            earlyBird: {
                              ...prev.earlyBird!,
                              enabled: checked,
                            },
                          }))}
                        />
                      </div>

                      {newTicket.earlyBird?.enabled && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Early Bird Price</Label>
                            <div className="flex items-center gap-2">
                              <Euro className="w-5 h-5 text-muted-foreground" />
                              <Input
                                type="number"
                                value={newTicket.earlyBird.price}
                                onChange={(e) => setNewTicket(prev => ({
                                  ...prev,
                                  earlyBird: {
                                    ...prev.earlyBird!,
                                    price: Number(e.target.value),
                                  },
                                }))}
                                min={0}
                              />
                            </div>
                          </div>
                          <div>
                            <Label>Deadline</Label>
                            <Input
                              type="datetime-local"
                              value={newTicket.earlyBird.deadline}
                              onChange={(e) => setNewTicket(prev => ({
                                ...prev,
                                earlyBird: {
                                  ...prev.earlyBird!,
                                  deadline: e.target.value,
                                },
                              }))}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Group Discount */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Group Discount</Label>
                          <p className="text-sm text-muted-foreground">
                            Offer discounts for group bookings
                          </p>
                        </div>
                        <Switch
                          checked={newTicket.groupDiscount?.enabled}
                          onCheckedChange={(checked) => setNewTicket(prev => ({
                            ...prev,
                            groupDiscount: {
                              ...prev.groupDiscount!,
                              enabled: checked,
                            },
                          }))}
                        />
                      </div>

                      {newTicket.groupDiscount?.enabled && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Minimum Group Size</Label>
                            <Input
                              type="number"
                              value={newTicket.groupDiscount.threshold}
                              onChange={(e) => setNewTicket(prev => ({
                                ...prev,
                                groupDiscount: {
                                  ...prev.groupDiscount!,
                                  threshold: Number(e.target.value),
                                },
                              }))}
                              min={2}
                            />
                          </div>
                          <div>
                            <Label>Discount Percentage</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                value={newTicket.groupDiscount.percentage}
                                onChange={(e) => setNewTicket(prev => ({
                                  ...prev,
                                  groupDiscount: {
                                    ...prev.groupDiscount!,
                                    percentage: Number(e.target.value),
                                  },
                                }))}
                                min={0}
                                max={100}
                              />
                              <span className="text-muted-foreground">%</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowTicketForm(false);
                        setEditingTicket(null);
                        setNewTicket({
                          id: '',
                          name: '',
                          description: '',
                          price: 0,
                          quantity: 0,
                          maxPerBooking: 1,
                          earlyBird: {
                            enabled: false,
                            price: 0,
                            deadline: '',
                          },
                          groupDiscount: {
                            enabled: false,
                            threshold: 5,
                            percentage: 10,
                          },
                        });
                      }}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddTicket}>
                      {editingTicket !== null ? 'Update' : 'Add'} Ticket
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid gap-4">
              {ticketTypes.map((ticket, index) => (
                <Card key={ticket.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{ticket.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {ticket.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-primary font-semibold">
                          €{formatPrice(ticket.price, false)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {ticket.quantity} available
                        </span>
                        <span className="text-sm text-muted-foreground">
                          Max {ticket.maxPerBooking} per booking
                        </span>
                      </div>
                      {ticket.earlyBird?.enabled && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4" />
                          Early Bird: €{formatPrice(ticket.earlyBird.price, false)}
                          until {new Date(ticket.earlyBird.deadline).toLocaleDateString()}
                        </div>
                      )}
                      {ticket.groupDiscount?.enabled && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="w-4 h-4" />
                          {ticket.groupDiscount.percentage}% off for groups of {ticket.groupDiscount.threshold}+
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditTicket(index)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteTicket(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>

        {/* Attendance Tracking */}
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold">Attendance Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Choose how you want to track attendance
              </p>
            </div>

            <div className="grid gap-4">
              {attendanceOptions.map((option) => (
                <div
                  key={option.type}
                  className={cn(
                    "flex items-center space-x-4 p-4 border rounded-lg cursor-pointer",
                    attendanceType === option.type && "border-primary bg-primary/5"
                  )}
                  onClick={() => setAttendanceType(option.type)}
                >
                  <div className={cn(
                    "p-2 rounded-full",
                    attendanceType === option.type ? "bg-primary text-white" : "bg-muted"
                  )}>
                    <option.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-medium">{option.label}</h4>
                    <p className="text-sm text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Require Check-in</Label>
                <p className="text-sm text-muted-foreground">
                  Attendees must check in to access the event
                </p>
              </div>
              <Switch
                checked={requiresCheckin}
                onCheckedChange={setRequiresCheckin}
              />
            </div>
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
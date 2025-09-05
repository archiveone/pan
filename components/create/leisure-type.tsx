'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car,
  Ship,
  Plane,
  Bike,
  Tent,
  Map,
  Users,
  Clock,
  Plus,
  Minus,
  Check,
  ChevronRight,
  X,
  Ticket,
  Music,
  Utensils,
  Calendar,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useListingCreation } from '@/contexts/listing-creation-context';
import { cn } from '@/lib/utils';

interface LeisureType {
  id: string;
  label: string;
  icon: any;
  description: string;
  categories: {
    id: string;
    label: string;
    icon: any;
  }[];
}

const leisureTypes: LeisureType[] = [
  {
    id: 'rental',
    label: 'Equipment Rental',
    icon: Car,
    description: 'Rent out vehicles, equipment, or spaces',
    categories: [
      { id: 'car', label: 'Cars', icon: Car },
      { id: 'boat', label: 'Boats', icon: Ship },
      { id: 'aircraft', label: 'Aircraft', icon: Plane },
      { id: 'bike', label: 'Bikes', icon: Bike },
      { id: 'camping', label: 'Camping', icon: Tent },
    ],
  },
  {
    id: 'experience',
    label: 'Experiences',
    icon: Map,
    description: 'Offer guided tours, workshops, or activities',
    categories: [
      { id: 'tour', label: 'Tours', icon: Map },
      { id: 'workshop', label: 'Workshops', icon: Users },
      { id: 'event', label: 'Events', icon: Ticket },
      { id: 'concert', label: 'Concerts', icon: Music },
      { id: 'dining', label: 'Dining', icon: Utensils },
    ],
  },
  {
    id: 'event',
    label: 'Events',
    icon: Calendar,
    description: 'Host one-time or recurring events',
    categories: [
      { id: 'party', label: 'Parties', icon: Users },
      { id: 'conference', label: 'Conferences', icon: Users },
      { id: 'exhibition', label: 'Exhibitions', icon: Map },
      { id: 'performance', label: 'Performances', icon: Music },
      { id: 'sports', label: 'Sports', icon: Users },
    ],
  },
];

export function LeisureType() {
  const { state, updateData, nextStep } = useListingCreation();
  const [type, setType] = useState(state.data.leisure?.type || '');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState(state.data.leisure?.duration || '');
  const [groupSize, setGroupSize] = useState({
    min: state.data.leisure?.groupSize?.min || 1,
    max: state.data.leisure?.groupSize?.max || 1,
  });
  const [included, setIncluded] = useState<string[]>(
    state.data.leisure?.included || []
  );
  const [requirements, setRequirements] = useState<string[]>(
    state.data.leisure?.requirements || []
  );
  const [newItem, setNewItem] = useState('');
  const [error, setError] = useState('');

  const selectedType = leisureTypes.find(t => t.type === type);

  const validateDetails = () => {
    if (!type || !category) {
      setError('Please select a type and category');
      return false;
    }

    if (!duration) {
      setError('Please specify the duration');
      return false;
    }

    if (groupSize.min < 1 || groupSize.max < groupSize.min) {
      setError('Please set valid group size limits');
      return false;
    }

    setError('');
    return true;
  };

  const handleAddItem = (list: 'included' | 'requirements') => {
    if (!newItem.trim()) return;

    if (list === 'included') {
      setIncluded(prev => [...prev, newItem.trim()]);
    } else {
      setRequirements(prev => [...prev, newItem.trim()]);
    }
    setNewItem('');
  };

  const handleRemoveItem = (list: 'included' | 'requirements', index: number) => {
    if (list === 'included') {
      setIncluded(prev => prev.filter((_, i) => i !== index));
    } else {
      setRequirements(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleContinue = () => {
    if (validateDetails()) {
      updateData({
        leisure: {
          ...state.data.leisure,
          type,
          category,
          duration,
          groupSize,
          included,
          requirements,
        },
      });
      nextStep();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          What type of leisure offering is this?
        </h2>
        <p className="text-muted-foreground">
          Choose the category that best describes your offering
        </p>
      </div>

      <div className="space-y-8">
        {/* Type Selection */}
        <div className="grid gap-4">
          {leisureTypes.map((leisureType) => (
            <Card
              key={leisureType.id}
              className={cn(
                "p-6 cursor-pointer transition-all hover:shadow-md",
                type === leisureType.id && "ring-2 ring-primary"
              )}
              onClick={() => {
                setType(leisureType.id);
                setCategory('');
              }}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "p-2 rounded-full",
                  type === leisureType.id ? "bg-primary text-white" : "bg-muted"
                )}>
                  <leisureType.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-medium">{leisureType.label}</h3>
                  <p className="text-sm text-muted-foreground">
                    {leisureType.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Category Selection */}
        <AnimatePresence>
          {type && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="p-6">
                <h3 className="font-medium mb-4">Select a Category</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {leisureTypes
                    .find(t => t.id === type)
                    ?.categories.map((cat) => (
                      <Card
                        key={cat.id}
                        className={cn(
                          "p-4 cursor-pointer transition-all hover:shadow-md",
                          category === cat.id && "ring-2 ring-primary bg-primary/5"
                        )}
                        onClick={() => setCategory(cat.id)}
                      >
                        <div className="flex flex-col items-center text-center gap-2">
                          <div className={cn(
                            "p-2 rounded-full",
                            category === cat.id ? "bg-primary text-white" : "bg-muted"
                          )}>
                            <cat.icon className="w-5 h-5" />
                          </div>
                          <span className="font-medium">{cat.label}</span>
                        </div>
                      </Card>
                    ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Details */}
        <AnimatePresence>
          {type && category && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Duration */}
              <Card className="p-6">
                <div className="grid gap-4">
                  <Label>Duration</Label>
                  <Input
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g., 2 hours, Full day, 3 days"
                  />
                </div>
              </Card>

              {/* Group Size */}
              <Card className="p-6">
                <div className="space-y-4">
                  <Label>Group Size</Label>
                  <div className="flex items-center gap-4">
                    <div className="space-y-2">
                      <Label>Minimum</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setGroupSize(prev => ({
                            ...prev,
                            min: Math.max(1, prev.min - 1),
                          }))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={groupSize.min}
                          onChange={(e) => setGroupSize(prev => ({
                            ...prev,
                            min: Number(e.target.value),
                          }))}
                          className="w-20 text-center"
                          min={1}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setGroupSize(prev => ({
                            ...prev,
                            min: prev.min + 1,
                          }))}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Maximum</Label>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setGroupSize(prev => ({
                            ...prev,
                            max: Math.max(prev.min, prev.max - 1),
                          }))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Input
                          type="number"
                          value={groupSize.max}
                          onChange={(e) => setGroupSize(prev => ({
                            ...prev,
                            max: Number(e.target.value),
                          }))}
                          className="w-20 text-center"
                          min={groupSize.min}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setGroupSize(prev => ({
                            ...prev,
                            max: prev.max + 1,
                          }))}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* What's Included */}
              <Card className="p-6">
                <div className="space-y-4">
                  <Label>What's Included</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      placeholder="Add included item..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddItem('included');
                        }
                      }}
                    />
                    <Button
                      onClick={() => handleAddItem('included')}
                      disabled={!newItem.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {included.map((item, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="pl-2 pr-1 py-1"
                      >
                        {item}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-transparent"
                          onClick={() => handleRemoveItem('included', index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Requirements */}
              <Card className="p-6">
                <div className="space-y-4">
                  <Label>Requirements</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newItem}
                      onChange={(e) => setNewItem(e.target.value)}
                      placeholder="Add requirement..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddItem('requirements');
                        }
                      }}
                    />
                    <Button
                      onClick={() => handleAddItem('requirements')}
                      disabled={!newItem.trim()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {requirements.map((item, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="pl-2 pr-1 py-1"
                      >
                        {item}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-transparent"
                          onClick={() => handleRemoveItem('requirements', index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

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
            disabled={!type || !category}
            className={cn(
              "min-w-[120px]",
              type && category && "bg-green-500 hover:bg-green-600"
            )}
          >
            {type && category ? (
              <Check className="mr-2 h-4 w-4" />
            ) : (
              <ChevronRight className="mr-2 h-4 w-4" />
            )}
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
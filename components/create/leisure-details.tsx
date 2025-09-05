'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Image as ImageIcon,
  Video,
  MapPin,
  Upload,
  X,
  Check,
  ChevronRight,
  AlertCircle,
  Link as LinkIcon,
  FileText,
  Calendar,
  Clock,
  Info,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useListingCreation } from '@/contexts/listing-creation-context';
import { cn } from '@/lib/utils';

interface MediaFile {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
}

interface AdditionalInfo {
  title: string;
  content: string;
}

export function LeisureDetails() {
  const { state, updateData, nextStep } = useListingCreation();
  const [title, setTitle] = useState(state.data.leisure?.title || '');
  const [description, setDescription] = useState(state.data.leisure?.description || '');
  const [shortDescription, setShortDescription] = useState(
    state.data.leisure?.shortDescription || ''
  );
  const [location, setLocation] = useState(state.data.leisure?.location || {
    address: '',
    venue: '',
    directions: '',
  });
  const [media, setMedia] = useState<MediaFile[]>(state.data.leisure?.media || []);
  const [additionalInfo, setAdditionalInfo] = useState<AdditionalInfo[]>(
    state.data.leisure?.additionalInfo || []
  );
  const [newInfo, setNewInfo] = useState({ title: '', content: '' });
  const [virtualEvent, setVirtualEvent] = useState(
    state.data.leisure?.virtual || false
  );
  const [virtualLink, setVirtualLink] = useState(
    state.data.leisure?.virtualLink || ''
  );
  const [error, setError] = useState('');

  const validateDetails = () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return false;
    }

    if (!description.trim()) {
      setError('Please enter a description');
      return false;
    }

    if (!shortDescription.trim()) {
      setError('Please enter a short description');
      return false;
    }

    if (!virtualEvent && !location.address.trim()) {
      setError('Please enter a location');
      return false;
    }

    if (virtualEvent && !virtualLink.trim()) {
      setError('Please enter a virtual event link');
      return false;
    }

    if (media.length === 0) {
      setError('Please add at least one photo or video');
      return false;
    }

    setError('');
    return true;
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const files = e.target.files;
    if (files) {
      // In a real implementation, you would upload these to your storage
      // For now, we'll just create URLs for preview
      const newMedia = Array.from(files).map(file => ({
        type,
        url: URL.createObjectURL(file),
        thumbnail: type === 'video' ? '' : URL.createObjectURL(file),
      }));
      setMedia(prev => [...prev, ...newMedia]);
    }
  };

  const removeMedia = (index: number) => {
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddInfo = () => {
    if (newInfo.title.trim() && newInfo.content.trim()) {
      setAdditionalInfo(prev => [...prev, { ...newInfo }]);
      setNewInfo({ title: '', content: '' });
    }
  };

  const removeInfo = (index: number) => {
    setAdditionalInfo(prev => prev.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    if (validateDetails()) {
      updateData({
        leisure: {
          ...state.data.leisure,
          title,
          description,
          shortDescription,
          location: virtualEvent ? undefined : location,
          virtual: virtualEvent,
          virtualLink: virtualEvent ? virtualLink : undefined,
          media,
          additionalInfo,
        },
      });
      nextStep();
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold mb-2">
          Event Details
        </h2>
        <p className="text-muted-foreground">
          Provide information about your leisure offering
        </p>
      </div>

      <div className="space-y-8">
        {/* Basic Details */}
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Summer Music Festival 2025"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Short Description</Label>
              <Input
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="Brief summary (appears in listings)"
                className="mt-2"
              />
            </div>

            <div>
              <Label>Full Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed description of your event..."
                className="mt-2"
                rows={6}
              />
            </div>
          </div>
        </Card>

        {/* Location */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Virtual Event</Label>
                <p className="text-sm text-muted-foreground">
                  Is this an online event?
                </p>
              </div>
              <Switch
                checked={virtualEvent}
                onCheckedChange={setVirtualEvent}
              />
            </div>

            <AnimatePresence mode="wait">
              {virtualEvent ? (
                <motion.div
                  key="virtual"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <Label>Virtual Event Link</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <LinkIcon className="w-5 h-5 text-muted-foreground" />
                      <Input
                        value={virtualLink}
                        onChange={(e) => setVirtualLink(e.target.value)}
                        placeholder="Enter the event link"
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="physical"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div>
                    <Label>Address</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <Input
                        value={location.address}
                        onChange={(e) => setLocation(prev => ({
                          ...prev,
                          address: e.target.value,
                        }))}
                        placeholder="Enter the event location"
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Venue Name (optional)</Label>
                    <Input
                      value={location.venue}
                      onChange={(e) => setLocation(prev => ({
                        ...prev,
                        venue: e.target.value,
                      }))}
                      placeholder="e.g., City Concert Hall"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label>Directions (optional)</Label>
                    <Textarea
                      value={location.directions}
                      onChange={(e) => setLocation(prev => ({
                        ...prev,
                        directions: e.target.value,
                      }))}
                      placeholder="How to get there..."
                      className="mt-2"
                      rows={3}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Card>

        {/* Media */}
        <Card className="p-6">
          <div className="space-y-6">
            <div>
              <Label>Photos & Videos</Label>
              <p className="text-sm text-muted-foreground">
                Add media to showcase your event
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {media.map((file, index) => (
                <div key={index} className="relative aspect-square">
                  {file.type === 'image' ? (
                    <img
                      src={file.url}
                      alt={`Event media ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                      <Video className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => removeMedia(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <label className="border-2 border-dashed rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50">
                <ImageIcon className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Add Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleMediaUpload(e, 'image')}
                />
              </label>
              <label className="border-2 border-dashed rounded-lg aspect-square flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50">
                <Video className="w-8 h-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Add Video</span>
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleMediaUpload(e, 'video')}
                />
              </label>
            </div>
          </div>
        </Card>

        {/* Additional Information */}
        <Card className="p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Additional Information</Label>
                <p className="text-sm text-muted-foreground">
                  Add any extra details about your event
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Section title"
                  value={newInfo.title}
                  onChange={(e) => setNewInfo(prev => ({
                    ...prev,
                    title: e.target.value,
                  }))}
                />
                <Button
                  onClick={handleAddInfo}
                  disabled={!newInfo.title.trim() || !newInfo.content.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <Textarea
                placeholder="Section content..."
                value={newInfo.content}
                onChange={(e) => setNewInfo(prev => ({
                  ...prev,
                  content: e.target.value,
                }))}
                rows={3}
              />
            </div>

            <div className="space-y-4">
              {additionalInfo.map((info, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-medium">{info.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {info.content}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeInfo(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
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
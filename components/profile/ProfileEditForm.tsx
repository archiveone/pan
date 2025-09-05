import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Loader2, ImagePlus } from 'lucide-react';
import { processMedia } from '@/lib/media';

// Form validation schema
const profileSchema = z.object({
  name: z.string().min(2).max(50),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  bio: z.string().max(160).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  website: z.string().url().max(100).optional().nullable(),
  company: z.string().max(100).optional().nullable(),
  position: z.string().max(100).optional().nullable(),
  experience: z.string().max(100).optional().nullable(),
  specialties: z.array(z.string()),
  certifications: z.array(z.string())
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
  profile: ProfileFormData & {
    id: string;
    image: string | null;
    coverImage: string | null;
  };
  onSuccess: () => void;
}

export function ProfileEditForm({ profile, onSuccess }: ProfileEditFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [newSpecialty, setNewSpecialty] = useState('');
  const [newCertification, setNewCertification] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile.name,
      username: profile.username,
      bio: profile.bio || '',
      location: profile.location || '',
      website: profile.website || '',
      company: profile.company || '',
      position: profile.position || '',
      experience: profile.experience || '',
      specialties: profile.specialties || [],
      certifications: profile.certifications || []
    }
  });

  // Handle media upload
  const handleMediaUpload = async (
    file: File,
    type: 'profile' | 'banner'
  ) => {
    try {
      const processedMedia = await processMedia(
        file,
        type === 'profile' ? 'profile' : 'banner'
      );

      // Update profile photo or banner
      const formData = new FormData();
      formData.append(type === 'profile' ? 'profilePhoto' : 'coverPhoto', file);

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to update profile photo');
      }

      toast.success(
        \`\${type === 'profile' ? 'Profile photo' : 'Cover photo'} updated successfully\`
      );
    } catch (error) {
      console.error('Error uploading media:', error);
      toast.error(
        \`Failed to update \${type === 'profile' ? 'profile photo' : 'cover photo'}\`
      );
    }
  };

  // Handle form submission
  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      toast.success('Profile updated successfully');
      onSuccess();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle specialties and certifications
  const handleAddSpecialty = () => {
    if (newSpecialty.trim()) {
      const currentSpecialties = watch('specialties');
      if (!currentSpecialties.includes(newSpecialty.trim())) {
        setValue('specialties', [...currentSpecialties, newSpecialty.trim()]);
      }
      setNewSpecialty('');
    }
  };

  const handleRemoveSpecialty = (specialty: string) => {
    const currentSpecialties = watch('specialties');
    setValue(
      'specialties',
      currentSpecialties.filter(s => s !== specialty)
    );
  };

  const handleAddCertification = () => {
    if (newCertification.trim()) {
      const currentCertifications = watch('certifications');
      if (!currentCertifications.includes(newCertification.trim())) {
        setValue('certifications', [...currentCertifications, newCertification.trim()]);
      }
      setNewCertification('');
    }
  };

  const handleRemoveCertification = (certification: string) => {
    const currentCertifications = watch('certifications');
    setValue(
      'certifications',
      currentCertifications.filter(c => c !== certification)
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Profile Photos */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Profile Photo</Label>
          <div className="mt-2">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleMediaUpload(file, 'profile');
              }}
            />
          </div>
        </div>
        <div>
          <Label>Cover Photo</Label>
          <div className="mt-2">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleMediaUpload(file, 'banner');
              }}
            />
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            {...register('name')}
            error={errors.name?.message}
          />
        </div>

        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            {...register('username')}
            error={errors.username?.message}
          />
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            {...register('bio')}
            error={errors.bio?.message}
          />
        </div>
      </div>

      {/* Contact Info */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            {...register('location')}
            error={errors.location?.message}
          />
        </div>

        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            {...register('website')}
            error={errors.website?.message}
          />
        </div>
      </div>

      {/* Professional Info */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            {...register('company')}
            error={errors.company?.message}
          />
        </div>

        <div>
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            {...register('position')}
            error={errors.position?.message}
          />
        </div>

        <div>
          <Label htmlFor="experience">Experience</Label>
          <Input
            id="experience"
            {...register('experience')}
            error={errors.experience?.message}
          />
        </div>
      </div>

      {/* Specialties */}
      <div>
        <Label>Specialties</Label>
        <div className="flex gap-2 mt-2">
          <Input
            value={newSpecialty}
            onChange={(e) => setNewSpecialty(e.target.value)}
            placeholder="Add a specialty"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddSpecialty}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {watch('specialties').map((specialty, index) => (
            <Badge key={index} variant="secondary">
              {specialty}
              <button
                type="button"
                onClick={() => handleRemoveSpecialty(specialty)}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div>
        <Label>Certifications</Label>
        <div className="flex gap-2 mt-2">
          <Input
            value={newCertification}
            onChange={(e) => setNewCertification(e.target.value)}
            placeholder="Add a certification"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddCertification}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          {watch('certifications').map((certification, index) => (
            <Badge key={index} variant="outline">
              {certification}
              <button
                type="button"
                onClick={() => handleRemoveCertification(certification)}
                className="ml-1 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Changes
      </Button>
    </form>
  );
}
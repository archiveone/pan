import { useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Pencil, MapPin, Link as LinkIcon, Building2, Briefcase } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProfileEditForm } from './ProfileEditForm';
import { VerifiedBadge } from '@/components/shared/VerifiedBadge';

interface ProfileHeaderProps {
  profile: {
    id: string;
    name: string;
    username: string;
    image: string | null;
    coverImage: string | null;
    bio: string | null;
    location: string | null;
    website: string | null;
    verified: boolean;
    company: string | null;
    position: string | null;
    experience: string | null;
    specialties: string[];
    certifications: string[];
    _count: {
      followers: number;
      following: number;
      posts: number;
    };
  };
  isFollowing: boolean;
  onFollow: () => void;
  onUnfollow: () => void;
}

export function ProfileHeader({
  profile,
  isFollowing,
  onFollow,
  onUnfollow
}: ProfileHeaderProps) {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const isOwnProfile = session?.user?.id === profile.id;

  return (
    <div className="relative">
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 w-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
        {profile.coverImage && (
          <Image
            src={profile.coverImage}
            alt={`${profile.name}'s cover`}
            fill
            className="object-cover"
            priority
          />
        )}
      </div>

      {/* Profile Info */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <div className="relative -mt-16 sm:-mt-20">
          {/* Avatar */}
          <div className="relative inline-block">
            <Avatar className="w-24 h-24 sm:w-32 sm:h-32 border-4 border-white dark:border-gray-900">
              <AvatarImage src={profile.image || ''} alt={profile.name} />
              <AvatarFallback>
                {profile.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Actions */}
          <div className="absolute right-0 bottom-0 sm:bottom-auto sm:top-0 flex space-x-3">
            {isOwnProfile ? (
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                  </DialogHeader>
                  <ProfileEditForm
                    profile={profile}
                    onSuccess={() => setIsEditing(false)}
                  />
                </DialogContent>
              </Dialog>
            ) : (
              <Button
                variant={isFollowing ? 'outline' : 'default'}
                size="sm"
                onClick={isFollowing ? onUnfollow : onFollow}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
        </div>

        {/* Profile Details */}
        <div className="mt-6">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            {profile.verified && <VerifiedBadge />}
          </div>
          <p className="text-gray-500 dark:text-gray-400">@{profile.username}</p>

          {profile.bio && (
            <p className="mt-4 text-gray-700 dark:text-gray-300">{profile.bio}</p>
          )}

          {/* Professional Info */}
          <div className="mt-4 space-y-2">
            {profile.position && profile.company && (
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <Briefcase className="h-4 w-4 mr-2" />
                <span>{profile.position} at {profile.company}</span>
              </div>
            )}
            {profile.location && (
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{profile.location}</span>
              </div>
            )}
            {profile.website && (
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <LinkIcon className="h-4 w-4 mr-2" />
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>

          {/* Specialties & Certifications */}
          {(profile.specialties.length > 0 || profile.certifications.length > 0) && (
            <div className="mt-4 space-y-3">
              {profile.specialties.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.specialties.map((specialty, index) => (
                    <Badge key={index} variant="secondary">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              )}
              {profile.certifications.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {profile.certifications.map((cert, index) => (
                    <Badge key={index} variant="outline">
                      {cert}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="mt-6 flex space-x-6">
            <div>
              <span className="font-semibold">{profile._count.posts}</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">Posts</span>
            </div>
            <div>
              <span className="font-semibold">{profile._count.followers}</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">Followers</span>
            </div>
            <div>
              <span className="font-semibold">{profile._count.following}</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">Following</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
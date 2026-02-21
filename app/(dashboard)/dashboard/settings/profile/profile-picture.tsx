'use client';

import { useState, useEffect } from 'react';
import { UserCircle } from 'lucide-react';
import { ImageUpload } from '@/app/(dashboard)/dashboard/account/image-upload';

interface ProfilePictureProps {
  user: {
    id: string;
    avatar_url?: string | null;
    user_metadata?: {
      avatar_url?: string | null;
    };
  };
}

export function ProfilePicture({ user }: ProfilePictureProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    user.user_metadata?.avatar_url || user.avatar_url || null
  );
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Reset error state when avatar URL changes
    setImageError(false);
    setAvatarUrl(user.user_metadata?.avatar_url || user.avatar_url || null);
  }, [user.user_metadata?.avatar_url, user.avatar_url]);

  const displayUrl = avatarUrl ? `${avatarUrl}?t=${Date.now()}` : null;

  return (
    <div className="flex items-start gap-6">
      <div className="relative shrink-0">
        {displayUrl && !imageError ? (
          <div className="w-24 h-24 rounded-none overflow-hidden border-2 border-gray-200 bg-white">
            <img 
              src={displayUrl}
              alt="Profile"
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          <div className="w-24 h-24 rounded-none border-2 border-gray-200 bg-[#f3f5f9] flex items-center justify-center">
            <UserCircle className="h-16 w-16 text-[#565656]" strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className="flex-1">
        <ImageUpload user={user} />
      </div>
    </div>
  );
}

'use client'

import { ChangeEvent, useRef, useState, useTransition } from "react";
import { toast } from "@/components/ui/use-toast";
import Image from "next/image";
import { uploadImage } from "@/utils/supabase/storage/client";
import { convertBlobUrlToFile } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { UserCircle } from 'lucide-react';

export function ImageUpload({ user }: { user: any }) {
  const userAvatarUrl = user?.user_metadata?.avatar_url || user?.avatar_url || null;
  const [avatarUrl, setAvatarUrl] = useState(userAvatarUrl ? `${userAvatarUrl}?t=${Date.now()}` : null);
  const [imageUrl, setImageUrl] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
      const newImageUrl = URL.createObjectURL(file);
      setImageUrl(newImageUrl);
    }
  };

  const handleClickUploadImagesButton = async () => {
    if (!user) {
      toast({
        title: "You need to be logged in to upload image",
        variant: "destructive",
      });
      return;
    }
    if (!imageUrl.length) {
      toast({
        title: "Please select an image to upload",
        variant: "destructive",
      });
      return;
    }
    startTransition(async () => {
      const imageFile = await convertBlobUrlToFile(imageUrl);
      const { imageUrl: uploadedImageUrl, error } = await uploadImage({
        file: imageFile,
        bucket: "avatar",
        folder: user.id,
      });
      if (error) {
        toast({
          title: error,
          variant: "destructive",
        });
        return;
      }
      if (uploadedImageUrl) {
        setAvatarUrl(`${uploadedImageUrl}?t=${Date.now()}`);
        await fetch('/api/update-avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, avatarUrl: uploadedImageUrl }),
        });
        toast({
          title: "Successfully uploaded image",
          variant: "default",
        });
        setImageUrl("");
        // Refresh to update profile picture display
        router.refresh();
      }
    });
  };

  const displayImageUrl = imageUrl || avatarUrl;

  return (
    <div className="flex flex-col gap-4">
      <input
        type="file"
        hidden
        ref={imageInputRef}
        onChange={handleImageChange}
        disabled={isPending}
        accept="image/*"
      />
      <div className="space-y-3">
        <Button
          variant="outline"
          onClick={() => imageInputRef.current?.click()}
          disabled={isPending}
          className="border-gray-300 text-[#565656] hover:bg-gray-50 rounded-none font-light"
        >
          {displayImageUrl ? "Change Photo" : "Upload Photo"}
        </Button>

        {imageUrl && (
          <Button
            onClick={handleClickUploadImagesButton}
            disabled={isPending}
            className="bg-[#00bceb] text-white hover:bg-[#00bceb]/90 rounded-none font-bold"
          >
            {isPending ? "Uploading..." : "Save Photo"}
          </Button>
        )}
      </div>
      <p className="text-xs text-[#565656] font-light">
        {!imageUrl && !isPending && "Upload a profile picture to personalize your account."}
        {imageUrl && !isPending && "Click 'Save Photo' to update your profile picture."}
        {isPending && "Uploading your profile picture..."}
      </p>
    </div>
  );
}
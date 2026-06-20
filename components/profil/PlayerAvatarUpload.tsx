"use client";

import {
  formatAvatarUploadError,
  uploadUserAvatar,
} from "@/lib/supabase/avatar";
import { Camera, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

type PlayerAvatarUploadProps = {
  userId: string;
  avatarUrl: string | null;
  fallbackInitial: string;
  onUploaded: (url: string) => void;
};

export function PlayerAvatarUpload({
  userId,
  avatarUrl,
  fallbackInitial,
  onUploaded,
}: PlayerAvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadUserAvatar(userId, file);
      onUploaded(url);
    } catch (e) {
      console.error("Avatar upload failed", e);
      const message = formatAvatarUploadError(e);
      alert(message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="group relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-orange-600 via-orange-500 to-orange-500 shadow-[0_0_40px_rgba(192,38,211,0.35)] ring-4 ring-white/10 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 sm:h-32 sm:w-32"
        aria-label="Zmień awatar"
      >
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt=""
            fill
            className="object-cover"
            sizes="128px"
            unoptimized
          />
        ) : (
          <span className="text-4xl font-black text-white sm:text-5xl">
            {fallbackInitial}
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          ) : (
            <Camera className="h-8 w-8 text-white" />
          )}
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg"
        className="sr-only"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      <p className="mt-2 text-xs font-semibold text-zinc-500">
        Kliknij awatar · PNG lub JPG
      </p>
    </div>
  );
}

"use client";

import {
  formatAvatarUploadError,
  uploadUserAvatar,
} from "@/lib/supabase/avatar";
import { Camera, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  const [imageBroken, setImageBroken] = useState(false);

  useEffect(() => {
    setImageBroken(false);
  }, [avatarUrl]);

  const showImage = Boolean(avatarUrl) && !imageBroken;

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
        className={`group relative h-28 w-28 overflow-hidden rounded-full ring-4 ring-white/10 transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 sm:h-32 sm:w-32 ${
          showImage
            ? "bg-surface"
            : "bg-accent text-on-accent shadow-[0_0_32px_rgba(244,183,64,0.25)]"
        }`}
        aria-label="Zmień zdjęcie profilowe"
      >
        {showImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- awatar z Supabase Storage
          <img
            src={avatarUrl!}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            onError={() => setImageBroken(true)}
          />
        ) : (
          <span className="flex h-full w-full items-center justify-center text-4xl font-black text-on-accent sm:text-5xl">
            {fallbackInitial}
          </span>
        )}
        <span className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
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
        accept="image/*"
        className="sr-only"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
      <p className="mt-2 text-center text-xs font-semibold text-muted">
        Kliknij awatar, aby zmienić zdjęcie
      </p>
    </div>
  );
}

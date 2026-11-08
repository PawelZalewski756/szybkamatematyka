import { compressAvatarFile } from "@/lib/image/compress-avatar";
import { getSupabase } from "@/lib/supabase";
import { formatSupabaseErrorForUser } from "@/lib/supabase/errors";
import { updateProfileAvatarUrl } from "@/lib/supabase/profiles";

export const AVATAR_BUCKET = "avatary";

export const AVATAR_BUCKET_NOT_FOUND_MESSAGE =
  "Bucket „avatary” nie istnieje - uruchom init_profiles_avatars.sql w Supabase Dashboard → SQL Editor.";

export function getAvatarStoragePublicUrl(userId: string): string {
  const supabase = getSupabase();
  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(`${userId}/avatar.jpg`);
  return publicUrl;
}

/** Gdy plik jest w Storage, ale brak wpisu w profiles.avatar_url. */
export async function findAvatarUrlInStorage(
  userId: string,
): Promise<string | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .list(userId, { limit: 8 });

  if (error || !data?.length) return null;

  const hasAvatar = data.some(
    (file) => file.name === "avatar.jpg" || file.name === "avatar.png",
  );
  if (!hasAvatar) return null;

  return `${getAvatarStoragePublicUrl(userId)}?v=${Date.now()}`;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return "";
}

export function formatAvatarUploadError(error: unknown): string {
  const msg = errorMessage(error);
  if (/bucket not found/i.test(msg)) {
    return AVATAR_BUCKET_NOT_FOUND_MESSAGE;
  }
  if (msg) {
    return formatSupabaseErrorForUser(msg);
  }
  return "Nie udało się wgrać awatara.";
}

export async function uploadUserAvatar(
  userId: string,
  file: File,
): Promise<string> {
  const compressed = await compressAvatarFile(file);
  const path = `${userId}/avatar.jpg`;
  const supabase = getSupabase();

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, compressed, {
      upsert: true,
      contentType: "image/jpeg",
      cacheControl: "3600",
    });

  if (uploadError) {
    console.error("Avatar storage upload failed", uploadError);
    throw new Error(formatAvatarUploadError(uploadError));
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);

  const cacheBusted = `${publicUrl}?v=${Date.now()}`;
  const { persisted } = await updateProfileAvatarUrl(userId, cacheBusted);
  if (!persisted) {
    console.error(
      "[szybka-matma] Awatar w storage, ale nie zapisano w profiles ani user_metadata.",
    );
  }
  return cacheBusted;
}

import { ExerciseMedia } from '@/shared/models';

/**
 * First still image in a media list.
 * YouTube and video entries are played on the exercise page, not used as thumbnails.
 */
export function exerciseImageUrl(
  media: readonly ExerciseMedia[] | null | undefined,
): string | null {
  if (!media) return null;

  const image = media.find(
    (item) => item.media_type === 'image' && item.media_url.trim().length > 0,
  );
  return image ? image.media_url : null;
}

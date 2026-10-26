import { exerciseImageUrl } from './exercise-media.utils';

describe('exerciseImageUrl', () => {
  it('returns the first image and skips youtube and video entries', () => {
    expect(
      exerciseImageUrl([
        { id: 1, media_type: 'youtube', media_url: 'https://youtu.be/abc', display_order: 0 },
        { id: 2, media_type: 'video', media_url: 'https://cdn.example/a.mp4', display_order: 1 },
        { id: 3, media_type: 'image', media_url: 'assets/bench.webp', display_order: 2 },
      ]),
    ).toBe('assets/bench.webp');
  });

  it('returns null when there is no still image', () => {
    expect(exerciseImageUrl(undefined)).toBeNull();
    expect(exerciseImageUrl(null)).toBeNull();
    expect(exerciseImageUrl([])).toBeNull();
    expect(
      exerciseImageUrl([
        { id: 1, media_type: 'youtube', media_url: 'https://youtu.be/abc', display_order: 0 },
      ]),
    ).toBeNull();
    expect(
      exerciseImageUrl([{ id: 1, media_type: 'image', media_url: '   ', display_order: 0 }]),
    ).toBeNull();
  });
});

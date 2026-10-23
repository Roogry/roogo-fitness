import { sheetMaxHeightAboveKeyboard } from './sheet.utils';

describe('sheetMaxHeightAboveKeyboard', () => {
  it('leaves the Tailwind max-height classes in charge when the keyboard is closed', () => {
    expect(sheetMaxHeightAboveKeyboard(0)).toBeNull();
    expect(sheetMaxHeightAboveKeyboard(-5)).toBeNull();
  });

  it('shrinks the sheet by the keyboard height', () => {
    expect(sheetMaxHeightAboveKeyboard(300)).toBe('calc(85vh - 300px)');
  });

  it('never grows taller than the visual viewport', () => {
    expect(sheetMaxHeightAboveKeyboard(300, 480)).toBe('min(480px, calc(85vh - 300px))');
  });
});

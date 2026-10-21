import {
  completedSetCount,
  deleteLoggedSetsMessage,
  loggedSetsConfirmOptions,
  replaceLoggedSetsMessage,
} from './logged-sets-confirm.utils';

describe('logged sets confirm', () => {
  it('counts only sets that were marked done', () => {
    expect(
      completedSetCount([{ completed_at: '2026-10-11T00:00:00.000Z' }, {}, { completed_at: '' }]),
    ).toBe(1);
  });

  it('uses the singular when one set is logged', () => {
    expect(replaceLoggedSetsMessage(1)).toBe(
      "You've logged 1 set. Their weight and reps will move to the new exercise.",
    );
    expect(deleteLoggedSetsMessage(1)).toBe(
      "You've logged 1 set. They'll be removed from this session.",
    );
  });

  it('uses the plural when more than one set is logged', () => {
    expect(replaceLoggedSetsMessage(2)).toBe(
      "You've logged 2 sets. Their weight and reps will move to the new exercise.",
    );
    expect(deleteLoggedSetsMessage(3)).toBe(
      "You've logged 3 sets. They'll be removed from this session.",
    );
  });

  it('shares cancel, width, and a destructive confirm only when asked', () => {
    const onOk = vi.fn();
    const onCancel = vi.fn();
    const options = loggedSetsConfirmOptions({
      title: 'Delete exercise?',
      description: deleteLoggedSetsMessage(2),
      okText: 'Delete',
      destructive: true,
      onOk,
      onCancel,
    });

    expect(options).toMatchObject({
      zWidth: '400px',
      zTitle: 'Delete exercise?',
      zDescription: "You've logged 2 sets. They'll be removed from this session.",
      zOkText: 'Delete',
      zCancelText: 'Cancel',
      zOkDestructive: true,
    });

    (options.zOnOk as () => void)();
    (options.zOnCancel as () => void)();
    expect(onOk).toHaveBeenCalledOnce();
    expect(onCancel).toHaveBeenCalledOnce();
  });
});

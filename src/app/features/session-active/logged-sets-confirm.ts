import { ZardDialogOptions } from '@/shared/components/zard/dialog';
import { LoggedSet } from '@/shared/models';

/** Width the replace and delete confirms already share. The dialog API takes a CSS length. */
const LOGGED_SETS_CONFIRM_WIDTH = '400px';

export function completedSetCount(sets: readonly Pick<LoggedSet, 'completed_at'>[]): number {
  return sets.filter((set) => !!set.completed_at).length;
}

export function replaceLoggedSetsMessage(completedSets: number): string {
  return `You've logged ${loggedSetsLabel(completedSets)}. Their weight and reps will move to the new exercise.`;
}

export function deleteLoggedSetsMessage(completedSets: number): string {
  return `You've logged ${loggedSetsLabel(completedSets)}. They'll be removed from this session.`;
}

export interface LoggedSetsConfirm {
  title: string;
  description: string;
  okText: string;
  destructive?: boolean;
  onOk: () => void;
  onCancel?: () => void;
}

/** Same dialog for replace and delete: title, logged-sets body, Cancel, and one confirm button. */
export function loggedSetsConfirmOptions(
  confirm: LoggedSetsConfirm,
): ZardDialogOptions<unknown, unknown> {
  return {
    zWidth: LOGGED_SETS_CONFIRM_WIDTH,
    zTitle: confirm.title,
    zDescription: confirm.description,
    zOkText: confirm.okText,
    zCancelText: 'Cancel',
    zOkDestructive: confirm.destructive ?? false,
    zOnOk: () => {
      confirm.onOk();
    },
    zOnCancel: () => {
      confirm.onCancel?.();
    },
  };
}

function loggedSetsLabel(completedSets: number): string {
  return completedSets === 1 ? '1 set' : `${completedSets} sets`;
}

import { ZardDialogOptions } from '@/shared/components/zard/dialog';
import { LoggedSet } from '@/shared/models';
import {
  LOGGED_SETS_CANCEL_TEXT,
  LOGGED_SETS_CONFIRM_WIDTH,
} from './logged-sets-confirm.constants';
import type { LoggedSetsConfirm } from './logged-sets-confirm.types';

export function completedSetCount(sets: readonly Pick<LoggedSet, 'completed_at'>[]): number {
  return sets.filter((set) => !!set.completed_at).length;
}

export function replaceLoggedSetsMessage(completedSets: number): string {
  return `You've logged ${loggedSetsLabel(completedSets)}. Their weight and reps will move to the new exercise.`;
}

export function deleteLoggedSetsMessage(completedSets: number): string {
  return `You've logged ${loggedSetsLabel(completedSets)}. They'll be removed from this session.`;
}

export function loggedSetsConfirmOptions(
  confirm: LoggedSetsConfirm,
): ZardDialogOptions<unknown, unknown> {
  return {
    zWidth: LOGGED_SETS_CONFIRM_WIDTH,
    zTitle: confirm.title,
    zDescription: confirm.description,
    zOkText: confirm.okText,
    zCancelText: LOGGED_SETS_CANCEL_TEXT,
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

import { TemplateRef } from '@angular/core';

export function isTemplateRef<C = unknown>(value: unknown): value is TemplateRef<C> {
  return value instanceof TemplateRef;
}

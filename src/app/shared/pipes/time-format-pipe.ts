import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeFormat',
})
export class timeFormatPipe implements PipeTransform {
  transform(value: number, showAll = false): unknown {
    if (isNaN(value) || value < 0) return '';

    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = value % 60;

    if (hours > 0 && !showAll) return `${hours}:${minutes}m`;
    if (hours > 0 && showAll) return `${hours}:${minutes}:${seconds}s`;
    if (minutes > 0) return `${minutes}:${seconds}s`;
    return `${seconds}s`;
  }
}

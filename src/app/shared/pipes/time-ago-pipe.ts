import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'timeAgo',
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: string | Date | undefined | null): string {
    if (!value) return '';

    const date = new Date(value);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) {
      return 'just now';
    } else if (seconds < 120) {
      return 'a minute ago';
    } else if (seconds < 3600) {
      return Math.floor(seconds / 60) + ' minutes ago';
    } else if (seconds < 7200) {
      return 'an hour ago';
    } else if (seconds < 86400) {
      return Math.floor(seconds / 3600) + ' hours ago';
    } else if (seconds < 172800) {
      return 'yesterday';
    } else if (seconds < 604800) {
      return Math.floor(seconds / 86400) + ' days ago';
    } else if (seconds < 2592000) {
      return Math.floor(seconds / 604800) + ' weeks ago';
    } else if (seconds < 31536000) {
      return Math.floor(seconds / 2592000) + ' months ago';
    } else {
      return Math.floor(seconds / 31536000) + ' years ago';
    }
  }
}

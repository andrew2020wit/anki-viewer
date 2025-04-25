import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'transcription',
})
export class TranscriptionPipe implements PipeTransform {
  transform(value: string | undefined): string {
    if (!value) return '';

    const index = value.lastIndexOf('$');

    if (index === -1) {
      return value;
    }

    const am = value.slice(index + 1);
    const en = value.slice(0, index);

    if (am.trim() === en.trim()) {
      return am;
    } else {
      return value;
    }
  }
}

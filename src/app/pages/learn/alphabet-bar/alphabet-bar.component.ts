import {Component, computed, input} from '@angular/core';
import {NgClass} from '@angular/common';

interface Latter {
  letter: string;
  className: string;
}

@Component({
  selector: 'app-alphabet-bar',
  imports: [
    NgClass
  ],
  templateUrl: './alphabet-bar.component.html',
  styleUrl: './alphabet-bar.component.scss',
})
export class AlphabetBarComponent {
  public readonly word = input.required<string>();

  private readonly alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  private readonly alphabetArray: string[] = this.alphabet.split('');

  protected readonly letters = computed(()=> {
    const word = this.word();
    if (!word) return [];

    const letters: Latter[] = [];

    for (const letter of this.alphabetArray) {
      let className = '';

      switch (letter) {
        case word[0].toUpperCase():
          className = 'first';
          break;
        case word[1].toUpperCase():
          className = 'second';
          break;
        case word[2].toUpperCase():
          className = 'third';
          break;
        case word[3].toUpperCase():
          className = 'fourth';
          break;
      }


      letters.push({
        letter,
        className
      });
    }

    console.log(letters);

    return letters;
  })
}

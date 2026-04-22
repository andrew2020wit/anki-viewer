import {Component, computed, input} from '@angular/core';

interface Latter {
  letter: string;
  isSelected: boolean;
}

@Component({
  selector: 'app-alphabet-bar',
  imports: [],
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
      letters.push({
        letter,
        isSelected: word?.[0].toUpperCase() === letter || word?.[1].toUpperCase() === letter,
      });
    }

    console.log(letters);

    return letters;
  })
}

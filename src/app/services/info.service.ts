import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class InfoService {
  constructor(private snackBar: MatSnackBar) {}

  show(text: string) {
    this.snackBar.open(text, '', {
      duration: 1000,
      verticalPosition: 'top',
      panelClass: 'info-snack',
    });
  }

  error(text: string) {
    this.snackBar.open(text, '', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: 'error-snack',
    });
  }
}

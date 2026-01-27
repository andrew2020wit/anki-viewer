import {Component} from '@angular/core';
import {UrlsEnum} from '../../enums/urls.enum';
import {RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatButton],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {
  protected readonly UrlsEnum = UrlsEnum;
}

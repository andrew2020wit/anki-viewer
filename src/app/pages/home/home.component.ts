import {Component} from '@angular/core';
import {UrlsEnum} from "../../enums/urls.enum";
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  protected readonly UrlsEnum = UrlsEnum;
}

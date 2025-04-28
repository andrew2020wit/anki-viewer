import { Component, OnInit, signal } from '@angular/core';
import { UrlQueriesEnum, UrlsEnum } from '../../enums/urls.enum';
import { Router, RouterLink } from '@angular/router';
import { learningDecksSettingItem } from '../settings/const/extra-settings.const';
import { MatButton } from '@angular/material/button';
import { getProfilesSettings, ViewProfile } from '../../utils/view-profile';

@Component({
  selector: 'app-home',
  imports: [RouterLink, MatButton],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  protected readonly UrlsEnum = UrlsEnum;

  protected learningDecks = signal<string[]>([]);

  protected profileSettings = signal<ViewProfile[]>([]);

  constructor(private router: Router) {}

  public ngOnInit() {
    const decks = localStorage.getItem(learningDecksSettingItem.key)?.split(' ') || [];
    this.learningDecks.set(decks);

    const profileSettings = getProfilesSettings();
    this.profileSettings.set(profileSettings);
  }

  protected goToDeck(deck: string) {
    this.router.navigate(['/', UrlsEnum.Learn], { queryParams: { [UrlQueriesEnum.Deck]: deck } });
  }

  protected goToView(profile: ViewProfile) {
    this.router.navigate(['/', UrlsEnum.Viewer], { queryParams: { [UrlQueriesEnum.Profile]: profile.index } });
  }
}

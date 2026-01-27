import { Routes } from '@angular/router';
import { UrlsEnum } from './enums/urls.enum';
import { getTitleWithVersion } from './app-version.const';

export const routes: Routes = [
  {
    path: UrlsEnum.Learn,
    title: getTitleWithVersion('Anki Learn'),
    loadComponent: () => import('./pages/learn/learn.component').then((m) => m.LearnComponent),
  },
  {
    path: UrlsEnum.Settings,
    title: getTitleWithVersion('Settings'),
    loadComponent: () => import('./pages/settings/settings.component').then((m) => m.SettingsComponent),
  },
  {
    path: '**',
    title: getTitleWithVersion('Anki Viewer'),
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
];

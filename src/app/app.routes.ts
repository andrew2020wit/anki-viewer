import { Routes } from '@angular/router';
import { UrlsEnum } from './enums/urls.enum';
import { getTitleWithVersion } from './consts/app-version.const';

export const routes: Routes = [
  {
    path: UrlsEnum.Viewer,
    title: getTitleWithVersion('Anki Viewer'),
    loadComponent: () => import('./pages/viewer/viewer.component').then((m) => m.ViewerComponent),
  },
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
    path: '',
    pathMatch: 'full',
    title: getTitleWithVersion('Anki Viewer'),
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
];

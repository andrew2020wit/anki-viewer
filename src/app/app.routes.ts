import {Routes} from '@angular/router';
import { UrlsEnum } from './enums/urls.enum';

export const routes: Routes = [
  {
    path: UrlsEnum.Viewer,
    title: 'Anki Viewer',
    loadComponent: () =>
      import('./pages/viewer/viewer.component').then((m) => m.ViewerComponent),

  },
  {
    path: UrlsEnum.Learn,
    title: 'Anki Learn',
    loadComponent: () =>
      import('./pages/learn/learn.component').then((m) => m.LearnComponent),

  },
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home.component')
      .then((m) => m.HomeComponent),
  },
];

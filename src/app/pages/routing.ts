import { Routes } from '@angular/router';

const Routing: Routes = [
  {
    path: 'my-drive',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
    title: 'My Drive - Drive'
  },
  {
    path: 'folders/:id',
    loadChildren: () =>
      import('./Folder/folder.module').then((m) => m.BuilderModule),
    title: 'My Folders - Drive'
  },
  {
    path: 'my-profile',
    loadChildren: () =>
      import('../modules/profile/profile.module').then((m) => m.ProfileModule),
    title: 'My Profile - Drive'
  },
  {
    path: '',
    redirectTo: '/my-drive',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'error/404',
  },
];

export { Routing };

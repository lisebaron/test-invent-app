import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'pages/Inbox',
    pathMatch: 'full'
  },
  {
    path: 'pages/home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'pages/participants',
    loadChildren: () => import('./pages/participants/participants.module').then( m => m.ParticipantsPageModule)
  },
  {
    path: 'pages/sessions',
    loadChildren: () => import('./pages/sessions/sessions.module').then( m => m.SessionsPageModule)
  }

];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}

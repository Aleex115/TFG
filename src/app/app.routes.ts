import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { LogInComponent } from './log-in/log-in.component';
import { AuthGuard } from './guards/auth.guard';
import { Error404Component } from './error404/error404.component';
import { UserComponent } from './user/user.component';
import { UploadComponent } from './user/upload/upload.component';
import { SearchComponent } from './search/search.component';
import { OtherUserComponent } from './other-user/other-user.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'signin',
    component: SignInComponent,
  },
  {
    path: 'login',
    component: LogInComponent,
  },
  {
    path: 'search',
    component: SearchComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'user/:username',
    component: OtherUserComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'user',
    component: UserComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'upload',
    component: UploadComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'error404',
    component: Error404Component,
  },
  {
    path: '**',
    redirectTo: 'error404',
  },

  // {
  //  Para realizar la verificación del usuario usamos el AuthGuard para comprobar la sesión
  //   path: 'signin',
  //   component: SignInComponent,
  //   canActivate: [AuthGuard],
  // },
];

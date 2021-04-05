import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './_helpers';

const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch:'full'},
    // { path: 'login',  loadChildren: () => import('./login/login.module').then( m => m.LoginModule),  canActivate: [AuthGuard]},
    // { path: 'home',  loadChildren: () => import('./home/home.module').then( m => m.HomeModule)}
    { path: 'login', loadChildren: () => import('./login/login.module').then( m => m.LoginModule) },
    { path: 'home', loadChildren: () => import('./home/home.module').then( m => m.HomeModule), canActivate: [AuthGuard]},

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
  ];

@NgModule({
    imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
    exports: [RouterModule]
})
export class AppRoutingModule { }

import { Routes } from '@angular/router';
import { Login } from './core/auth/login/login';
import { Landing } from './core/landing/landing';
import { Home } from './modules/home/home';
import { Profile } from './modules/profile/profile';
import { authGuard } from './core/auth/guards/auth-guard';
import { noAuthGuard } from './core/auth/guards/no-auth-guard';
import { Manage } from './modules/manage/manage';
import { DemoContainer } from './core/demo/demo-container';
import { demoGuard } from './core/demo/demo.guard';


export const routes: Routes = [
    
    { path: 'login', component: Login, canActivate: [noAuthGuard] },

    { path: '', component: Landing, canActivate: [noAuthGuard] },

    {
        path: 'demo',
        component: DemoContainer,
        canActivate: [demoGuard],
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: Home },
            { path: 'profile', component: Profile },
            { path: 'manage', redirectTo: 'home' },
        ],
    },

    {
        path: '',
        canActivate: [authGuard],
        children: [
            { path: 'home', component: Home },
            { path: 'profile', component: Profile },
            { path: 'manage', component: Manage }
        ]
    },
    
    { path: '**', redirectTo: '' },
    
];

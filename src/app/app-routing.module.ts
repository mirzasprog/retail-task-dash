import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutComponent } from './components/layout/layout.component';
import { DashboardPageComponent } from './pages/dashboard/dashboard-page.component';
import { TaskTemplatesPageComponent } from './pages/task-templates/task-templates-page.component';
import { TaskMapPageComponent } from './pages/task-map/task-map-page.component';
import { PriceCheckerPageComponent } from './pages/price-checker/price-checker-page.component';
import { LoginPageComponent } from './pages/auth/login-page.component';
import { ResetPasswordPageComponent } from './pages/auth/reset-password-page.component';
import { ForgotPasswordPageComponent } from './pages/auth/forgot-password-page.component';
import { DailySalesPageComponent } from './pages/daily-sales/daily-sales-page.component';
import { AdminPageComponent } from './pages/admin/admin-page.component';
import { NotFoundPageComponent } from './pages/not-found/not-found-page.component';

const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'forgot-password', component: ForgotPasswordPageComponent },
  { path: 'reset-password', component: ResetPasswordPageComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardPageComponent },
      { path: 'tasks', component: TaskTemplatesPageComponent },
      { path: 'task-map', component: TaskMapPageComponent },
      { path: 'price-checker', component: PriceCheckerPageComponent },
      { path: 'daily-sales', component: DailySalesPageComponent },
      { path: 'admin', component: AdminPageComponent },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'not-found', component: NotFoundPageComponent }
    ]
  },
  { path: '**', redirectTo: 'not-found' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule]
})
export class AppRoutingModule {}

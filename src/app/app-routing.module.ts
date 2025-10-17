import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LayoutComponent } from './components/layout/layout.component';
import { DashboardPageComponent } from './pages/dashboard/dashboard-page.component';
import { LoginPageComponent } from './pages/auth/login-page.component';
import { ResetPasswordPageComponent } from './pages/auth/reset-password-page.component';
import { ForgotPasswordPageComponent } from './pages/auth/forgot-password-page.component';
import { AdminPageComponent } from './pages/admin/admin-page.component';
import { NotFoundPageComponent } from './pages/not-found/not-found-page.component';
import { NotAuthorizedComponent } from './pages/not-authorized/not-authorized.component';
import { HqDashboardComponent } from './pages/hq-dashboard/hq-dashboard.component';
import { RegionalDashboardComponent } from './pages/regional-dashboard/regional-dashboard.component';
import { AreaDashboardComponent } from './pages/area-dashboard/area-dashboard.component';
import { TaskTemplatesPageComponent } from './pages/task-templates/task-templates-page.component';
import { TaskMapPageComponent } from './pages/task-map/task-map-page.component';
import { PriceCheckerPageComponent } from './pages/price-checker/price-checker-page.component';
import { DailySalesPageComponent } from './pages/daily-sales/daily-sales-page.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { UserRole } from './shared/models/user.model';

const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'forgot-password', component: ForgotPasswordPageComponent },
  { path: 'reset-password', component: ResetPasswordPageComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'store', component: DashboardPageComponent, canActivate: [RoleGuard], data: { roles: [UserRole.StoreManager, UserRole.AreaManager, UserRole.RegionalDirector, UserRole.Headquarters, UserRole.Admin] } },
      { path: 'hq', component: HqDashboardComponent, canActivate: [RoleGuard], data: { roles: [UserRole.Headquarters, UserRole.Admin] } },
      { path: 'regional', component: RegionalDashboardComponent, canActivate: [RoleGuard], data: { roles: [UserRole.RegionalDirector, UserRole.Admin] } },
      { path: 'area', component: AreaDashboardComponent, canActivate: [RoleGuard], data: { roles: [UserRole.AreaManager, UserRole.Admin] } },
      { path: 'tasks', component: TaskTemplatesPageComponent },
      { path: 'task-map', component: TaskMapPageComponent },
      { path: 'price-checker', component: PriceCheckerPageComponent },
      { path: 'daily-sales', component: DailySalesPageComponent },
      { path: 'admin', component: AdminPageComponent, canActivate: [RoleGuard], data: { roles: [UserRole.Admin] } },
      { path: 'not-authorized', component: NotAuthorizedComponent },
      { path: '', redirectTo: 'store', pathMatch: 'full' },
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

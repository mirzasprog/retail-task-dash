import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LayoutComponent } from './components/layout/layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
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
import { KpiCardComponent } from './components/kpi-card/kpi-card.component';
import { TrendChartComponent } from './components/trend-chart/trend-chart.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { SalesTableComponent } from './components/sales-table/sales-table.component';
import { NotAuthorizedComponent } from './pages/not-authorized/not-authorized.component';
import { HqDashboardComponent } from './pages/hq-dashboard/hq-dashboard.component';
import { RegionalDashboardComponent } from './pages/regional-dashboard/regional-dashboard.component';
import { AreaDashboardComponent } from './pages/area-dashboard/area-dashboard.component';
import { RegionFilterPipe } from './shared/pipes/region-filter.pipe';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    SidebarComponent,
    HeaderComponent,
    DashboardPageComponent,
    TaskTemplatesPageComponent,
    TaskMapPageComponent,
    PriceCheckerPageComponent,
    LoginPageComponent,
    ResetPasswordPageComponent,
    ForgotPasswordPageComponent,
    DailySalesPageComponent,
    AdminPageComponent,
    NotFoundPageComponent,
    KpiCardComponent,
    TrendChartComponent,
    TaskListComponent,
    SalesTableComponent,
    NotAuthorizedComponent,
    HqDashboardComponent,
    RegionalDashboardComponent,
    AreaDashboardComponent,
    RegionFilterPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}

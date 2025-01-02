import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { ToastrModule } from 'ngx-toastr';

import { MdbDropdownModule } from 'mdb-angular-ui-kit/dropdown'; // Dropdown
import { MdbTooltipModule } from 'mdb-angular-ui-kit/tooltip'; // Tooltip (if needed)

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { MdbModalModule } from 'mdb-angular-ui-kit/modal';
import { MdbTabsModule } from 'mdb-angular-ui-kit/tabs';
import { DashboardComponent } from './components/admin/dashboard/dashboard.component';
import { BusinessDetailComponent } from './components/admin/business/business-detail/business-detail.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MdbRippleModule } from 'mdb-angular-ui-kit/ripple';
import { MdbCollapseModule } from 'mdb-angular-ui-kit/collapse';
import { authInterceptor } from './services/auth.interceptor';
import { HomeCarouselComponent } from "./components/home/home-carousel/home-carousel.component";
import { RouterModule, RouterOutlet } from '@angular/router';
<<<<<<< HEAD
import { UserOrderComponent } from './components/home/user-order/user-order.component';
=======
import { AgGridModule } from 'ag-grid-angular';
>>>>>>> e6f3b6e7481294316517509dff12eab6f1b73c40

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
<<<<<<< HEAD
    CreateProductComponent,
    DashboardComponent,
   
=======
    DashboardComponent
>>>>>>> e6f3b6e7481294316517509dff12eab6f1b73c40

  ],
  imports: [
    AgGridModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot({
      closeButton:true,
      progressBar:true,
      timeOut:4000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
    }),
    MdbCollapseModule,
    MdbDropdownModule,
    MdbRippleModule,
    MdbTooltipModule,
    MdbTabsModule,
    MdbModalModule,
    FormsModule,
    CommonModule,
    HomeCarouselComponent,
    RouterOutlet
],
  providers: [
    provideClientHydration(),
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withFetch()
    ),
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

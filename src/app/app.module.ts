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
import { provideHttpClient, withFetch } from '@angular/common/http';
import { MdbModalModule } from 'mdb-angular-ui-kit/modal';
import { MdbTabsModule } from 'mdb-angular-ui-kit/tabs';
import { CreateProductComponent } from './components/owner/product/create-product/create-product.component';
import { DashboardComponent } from './components/admin/dashboard/dashboard.component';
import { BusinessDetailComponent } from './components/admin/business/business-detail/business-detail.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MdbRippleModule } from 'mdb-angular-ui-kit/ripple';
import { MdbCollapseModule } from 'mdb-angular-ui-kit/collapse';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    SignupComponent,
    CreateProductComponent,
    DashboardComponent,
    BusinessDetailComponent,

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ToastrModule.forRoot(
      { // Global toastr configuration
        positionClass: 'toast-top-right',
        preventDuplicates: true,
      }
    ),
    MdbCollapseModule,
    MdbDropdownModule,
    MdbRippleModule,
    MdbTooltipModule,
    MdbTabsModule,
    MdbModalModule,
    FormsModule,
    CommonModule


  ],
  providers: [
    provideClientHydration(),
    provideHttpClient(
      withFetch()
    ),
    provideAnimationsAsync()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

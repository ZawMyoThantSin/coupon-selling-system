import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { BusinessComponent } from './components/admin/business/business.component';
import { DashboardComponent } from './components/admin/dashboard/dashboard.component';
import { BusinessDetailComponent } from './components/admin/business/business-detail/business-detail.component';
import { BusinessEditComponent } from './components/admin/business/business-edit/business-edit.component';

const routes: Routes = [
  {path:'', redirectTo:'d',pathMatch:'full'},
  {path:'d', component:DashboardComponent,
    children:[
      {path:'business', component:BusinessComponent, title:'Business'},
      {path:'b/detail/:id', component:BusinessDetailComponent, title:'Details'},
      {path:'b/edit/:id', component:BusinessEditComponent, title:'Edit'}
    ]
  },
  {path:'login', component:LoginComponent, title:'Login'},
  {path:'signup', component:SignupComponent, title:'Signup'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

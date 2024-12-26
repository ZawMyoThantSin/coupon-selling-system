import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { BusinessComponent } from './components/admin/business/business.component';
import { BusinessDetailComponent } from './components/admin/business/business-detail/business-detail.component';
import { BusinessEditComponent } from './components/admin/business/business-edit/business-edit.component';
import { CouponComponent } from './components/admin/product/coupon/coupon.component';
import { ProductComponent } from './components/admin/product/product.component';
import { CreateProductModalComponent } from './components/admin/product/create-product/modals/create-modal/create-modal.component';
import { DetailProductComponent } from './components/admin/product/detail/detail-product/detail-product.component';
import { HomeComponent } from './components/home/home.component';
import { UserprofileComponent } from './components/home/user/userprofile/userprofile.component';
import { FriendComponent } from './components/home/friends/friend/friend.component';
import { AboutusComponent } from './components/home/aboutus/aboutus/aboutus.component';
import { HistoryComponent } from './components/home/history/history.component';

import { ProductdetailsComponent } from './components/home/product/product/productdetails/productdetails.component';
import { HomeCarouselComponent } from './components/home/home-carousel/home-carousel.component';
import { CustomersComponent } from './components/admin/customers/customers.component';
import { AddToCartComponent } from './components/home/add-to-cart/add-to-cart.component';
import { HomepageComponent } from './components/home/homepage/homepage/homepage.component';
import { UserBusinessComponent } from './components/home/homepage/user-business/user-business.component';
import { CategoryComponent } from './components/admin/category/category.component';
import { PaymentComponent } from './components/admin/payment/payment.component';
import { PaymentCreateComponent } from './components/admin/payment/payment-create/payment-create.component';
import { PaymentComponent } from './components/admin/payment/payment.component';
import { DashboardComponent } from './components/admin/dashboard/dashboard.component';
import { PaymentListComponent } from './components/admin/payment/payment-list/payment-list.component';
import { PaymentEditComponent } from './components/admin/payment/payment-edit/payment-edit.component';

const routes: Routes = [
  {path:'', redirectTo:'d',pathMatch:'full'},
  {path:'d', component:DashboardComponent,
    children:[
      {path:'carousel', component:HomeCarouselComponent},
      {path:'business', component:BusinessComponent, title:'Business'},
      {path:'payments',component:PaymentComponent, title:'Payments',children:[
        {path:'', component:PaymentListComponent},
        {path:'create', component:PaymentCreateComponent},
        {path:'edit', component:PaymentEditComponent}
      ]},
      {path:'customers', component:CustomersComponent, title:'Customers'},
      {path:'b/detail/:id', component:BusinessDetailComponent,
        children: [
        {path: '',component: ProductComponent},
        {path:'coupon',component:CouponComponent}
      ]},
      {path:'b/edit/:id', component:BusinessEditComponent, title:'Edit'},
      {path:'b/c', component:CouponComponent, title:''},
      {path:'product',component:ProductComponent},
      {path:'p/create-product',component:CreateProductModalComponent},
      {path:'p/detail-product/:id',component:DetailProductComponent},
      {path:'category', component:CategoryComponent, title:'Business Category'},
      {path:'payment', component:PaymentComponent, title:'Payment'},

    ]
  },
  {path:'homepage', component:HomeComponent, title:'Home Page',
    children:[
      {path: '', redirectTo: 'page', pathMatch: 'full' },
      {path:'cart', component:AddToCartComponent},
      {path:'userprofile', component:UserprofileComponent, title:'User Profile'},
      {path:'friends', component:FriendComponent, title:'Friends'},
      {path:'aboutus', component:AboutusComponent, title:'About Us'},
      {path:'history', component:HistoryComponent, title:'History'},
      {path:'page', component:HomepageComponent, title:'Home'},

      {path:'p/:id', component:ProductdetailsComponent,title:'productdetail'},
      {path:'u/detail-business/:id', component:UserBusinessComponent, title:'businessDetail'}
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

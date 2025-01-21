import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { BusinessComponent } from './components/admin/business/business.component';
import { BusinessEditComponent } from './components/admin/business/business-edit/business-edit.component';
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
import { DashboardComponent } from './components/admin/dashboard/dashboard.component';
import { PaymentListComponent } from './components/admin/payment/payment-list/payment-list.component';
import { PaymentEditComponent } from './components/admin/payment/payment-edit/payment-edit.component';
import { UserOrderComponent } from './components/home/user-order/user-order.component';
import { OrdersComponent } from './components/admin/orders/orders.component';
import { OrderListComponent } from './components/admin/orders/order-list/order-list.component';
import { OrderDetailComponent } from './components/admin/orders/order-detail/order-detail.component';
import { OwnerDashboardComponent } from './components/owner/owner-dashboard/owner-dashboard.component';
import { ShopComponent } from './components/owner/shop/shop.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { ProductComponent } from './components/owner/product/product.component';
import { CouponComponent } from './components/owner/product/coupon/coupon.component';
import { ExcelImportComponent } from './components/owner/product/excel-import/excel-import.component';
import { DetailProductComponent } from './components/owner/product/detail/detail-product/detail-product.component';
import { AccessDeniedComponent } from './components/access-denied/access-denied.component';
import { PurchaseCouponComponent } from './components/home/purchase-coupon/purchase-coupon.component';
import { CouponSaleBarChartComponent } from './components/owner/owner-dashboard/chart/coupon-sale-bar-chart/coupon-sale-bar-chart.component';
import { QrScannerComponent } from './components/owner/qr-scanner/qr-scanner.component';
import { QrResultComponent } from './components/owner/qr-result/qr-result.component';
import { dashboardGuard } from './guards/dashboard.guard';
import { OwnerPasswordResetComponent } from './components/owner/owner-password-reset/owner-password-reset.component';
import { OrderHistoryComponent } from './components/home/order-history/order-history.component';
import { SaleCouponReportComponent } from './components/owner/owner-dashboard/sale-coupon-report/sale-coupon-report.component';
import { TestDashComponent } from './components/test-dash/test-dash.component';
import { ForgetPasswordComponent } from './components/forget-password/forget-password.component';
import { EditShopComponent } from './components/owner/shop/edit-shop/edit-shop.component';
import { BusinessIncomeComponent } from './components/admin/business/business-income/business-income.component';

import { OwnerOrderComponent } from './components/owner/owner-order/owner-order.component';
import { UsedCouponComponent } from './components/owner/owner-dashboard/used-coupon/used-coupon.component';
import { CouponCardComponent } from './components/home/homepage/coupon-card/coupon-card.component';

const routes: Routes = [
  {path:'', redirectTo:'d', pathMatch:'full'},
  {path:'d', component:DashboardComponent, title:'Dashboard', canActivate: [dashboardGuard],
    children:[
      {path:'carousel', component:HomeCarouselComponent},
      {path:'business', component:BusinessComponent, title:'Business'},
      {path:'orders', component:OrdersComponent, title:'Orders'},
      {path:'order' , component:OrderListComponent},
      {path:'order/:id', component:OrderDetailComponent},
      {path:'payments',component:PaymentComponent, title:'Payments',children:[
        {path:'', component:PaymentListComponent},
        {path:'create', component:PaymentCreateComponent},
        {path:'edit', component:PaymentEditComponent}
      ]},
      {path:'customers', component:CustomersComponent, title:'Customers'},
      {path:'b/edit/:id', component:BusinessEditComponent, title:'Edit'},
      {path:'category', component:CategoryComponent, title:'Business Category'},
      {path:'payment', component:PaymentComponent, title:'Payment'},
      {path: 'excel-import', component: ExcelImportComponent },
      {path: 'business-income', component: BusinessIncomeComponent}

    ]
  },
  {path:'o', component:OwnerDashboardComponent, canActivate: [dashboardGuard],
    children:[
      {path:'',  component:CouponSaleBarChartComponent},
      {path:'order', component:OwnerOrderComponent, title:'order'},
      {path:'qr-scanner', component:QrScannerComponent},
      {path:'report', component:SaleCouponReportComponent, title:'Report'},
      { path: 'edit-shop/:id', component: EditShopComponent },
      {path:'used-coupon/:shopId',component:UsedCouponComponent},
      {path:'qr-result', component:QrResultComponent},
      {path:'shop/:id', component:ShopComponent, title:'Shop' ,children:[
        {path:'', component:ProductComponent},
        {path:'coupon',component:CouponComponent}
      ]
    },
    {path:'p/detail-product/:id',component:DetailProductComponent},

    ]
  },
  {path:'homepage', component:HomeComponent, title:'Home Page', canActivate: [dashboardGuard],
    children:[
      {path: '', component:HomepageComponent, title:'Home'},
      {path:'cart', component:AddToCartComponent},
      {path:'order', component:UserOrderComponent, },
      {path:'order-history', component:OrderHistoryComponent, title:'History'},
      {path:'userprofile', component:UserprofileComponent, title:'User Profile'},
      {path:'friends', component:FriendComponent, title:'Friends'},
      {path:'products', component:CouponCardComponent, title:'Products'},
      {path:'aboutus', component:AboutusComponent, title:'About Us'},
      {path:'history', component:HistoryComponent, title:'History'},
      {path:'purchase-coupon', component:PurchaseCouponComponent, title:'purchase'},
      {path:'purchase-coupon', component:PurchaseCouponComponent, title:'purchase'},
      {path:'p/:id', component:ProductdetailsComponent,title:'productdetail'},
      {path:'u/detail-business/:id', component:UserBusinessComponent, title:'businessDetail'}
    ]
  },
  {path:'test-dash', component:TestDashComponent},
  {path:'password-reset', component:OwnerPasswordResetComponent, title:'Reset Password'},
  {path:'forget-password', component:ForgetPasswordComponent, },
  {path:'login', component:LoginComponent, title:'Login'},
  {path:'signup', component:SignupComponent, title:'Signup'},
  {path: 'access-denied', component: AccessDeniedComponent,title:'403' },
  {path: '**', component: NotFoundComponent,title:'404' },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

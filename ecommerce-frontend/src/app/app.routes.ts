import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { CreateOrderComponent } from './components/create-order/create-order.component';
import { OrderListComponent } from './components/order-list/order-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/products', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'create-order', component: CreateOrderComponent },
  { path: 'orders', component: OrderListComponent },
  { path: '**', redirectTo: '/products' },
];

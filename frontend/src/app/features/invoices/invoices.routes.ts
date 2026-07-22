import { Routes } from '@angular/router';
import { InvoiceViewComponent } from './invoice-view/invoice-view.component';

export const INVOICE_ROUTES: Routes = [
  { path: '', component: InvoiceViewComponent },
  { path: ':id', component: InvoiceViewComponent },
];

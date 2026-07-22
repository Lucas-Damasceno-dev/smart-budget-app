import { Routes } from '@angular/router';
import { InstallmentListComponent } from './installment-list/installment-list.component';
import { InstallmentDetailComponent } from './installment-detail/installment-detail.component';
import { InstallmentFormComponent } from './installment-form/installment-form.component';

export const INSTALLMENT_ROUTES: Routes = [
  { path: '', component: InstallmentListComponent },
  { path: 'new', component: InstallmentFormComponent },
  { path: ':id', component: InstallmentDetailComponent },
];

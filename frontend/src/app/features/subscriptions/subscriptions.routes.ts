import { Routes } from '@angular/router';
import { SubscriptionListComponent } from './subscription-list/subscription-list.component';
import { SubscriptionFormComponent } from './subscription-form/subscription-form.component';

export const SUBSCRIPTION_ROUTES: Routes = [
  { path: '', component: SubscriptionListComponent },
  { path: 'new', component: SubscriptionFormComponent },
  { path: ':id/edit', component: SubscriptionFormComponent },
];

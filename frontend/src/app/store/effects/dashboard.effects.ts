import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError } from 'rxjs/operators';
import { DashboardService } from '@core/services/dashboard.service';
import * as DashboardActions from '../actions/dashboard.actions';

@Injectable()
export class DashboardEffects {
  private actions$ = inject(Actions);
  private dashboardService = inject(DashboardService);

  loadDashboard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DashboardActions.loadDashboard, DashboardActions.refreshDashboard),
      exhaustMap(() =>
        this.dashboardService.getDashboard().pipe(
          map((response) =>
            DashboardActions.loadDashboardSuccess({ dashboard: response.data })
          ),
          catchError((error) =>
            of(
              DashboardActions.loadDashboardFailure({
                error: error.error?.message || 'Failed to load dashboard',
              })
            )
          )
        )
      )
    )
  );
}

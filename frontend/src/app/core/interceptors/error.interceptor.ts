import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Ocorreu um erro inesperado';
      const isAuthRequest = req.url.includes('/auth/');

      if (error.error instanceof ErrorEvent) {
        errorMessage = error.error.message;
      } else {
        switch (error.status) {
          case 400:
            errorMessage = error.error?.message || 'Requisição inválida';
            break;
          case 401:
            if (!isAuthRequest) {
              errorMessage = 'Sessão expirada. Faça login novamente.';
              authService.logout();
              router.navigate(['/auth/login']);
            } else {
              errorMessage = error.error?.message || 'Credenciais inválidas';
            }
            break;
          case 403:
            errorMessage = 'Você não tem permissão para esta ação';
            break;
          case 404:
            errorMessage = 'Recurso não encontrado';
            break;
          case 409:
            errorMessage = error.error?.message || 'Conflito de dados. Tente novamente.';
            break;
          case 500:
            errorMessage = 'Erro interno do servidor';
            break;
        }
      }

      snackBar.open(errorMessage, 'Fechar', {
        duration: 5000,
        panelClass: ['snackbar-error'],
      });

      return throwError(() => error);
    })
  );
};

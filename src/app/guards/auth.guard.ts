import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';

export const authGuard = () => {
  const dataService = inject(DataService);
  const router = inject(Router);

  if (dataService.isLoggedIn()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

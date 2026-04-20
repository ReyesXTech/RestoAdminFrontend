import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  private dataService = inject(DataService);
  private router = inject(Router);

  fullName = '';
  password = '';
  error = signal(false);
  loading = signal(false);

  async onSubmit(): Promise<void> {
    this.error.set(false);
    this.loading.set(true);

    try {
      const success = await this.dataService.login(this.fullName, this.password);
      if (success) {
        this.router.navigate(['/pedidos']);
      } else {
        this.error.set(true);
      }
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}

import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private dataService = inject(DataService);
  private router = inject(Router);

  email = '';
  password = '';
  error = signal(false);

  onSubmit() {
    if (this.dataService.login(this.email, this.password)) {
      this.router.navigate(['/pedidos']);
    } else {
      this.error.set(true);
    }
  }
}

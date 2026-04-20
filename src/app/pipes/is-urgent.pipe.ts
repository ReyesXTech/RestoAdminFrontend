import { Pipe, PipeTransform, inject } from '@angular/core';
import { TimeService } from '../services/time.service';

@Pipe({
  name: 'isUrgent',
  standalone: true,
  pure: true,
})
export class IsUrgentPipe implements PipeTransform {
  private timeService = inject(TimeService);

  transform(desiredDeliveryTime: string | null | undefined, referenceDate?: Date): boolean {
    if (!desiredDeliveryTime) return false;
    return this.timeService.isUrgent(desiredDeliveryTime, referenceDate);
  }
}

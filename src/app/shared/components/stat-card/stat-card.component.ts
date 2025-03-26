import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-card',
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.css']
})
export class StatCardComponent {
  @Input() title: string = '';
  @Input() value: number | string = 0;
  @Input() icon: string = 'bi-star';
  @Input() bgColor: string = 'rgba(244, 164, 96, 0.2)';
  @Input() iconColor: string = 'var(--sandy-primary)';
}

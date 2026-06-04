import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AddClassService } from 'src/app/services/add-class/add-class.service';
import { MessageServiceService } from 'src/app/services/message-service/message-service.service';

@Component({
  selector: 'app-book-class',
  standalone: false,
  templateUrl: './book-class.component.html',
  styleUrl: './book-class.component.scss'
})
export class BookClassComponent implements OnInit {

  classes: any[] = [];
  isLoading = true;

  constructor(
    private readonly addClassService: AddClassService,
    private readonly messageService: MessageServiceService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadClasses();
  }

  loadClasses(): void {
    this.isLoading = true;
    this.addClassService.getData().subscribe({
      next: (response: any[]) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        this.classes = (response ?? []).filter(c => {
          if (c.status !== 'Scheduled') return false;
          const classDate = new Date(c.date);
          classDate.setHours(0, 0, 0, 0);
          return classDate >= today;
        });
        this.isLoading = false;
      },
      error: () => {
        this.messageService.showError('Could not load classes. Please try again.');
        this.isLoading = false;
      }
    });
  }

  openConfirmation(cls: any): void {
    this.router.navigate(['/pages/book-class-submit', cls.id]);
  }

  isFullyBooked(cls: any): boolean {
    return cls.remainingSlots <= 0;
  }

  getSlotsClass(remaining: number, total: number): string {
    if (!total) return 'ok';
    const pct = remaining / total;
    if (pct <= 0)   return 'full';
    if (pct <= 0.2) return 'low';
    if (pct <= 0.5) return 'medium';
    return 'ok';
  }

  getTypeClass(type: string): string {
    if (!type) return 'default';
    const t = type.toLowerCase();
    if (t.includes('hiit') || t.includes('crossfit') || t.includes('boxing')) return 'hiit';
    if (t.includes('zumba') || t.includes('dance'))                           return 'zumba';
    if (t.includes('yoga') || t.includes('pilates') || t.includes('stretch')) return 'yoga';
    if (t.includes('cycling') || t.includes('spin'))                          return 'cycling';
    return 'default';
  }

  formatTime(data: any): string {
    try {
      const arr: number[] = Array.isArray(data) ? data : String(data).split(':').map(Number);
      const [h, m, s] = arr;
      const d = new Date();
      d.setHours(h, m, s ?? 0, 0);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch {
      return '—';
    }
  }
}

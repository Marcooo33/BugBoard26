import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class Landing implements AfterViewInit {
  private readonly router = inject(Router);

  @ViewChild('heroVideo') heroVideo!: ElementRef<HTMLVideoElement>;

  isMenuOpen = false;

  ngAfterViewInit(): void {
    const video = this.heroVideo.nativeElement;
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        document.addEventListener('click', () => video.play(), { once: true });
      });
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  goToDemo(): void {
    this.router.navigate(['/demo']);
  }
}

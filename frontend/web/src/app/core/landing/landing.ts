import { AfterViewInit, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './landing.html',
  styleUrl: './landing.scss'
})
export class Landing implements AfterViewInit {
  private readonly router = inject(Router);

  @ViewChild('heroVideo') heroVideo!: ElementRef<HTMLVideoElement>;

  isMenuOpen = false;
  isVideoPlaying = true;

  ngAfterViewInit(): void {
    const video = this.heroVideo.nativeElement;
    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        this.isVideoPlaying = false;
        document.addEventListener('click', () => {
          this.isVideoPlaying = true;
          void video.play();
        }, { once: true });
      });
    }
  }

  toggleVideo(): void {
    const video = this.heroVideo.nativeElement;
    if (video.paused) {
      this.isVideoPlaying = true;
      void video.play();
    } else {
      this.isVideoPlaying = false;
      video.pause();
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

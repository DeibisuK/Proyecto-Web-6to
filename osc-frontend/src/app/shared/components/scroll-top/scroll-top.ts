import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-scroll-top',
  imports: [CommonModule],
  templateUrl: './scroll-top.html',
  styleUrl: './scroll-top.css'
})
export class ScrollTop {
  isVisible = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isVisible = window.pageYOffset > 100;
  }

  scrollToTop() {
    const duration = 500; // duración en ms
    const start = window.pageYOffset;
    const startTime = performance.now();

    const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

    const animateScroll = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutQuad(progress);

      window.scrollTo(0, start * (1 - easedProgress));

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }
}

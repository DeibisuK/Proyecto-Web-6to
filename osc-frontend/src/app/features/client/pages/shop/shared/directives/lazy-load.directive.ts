import { Directive, ElementRef, inject, input, OnInit, signal, effect } from '@angular/core';

/**
 * Directiva para lazy loading de imágenes con IntersectionObserver
 *
 * Uso:
 * <img appLazyLoad [src]="imageUrl" [placeholder]="placeholderUrl" alt="...">
 */
@Directive({
  selector: 'img[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective implements OnInit {
  private el = inject(ElementRef<HTMLImageElement>);

  /**
   * URL de la imagen real
   */
  src = input.required<string>();

  /**
   * URL del placeholder (opcional)
   */
  placeholder = input<string>('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"%3E%3Crect width="300" height="200" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%23999"%3ECargando...%3C/text%3E%3C/svg%3E');

  /**
   * Signal para saber si la imagen ya se cargó
   */
  private loaded = signal(false);

  private observer?: IntersectionObserver;

  constructor() {
    // Effect para actualizar la imagen cuando cambie el src
    effect(() => {
      const newSrc = this.src();
      if (this.loaded()) {
        this.el.nativeElement.src = newSrc;
      }
    });
  }

  ngOnInit() {
    // Establecer placeholder inicialmente
    this.el.nativeElement.src = this.placeholder();
    this.el.nativeElement.classList.add('lazy-loading');

    // Configurar IntersectionObserver
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.loadImage();
            this.observer?.unobserve(this.el.nativeElement);
          }
        });
      },
      {
        rootMargin: '50px', // Comenzar a cargar 50px antes de que sea visible
        threshold: 0.01
      }
    );

    this.observer.observe(this.el.nativeElement);
  }

  private loadImage() {
    const img = this.el.nativeElement;
    const newSrc = this.src();

    // Crear una nueva imagen para pre-cargar
    const tempImg = new Image();

    tempImg.onload = () => {
      img.src = newSrc;
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-loaded');
      this.loaded.set(true);
    };

    tempImg.onerror = () => {
      img.classList.remove('lazy-loading');
      img.classList.add('lazy-error');
      console.error('Error al cargar imagen:', newSrc);
    };

    tempImg.src = newSrc;
  }

  ngOnDestroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

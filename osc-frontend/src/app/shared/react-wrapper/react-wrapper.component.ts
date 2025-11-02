import {
  Component,
  Input,
  ElementRef,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  output
} from '@angular/core';
import * as React from 'react';
import { createRoot, Root } from 'react-dom/client';

@Component({
  selector: 'app-react-wrapper',
  standalone: true,
  template: '<div #reactContainer></div>',
  styles: []
})
export class ReactWrapperComponent implements OnInit, OnDestroy, OnChanges {
  // El componente React que se va a renderizar
  @Input() component!: React.ComponentType<any>;

  // Las props que se le pasarán al componente React
  @Input() props: any = {};

  // Output para eventos del componente React
  reactEvent = output<any>();

  private root: Root | null = null;

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    this.renderReactComponent();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Re-renderizar solo cuando cambien las props realmente
    if (changes['props'] && !changes['props'].firstChange) {
      const prevProps = changes['props'].previousValue;
      const currentProps = changes['props'].currentValue;

      // Comparación simple para evitar re-renders innecesarios
      if (JSON.stringify(prevProps) !== JSON.stringify(currentProps)) {
        this.renderReactComponent();
      }
    }

    // Re-renderizar si cambia el componente
    if (changes['component'] && !changes['component'].firstChange) {
      this.renderReactComponent();
    }
  }

  ngOnDestroy() {
    // Limpiar el componente React cuando Angular lo destruya
    if (this.root) {
      this.root.unmount();
    }
  }

  private renderReactComponent() {
    const container = this.elementRef.nativeElement;

    // Crear el root solo una vez
    if (!this.root) {
      this.root = createRoot(container);
    }

    // Agregar un callback para eventos si existe en las props
    const propsWithCallback = {
      ...this.props,
      onEvent: (data: any) => {
        this.reactEvent.emit(data);
      }
    };

    // Renderizar el componente React
    this.root.render(React.createElement(this.component, propsWithCallback));
  }
}

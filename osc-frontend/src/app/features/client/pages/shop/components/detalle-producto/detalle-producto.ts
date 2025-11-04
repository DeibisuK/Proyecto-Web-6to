import { Component, OnInit, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ProductoDetalle, VarianteProducto, OpcionesProducto } from '@shared/models/index';
import { CarritoService } from '@shared/services/index';
import { ProductoService } from '@shared/services/index';
import { ProductosRelacionados } from '../productos-relacionados/productos-relacionados';

@Component({
  selector: 'app-detalle-producto',
  imports: [CommonModule, FormsModule, RouterModule, ProductosRelacionados],
  templateUrl: './detalle-producto.html',
  styleUrls: ['./detalle-producto.css']
})
export class DetalleProducto implements OnInit {
  // ====================
  // SERVICES
  // ====================
  private carritoService = inject(CarritoService);
  private productoService = inject(ProductoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // ====================
  // SIGNALS
  // ====================
  producto = signal<ProductoDetalle | undefined>(undefined);
  varianteSeleccionada = signal<VarianteProducto | undefined>(undefined);
  opcionesSeleccionadas = signal<Map<number, number>>(new Map()); // id_opcion -> id_valor
  opcionesDisponibles = signal<OpcionesProducto[]>([]);

  cantidad = signal<number>(1);
  imagenPrincipal = signal<string>('');
  isLoading = signal<boolean>(true);

  seccionesAbiertas = signal({
    caracteristicas: false,
    descripcion: false
  });

  // ====================
  // COMPUTED SIGNALS
  // ====================

  /**
   * Calcula el descuento de la variante seleccionada
   */
  descuento = computed(() => {
    const variante = this.varianteSeleccionada();
    if (!variante?.precio_anterior) return 0;
    if (variante.precio_anterior <= variante.precio) return 0;

    return Math.round(
      ((variante.precio_anterior - variante.precio) / variante.precio_anterior) * 100
    );
  });

  /**
   * Verifica si se puede agregar al carrito
   */
  puedeAgregar = computed(() => {
    const variante = this.varianteSeleccionada();
    if (!variante) return false;

    // Verificar que todas las opciones estén seleccionadas
    const todasOpcionesSeleccionadas =
      this.opcionesDisponibles().length === this.opcionesSeleccionadas().size;

    return variante.stock > 0 &&
           todasOpcionesSeleccionadas &&
           this.cantidad() > 0 &&
           this.cantidad() <= variante.stock;
  });

  /**
   * 🆕 Mensaje de validación cuando no se puede agregar al carrito
   */
  mensajeValidacion = computed(() => {
    const variante = this.varianteSeleccionada();
    const opciones = this.opcionesSeleccionadas();
    const disponibles = this.opcionesDisponibles();

    if (!variante) {
      return 'Selecciona una variante válida';
    }

    if (disponibles.length !== opciones.size) {
      const faltantes = disponibles.length - opciones.size;
      return `Selecciona ${faltantes} opción${faltantes > 1 ? 'es' : ''} más`;
    }

    if (variante.stock === 0) {
      return 'Producto sin stock';
    }

    if (this.cantidad() > variante.stock) {
      return `Solo hay ${variante.stock} disponible${variante.stock > 1 ? 's' : ''}`;
    }

    return '';
  });

  /**
   * Obtiene el array de URLs de imágenes normalizadas
   */
  imagenesNormalizadas = computed(() => {
    const variante = this.varianteSeleccionada();
    if (!variante?.imagenes) return [];
    return variante.imagenes.map(img => this.getImagenUrl(img));
  });

  /**
   * Clase CSS según el stock
   */
  stockClass = computed(() => {
    const variante = this.varianteSeleccionada();
    if (!variante) return 'sin-stock';

    const stock = variante.stock;
    if (stock === 0) return 'sin-stock';
    if (stock < 5) return 'poco-stock';
    if (stock < 10) return 'stock-medio';
    return 'buen-stock';
  });

  /**
   * Mensaje de stock
   */
  stockMessage = computed(() => {
    const variante = this.varianteSeleccionada();
    if (!variante) return 'Sin stock';

    const stock = variante.stock;
    if (stock === 0) return 'Sin stock';
    if (stock < 5) return `Solo ${stock} disponibles`;
    if (stock < 10) return `${stock} disponibles`;
    return `${stock} disponibles`;
  });

  /**
   * Porcentaje de stock (para barra visual)
   */
  stockPercentage = computed(() => {
    const variante = this.varianteSeleccionada();
    if (!variante) return 0;

    const maxStock = 20;
    return Math.min((variante.stock / maxStock) * 100, 100);
  });

  /**
   * Retorna el nombre de la categoría
   */
  categoriaDisplay = computed(() => {
    return this.producto()?.nombre_categoria || '';
  });

  /**
   * 🆕 Verifica si un valor de opción tiene stock disponible
   */
  tieneStockDisponible = computed(() => {
    const producto = this.producto();
    const opcionesActuales = this.opcionesSeleccionadas();

    return (idOpcion: number, idValor: number): boolean => {
      if (!producto?.variantes) return false;

      // Buscar al menos una variante que:
      // 1. Tenga este valor de opción
      // 2. Tenga las demás opciones ya seleccionadas (si existen)
      // 3. Tenga stock > 0
      return producto.variantes.some(variante => {
        // Verificar que la variante tenga este valor
        const tieneValor = variante.valores.some(
          v => v.id_opcion === idOpcion && v.id_valor === idValor
        );

        if (!tieneValor) return false;

        // Verificar que coincida con las demás opciones ya seleccionadas
        const coincideOtrasOpciones = Array.from(opcionesActuales.entries())
          .filter(([opId]) => opId !== idOpcion) // Excluir la opción actual
          .every(([opId, valId]) =>
            variante.valores.some(v => v.id_opcion === opId && v.id_valor === valId)
          );

        return coincideOtrasOpciones && variante.stock > 0;
      });
    };
  });

  // ====================
  // CONSTRUCTOR con EFFECTS
  // ====================
  constructor() {
    // Effect para actualizar variante cuando cambian las opciones seleccionadas
    effect(() => {
      const opciones = this.opcionesSeleccionadas();
      const producto = this.producto();

      if (producto && opciones.size > 0) {
        this.actualizarVarianteSeleccionada();
      }
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.cargarProducto(parseInt(id, 10));
      }
    });
  }

  // ====================
  // MÉTODOS PRIVADOS
  // ====================

  /**
   * Carga el producto desde el backend
   */
  private cargarProducto(id: number) {
    this.isLoading.set(true);

    // Resetear estado que podría quedar entre navegaciones
    this.opcionesSeleccionadas.set(new Map());
    this.opcionesDisponibles.set([]);
    this.varianteSeleccionada.set(undefined);
    this.imagenPrincipal.set('');
    this.cantidad.set(1);

    this.productoService.getProductoDetalle(id).subscribe({
      next: (producto) => {
        this.producto.set(producto);
        this.extraerOpciones();
        this.seleccionarPrimeraVariante();
        this.isLoading.set(false);
      },
      error: (error) => {
        this.isLoading.set(false);
        // Redirigir a tienda si el producto no existe
        this.router.navigate(['/tienda']);
      }
    });
  }

  /**
   * Extrae las opciones únicas (Color, Talla) de todas las variantes
   */
  private extraerOpciones() {
    const producto = this.producto();
    if (!producto?.variantes) return;

    const opcionesMap = new Map<number, OpcionesProducto>();

    producto.variantes.forEach(variante => {
      variante.valores.forEach(valor => {
        if (!opcionesMap.has(valor.id_opcion)) {
          opcionesMap.set(valor.id_opcion, {
            id_opcion: valor.id_opcion,
            nombre_opcion: valor.nombre_opcion,
            valores: []
          });
        }

        const opcion = opcionesMap.get(valor.id_opcion)!;

        // Agregar valor si no existe
        if (!opcion.valores.find(v => v.id_valor === valor.id_valor)) {
          opcion.valores.push({
            id_valor: valor.id_valor,
            valor: valor.valor
          });
        }
      });
    });

    this.opcionesDisponibles.set(Array.from(opcionesMap.values()));
  }

  /**
   * Selecciona automáticamente la primera variante disponible
   */
  private seleccionarPrimeraVariante() {
    const producto = this.producto();
    if (!producto?.variantes || producto.variantes.length === 0) return;

    const primeraVariante = producto.variantes[0];

    // Limpiar y pre-seleccionar los valores de la primera variante
    const nuevasOpciones = new Map<number, number>();
    primeraVariante.valores.forEach(valor => {
      nuevasOpciones.set(valor.id_opcion, valor.id_valor);
    });
    this.opcionesSeleccionadas.set(nuevasOpciones);

    // Establecer la primera variante como seleccionada por defecto
    this.varianteSeleccionada.set(primeraVariante);
    this.imagenPrincipal.set(this.getImagenUrl(primeraVariante.imagenes[0]));
    this.cantidad.set(1);
  }

  // ====================
  // MÉTODOS PÚBLICOS
  // ====================

  /**
   * Maneja el cambio de una opción (Color, Talla, etc.)
   */
  seleccionarOpcion(idOpcion: number, idValor: number) {
    // 🆕 Verificar si tiene stock antes de permitir selección
    const tieneStock = this.tieneStockDisponible();
    if (!tieneStock(idOpcion, idValor)) {
      return; // No permitir selección de opciones sin stock
    }

    this.opcionesSeleccionadas.update(opciones => {
      const nuevasOpciones = new Map(opciones);
      nuevasOpciones.set(idOpcion, idValor);
      return nuevasOpciones;
    });
  }

  /**
   * Busca y selecciona la variante que coincida con las opciones elegidas
   */
  private actualizarVarianteSeleccionada() {
    const producto = this.producto();
    if (!producto?.variantes) return;

    const opciones = this.opcionesSeleccionadas();

    // Buscar variante que coincida con TODAS las opciones seleccionadas
    const varianteEncontrada = producto.variantes.find(variante => {
      return Array.from(opciones.entries()).every(([idOpcion, idValor]) => {
        return variante.valores.some(v => v.id_opcion === idOpcion && v.id_valor === idValor);
      });
    });

    if (varianteEncontrada) {
      this.varianteSeleccionada.set(varianteEncontrada);
      this.imagenPrincipal.set(this.getImagenUrl(varianteEncontrada.imagenes[0]));
      this.cantidad.set(1); // Resetear cantidad al cambiar variante
    } else {
      // Fallback a primera variante
      const primera = producto.variantes[0];
      if (primera) {
        this.varianteSeleccionada.set(primera);
        this.imagenPrincipal.set(this.getImagenUrl(primera.imagenes[0]));
        this.cantidad.set(1);
        // Asegurar que las opciones seleccionadas reflejen la variante usada
        const nuevasOpciones = new Map<number, number>();
        primera.valores.forEach(v => nuevasOpciones.set(v.id_opcion, v.id_valor));
        this.opcionesSeleccionadas.set(nuevasOpciones);
      }
    }
  }

  /**
   * Normaliza la URL de imagen (maneja string o objeto {url: string})
   */
  private getImagenUrl(imagen: any): string {
    if (typeof imagen === 'string') {
      return imagen;
    }
    if (imagen && typeof imagen === 'object' && imagen.url) {
      return imagen.url;
    }
    return '/assets/placeholder.png';
  }

  /**
   * Cambia la imagen principal
   */
  cambiarImagenPrincipal(imagen: string) {
    this.imagenPrincipal.set(imagen);
  }

  /**
   * Verifica si una opción está seleccionada
   */
  isOpcionSeleccionada(idOpcion: number, idValor: number): boolean {
    return this.opcionesSeleccionadas().get(idOpcion) === idValor;
  }

  /**
   * Cambia la cantidad del producto
   */
  cambiarCantidad(incremento: number) {
    const variante = this.varianteSeleccionada();
    if (!variante) return;

    const nuevaCantidad = this.cantidad() + incremento;
    if (nuevaCantidad >= 1 && nuevaCantidad <= variante.stock) {
      this.cantidad.set(nuevaCantidad);
    }
  }

  /**
   * Agrega el producto al carrito usando el nuevo backend
   */
  agregarAlCarrito() {
    const producto = this.producto();
    const variante = this.varianteSeleccionada();

    if (!this.puedeAgregar() || !producto || !variante) {
      // 🆕 Mostrar mensaje de error si hay validación
      const mensaje = this.mensajeValidacion();
      if (mensaje) {
        alert(mensaje); // TODO: Reemplazar con toast/snackbar en el futuro
      }
      return;
    }

    this.carritoService.agregarItem(variante.id_variante, this.cantidad()).subscribe({
      next: () => {
        // 🆕 Feedback visual de éxito
        alert(`✓ ${producto.nombre} agregado al carrito`); // TODO: Reemplazar con toast/snackbar
      },
      error: (error) => {
        alert('Error al agregar al carrito. Intenta nuevamente.');
      }
    });
  }

  /**
   * Toggle de secciones expandibles
   */
  toggleSeccion(seccion: 'caracteristicas' | 'descripcion') {
    this.seccionesAbiertas.update(secciones => ({
      ...secciones,
      [seccion]: !secciones[seccion]
    }));
  }

  /**
   * Manejo de error en imágenes
   */
  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img) {
      img.src = '/assets/placeholder.png';
    }
  }

  /**
   * Obtiene el código de color CSS para un nombre de color
   */
  getColorCss(nombreColor: string): string {
    const colores: { [key: string]: string } = {
      'negro': '#000000',
      'blanco': '#FFFFFF',
      'gris': '#808080',
      'rojo': '#FF0000',
      'azul': '#0066CC',
      'verde': '#00AA00',
      'amarillo': '#FFD700',
      'naranja': '#FF8C00',
      'rosa': '#FF69B4',
      'morado': '#9B59B6',
      'violeta': '#8B00FF',
      'celeste': '#87CEEB',
      'turquesa': '#40E0D0',
      'dorado': '#FFD700',
      'plateado': '#C0C0C0',
      'beige': '#F5F5DC',
      'marron': '#8B4513',
      'café': '#6F4E37',
      'crema': '#FFFDD0'
    };

    return colores[nombreColor.toLowerCase()] || '#CCCCCC'; // Color por defecto si no se encuentra
  }
}

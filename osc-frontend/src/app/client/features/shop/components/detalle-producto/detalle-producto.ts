import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ProductoDetalle, VarianteProducto, OpcionesProducto } from '../../models/producto';
import { CarritoService } from '../../services/carrito.service';
import { ProductoService } from '../../services/producto.service';
import { ProductosRelacionados } from '../productos-relacionados/productos-relacionados';

@Component({
  selector: 'app-detalle-producto',
  imports: [CommonModule, FormsModule, RouterModule, ProductosRelacionados],
  templateUrl: './detalle-producto.html',
  styleUrls: ['./detalle-producto.css']
})
export class DetalleProducto implements OnInit {
  producto?: ProductoDetalle;
  varianteSeleccionada?: VarianteProducto;
  opcionesSeleccionadas: Map<number, number> = new Map(); // id_opcion -> id_valor
  opcionesDisponibles: OpcionesProducto[] = [];

  cantidad: number = 1;
  imagenPrincipal: string = '';
  isLoading: boolean = true;

  seccionesAbiertas = {
    caracteristicas: false,
    descripcion: false
  };

  constructor(
    private carritoService: CarritoService,
    private productoService: ProductoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.cargarProducto(parseInt(id, 10));
      }
    });
  }

  /**
   * Carga el producto desde el backend
   */
  private cargarProducto(id: number) {
    this.isLoading = true;

    // Resetear estado que podría quedar entre navegaciones
    this.opcionesSeleccionadas = new Map();
    this.opcionesDisponibles = [];
    this.varianteSeleccionada = undefined;
    this.imagenPrincipal = '';
    this.cantidad = 1;

    this.productoService.getProductoDetalle(id).subscribe({
      next: (producto) => {
        console.log('✅ Producto cargado:', producto);
        this.producto = producto;
        this.extraerOpciones();
        this.seleccionarPrimeraVariante();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Error cargando producto:', error);
        this.isLoading = false;
        // Redirigir a tienda si el producto no existe
        this.router.navigate(['/tienda']);
      }
    });
  }

  /**
   * Extrae las opciones únicas (Color, Talla) de todas las variantes
   */
  private extraerOpciones() {
    if (!this.producto?.variantes) return;

    const opcionesMap = new Map<number, OpcionesProducto>();

    this.producto.variantes.forEach(variante => {
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

    this.opcionesDisponibles = Array.from(opcionesMap.values());
    console.log('🎨 Opciones extraídas:', this.opcionesDisponibles);
  }

  /**
   * Selecciona automáticamente la primera variante disponible
   */
  private seleccionarPrimeraVariante() {
    if (!this.producto?.variantes || this.producto.variantes.length === 0) return;

    const primeraVariante = this.producto.variantes[0];

    // Limpiar y pre-seleccionar los valores de la primera variante
    this.opcionesSeleccionadas = new Map();
    primeraVariante.valores.forEach(valor => {
      this.opcionesSeleccionadas.set(valor.id_opcion, valor.id_valor);
    });

    // Establecer la primera variante como seleccionada por defecto
    this.varianteSeleccionada = primeraVariante;
    this.imagenPrincipal = this.getImagenUrl(primeraVariante.imagenes[0]);
    this.cantidad = 1;
  }

  /**
   * Maneja el cambio de una opción (Color, Talla, etc.)
   */
  seleccionarOpcion(idOpcion: number, idValor: number) {
    this.opcionesSeleccionadas.set(idOpcion, idValor);
    this.actualizarVarianteSeleccionada();
  }

  /**
   * Busca y selecciona la variante que coincida con las opciones elegidas
   */
  private actualizarVarianteSeleccionada() {
    if (!this.producto?.variantes) return;

    // Buscar variante que coincida con TODAS las opciones seleccionadas
    const varianteEncontrada = this.producto.variantes.find(variante => {
      return Array.from(this.opcionesSeleccionadas.entries()).every(([idOpcion, idValor]) => {
        return variante.valores.some(v => v.id_opcion === idOpcion && v.id_valor === idValor);
      });
    });

    if (varianteEncontrada) {
      this.varianteSeleccionada = varianteEncontrada;
      this.imagenPrincipal = this.getImagenUrl(varianteEncontrada.imagenes[0]);
      this.cantidad = 1; // Resetear cantidad al cambiar variante

      console.log('🔄 Variante seleccionada:', {
        sku: varianteEncontrada.sku,
        precio: varianteEncontrada.precio,
        stock: varianteEncontrada.stock
      });
    } else {
      // Si no se encontró una variante que coincida (puede ocurrir cuando las opciones
      // anteriores persisten), tomar la primera variante como fallback para evitar
      // dejar la UI en un estado inconsistente.
      const primera = this.producto.variantes[0];
      if (primera) {
        this.varianteSeleccionada = primera;
        this.imagenPrincipal = this.getImagenUrl(primera.imagenes[0]);
        this.cantidad = 1;
        // Asegurar que las opciones seleccionadas reflejen la variante usada
        this.opcionesSeleccionadas = new Map();
        primera.valores.forEach(v => this.opcionesSeleccionadas.set(v.id_opcion, v.id_valor));
        console.log('⚠️ Variante no encontrada por filtros — usando primera variante como fallback');
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
   * Obtiene el array de URLs de imágenes normalizadas
   */
  getImagenesNormalizadas(): string[] {
    if (!this.varianteSeleccionada?.imagenes) return [];
    return this.varianteSeleccionada.imagenes.map(img => this.getImagenUrl(img));
  }

  /**
   * Cambia la imagen principal
   */
  cambiarImagenPrincipal(imagen: string) {
    this.imagenPrincipal = imagen;
  }

  /**
   * Verifica si una opción está seleccionada
   */
  isOpcionSeleccionada(idOpcion: number, idValor: number): boolean {
    return this.opcionesSeleccionadas.get(idOpcion) === idValor;
  }

  /**
   * Calcula el descuento de la variante seleccionada
   */
  calcularDescuento(): number {
    if (!this.varianteSeleccionada?.precio_anterior) return 0;
    if (this.varianteSeleccionada.precio_anterior <= this.varianteSeleccionada.precio) return 0;

    return Math.round(
      ((this.varianteSeleccionada.precio_anterior - this.varianteSeleccionada.precio) /
       this.varianteSeleccionada.precio_anterior) * 100
    );
  }

  /**
   * Retorna el nombre de la categoría
   */
  getCategoriaDisplay(): string {
    return this.producto?.nombre_categoria || '';
  }

  /**
   * Cambia la cantidad del producto
   */
  cambiarCantidad(incremento: number) {
    if (!this.varianteSeleccionada) return;

    const nuevaCantidad = this.cantidad + incremento;
    if (nuevaCantidad >= 1 && nuevaCantidad <= this.varianteSeleccionada.stock) {
      this.cantidad = nuevaCantidad;
    }
  }

  /**
   * Verifica si se puede agregar al carrito
   */
  puedeAgregar(): boolean {
    if (!this.varianteSeleccionada) return false;

    // Verificar que todas las opciones estén seleccionadas
    const todasOpcionesSeleccionadas = this.opcionesDisponibles.length === this.opcionesSeleccionadas.size;

    return this.varianteSeleccionada.stock > 0 &&
           todasOpcionesSeleccionadas &&
           this.cantidad > 0;
  }

  /**
   * Agrega el producto al carrito usando el nuevo backend
   */
  agregarAlCarrito() {
    if (!this.puedeAgregar() || !this.producto || !this.varianteSeleccionada) {
      return;
    }

    this.carritoService.agregarItem(this.varianteSeleccionada.id_variante, this.cantidad).subscribe({
      next: () => {
        // La notificación ya se muestra en el servicio
      },
      error: (error) => {
        // Los errores ya se manejan en el servicio con notificaciones
        if (error.message !== 'Usuario no autenticado') {
          console.error('Error al agregar al carrito:', error);
        }
      }
    });
  }

  /**
   * Obtiene el valor seleccionado de una opción
   */
  private getValorOpcion(idOpcion: number): string | null {
    const idValor = this.opcionesSeleccionadas.get(idOpcion);
    if (!idValor || !this.varianteSeleccionada) return null;

    const valor = this.varianteSeleccionada.valores.find(v =>
      v.id_opcion === idOpcion && v.id_valor === idValor
    );

    return valor?.valor || null;
  }

  /**
   * Toggle de secciones expandibles
   */
  toggleSeccion(seccion: 'caracteristicas' | 'descripcion') {
    this.seccionesAbiertas[seccion] = !this.seccionesAbiertas[seccion];
  }

  /**
   * Clase CSS según el stock
   */
  getStockClass(): string {
    if (!this.varianteSeleccionada) return 'sin-stock';

    const stock = this.varianteSeleccionada.stock;
    if (stock === 0) return 'sin-stock';
    if (stock < 5) return 'poco-stock';
    if (stock < 10) return 'stock-medio';
    return 'buen-stock';
  }

  /**
   * Mensaje de stock
   */
  getStockMessage(): string {
    if (!this.varianteSeleccionada) return 'Sin stock';

    const stock = this.varianteSeleccionada.stock;
    if (stock === 0) return 'Sin stock';
    if (stock < 5) return `Solo ${stock} disponibles`;
    if (stock < 10) return `${stock} disponibles`;
    return `${stock} disponibles`;
  }

  /**
   * Porcentaje de stock (para barra visual)
   */
  getStockPercentage(): number {
    if (!this.varianteSeleccionada) return 0;

    const maxStock = 20;
    return Math.min((this.varianteSeleccionada.stock / maxStock) * 100, 100);
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

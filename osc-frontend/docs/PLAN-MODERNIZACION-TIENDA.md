# 🚀 Plan de Modernización de Componentes de Tienda

**Fecha:** 3 de Noviembre, 2025  
**Objetivo:** Modernizar componentes de tienda a Angular 20 con signals, mejorar UX y agregar funcionalidades faltantes

---

## 📊 Análisis del Estado Actual

### ❌ Problemas Identificados

#### **1. Código No Moderno (Angular 20)**
- ❌ Uso de `class properties` en lugar de `signals`
- ❌ Constructor injection en lugar de `inject()`
- ❌ `@Input/@Output` tradicionales en lugar de `input()/output()/model()`
- ❌ Mutación directa de estado en lugar de signals reactivos
- ❌ Falta de `computed()` para valores derivados
- ❌ No usa `effect()` para side effects reactivos

#### **2. Carencias Funcionales**
- ❌ **Sin filtro por rango de precio** (crítico para e-commerce)
- ❌ **Sin filtro por colores** (muy común en tiendas)
- ❌ **Sin filtro por tallas** dinámico según categoría
- ❌ **Opciones deshabilitadas** en filtros (tallas no comentadas)
- ❌ **Sin scroll infinito** (solo paginación tradicional)
- ❌ **Sin búsqueda predictiva/autocompletado**
- ❌ **Sin persistencia de filtros en URL** (no se pueden compartir)

#### **3. Problemas de UX**
- ❌ No muestra filtros activos con chips removibles
- ❌ No indica cuántos productos por filtro
- ❌ Selección de opciones poco intuitiva en detalle
- ❌ Loading states genéricos (sin granularidad)
- ❌ Manejo de errores básico
- ❌ Falta feedback visual en acciones

#### **4. Performance**
- ❌ Sin `trackBy` functions en `*ngFor`
- ❌ No usa `OnPush` change detection
- ❌ Re-renderiza innecesariamente
- ❌ Cálculos no memoizados

#### **5. Accesibilidad**
- ❌ Falta de `aria-labels` apropiados
- ❌ Navegación por teclado limitada
- ❌ Sin anuncios para screen readers
- ❌ Contraste de colores no verificado

---

## 🎯 Plan de Implementación por Fases

### **FASE 1: Modernización a Angular 20** (Prioridad ALTA) ⚡
*Objetivo: Actualizar código a prácticas modernas de Angular 20*

#### **1.1 Migrar TiendaPage a Signals**
**Archivos:** `tienda-page.ts`

**Cambios:**
```typescript
// ANTES (❌ Antiguo)
export class TiendaPage implements OnInit {
  categorias: Categoria[] = [];
  productos: Productos[] = [];
  isLoading: boolean = true;
  filtrosActivos: FiltrosProducto = {...};
  
  constructor(
    private productoService: ProductoService,
    private route: ActivatedRoute
  ) {}
}

// DESPUÉS (✅ Moderno)
export class TiendaPage {
  private productoService = inject(ProductoService);
  private route = inject(ActivatedRoute);
  
  categorias = signal<Categoria[]>([]);
  productos = signal<Productos[]>([]);
  isLoading = signal(true);
  filtrosActivos = signal<FiltrosProducto>({...});
  
  // Valores computados
  totalPaginas = computed(() => {
    const total = this.totalProductos();
    const perPage = this.filtrosActivos().per_page;
    return Math.ceil(total / perPage);
  });
  
  constructor() {
    effect(() => {
      // Reaccionar a cambios de filtros
      const filtros = this.filtrosActivos();
      this.cargarProductos();
    });
  }
}
```

**Beneficios:**
- ✅ Reactividad automática
- ✅ Menos código boilerplate
- ✅ Mejor rendimiento (granular change detection)
- ✅ Type-safe

---

#### **1.2 Migrar FiltroPanelComponent**
**Archivos:** `filtro-panel.ts`

**Cambios:**
```typescript
// ANTES (❌)
@Input() filtrosActivos: FiltrosProducto = {...};
@Output() filtrosChange = new EventEmitter<FiltrosProducto>();

// DESPUÉS (✅)
filtrosActivos = input.required<FiltrosProducto>();
filtrosChange = output<FiltrosProducto>();

// O mejor: usar model() para two-way binding
filtros = model<FiltrosProducto>({...});

categorias = signal<Categoria[]>([]);
marcas = signal<Marca[]>([]);

// Cargar con toSignal
categorias = toSignal(
  inject(CategoriaService).getCategorias(),
  { initialValue: [] }
);
```

---

#### **1.3 Migrar ProductoCard**
**Archivos:** `producto-card.ts`

**Cambios:**
```typescript
// ANTES (❌)
@Input() producto!: Productos;

calcularDescuento(): number {
  // Cálculo costoso
}

// DESPUÉS (✅)
producto = input.required<Productos>();

// Computed para descuento (se cachea automáticamente)
descuento = computed(() => {
  const prod = this.producto();
  if (!prod.precio_anterior) return 0;
  return Math.round(
    ((prod.precio_anterior - prod.precio) / prod.precio_anterior) * 100
  );
});

tieneStock = computed(() => this.producto().stock > 0);
stockBajo = computed(() => {
  const stock = this.producto().stock;
  return stock > 0 && stock < 5;
});
```

---

#### **1.4 Migrar DeporteSelector**
**Archivos:** `deporte-selector.ts`

**Cambios:**
```typescript
// ANTES (❌)
@Input() deporteActivo: number = 1;
@Output() deporteChange = new EventEmitter<number>();

// DESPUÉS (✅)
deporteActivo = model<number>(1); // Two-way binding automático

deportes = toSignal(
  inject(DeporteService).getDeportes(),
  { initialValue: [] }
);

seleccionarDeporte(id: number) {
  this.deporteActivo.set(id); // Actualiza automáticamente el parent
}
```

---

#### **1.5 Migrar DetalleProducto**
**Archivos:** `detalle-producto.ts`

**Cambios:**
```typescript
// ANTES (❌)
producto?: ProductoDetalle;
varianteSeleccionada?: VarianteProducto;
cantidad: number = 1;

// DESPUÉS (✅)
producto = signal<ProductoDetalle | null>(null);
varianteSeleccionada = signal<VarianteProducto | null>(null);
cantidad = signal(1);

// Computed para validaciones
puedeAgregar = computed(() => {
  const variante = this.varianteSeleccionada();
  const cant = this.cantidad();
  const opciones = this.opcionesSeleccionadas();
  
  return variante !== null &&
         variante.stock > 0 &&
         opciones.size === this.opcionesDisponibles().length &&
         cant > 0;
});

descuento = computed(() => {
  const variante = this.varianteSeleccionada();
  if (!variante?.precio_anterior) return 0;
  return Math.round(
    ((variante.precio_anterior - variante.precio) / variante.precio_anterior) * 100
  );
});

// Effect para reaccionar a cambios de producto
constructor() {
  effect(() => {
    const prod = this.producto();
    if (prod) {
      this.extraerOpciones();
      this.seleccionarPrimeraVariante();
    }
  });
}
```

---

### **FASE 2: Filtros Avanzados** (Prioridad ALTA) 🔍

#### **2.1 Filtro por Rango de Precio**
**Impacto:** CRÍTICO para e-commerce

**Backend:**
```typescript
// producto.service.ts
interface FiltrosProducto {
  // ... existentes
  precioMin?: number;
  precioMax?: number;
}
```

**Frontend:**
```typescript
// filtro-panel.ts
precioMin = signal<number | null>(null);
precioMax = signal<number | null>(null);

// Rango de precios del catálogo
precioRango = computed(() => {
  // Obtener desde backend o calcular del catálogo
  return { min: 0, max: 1000 };
});

aplicarFiltroPrecio() {
  this.filtros.update(f => ({
    ...f,
    precioMin: this.precioMin(),
    precioMax: this.precioMax()
  }));
}
```

**UI:**
```html
<!-- Dual range slider -->
<div class="filtro-seccion">
  <h4>Rango de Precio</h4>
  <div class="precio-inputs">
    <input type="number" 
           [ngModel]="precioMin()"
           (ngModelChange)="precioMin.set($event)"
           placeholder="Mín">
    <span>-</span>
    <input type="number"
           [ngModel]="precioMax()"
           (ngModelChange)="precioMax.set($event)"
           placeholder="Máx">
  </div>
  
  <!-- Slider visual -->
  <div class="dual-range-slider">
    <!-- Implementar con input[type="range"] personalizado -->
  </div>
  
  <!-- Histograma opcional -->
  <div class="precio-histograma">
    <!-- Barras mostrando distribución de precios -->
  </div>
</div>
```

---

#### **2.2 Filtro por Colores**
**Impacto:** ALTO - común en tiendas de ropa/calzado

**Backend:**
```typescript
// Nuevo endpoint
GET /api/p/productos/opciones/valores?nombre_opcion=Color

// Respuesta
[
  { id_valor: 1, valor: "Negro" },
  { id_valor: 2, valor: "Blanco" },
  { id_valor: 3, valor: "Rojo" }
]
```

**Frontend:**
```typescript
// filtro-panel.ts
coloresDisponibles = toSignal(
  inject(ProductoService).getOpcionesValores('Color'),
  { initialValue: [] }
);

coloresSeleccionados = signal<number[]>([]);

toggleColor(idValor: number) {
  this.coloresSeleccionados.update(colores => {
    const index = colores.indexOf(idValor);
    return index === -1
      ? [...colores, idValor]
      : colores.filter(c => c !== idValor);
  });
  
  this.aplicarFiltros();
}

// Mapeo de colores a CSS
getColorCss(nombreColor: string): string {
  const colores: Record<string, string> = {
    'Negro': '#000000',
    'Blanco': '#FFFFFF',
    'Rojo': '#FF0000',
    // ... más colores
  };
  return colores[nombreColor] || '#CCCCCC';
}
```

**UI:**
```html
<div class="filtro-seccion">
  <h4>Colores</h4>
  <div class="colores-grid">
    @for (color of coloresDisponibles(); track color.id_valor) {
      <button 
        class="color-chip"
        [class.selected]="coloresSeleccionados().includes(color.id_valor)"
        (click)="toggleColor(color.id_valor)"
        [attr.aria-label]="color.valor">
        <span 
          class="color-circulo"
          [style.background-color]="getColorCss(color.valor)">
        </span>
        <span class="color-nombre">{{ color.valor }}</span>
        @if (coloresSeleccionados().includes(color.id_valor)) {
          <i class="check-icon">✓</i>
        }
      </button>
    }
  </div>
</div>
```

**CSS:**
```css
.colores-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
}

.color-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.color-chip.selected {
  border-color: #4F46E5;
  background: #EEF2FF;
}

.color-circulo {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #E5E7EB;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.color-chip.selected .color-circulo {
  border-color: #4F46E5;
  border-width: 3px;
}
```

---

#### **2.3 Filtro Dinámico por Tallas según Categoría**
**Impacto:** ALTO - usa el sistema de categoría-opciones implementado

**Flujo:**
1. Usuario selecciona categoría (ej: Calzado)
2. Frontend llama `GET /opciones/categoria/3`
3. Backend retorna opciones específicas (Talla Calzado con 35-47)
4. UI muestra solo esas tallas

**Frontend:**
```typescript
// filtro-panel.ts
categoriasSeleccionadas = signal<number[]>([]);
tallasDisponibles = signal<OpcionTalla[]>([]);
tallasSeleccionadas = signal<number[]>([]);

// Effect para cargar tallas cuando cambian categorías
constructor() {
  effect(() => {
    const categorias = this.categoriasSeleccionadas();
    if (categorias.length > 0) {
      this.cargarTallasPorCategorias(categorias);
    } else {
      this.tallasDisponibles.set([]);
    }
  });
}

async cargarTallasPorCategorias(categoriaIds: number[]) {
  // Cargar opciones de cada categoría
  const promises = categoriaIds.map(id =>
    firstValueFrom(this.productoService.getOpcionesPorCategoria(id))
  );
  
  const opcionesPorCategoria = await Promise.all(promises);
  
  // Extraer solo opciones de talla (Talla Ropa o Talla Calzado)
  const tallas = opcionesPorCategoria
    .flatMap(opciones => 
      opciones.filter(o => o.nombre_opcion.includes('Talla'))
    )
    .flatMap(opcion => opcion.valores);
  
  // Eliminar duplicados
  const tallasUnicas = Array.from(
    new Map(tallas.map(t => [t.id_valor, t])).values()
  );
  
  this.tallasDisponibles.set(tallasUnicas);
}
```

**UI:**
```html
<div class="filtro-seccion">
  <h4>
    Tallas
    @if (tallasDisponibles().length === 0) {
      <span class="info-text">(Selecciona una categoría primero)</span>
    }
  </h4>
  
  @if (tallasDisponibles().length > 0) {
    <div class="tallas-grid">
      @for (talla of tallasDisponibles(); track talla.id_valor) {
        <button
          class="talla-chip"
          [class.selected]="tallasSeleccionadas().includes(talla.id_valor)"
          (click)="toggleTalla(talla.id_valor)">
          {{ talla.valor }}
        </button>
      }
    </div>
  } @else {
    <p class="empty-state">
      Selecciona una o más categorías para ver las tallas disponibles
    </p>
  }
</div>
```

---

### **FASE 3: Servicios Reactivos** (Prioridad MEDIA) 🔄

#### **3.1 Crear FiltrosService**
**Objetivo:** Centralizar lógica de filtros y sincronización con URL

```typescript
// filtros.service.ts
@Injectable({ providedIn: 'root' })
export class FiltrosService {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  // State centralizado
  private filtrosState = signal<FiltrosProducto>({
    categorias: [],
    marcas: [],
    deportes: [],
    colores: [],
    tallas: [],
    precioMin: null,
    precioMax: null,
    is_new: undefined,
    q: '',
    sort: 'price_asc',
    page: 1,
    per_page: 24,
  });
  
  // Public readonly signal
  filtros = this.filtrosState.asReadonly();
  
  // Computed values
  totalFiltrosActivos = computed(() => {
    const f = this.filtrosState();
    return (f.categorias?.length || 0) +
           (f.marcas?.length || 0) +
           (f.colores?.length || 0) +
           (f.tallas?.length || 0) +
           (f.precioMin !== null ? 1 : 0) +
           (f.precioMax !== null ? 1 : 0);
  });
  
  tieneFiltros = computed(() => this.totalFiltrosActivos() > 0);
  
  constructor() {
    // Sincronizar con URL
    effect(() => {
      const filtros = this.filtrosState();
      this.sincronizarConURL(filtros);
    });
    
    // Leer filtros iniciales de URL
    this.leerFiltrosDeURL();
  }
  
  // Métodos públicos
  actualizarFiltros(filtros: Partial<FiltrosProducto>) {
    this.filtrosState.update(f => ({ ...f, ...filtros, page: 1 }));
  }
  
  limpiarFiltros() {
    this.filtrosState.set({
      categorias: [],
      marcas: [],
      deportes: [],
      colores: [],
      tallas: [],
      precioMin: null,
      precioMax: null,
      is_new: undefined,
      q: '',
      sort: 'price_asc',
      page: 1,
      per_page: 24,
    });
  }
  
  removerFiltro(tipo: keyof FiltrosProducto, valor?: any) {
    this.filtrosState.update(f => {
      const updated = { ...f };
      
      if (tipo === 'categorias' || tipo === 'marcas' || 
          tipo === 'colores' || tipo === 'tallas') {
        updated[tipo] = f[tipo]?.filter(v => v !== valor) || [];
      } else if (tipo === 'precioMin' || tipo === 'precioMax') {
        updated[tipo] = null;
      } else {
        delete updated[tipo];
      }
      
      return updated;
    });
  }
  
  cambiarPagina(pagina: number) {
    this.filtrosState.update(f => ({ ...f, page: pagina }));
  }
  
  // Sincronización con URL
  private sincronizarConURL(filtros: FiltrosProducto) {
    const queryParams: any = {};
    
    if (filtros.categorias && filtros.categorias.length > 0) {
      queryParams.categorias = filtros.categorias.join(',');
    }
    if (filtros.marcas && filtros.marcas.length > 0) {
      queryParams.marcas = filtros.marcas.join(',');
    }
    if (filtros.precioMin !== null) {
      queryParams.precioMin = filtros.precioMin;
    }
    if (filtros.precioMax !== null) {
      queryParams.precioMax = filtros.precioMax;
    }
    if (filtros.q) {
      queryParams.q = filtros.q;
    }
    if (filtros.page && filtros.page > 1) {
      queryParams.page = filtros.page;
    }
    
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge'
    });
  }
  
  private leerFiltrosDeURL() {
    this.route.queryParams.pipe(take(1)).subscribe(params => {
      const filtros: Partial<FiltrosProducto> = {};
      
      if (params['categorias']) {
        filtros.categorias = params['categorias']
          .split(',')
          .map((id: string) => parseInt(id, 10));
      }
      if (params['marcas']) {
        filtros.marcas = params['marcas']
          .split(',')
          .map((id: string) => parseInt(id, 10));
      }
      if (params['precioMin']) {
        filtros.precioMin = parseInt(params['precioMin'], 10);
      }
      if (params['precioMax']) {
        filtros.precioMax = parseInt(params['precioMax'], 10);
      }
      if (params['q']) {
        filtros.q = params['q'];
      }
      if (params['page']) {
        filtros.page = parseInt(params['page'], 10);
      }
      
      if (Object.keys(filtros).length > 0) {
        this.filtrosState.update(f => ({ ...f, ...filtros }));
      }
    });
  }
}
```

**Uso en componentes:**
```typescript
// tienda-page.ts
export class TiendaPage {
  private filtrosService = inject(FiltrosService);
  
  filtros = this.filtrosService.filtros;
  totalFiltros = this.filtrosService.totalFiltrosActivos;
  
  constructor() {
    // Reaccionar a cambios de filtros
    effect(() => {
      const filtros = this.filtros();
      this.cargarProductos(filtros);
    });
  }
}
```

---

### **FASE 4: Componente de Filtros Activos** (Prioridad MEDIA) 🏷️

#### **4.1 Crear FiltrosActivosComponent**

```typescript
// filtros-activos.component.ts
@Component({
  selector: 'app-filtros-activos',
  template: `
    <div class="filtros-activos-container" *ngIf="tieneFiltros()">
      <div class="header">
        <span class="total-resultados">
          {{ totalProductos() }} productos encontrados
        </span>
        <button class="btn-limpiar-todo" (click)="limpiarTodo()">
          Limpiar todos los filtros
        </button>
      </div>
      
      <div class="chips-container">
        <!-- Categorías -->
        @for (cat of categoriasSeleccionadas(); track cat.id) {
          <div class="filtro-chip categoria">
            <span class="chip-icono">📁</span>
            <span class="chip-label">{{ cat.nombre }}</span>
            <button 
              class="chip-remove"
              (click)="removerCategoria(cat.id)"
              aria-label="Quitar categoría {{ cat.nombre }}">
              ✕
            </button>
          </div>
        }
        
        <!-- Marcas -->
        @for (marca of marcasSeleccionadas(); track marca.id) {
          <div class="filtro-chip marca">
            <span class="chip-icono">🏷️</span>
            <span class="chip-label">{{ marca.nombre }}</span>
            <button 
              class="chip-remove"
              (click)="removerMarca(marca.id)">
              ✕
            </button>
          </div>
        }
        
        <!-- Colores -->
        @for (color of coloresSeleccionados(); track color.id) {
          <div class="filtro-chip color">
            <span 
              class="chip-color"
              [style.background-color]="getColorCss(color.nombre)">
            </span>
            <span class="chip-label">{{ color.nombre }}</span>
            <button 
              class="chip-remove"
              (click)="removerColor(color.id)">
              ✕
            </button>
          </div>
        }
        
        <!-- Rango de precio -->
        @if (precioMin() !== null || precioMax() !== null) {
          <div class="filtro-chip precio">
            <span class="chip-icono">💰</span>
            <span class="chip-label">
              ${{ precioMin() || 0 }} - ${{ precioMax() || '∞' }}
            </span>
            <button 
              class="chip-remove"
              (click)="removerPrecio()">
              ✕
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .filtros-activos-container {
      background: white;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }
    
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .total-resultados {
      font-weight: 600;
      color: #1F2937;
    }
    
    .chips-container {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .filtro-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: #F3F4F6;
      border-radius: 20px;
      font-size: 14px;
      transition: all 0.2s;
    }
    
    .filtro-chip:hover {
      background: #E5E7EB;
    }
    
    .chip-remove {
      background: none;
      border: none;
      padding: 2px 4px;
      cursor: pointer;
      font-size: 16px;
      color: #6B7280;
      transition: color 0.2s;
    }
    
    .chip-remove:hover {
      color: #EF4444;
    }
    
    .chip-color {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid #E5E7EB;
    }
  `]
})
export class FiltrosActivosComponent {
  private filtrosService = inject(FiltrosService);
  
  // Signals
  filtros = this.filtrosService.filtros;
  tieneFiltros = this.filtrosService.tieneFiltros;
  
  // Input
  totalProductos = input.required<number>();
  
  // Computed
  categoriasSeleccionadas = computed(() => {
    // Mapear IDs a objetos completos
    // ... implementación
  });
  
  marcasSeleccionadas = computed(() => {
    // ... similar
  });
  
  // ... más computed
  
  // Métodos
  removerCategoria(id: number) {
    this.filtrosService.removerFiltro('categorias', id);
  }
  
  limpiarTodo() {
    this.filtrosService.limpiarFiltros();
  }
}
```

---

### **FASE 5: Mejoras de UX/UI** (Prioridad MEDIA) 🎨

#### **5.1 Estados de Carga Granulares**

```typescript
// tienda-page.ts
loadingStates = signal({
  productos: true,
  filtros: false,
  paginacion: false
});

cargarProductos() {
  this.loadingStates.update(s => ({ ...s, productos: true }));
  
  this.productoService.searchProductos(this.filtros()).subscribe({
    next: (response) => {
      this.productos.set(response.data);
      this.loadingStates.update(s => ({ ...s, productos: false }));
    }
  });
}

cargarMas() {
  this.loadingStates.update(s => ({ ...s, paginacion: true }));
  // ... implementación
}
```

**Skeletons específicos:**
```html
<!-- Skeleton para card de producto -->
<div class="producto-skeleton">
  <div class="skeleton-image"></div>
  <div class="skeleton-title"></div>
  <div class="skeleton-price"></div>
</div>

<!-- Skeleton para filtros -->
<div class="filtro-skeleton">
  <div class="skeleton-header"></div>
  <div class="skeleton-options">
    <div class="skeleton-option"></div>
    <div class="skeleton-option"></div>
    <div class="skeleton-option"></div>
  </div>
</div>
```

---

#### **5.2 Scroll Infinito**

```typescript
// tienda-page.ts
@ViewChild('scrollSentinel') scrollSentinel!: ElementRef;

private observer?: IntersectionObserver;

ngAfterViewInit() {
  this.setupIntersectionObserver();
}

setupIntersectionObserver() {
  this.observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && !this.loadingStates().paginacion) {
        this.cargarMasProductos();
      }
    },
    { rootMargin: '200px' }
  );
  
  this.observer.observe(this.scrollSentinel.nativeElement);
}

cargarMasProductos() {
  const currentPage = this.filtros().page;
  const totalPages = this.totalPaginas();
  
  if (currentPage >= totalPages) return;
  
  this.loadingStates.update(s => ({ ...s, paginacion: true }));
  
  this.filtrosService.cambiarPagina(currentPage + 1);
  
  this.productoService.searchProductos(this.filtros()).subscribe({
    next: (response) => {
      // Agregar productos, no reemplazar
      this.productos.update(prods => [...prods, ...response.data]);
      this.loadingStates.update(s => ({ ...s, paginacion: false }));
    }
  });
}
```

---

### **FASE 6: Performance** (Prioridad BAJA) ⚡

#### **6.1 TrackBy Functions**

```typescript
// tienda-page.ts
trackByProductoId(index: number, producto: Productos): number {
  return producto.id;
}

trackByCategoriaId(index: number, categoria: Categoria): number {
  return categoria.id_categoria;
}
```

```html
<app-producto-card
  *ngFor="let producto of productos(); trackBy: trackByProductoId"
  [producto]="producto">
</app-producto-card>
```

---

#### **6.2 OnPush Change Detection**

```typescript
@Component({
  selector: 'app-producto-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // ...
})
export class ProductoCard {
  // ... código con signals (triggers automático)
}
```

---

### **FASE 7: Testing** (Prioridad BAJA) 🧪

#### **7.1 Unit Tests**

```typescript
// filtro-panel.component.spec.ts
describe('FiltroPanelComponent', () => {
  it('should toggle categoria selection', () => {
    const component = TestBed.createComponent(FiltroPanelComponent).componentInstance;
    
    component.toggleCategoria(1);
    expect(component.filtros().categorias).toContain(1);
    
    component.toggleCategoria(1);
    expect(component.filtros().categorias).not.toContain(1);
  });
  
  it('should emit filtros when changed', () => {
    const component = TestBed.createComponent(FiltroPanelComponent).componentInstance;
    const spy = jasmine.createSpy();
    component.filtrosChange.subscribe(spy);
    
    component.toggleCategoria(1);
    
    expect(spy).toHaveBeenCalledWith(
      jasmine.objectContaining({ categorias: [1] })
    );
  });
});
```

---

## 📅 Cronograma Sugerido

| Fase | Tareas | Tiempo Estimado | Prioridad |
|------|--------|-----------------|-----------|
| 1 | Modernización a Angular 20 | 2-3 días | ⚡ ALTA |
| 2 | Filtros Avanzados (precio, color, tallas) | 3-4 días | ⚡ ALTA |
| 3 | Servicios Reactivos | 1-2 días | 🟡 MEDIA |
| 4 | Componente Filtros Activos | 1 día | 🟡 MEDIA |
| 5 | Mejoras UX/UI | 2-3 días | 🟡 MEDIA |
| 6 | Performance | 1 día | 🟢 BAJA |
| 7 | Testing | 2-3 días | 🟢 BAJA |

**Total:** 12-17 días de trabajo

---

## ✅ Criterios de Aceptación

### **Para cada componente modernizado:**
- [ ] Usa signals en lugar de propiedades tradicionales
- [ ] Usa `inject()` en lugar de constructor injection
- [ ] Usa `input()/output()/model()` en lugar de `@Input/@Output`
- [ ] Usa `computed()` para valores derivados
- [ ] Usa `effect()` apropiadamente para side effects
- [ ] No tiene errores de compilación
- [ ] Mantiene la funcionalidad existente

### **Para filtros:**
- [ ] Filtro de precio funciona correctamente
- [ ] Filtro de colores carga opciones dinámicamente
- [ ] Filtro de tallas cambia según categoría
- [ ] Filtros se sincronizan con URL
- [ ] Se pueden compartir URLs con filtros
- [ ] Chips de filtros activos funcionan
- [ ] Limpiar filtros funciona correctamente

### **Para performance:**
- [ ] Todos los `*ngFor` tienen `trackBy`
- [ ] Componentes usan `OnPush` donde sea posible
- [ ] No hay re-renders innecesarios
- [ ] Scroll infinito funciona sin lag

### **Para testing:**
- [ ] >80% code coverage en componentes críticos
- [ ] Tests unitarios pasan
- [ ] Tests de integración pasan
- [ ] No hay regresiones en funcionalidad

---

## 🚀 Próximos Pasos Inmediatos

**RECOMENDACIÓN: Empezar con FASE 1** ✅

1. ✅ **Día 1-2:** Migrar TiendaPage a signals
2. ✅ **Día 2-3:** Migrar FiltroPanelComponent
3. ✅ **Día 3:** Migrar ProductoCard y DeporteSelector
4. ✅ **Día 4:** Migrar DetalleProducto
5. ✅ **Día 5:** Testing de regresión

**Luego continuar con FASE 2 (Filtros)**

---

## 📚 Referencias

- **Angular Signals:** https://angular.dev/guide/signals
- **Angular inject():** https://angular.dev/api/core/inject
- **input()/output():** https://angular.dev/guide/components/inputs
- **model():** https://angular.dev/guide/signals/model
- **OnPush:** https://angular.dev/api/core/ChangeDetectionStrategy

---

**¿Por dónde empezamos?** 🚀

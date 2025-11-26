import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CrearEquipo } from '../crear-equipo/crear-equipo';
import { Equipo } from '@shared/models/index';
import { EquipoService } from '@shared/services/index';
import { NotificationService } from '@core/services/notification.service';
import { JugadoresService } from '@shared/services/jugadores.service';
import { UserApiService } from '@shared/services/user-api.service';
import { Jugador } from '@shared/interfaces/match.interfaces';

@Component({
  selector: 'app-list-equipo',
  imports: [CommonModule, FormsModule, CrearEquipo],
  templateUrl: './list-equipo.html',
  styleUrl: './list-equipo.css'
})
export class ListEquipo implements OnInit {
  equipos: Equipo[] = [];
  equiposFiltrados: Equipo[] = [];
  searchTerm = '';
  isLoading = true;
  mostrarModal = false;
  mostrarModalEliminar = false;
  mostrarModalAsignar = false;
  equipoSeleccionado?: Equipo;
  equipoAEliminar?: Equipo;
  equipoParaAsignar?: Equipo;
  usuariosDisponibles: any[] = [];
  usuariosFiltrados: any[] = [];
  usuariosEquipo: any[] = [];
  jugadoresOriginales: any[] = []; // Track original jugadores to detect removals
  todosLosJugadores: any[] = [];
  isLoadingUsuarios = false;
  searchUsuario = '';

  deportes: { [key: number]: string } = {
    1: 'Futbol',
    2: 'Padel',
    3: 'Tenis',
    4: 'Baloncesto'
  };

  constructor(
    private equipoService: EquipoService,
    private notificationService: NotificationService,
    private router: Router,
    private jugadoresService: JugadoresService,
    private userApiService: UserApiService
  ) {}

  ngOnInit() {
    this.cargarEquipos();
  }

  cargarEquipos() {
    this.isLoading = true;
    this.equipoService.getMisEquipos().subscribe({
      next: (equipos) => {
        this.equipos = equipos;
        this.equiposFiltrados = [...equipos];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar equipos:', error);
        this.notificationService.error('Error al cargar los equipos');
        this.isLoading = false;
      }
    });
  }

  obtenerNombreDeporte(id?: number): string {
    if (!id) return 'Sin especificar';
    return this.deportes[id] || 'Sin especificar';
  }

  filtrarEquipos() {
    const term = this.searchTerm.toLowerCase().trim();

    if (!term) {
      this.equiposFiltrados = [...this.equipos];
      return;
    }

    this.equiposFiltrados = this.equipos.filter(equipo =>
      equipo.nombre_equipo.toLowerCase().includes(term) ||
      equipo.descripcion.toLowerCase().includes(term)
    );
  }

  abrirModalCrear() {
    this.equipoSeleccionado = undefined;
    this.mostrarModal = true;
    document.body.classList.add('modal-open');
  }

  editarEquipo(equipo: Equipo) {
    // Navegar a la ruta de edición
    this.router.navigate(['/editar-equipo', equipo.id_equipo]);
  }

  eliminarEquipo(equipo: Equipo) {
    this.equipoAEliminar = equipo;
    this.mostrarModalEliminar = true;
    document.body.classList.add('modal-open');
  }

  confirmarEliminacion() {
    if (this.equipoAEliminar && this.equipoAEliminar.id_equipo) {
      this.equipoService.deleteEquipoClient(this.equipoAEliminar.id_equipo).subscribe({
        next: () => {
          this.notificationService.success(`Equipo "${this.equipoAEliminar!.nombre_equipo}" eliminado correctamente`);
          this.cargarEquipos();
          this.cerrarModalEliminar();
        },
        error: (error) => {
          console.error('Error al eliminar equipo:', error);
          this.notificationService.error('Error al eliminar el equipo');
          this.cerrarModalEliminar();
        }
      });
    }
  }

  onEquipoGuardado(equipo: Equipo) {
    this.cargarEquipos();
    this.cerrarModal();
  }

  cerrarModal() {
    this.mostrarModal = false;
    this.equipoSeleccionado = undefined;
    document.body.classList.remove('modal-open');
  }

  cerrarModalEliminar() {
    this.mostrarModalEliminar = false;
    this.equipoAEliminar = undefined;
    document.body.classList.remove('modal-open');
  }

  abrirModalAsignar(equipo: Equipo) {
    this.equipoParaAsignar = equipo;
    this.mostrarModalAsignar = true;
    document.body.classList.add('modal-open');
    this.cargarUsuariosParaAsignar(equipo.id_equipo);
  }

  cargarUsuariosParaAsignar(idEquipo: number) {
    this.isLoadingUsuarios = true;

    // Cargar jugadores de TODOS los equipos del usuario para validar deportes
    const promesasJugadores = this.equipos.map(equipo =>
      this.jugadoresService.getJugadoresByEquipo(equipo.id_equipo).toPromise()
        .then(res => (res?.data || []).map((j: any) => ({ ...j, id_deporte_equipo: equipo.id_deporte })))
        .catch(() => [])
    );

    Promise.all([...promesasJugadores, this.userApiService.getAllUsersFromDB().toPromise()])
      .then(resultados => {
        // Los primeros son jugadores, el último son usuarios
        const todosLosJugadores = resultados.slice(0, -1).flat();
        const todosUsuarios = resultados[resultados.length - 1] || [];

        this.todosLosJugadores = todosLosJugadores;

        // Cargar jugadores del equipo actual
        return this.jugadoresService.getJugadoresByEquipo(idEquipo).toPromise()
          .then(jugadoresRes => {
            const jugadores = jugadoresRes?.data || [];
            return { todosUsuarios, jugadores };
          })
          .catch(error => {
            console.warn('No se pudieron cargar jugadores del equipo, iniciando vacío:', error);
            return { todosUsuarios, jugadores: [] };
          });
      })
      .then(({ todosUsuarios, jugadores }) => {
        // Mapear jugadores del equipo
        this.usuariosEquipo = jugadores.map((jugador: Jugador) => ({
          id: jugador.uid || jugador.id_jugador,
          id_jugador: jugador.id_jugador,
          id_user: jugador.id_usuario,
          nombre: jugador.nombre_completo,
          email: jugador.email_usuario || '',
          numero_dorsal: jugador.numero_dorsal,
          posicion: jugador.posicion,
          es_capitan: jugador.es_capitan
        }));

        // Store original jugadores to detect deletions
        this.jugadoresOriginales = JSON.parse(JSON.stringify(this.usuariosEquipo));

        // Filtrar usuarios disponibles (que no están ya en el equipo)
        const idsUsuariosEnEquipo = this.usuariosEquipo
          .map(u => u.id_user)
          .filter(id => id);

        this.usuariosDisponibles = todosUsuarios
          .filter((usuario: any) => {
            const idUser = usuario.id_user || usuario.id_usuario;
            return idUser && !idsUsuariosEnEquipo.includes(idUser);
          })
          .map((usuario: any) => {
            const idUser = usuario.id_user || usuario.id_usuario;
            // Verificar si está en otro equipo del mismo deporte
            const jugadorEnOtroEquipo = this.todosLosJugadores.find(
              (j: any) => j.id_usuario === idUser && j.id_equipo !== this.equipoParaAsignar?.id_equipo
            );
            const deporteConflicto = jugadorEnOtroEquipo &&
              jugadorEnOtroEquipo.id_deporte_equipo === this.equipoParaAsignar?.id_deporte;

            return {
              id: usuario.uid,
              id_user: idUser,
              nombre: `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() || usuario.email.split('@')[0],
              email: usuario.email,
              noDisponible: deporteConflicto,
              equipoActual: jugadorEnOtroEquipo ? this.equipos.find(e => e.id_equipo === jugadorEnOtroEquipo.id_equipo)?.nombre_equipo : null
            };
          });

        this.usuariosFiltrados = [...this.usuariosDisponibles];
        this.isLoadingUsuarios = false;
      })
      .catch(error => {
        console.error('Error al cargar usuarios:', error);
        this.notificationService.error('Error al cargar usuarios');
        this.usuariosDisponibles = [];
        this.usuariosFiltrados = [];
        this.usuariosEquipo = [];
        this.isLoadingUsuarios = false;
      });
  }

  asignarUsuario(usuario: any) {
    // Prevenir asignación si el usuario no está disponible (mismo deporte)
    if (usuario.noDisponible) {
      this.notificationService.error(`${usuario.nombre} ya está en ${usuario.equipoActual} (mismo deporte)`);
      return;
    }

    const index = this.usuariosDisponibles.findIndex(u => u.id === usuario.id);
    if (index !== -1) {
      this.usuariosDisponibles.splice(index, 1);
      this.usuariosFiltrados = this.usuariosFiltrados.filter(u => u.id !== usuario.id);
      // Agregar con propiedades de jugador predeterminadas
      this.usuariosEquipo.push({
        ...usuario,
        numero_dorsal: this.obtenerSiguienteNumeroDorsal(),
        posicion: '',
        es_capitan: false
      });
    }
  }

  removerUsuario(usuario: any) {
    const index = this.usuariosEquipo.findIndex(u => u.id === usuario.id);
    if (index !== -1) {
      // Remover del equipo
      const usuarioRemovido = this.usuariosEquipo.splice(index, 1)[0];

      // Volver a agregar a disponibles (sin datos de jugador)
      const usuarioDisponible = {
        id: usuarioRemovido.id,
        id_user: usuarioRemovido.id_user,
        nombre: usuarioRemovido.nombre,
        email: usuarioRemovido.email,
        noDisponible: usuarioRemovido.noDisponible || false,
        equipoActual: usuarioRemovido.equipoActual
      };

      this.usuariosDisponibles.push(usuarioDisponible);

      // Actualizar filtrados si coincide con búsqueda actual
      const term = this.searchUsuario.toLowerCase().trim();
      if (!term ||
          usuarioDisponible.nombre.toLowerCase().includes(term) ||
          usuarioDisponible.email.toLowerCase().includes(term)) {
        this.usuariosFiltrados.push(usuarioDisponible);
      }
    }
  }

  guardarAsignaciones() {
    if (!this.equipoParaAsignar) return;

    const idEquipo = this.equipoParaAsignar.id_equipo;
    const jugadoresActuales = this.usuariosEquipo;

    // Separar jugadores nuevos y existentes
    const jugadoresNuevos = jugadoresActuales.filter((j: any) => !j.id_jugador);
    const jugadoresExistentes = jugadoresActuales.filter((j: any) => j.id_jugador);

    // Detectar jugadores removidos
    const idsActuales = jugadoresExistentes.map((j: any) => j.id_jugador);
    const jugadoresRemovidos = this.jugadoresOriginales.filter(
      (j: any) => j.id_jugador && !idsActuales.includes(j.id_jugador)
    );

    // Promesas para crear nuevos jugadores
    const promesasCrear = jugadoresNuevos.map((jugador: any) => {
      const nuevoJugador = {
        id_equipo: idEquipo,
        id_usuario: jugador.id_user,
        nombre_completo: jugador.nombre,
        numero_dorsal: jugador.numero_dorsal || 0,
        posicion: jugador.posicion || '',
        es_capitan: jugador.es_capitan || false,
        estado: 'activo'
      };
      return this.jugadoresService.crearJugador(nuevoJugador).toPromise();
    });

    // Promesas para actualizar jugadores existentes
    const promesasActualizar = jugadoresExistentes.map((jugador: any) => {
      const datosActualizar = {
        numero_dorsal: jugador.numero_dorsal || 0,
        posicion: jugador.posicion || '',
        es_capitan: jugador.es_capitan || false
      };
      return this.jugadoresService.actualizarJugador(jugador.id_jugador, datosActualizar).toPromise();
    });

    // Promesas para eliminar jugadores removidos
    const promesasEliminar = jugadoresRemovidos.map((jugador: any) => {
      return this.jugadoresService.eliminarJugador(jugador.id_jugador).toPromise();
    });

    // Ejecutar todas las promesas
    console.log('🔄 Ejecutando promesas - Crear:', promesasCrear.length, 'Actualizar:', promesasActualizar.length, 'Eliminar:', promesasEliminar.length);

    Promise.all([...promesasCrear, ...promesasActualizar, ...promesasEliminar])
      .then((resultados) => {
        console.log('✅ Guardado exitoso:', resultados);
        this.notificationService.success('Cambios guardados correctamente');

        // Recargar lista de equipos
        this.cargarEquipos();

        // Recargar datos del modal para mostrar los cambios guardados
        if (this.equipoParaAsignar) {
          this.cargarUsuariosParaAsignar(this.equipoParaAsignar.id_equipo);
        }
      })
      .catch(error => {
        console.error('❌ Error al guardar cambios:', error);
        this.notificationService.error('Error al guardar algunos cambios');
      });
  }

  obtenerSiguienteNumeroDorsal(): number {
    if (this.usuariosEquipo.length === 0) return 1;
    const maxDorsal = Math.max(...this.usuariosEquipo.map((u: any) => u.numero_dorsal || 0));
    return maxDorsal + 1;
  }

  manejarCambioCapitan(usuarioSeleccionado: any) {
    if (usuarioSeleccionado.es_capitan) {
      // Desmarcar a todos los demás capitanes
      this.usuariosEquipo.forEach(u => {
        if (u.id !== usuarioSeleccionado.id) {
          u.es_capitan = false;
        }
      });
    }
  }

  obtenerPosicionesDeporte(idDeporte?: number): string[] {
    const posiciones: { [key: number]: string[] } = {
      1: ['Portero', 'Defensa', 'Mediocampista', 'Delantero'], // Fútbol
      2: ['Base', 'Escolta', 'Alero', 'Ala-Pívot', 'Pívot'],   // Baloncesto
      3: ['Derecha', 'Izquierda'],                              // Padel
      4: ['Derecha', 'Izquierda']                               // Tenis
    };
    return idDeporte ? (posiciones[idDeporte] || []) : [];
  }

  cerrarModalAsignar() {
    this.mostrarModalAsignar = false;
    this.equipoParaAsignar = undefined;
    this.usuariosDisponibles = [];
    this.usuariosFiltrados = [];
    this.usuariosEquipo = [];
    this.searchUsuario = '';
    document.body.classList.remove('modal-open');
  }

  filtrarUsuariosDisponibles() {
    const search = this.searchUsuario.toLowerCase().trim();
    if (!search) {
      this.usuariosFiltrados = [...this.usuariosDisponibles];
    } else {
      this.usuariosFiltrados = this.usuariosDisponibles.filter(usuario =>
        usuario.nombre.toLowerCase().includes(search) ||
        usuario.email.toLowerCase().includes(search)
      );
    }
  }
}

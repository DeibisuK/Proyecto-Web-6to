import * as equipoModel from "../models/equipo.model.js";
import * as historialModel from "../models/historial_partidos.model.js";
//import admin from "../config/firebase.js";
import { eliminarImagenCloudinary } from "../../../../share/utils.js";

// Obtener todos los equipos (ADMIN)
export const getAll = async () => {
  const equipos = await equipoModel.findAll();

  // Enriquecer con datos de Firebase
  // const equiposConDatos = await Promise.all(
  //   equipos.map(async (equipo) => {
  //     if (equipo.firebase_uid) {
  //       try {
  //         const userRecord = await admin.auth().getUser(equipo.firebase_uid);
  //         return {
  //           ...equipo,
  //           nombre_creador:
  //             userRecord.displayName ||
  //             userRecord.email?.split("@")[0] ||
  //             "Usuario",
  //           email_creador: userRecord.email || "",
  //         };
  //       } catch (error) {
  //         console.error(
  //           `Error obteniendo datos de Firebase para UID ${equipo.firebase_uid}:`,
  //           error.message
  //         );
  //         return {
  //           ...equipo,
  //           nombre_creador: "Usuario no encontrado",
  //           email_creador: "",
  //         };
  //       }
  //     }
  //     return equipo;
  //   })
  // );

  return equipos;
};

// Obtener equipos del usuario autenticado
export const getMisEquipos = async (user) => {
  if (!user || !user.uid) {
    throw new Error("Usuario no autenticado o sin Firebase UID");
  }

  return await equipoModel.findByFirebaseUid(user.uid);
};

export const getById = async (id) => {
  return await equipoModel.findById(id);
};

export const create = async (equipo, user) => {
  if (!user || !user.uid) {
    throw new Error("Usuario no autenticado o sin Firebase UID");
  }

  // Solo asignar Firebase UID, los datos se obtienen después
  equipo.firebase_uid = user.uid;
  equipo.id_usuario_creador = null; // Ya no usamos usuarios de BD

  const nuevoEquipo = await equipoModel.create(equipo);
  await historialModel.create(nuevoEquipo.id_equipo);
  return nuevoEquipo;
};

export const update = async (id, equipo, user) => {
  if (!user || !user.uid) {
    throw new Error("Usuario no autenticado o sin Firebase UID");
  }

  // Si es admin o superadmin, puede editar cualquier equipo
  if (user.role === "admin" || user.role === "superadmin") {
    return await equipoModel.update(id, equipo);
  }

  // Verificar que el equipo pertenece al usuario (solo Firebase)
  const pertenece = await equipoModel.belongsToFirebaseUser(id, user.uid);

  if (!pertenece) {
    throw new Error("No tienes permiso para editar este equipo");
  }

  return await equipoModel.update(id, equipo);
};

export const remove = async (id, user) => {
  if (!user || !user.uid) {
    throw new Error("Usuario no autenticado o sin Firebase UID");
  }

  // Obtener el equipo para ver si tiene logo_url
  const equipo = await equipoModel.findById(id);

  if (!equipo) {
    throw new Error("Equipo no encontrado");
  }
  // Si es Admin o Superadmin, puede eliminar cualquier equipo
  if (user.role === "Admin" || user.role === "Superadmin") {
    // Eliminar imagen de Cloudinary si existe
    if (equipo.logo_url) {
      await eliminarImagenCloudinary(equipo.logo_url);
    }
    return await equipoModel.remove(id);
  }

  // Verificar que el equipo pertenece al usuario (solo Firebase)
  const pertenece = await equipoModel.belongsToFirebaseUser(id, user.uid);

  if (!pertenece) {
    throw new Error("No tienes permiso para eliminar este equipo");
  }

  // Eliminar imagen de Cloudinary si existe
  if (equipo.logo_url) {
    await eliminarImagenCloudinary(equipo.logo_url);
  }

  return await equipoModel.remove(id);
};

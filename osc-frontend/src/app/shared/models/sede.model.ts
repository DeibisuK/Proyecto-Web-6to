import { Sede } from "./canchas.model";

export interface Sedes extends Sede {
  ciudad?: string;
  telefono?: string;
  email?: string;
  estado: string;
  latitud?: number;
  longitud?: number;
}

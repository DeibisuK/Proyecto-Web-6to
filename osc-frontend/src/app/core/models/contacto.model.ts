export interface ContactoForm {
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
  sede: string;
  tipo: string;
  mensaje: string;
}

export interface ContactoRequest {
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string;
  asunto: string;
  mensaje: string;
}

export interface MetodoPago {
  id_metodo_pago: number;
  firebase_uid: string;
  numero_tarjeta: string; // Vendrá enmascarado desde la API (****1234)
  fecha_expiracion: string;
  cvv: string; // Siempre será "***" desde la API
  banco: string;
  tipo_tarjeta: string;
  fecha_creacion: string;
  fecha_actualizacion?: string;
}

export interface MetodoPagoRequest {
  firebase_uid: string;
  numero_tarjeta: string; // Número completo, se encripta en el backend
  fecha_expiracion: string; // Formato: YYYY-MM-DD o MM/YY
  cvv: string; // Se encripta en el backend
}

export interface MetodoPagoResponse {
  message: string;
  metodo: MetodoPago;
}

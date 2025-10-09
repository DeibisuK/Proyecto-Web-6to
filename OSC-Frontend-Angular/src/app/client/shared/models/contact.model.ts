export interface ContactForm {
  nombres: string;
  email: string;
  telefono: string;
  sede: string;
  tipo: string;
  mensaje: string;
}

export interface ContactInfo {
  address: string;
  phone: string;
  email: string;
  hours: string;
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}
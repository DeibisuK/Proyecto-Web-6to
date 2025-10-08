import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-preguntas-frecuentes',
  imports: [CommonModule ],
  templateUrl: './preguntas-frecuentes.html',
  styleUrl: './preguntas-frecuentes.css',
})
export class PreguntasFrecuentes {
  preguntaAbierta: number | null = null;

  togglePregunta(index: number) {
    this.preguntaAbierta = this.preguntaAbierta === index ? null : index;
  }
  // Preguntas para la seccion de preguntas frecuentes, aqui quitamos o agregamos como querramos
  preguntas = [
    {
      pregunta: '¿Cuáles son los horarios de atención?',
      respuesta:
        'Nuestros complejos deportivos están abiertos de lunes a viernes de 6:00 AM a 10:00 PM, y los fines de semana de 7:00 AM a 9:00 PM. Algunas canchas o actividades específicas pueden tener horarios diferentes.',
    },
    {
      pregunta: '¿Cómo se realizan los pagos?',
      respuesta:
        'Los pagos dentro de la plataforma son simulados y no requieren información bancaria real. Esto permite a los usuarios practicar el proceso de reserva y compra de manera segura durante la etapa de desarrollo.',
    },
    {
      pregunta: '¿Qué es Oro Sports Club?',
      respuesta:
        'Oro Sports Club es un complejo deportivo moderno que ofrece una amplia variedad de canchas, actividades y servicios. Destaca por su infraestructura de calidad, atención personalizada y programas para deportistas de todos los niveles.',
    },
    {
      pregunta: '¿Tienen una sección de ventas en línea?',
      respuesta:
        'Sí, contamos con un módulo de comercio electrónico donde los usuarios pueden explorar y comprar calzado deportivo, ropa especializada, accesorios como pelotas y raquetas, así como equipamiento para distintas disciplinas.',
    },
    {
      pregunta: '¿Las facturas y reservas incluyen algún tipo de verificación?',
      respuesta:
        'Sí, cada factura y reserva generada en la plataforma incluye un código QR único que permite verificar de forma rápida y segura la validez de la compra o pago realizado.',
    },
    // ,{
    //   pregunta: '¿Puedo reservar canchas o actividades sin membresía?',
    //   respuesta:
    //     'Sí, no es obligatorio tener una membresía para acceder a las instalaciones. Puedes realizar reservas y compras puntuales directamente desde la plataforma, con la opción de obtener beneficios adicionales si decides registrarte como socio.',
    // },
  ];
}

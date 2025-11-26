import nodemailer from "nodemailer";

export const enviarCorreo = async ({
  nombres,
  apellidos,
  telefono,
  email,
  asunto,
  mensaje,
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "noreplycinebyte@gmail.com",
      pass: "yzkx vkye nyuk zdxg",
    },
  });

  const mailOptions = {
    from: email,
    to: "noreplycinebyte@gmail.com",
    subject: `Nuevo mensaje de contacto de OSC Sports`,
    html: `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <!-- Header -->
      <div style="background-color: #2ECC71; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">
          OSC Sports
        </h1>
        <p style="margin: 8px 0 0 0; font-size: 16px; color: #ffffff; font-weight: 500;">
          Nuevo mensaje de contacto
        </p>
      </div>

      <!-- Content -->
      <div style="padding: 30px; background-color: #f8f9fa;">
        <p style="color: #495057; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
          Has recibido un nuevo mensaje desde el formulario de contacto de la web. Por favor, responde a la brevedad posible.
        </p>

        <!-- Info Table -->
        <table style="width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; overflow: hidden; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 15px 20px; font-weight: 600; color: #2ECC71; width: 35%; border-bottom: 1px solid #e9ecef;">Nombres:</td>
            <td style="padding: 15px 20px; color: #212529; border-bottom: 1px solid #e9ecef;">${nombres}</td>
          </tr>
          <tr>
            <td style="padding: 15px 20px; font-weight: 600; color: #2ECC71; border-bottom: 1px solid #e9ecef;">Apellidos:</td>
            <td style="padding: 15px 20px; color: #212529; border-bottom: 1px solid #e9ecef;">${apellidos}</td>
          </tr>
          <tr>
            <td style="padding: 15px 20px; font-weight: 600; color: #2ECC71; border-bottom: 1px solid #e9ecef;">Teléfono:</td>
            <td style="padding: 15px 20px; color: #212529; border-bottom: 1px solid #e9ecef;">${telefono}</td>
          </tr>
          <tr>
            <td style="padding: 15px 20px; font-weight: 600; color: #2ECC71; border-bottom: 1px solid #e9ecef;">Email:</td>
            <td style="padding: 15px 20px; border-bottom: 1px solid #e9ecef;">
              <a href="mailto:${email}" style="color: #2ECC71; text-decoration: none; font-weight: 500;">
                ${email}
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 15px 20px; font-weight: 600; color: #2ECC71; border-bottom: 1px solid #e9ecef;">Sede:</td>
            <td style="padding: 15px 20px; color: #212529; border-bottom: 1px solid #e9ecef;">${asunto}</td>
          </tr>
          <tr>
            <td style="padding: 15px 20px; font-weight: 600; color: #2ECC71;">Tipo:</td>
            <td style="padding: 15px 20px; color: #212529;">${
              mensaje.split("\n")[0]
            }</td>
          </tr>
        </table>

        <!-- Message -->
        <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #2ECC71; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #2ECC71;">Comentario:</h3>
          <p style="margin: 0; color: #212529; line-height: 1.6; font-size: 14px;">
            ${mensaje.replace(/\n/g, "<br>")}
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
        <p style="margin: 0; font-size: 12px; color: #6c757d;">
          Este mensaje fue enviado automáticamente desde el formulario de contacto de <span style="color: #2ECC71; font-weight: 600;">OSC Sports</span>
        </p>
      </div>
    </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

export const enviarCorreoBienvenida = async ({ nombre, email }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "noreplycinebyte@gmail.com",
      pass: "yzkx vkye nyuk zdxg",
    },
  });

  const mailOptions = {
    from: "noreplycinebyte@gmail.com",
    to: email,
    subject: "¡Bienvenido a Oro Sports Club!",
    html: `
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <!-- Header con logo -->
      <div style="background: linear-gradient(135deg, #2ECC71 0%, #27AE60 100%); padding: 40px 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <i class="fas fa-trophy" style="margin-right: 10px;"></i>Oro Sports Club
        </h1>
        <p style="margin: 12px 0 0 0; font-size: 18px; color: #ffffff; font-weight: 500; opacity: 0.95;">
          ¡Bienvenido a la comunidad deportiva!
        </p>
      </div>

      <!-- Contenido principal -->
      <div style="padding: 40px 30px; background-color: #ffffff;">
        <h2 style="color: #2c3e50; font-size: 24px; font-weight: 700; margin: 0 0 20px 0;">
          ¡Hola ${nombre}! <i class="fas fa-hand-wave" style="color: #2ECC71;"></i>
        </h2>
        
        <p style="color: #34495e; font-size: 16px; line-height: 1.8; margin: 0 0 25px 0;">
          Gracias por unirte a <strong style="color: #2ECC71;">Oro Sports Club</strong>, tu plataforma multideportiva completa. Estamos emocionados de tenerte con nosotros y ayudarte a llevar tu experiencia deportiva al siguiente nivel.
        </p>

        <p style="color: #34495e; font-size: 16px; line-height: 1.8; margin: 0 0 30px 0;">
          Oro Sports Club es un proyecto universitario innovador que integra todo lo que necesitas para tu actividad deportiva en un solo lugar.
        </p>

        <!-- Características principales -->
        <div style="background: linear-gradient(135deg, #f8f9fa 0%, #ecf0f1 100%); border-radius: 12px; padding: 30px; margin: 30px 0;">
          <h3 style="color: #2ECC71; font-size: 20px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
            <i class="fas fa-star" style="margin-right: 8px;"></i>¿Qué puedes hacer en OSC?
          </h3>
          
          <div style="margin: 20px 0;">
            <div style="display: flex; align-items: start; margin-bottom: 18px;">
              <div style="background-color: #2ECC71; color: white; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; margin-right: 15px; flex-shrink: 0;"><i class="fas fa-building"></i></div>
              <div>
                <strong style="color: #2c3e50; font-size: 16px;">Reserva de Canchas</strong>
                <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 14px; line-height: 1.6;">Reserva canchas deportivas en múltiples sedes con disponibilidad en tiempo real.</p>
              </div>
            </div>

            <div style="display: flex; align-items: start; margin-bottom: 18px;">
              <div style="background-color: #2ECC71; color: white; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; margin-right: 15px; flex-shrink: 0;"><i class="fas fa-trophy"></i></div>
              <div>
                <strong style="color: #2c3e50; font-size: 16px;">Torneos Deportivos</strong>
                <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 14px; line-height: 1.6;">Participa en torneos, inscribe tu equipo y compite con otros deportistas.</p>
              </div>
            </div>

            <div style="display: flex; align-items: start; margin-bottom: 18px;">
              <div style="background-color: #2ECC71; color: white; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; margin-right: 15px; flex-shrink: 0;"><i class="fas fa-users"></i></div>
              <div>
                <strong style="color: #2c3e50; font-size: 16px;">Gestión de Equipos</strong>
                <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 14px; line-height: 1.6;">Crea y administra tus equipos deportivos, gestiona jugadores y organízate mejor.</p>
              </div>
            </div>

            <div style="display: flex; align-items: start; margin-bottom: 18px;">
              <div style="background-color: #2ECC71; color: white; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; margin-right: 15px; flex-shrink: 0;"><i class="fas fa-shopping-bag"></i></div>
              <div>
                <strong style="color: #2c3e50; font-size: 16px;">Tienda Deportiva</strong>
                <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 14px; line-height: 1.6;">Accede a nuestra tienda con equipamiento, ropa deportiva, accesorios y calzado.</p>
              </div>
            </div>

            <div style="display: flex; align-items: start;">
              <div style="background-color: #2ECC71; color: white; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; margin-right: 15px; flex-shrink: 0;"><i class="fas fa-map-marker-alt"></i></div>
              <div>
                <strong style="color: #2c3e50; font-size: 16px;">Múltiples Sedes</strong>
                <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 14px; line-height: 1.6;">Encuentra la sede más cercana a ti y disfruta de nuestras instalaciones.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Call to action -->
        <div style="text-align: center; margin: 35px 0;">
          <p style="color: #34495e; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
            ¡Empieza a explorar todo lo que tenemos para ti!
          </p>
        </div>

        <!-- Nota de privacidad -->
        <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 8px; margin: 30px 0 0 0;">
          <p style="margin: 0 0 12px 0; color: #856404; font-size: 13px; line-height: 1.6; font-weight: 600;">
            <i class="fas fa-exclamation-circle" style="margin-right: 5px;"></i>Nota Importante:
          </p>
          <p style="margin: 0 0 10px 0; color: #856404; font-size: 13px; line-height: 1.6;">
            <strong>Oro Sports Club</strong> es un proyecto académico/universitario. Tu información está protegida y será utilizada únicamente con fines educativos y de demostración.
          </p>
          <p style="margin: 0; color: #856404; font-size: 13px; line-height: 1.6;">
            La información contenida en este e-mail es confidencial y solo puede ser utilizada por el individuo o la entidad a la cual está dirigido. <strong>OSC</strong> nunca solicitará información financiera ni claves vía telefónica, correos electrónicos o redes sociales.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div style="background-color: #2c3e50; padding: 30px; text-align: center;">
        <p style="margin: 0 0 8px 0; font-size: 14px; color: #ecf0f1; font-weight: 600;">
          Oro Sports Club
        </p>
        <p style="margin: 0 0 15px 0; font-size: 13px; color: #95a5a6;">
          Tu plataforma multideportiva integral
        </p>
        <div style="margin: 15px 0;">
          <p style="margin: 0; font-size: 12px; color: #7f8c8d; line-height: 1.5;">
            <i class="fas fa-envelope" style="margin-right: 5px;"></i><a href="mailto:noreplycinebyte@gmail.com" style="color: #2ECC71; text-decoration: none;">noreplycinebyte@gmail.com</a>
          </p>
        </div>
        <p style="margin: 15px 0 0 0; font-size: 11px; color: #7f8c8d; line-height: 1.5;">
          Este es un correo automático, por favor no responder directamente.
        </p>
      </div>
    </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
};

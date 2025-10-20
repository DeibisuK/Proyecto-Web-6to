import nodemailer from 'nodemailer';

export const enviarCorreo = async ({ 
  nombres, 
  apellidos, 
  telefono, 
  email, 
  asunto, 
  mensaje 
}) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'noreplycinebyte@gmail.com',
      pass: 'yzkx vkye nyuk zdxg'
    }
  });

  const mailOptions = {
    from: email,
    to: 'noreplycinebyte@gmail.com',
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
            <td style="padding: 15px 20px; color: #212529;">${mensaje.split('\n')[0]}</td>
          </tr>
        </table>

        <!-- Message -->
        <div style="background-color: #ffffff; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #2ECC71; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #2ECC71;">Comentario:</h3>
          <p style="margin: 0; color: #212529; line-height: 1.6; font-size: 14px;">
            ${mensaje.replace(/\n/g, '<br>')}
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
    `
  };

  return await transporter.sendMail(mailOptions);
};

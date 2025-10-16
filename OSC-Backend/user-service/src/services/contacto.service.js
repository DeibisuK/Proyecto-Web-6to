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
      pass: 'ykga uoxf eiyu caic'
    }
  });

  const mailOptions = {
    from: email,
    to: 'noreplyoscsports@gmail.com',
    subject: `Nuevo mensaje de contacto: ${asunto}`,
    html: `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: auto; border: 2px solid #2ECC71; border-radius: 12px; padding: 32px; background: #ECF0F1;">
      <div style="text-align: center; margin-bottom: 24px; border-bottom: 3px solid #2ECC71; padding-bottom: 16px;">
        <h1 style="color: #2C3E50; margin: 0; font-size: 32px; font-weight: 700;">
          🏟️ OSC Sports
        </h1>
        <h2 style="color: #34495E; margin: 8px 0 0 0; font-weight: 600; font-size: 20px;">
          Nuevo Mensaje de Contacto
        </h2>
      </div>
      
      <p style="color: #2C3E50; font-size: 15px; margin-bottom: 24px; line-height: 1.6;">
        Has recibido un nuevo mensaje desde el formulario de contacto del sitio web. 
        Por favor, responde a la brevedad posible.
      </p>

      <div style="background: #ffffff; border-radius: 8px; padding: 24px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <h3 style="color: #2ECC71; margin-top: 0; font-size: 18px; font-weight: 600; border-bottom: 2px solid #2ECC71; padding-bottom: 8px;">
          Información del Contacto
        </h3>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr>
            <td style="padding: 10px; font-weight: 600; color: #2C3E50; width: 35%;">Nombres:</td>
            <td style="padding: 10px; color: #34495E;">${nombres}</td>
          </tr>
          <tr style="background: #ECF0F1;">
            <td style="padding: 10px; font-weight: 600; color: #2C3E50;">Apellidos:</td>
            <td style="padding: 10px; color: #34495E;">${apellidos}</td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: 600; color: #2C3E50;">Teléfono:</td>
            <td style="padding: 10px; color: #34495E;">${telefono}</td>
          </tr>
          <tr style="background: #ECF0F1;">
            <td style="padding: 10px; font-weight: 600; color: #2C3E50;">Email:</td>
            <td style="padding: 10px; color: #34495E;">
              <a href="mailto:${email}" style="color: #2ECC71; text-decoration: none; font-weight: 600;">
                ${email}
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px; font-weight: 600; color: #2C3E50;">Asunto:</td>
            <td style="padding: 10px; color: #34495E; font-weight: 600;">${asunto}</td>
          </tr>
        </table>
      </div>

      <div style="background: linear-gradient(135deg, #2ECC71, #27AE60); border-radius: 8px; padding: 20px; margin: 20px 0; box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);">
        <h3 style="color: #ffffff; margin-top: 0; font-size: 18px; font-weight: 600; margin-bottom: 12px;">
          💬 Mensaje:
        </h3>
        <div style="background: rgba(255, 255, 255, 0.95); border-radius: 6px; padding: 16px; color: #2C3E50; line-height: 1.6; font-size: 14px;">
          ${mensaje.replace(/\n/g, '<br>')}
        </div>
      </div>

      <div style="background: rgba(46, 204, 113, 0.1); border-left: 4px solid #2ECC71; border-radius: 4px; padding: 16px; margin: 24px 0;">
        <p style="color: #2C3E50; margin: 0; font-size: 14px; font-weight: 500;">
          📋 <strong>Recordatorio:</strong> Responde directamente a 
          <a href="mailto:${email}" style="color: #2ECC71; text-decoration: none; font-weight: 600;">
            ${email}
          </a> 
          para continuar la conversación.
        </p>
      </div>

      <div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 2px solid #BDC3C7;">
        <p style="color: #7F8C8D; font-size: 13px; margin: 0;">
          Este correo fue enviado automáticamente desde el formulario de contacto de 
          <span style="color: #2ECC71; font-weight: 600;">OSC Sports</span>
        </p>
        <p style="color: #95A5A6; font-size: 12px; margin: 8px 0 0 0;">
          © ${new Date().getFullYear()} OSC Sports - Sistema de Gestión de Canchas Deportivas
        </p>
      </div>
    </div>
    `
  };

  return await transporter.sendMail(mailOptions);
};

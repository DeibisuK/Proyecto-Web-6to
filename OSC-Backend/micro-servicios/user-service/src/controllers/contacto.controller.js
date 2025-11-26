import * as service from '../services/contacto.service.js';

export const enviarContacto = async (req, res) => {
  try {
    await service.enviarCorreo(req.body);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error sending email', 
      error: error.message 
    });
  }
};

export const enviarBienvenida = async (req, res) => {
  try {
    const { nombre, email } = req.body;
    if (!nombre || !email) {
      return res.status(400).json({
        success: false,
        message: 'Nombre y email son requeridos',
      });
    }
    await service.enviarCorreoBienvenida({ nombre, email });
    res.status(200).json({ 
      success: true, 
      message: 'Correo de bienvenida enviado' 
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error al enviar el correo de bienvenida',
      error: error.message
    });
  }
};

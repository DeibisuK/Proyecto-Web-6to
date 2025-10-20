import * as service from '../services/contacto.service.js';

export const enviarContacto = async (req, res) => {
  try {
    await service.enviarCorreo(req.body);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({ 
      message: 'Error sending email', 
      error: error.message 
    });
  }
};

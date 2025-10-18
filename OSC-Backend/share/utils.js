export async function eliminarImagenCloudinary(imageUrl) {
  try {
    const matches = imageUrl.match(/\/v\d+\/(.+)\.\w+$/);
    if (matches && matches[1]) {
      const publicId = matches[1];
      
      // Llamar al servicio de Cloudinary para eliminar
      const cloudinaryServiceUrl = process.env.CLOUDINARY_SERVICE_URL || "http://localhost:3000/i/imagen";

      const response = await fetch(`${cloudinaryServiceUrl}/delete-imagen`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_id: publicId }),
      });

      if (response.ok) {
        console.log(`Imagen eliminada de Cloudinary: ${publicId}`);
      } else {
        console.warn(
          `No se pudo eliminar la imagen de Cloudinary: ${publicId}`
        );
      }
    }
  } catch (error) {
    console.error("Error al eliminar imagen de Cloudinary:", error.message);
  }
}
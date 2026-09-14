/**
 * Comprime una imagen del navegador a un tamaño razonable para guardar en la base de datos.
 * Redimensiona a máximo 800px de ancho/alto y comprime a JPEG calidad 0.6.
 * Resultado: ~30KB-100KB base64 en vez de 500KB+ original.
 */
export function compressImage(file: File, maxWidth = 800, quality = 0.6): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Error al leer la imagen'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Error al cargar la imagen'));
      img.onload = () => {
        // Calcular dimensiones preservando proporción
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        if (height > maxWidth) {
          width = Math.round((width * maxWidth) / height);
          height = maxWidth;
        }

        // Dibujar en canvas comprimido
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          // Fallback: devolver original como base64
          resolve(e.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        // Exportar como JPEG comprimido
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Comprime una imagen ya existente en base64 (para migrar datos viejos).
 */
export function compressBase64Image(base64: string, maxWidth = 800, quality = 0.6): Promise<string> {
  return new Promise((resolve) => {
    // Si no es base64 o es una URL normal, devolver sin cambios
    if (!base64.startsWith('data:image')) {
      resolve(base64);
      return;
    }

    const img = new Image();
    img.onerror = () => resolve(base64); // fallback: devolver original
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Si ya es pequeña, no comprimir
      if (width <= maxWidth && height <= maxWidth && base64.length < 150000) {
        resolve(base64);
        return;
      }

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxWidth) {
        width = Math.round((width * maxWidth) / height);
        height = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(base64);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.src = base64;
  });
}

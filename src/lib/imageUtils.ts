import { Database } from '../types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

export async function cropAndResizeImage(file: File, size = 400): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    img.onload = () => {
      // Calculate the square crop dimensions
      const minDimension = Math.min(img.width, img.height);
      const startX = (img.width - minDimension) / 2;
      const startY = (img.height - minDimension) / 2;

      // Set canvas dimensions to desired size
      canvas.width = size;
      canvas.height = size;

      // Draw the cropped and resized image
      ctx.drawImage(
        img,
        startX,
        startY,
        minDimension,
        minDimension,
        0,
        0,
        size,
        size
      );

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/jpeg',
        0.9
      );
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = URL.createObjectURL(file);
  });
}

export async function uploadProfileImage(
  file: File,
  supabase: any,
  profile: Profile | null
): Promise<string> {
  try {
    // Crop and resize the image
    const croppedImage = await cropAndResizeImage(file);

    // Generate a random filename
    const fileExt = 'jpg'; // We're converting all images to JPEG
    const fileName = `${Math.random()}.${fileExt}`;

    // Delete old avatar if exists
    if (profile?.avatar_url) {
      const oldFileName = profile.avatar_url.split('/').pop();
      if (oldFileName) {
        await supabase.storage
          .from('profile')
          .remove([oldFileName]);
      }
    }

    // Upload the cropped image
    const { error: uploadError } = await supabase.storage
      .from('profile')
      .upload(fileName, croppedImage, {
        contentType: 'image/jpeg',
      });

    if (uploadError) throw uploadError;

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}
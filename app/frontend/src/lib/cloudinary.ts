const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';

/**
 * Check if Cloudinary is configured with required environment variables.
 */
export function isCloudinaryConfigured(): boolean {
  return Boolean(CLOUD_NAME && UPLOAD_PRESET);
}

/**
 * Upload a single file to Cloudinary using unsigned upload.
 * Returns the secure_url of the uploaded file.
 */
export async function uploadToCloudinary(file: File): Promise<string> {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      `Cloudinary upload failed: ${errorData?.error?.message || response.statusText}`
    );
  }

  const data = await response.json();
  return data.secure_url;
}

/**
 * Upload multiple files to Cloudinary in parallel.
 * Returns an array of secure_urls.
 */
export async function uploadMultipleToCloudinary(files: File[]): Promise<string[]> {
  const results = await Promise.all(files.map((file) => uploadToCloudinary(file)));
  return results;
}
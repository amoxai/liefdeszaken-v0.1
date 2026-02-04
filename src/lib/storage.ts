import { createClient } from '@supabase/supabase-js';

// Storage bucket names
export const STORAGE_BUCKETS = {
  PRODUCT_IMAGES: 'product-images',
  CATEGORY_IMAGES: 'category-images',
  BANNERS: 'banners',
  LOGOS: 'logos',
  REWARDS_IMAGES: 'rewards-images',
} as const;

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS];

// Get the public URL for a file in storage
export function getStorageUrl(bucket: StorageBucket, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    console.warn('NEXT_PUBLIC_SUPABASE_URL not set');
    return '';
  }
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

// Get product image URL
export function getProductImageUrl(filename: string): string {
  return getStorageUrl(STORAGE_BUCKETS.PRODUCT_IMAGES, filename);
}

// Get category image URL
export function getCategoryImageUrl(filename: string): string {
  return getStorageUrl(STORAGE_BUCKETS.CATEGORY_IMAGES, filename);
}

// Get banner image URL
export function getBannerUrl(filename: string): string {
  return getStorageUrl(STORAGE_BUCKETS.BANNERS, filename);
}

// Get logo URL
export function getLogoUrl(filename: string): string {
  return getStorageUrl(STORAGE_BUCKETS.LOGOS, filename);
}

// Get reward image URL
export function getRewardImageUrl(filename: string): string {
  return getStorageUrl(STORAGE_BUCKETS.REWARDS_IMAGES, filename);
}

// Upload file to storage (client-side)
export async function uploadFile(
  supabase: ReturnType<typeof createClient>,
  bucket: StorageBucket,
  path: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    return { url: null, error: error.message };
  }

  const url = getStorageUrl(bucket, data.path);
  return { url, error: null };
}

// Delete file from storage
export async function deleteFile(
  supabase: ReturnType<typeof createClient>,
  bucket: StorageBucket,
  path: string
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

// List files in a bucket folder
export async function listFiles(
  supabase: ReturnType<typeof createClient>,
  bucket: StorageBucket,
  folder?: string
): Promise<{ files: string[]; error: string | null }> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .list(folder || '', {
      limit: 100,
      offset: 0,
    });

  if (error) {
    return { files: [], error: error.message };
  }

  const files = data
    .filter(item => item.name !== '.emptyFolderPlaceholder')
    .map(item => folder ? `${folder}/${item.name}` : item.name);
  
  return { files, error: null };
}

// Generate a unique filename
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalFilename.split('.').pop() || 'jpg';
  return `${timestamp}-${random}.${extension}`;
}

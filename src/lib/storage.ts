import { File } from 'expo-file-system';

import { supabase } from './supabase';

export async function uploadToBucket(
  bucket: string,
  path: string,
  localUri: string,
  contentType: string,
): Promise<string> {
  const bytes = await new File(localUri).arrayBuffer();
  const { error } = await supabase.storage.from(bucket).upload(path, bytes, { contentType, upsert: true });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

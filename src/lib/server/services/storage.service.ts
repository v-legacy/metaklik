import { createClient } from '@supabase/supabase-js';

export class SupabaseStorageService {
  private supabase;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase Storage environment variables are not set.');
    }

    // Initialize Supabase Client with Service Role Key for server-side operations
    this.supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  /**
   * Upload a base64 encoded image to Supabase Storage
   * @param base64Data The base64 string (e.g. data:image/png;base64,...)
   * @param bucket The Supabase storage bucket name
   * @param filename Optional filename (if not provided, a random UUID will be generated)
   * @returns The public URL of the uploaded image
   */
  async uploadBase64Image(base64Data: string, bucket: string, filename?: string): Promise<string> {
    // 1. Extract content type and base64 string
    const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 image data');
    }

    const contentType = matches[1];
    const base64String = matches[2];
    const extension = contentType.split('/')[1] || 'jpg';
    
    // Convert base64 to buffer
    const buffer = Buffer.from(base64String, 'base64');
    
    // Generate unique filename if not provided
    const uniqueFilename = filename || `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${extension}`;

    // 2. Upload to Supabase Storage
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(uniqueFilename, buffer, {
        contentType: contentType,
        upsert: true,
      });

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`);
    }

    // 3. Get the public URL
    const { data: publicUrlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  }
}

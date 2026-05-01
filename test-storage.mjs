import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function run() {
  const base64String = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
  const buffer = Buffer.from(base64String, 'base64');
  
  const { data, error } = await supabase.storage
    .from('metaklik')
    .upload('test.png', buffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (error) {
    console.error("Upload error:", error);
  } else {
    console.log("Upload success:", data);
  }
}

run();

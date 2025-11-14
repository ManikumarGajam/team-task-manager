import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export async function uploadToSupabase(buffer, filename, mimetype) {
  const filePath = `${Date.now()}-${filename}`;
  console.log("Supabase upload start:", filePath);

  const { data, error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET)
    .upload(filePath, buffer, { contentType: mimetype });

  if (error) {
    console.error("Supabase upload error:", error);
    throw error;
  }

  const { data: publicData, error: publicErr } = supabase.storage
    .from(process.env.SUPABASE_BUCKET)
    .getPublicUrl(filePath);

  if (publicErr) {
    console.error("Supabase getPublicUrl error:", publicErr);
    throw publicErr;
  }

  console.log("Supabase upload done:", publicData);
  return { url: publicData.publicUrl, filePath };
}

export async function deleteFromSupabase(filePath) {
  const { error } = await supabase.storage
    .from(process.env.SUPABASE_BUCKET)
    .remove([filePath]);

  if (error) throw error;

  return true;
}

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function generateThumbnail(fileUrl: string, fileType: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-thumbnail', {
      body: { fileUrl, fileType }
    })

    if (error) {
      console.error('Error generating thumbnail:', error)
      return null
    }

    return data?.thumbnailUrl || null
  } catch (error) {
    console.error('Error calling thumbnail function:', error)
    return null
  }
}
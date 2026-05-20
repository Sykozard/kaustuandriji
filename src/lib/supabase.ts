import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://crlgtbhmtagsrmxpewch.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2b3ZtZXdoa2Nwa3NkeW94bmV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkyNDczMDgsImV4cCI6MjA5NDgyMzMwOH0.vA9HEu7A2arVMwTYv2jCcPec_Si1CyoVejiGuynGE9s'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const MEMORIES_BUCKET = 'memories'
const LOCAL_KEY = 'kaustuandriji_memories'

export interface Memory {
  id: string
  image_url: string
  uploader: 'Kaustu' | 'Riji'
  caption?: string
  created_at: string
}

function getLocalMemories(): Memory[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalMemory(memory: Memory) {
  const all = getLocalMemories()
  const updated = [memory, ...all.filter(m => m.id !== memory.id)]
  localStorage.setItem(LOCAL_KEY, JSON.stringify(updated))
}

function removeLocalMemory(id: string) {
  const all = getLocalMemories()
  localStorage.setItem(LOCAL_KEY, JSON.stringify(all.filter(m => m.id !== id)))
}

export async function uploadMemory(
  file: File,
  uploader: 'Kaustu' | 'Riji',
  caption?: string
): Promise<{ success: boolean; error?: string; memory?: Memory }> {
  try {
    const fileExt = file.name.split('.').pop() || 'jpg'
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

    const { error: uploadError } = await supabase.storage
      .from(MEMORIES_BUCKET)
      .upload(fileName, file, { cacheControl: '3600', upsert: false })

    if (uploadError) {
      return { success: false, error: uploadError.message }
    }

    const { data } = supabase.storage
      .from(MEMORIES_BUCKET)
      .getPublicUrl(fileName)

    const newMemory: Memory = {
      id: fileName,
      image_url: data.publicUrl,
      uploader,
      caption: caption || undefined,
      created_at: new Date().toISOString(),
    }

    // Try DB insert, fall back to localStorage for metadata
    const { error: insertError } = await supabase
      .from('memories')
      .insert({
        id: fileName,
        image_url: data.publicUrl,
        uploader,
        caption: caption || null,
        created_at: newMemory.created_at,
      })

    if (insertError) {
      // DB table might not exist — persist metadata locally
      saveLocalMemory(newMemory)
    }

    return { success: true, memory: newMemory }
  } catch (error) {
    console.error(error)
    return { success: false, error: 'Failed to upload memory' }
  }
}

export async function fetchMemories(): Promise<Memory[]> {
  // Try DB first
  const { data, error } = await supabase
    .from('memories')
    .select('*')
    .order('created_at', { ascending: false })

  if (!error && data && data.length > 0) {
    return data as Memory[]
  }

  // If DB fails or is empty, try listing storage + local metadata fallback
  if (error) {
    console.warn('DB fetch failed, using local metadata:', error.message)
    // Return locally stored memories
    return getLocalMemories()
  }

  return []
}

export async function deleteMemory(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error: storageError } = await supabase.storage
      .from(MEMORIES_BUCKET)
      .remove([id])

    if (storageError) {
      return { success: false, error: storageError.message }
    }

    // Remove from DB
    await supabase.from('memories').delete().eq('id', id)
    // Also remove from local fallback
    removeLocalMemory(id)

    return { success: true }
  } catch {
    return { success: false, error: 'Failed to delete memory' }
  }
}

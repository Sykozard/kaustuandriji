import { useState, useEffect, useCallback, memo } from 'react'
import { X, Loader2, Trash2, Plus, Image as ImageIcon, Heart } from 'lucide-react'
import { format } from 'date-fns'
import { useIdentity } from '@/hooks/use-identity'
import { PasswordModal } from '@/components/password-modal'
import { uploadMemory, fetchMemories, deleteMemory, Memory } from '@/lib/supabase'
import { UPLOAD_PASSWORD } from '@/lib/constants'
import { cn } from '@/lib/utils'

const MemoryCard = memo(function MemoryCard({
  memory,
  onSelect,
  onDelete
}: {
  memory: Memory
  onSelect: () => void
  onDelete: () => void
}) {
  return (
    <div
      className="glass rounded-2xl overflow-hidden group cursor-pointer animate-fade-in"
      onClick={onSelect}
    >
      <div className="p-3 pb-4 bg-gradient-to-b from-white/5 to-transparent">
        <div className="relative aspect-square rounded-xl overflow-hidden mb-3">
          <img
            src={memory.image_url}
            alt={memory.caption || 'Memory'}
            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
              <Heart className="w-5 h-5 text-primary fill-primary" />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
                className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-400" />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          {memory.caption && (
            <p className="text-sm text-foreground line-clamp-2">{memory.caption}</p>
          )}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Uploaded by {memory.uploader}</span>
            <span>{format(new Date(memory.created_at), 'MMM d')}</span>
          </div>
        </div>
      </div>
    </div>
  )
})

export function Scrapbook() {
  const { currentUser } = useIdentity()
  const [memories, setMemories] = useState<Memory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [memoryToDelete, setMemoryToDelete] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<Memory | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadMemories = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    const data = await fetchMemories()
    setMemories(data)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    loadMemories()
  }, [loadMemories])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setPreviewUrl(URL.createObjectURL(file))
      setShowUploadModal(true)
    }
  }

  const handleUploadConfirm = () => {
    setShowUploadModal(false)
    setShowPasswordModal(true)
  }

  const handleUpload = async () => {
    if (!selectedFile || !currentUser) return

    setShowPasswordModal(false)
    setIsUploading(true)
    setUploadProgress(0)

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90))
    }, 200)

    const result = await uploadMemory(selectedFile, currentUser, caption)

    clearInterval(progressInterval)
    setUploadProgress(100)

    if (result.success) {
      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        loadMemories()
      }, 2000)
    } else {
      setError(result.error || 'Upload failed')
      setTimeout(() => setError(null), 3000)
    }

    setIsUploading(false)
    setSelectedFile(null)
    setPreviewUrl(null)
    setCaption('')
    setUploadProgress(0)
  }

  const handleDeleteClick = (id: string) => {
    setMemoryToDelete(id)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!memoryToDelete) return
    setShowDeleteModal(false)
    const result = await deleteMemory(memoryToDelete)
    if (result.success) {
      setMemories(prev => prev.filter(m => m.id !== memoryToDelete))
    }
    setMemoryToDelete(null)
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-serif text-foreground text-glow mb-2">
          Our Space
        </h1>
        <p className="text-muted-foreground text-sm">shared memories, forever cherished</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <div className="mb-8 flex justify-center animate-fade-in">
        <label className="relative cursor-pointer">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-medium transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="w-5 h-5" />
            <span>Add Memory</span>
          </div>
        </label>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      )}

      {!isLoading && memories.length === 0 && (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-20 h-20 rounded-full glass mx-auto flex items-center justify-center mb-4">
            <ImageIcon className="w-10 h-10 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground font-serif text-lg">No memories yet...</p>
          <p className="text-muted-foreground text-sm mt-2">Upload your first photo together</p>
        </div>
      )}

      {!isLoading && memories.length > 0 && (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {memories.map((memory) => (
            <div key={memory.id} className="break-inside-avoid">
              <MemoryCard
                memory={memory}
                onSelect={() => setSelectedImage(memory)}
                onDelete={() => handleDeleteClick(memory.id)}
              />
            </div>
          ))}
        </div>
      )}

      {showUploadModal && previewUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => {
            setShowUploadModal(false)
            setSelectedFile(null)
            setPreviewUrl(null)
          }}
        >
          <div
            className="glass rounded-2xl p-6 max-w-md w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-serif text-foreground">New Memory</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setSelectedFile(null)
                  setPreviewUrl(null)
                }}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-square relative rounded-xl overflow-hidden mb-4">
              <img
                src={previewUrl}
                alt="Preview"
                className="object-cover w-full h-full"
              />
            </div>

            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption... (optional)"
              className="w-full px-4 py-3 rounded-xl bg-input border border-border text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 mb-4"
              rows={2}
            />

            <button
              onClick={handleUploadConfirm}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
            >
              Upload as {currentUser}
            </button>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm animate-fade-in">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
            <p className="text-foreground font-serif">Uploading memory...</p>
            <div className="w-48 h-1 bg-secondary rounded-full overflow-hidden mx-auto">
              <div
                className="h-full bg-primary transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="glass rounded-2xl p-8 text-center animate-scale-in">
            <Heart className="w-16 h-16 text-primary fill-primary mx-auto mb-4 animate-heartbeat" />
            <p className="text-xl font-serif text-foreground">memory added</p>
          </div>
        </div>
      )}

      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full glass z-10"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-6 h-6 text-foreground" />
          </button>

          <div
            className="relative max-w-4xl max-h-[80vh] w-full animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.image_url}
              alt={selectedImage.caption || 'Memory'}
              className="rounded-2xl object-contain max-h-[80vh] w-auto mx-auto"
            />

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background/90 to-transparent rounded-b-2xl">
              {selectedImage.caption && <p className="text-foreground">{selectedImage.caption}</p>}
              <p className="text-sm text-muted-foreground mt-1">
                Uploaded by {selectedImage.uploader} on {format(new Date(selectedImage.created_at), 'MMMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>
      )}

      <PasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false)
          setSelectedFile(null)
          setPreviewUrl(null)
        }}
        onSuccess={handleUpload}
        correctPassword={UPLOAD_PASSWORD}
        title="Verify Upload"
        description="Enter password to add this memory"
      />

      <PasswordModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setMemoryToDelete(null)
        }}
        onSuccess={handleDeleteConfirm}
        correctPassword={UPLOAD_PASSWORD}
        title="Confirm Delete"
        description="Enter password to delete this memory"
      />
    </div>
  )
}

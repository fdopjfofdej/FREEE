import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { ImagePlus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"
import { useTranslation } from 'react-i18next'

interface ImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  maxFiles?: number
}

export function ImageUpload({ value = [], onChange, maxFiles = 5 }: ImageUploadProps) {
  const { t } = useTranslation()
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    try {
      setUploading(true)
      const newUrls = []

      for (const file of acceptedFiles) {
        if (value.length + newUrls.length >= maxFiles) break

        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('car-images')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('car-images')
          .getPublicUrl(filePath)

        newUrls.push(publicUrl)
      }

      onChange([...value, ...newUrls])
    } catch (error) {
      console.error('Error uploading image:', error)
    } finally {
      setUploading(false)
    }
  }, [value, onChange, maxFiles])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: maxFiles - value.length,
    disabled: uploading || value.length >= maxFiles
  })

  const removeImage = (index: number) => {
    const newValue = [...value]
    newValue.splice(index, 1)
    onChange(newValue)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {value.map((url, index) => (
          <div key={url} className="relative aspect-[4/3] group">
            <img
              src={url}
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeImage(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {value.length < maxFiles && (
          <div
            {...getRootProps()}
            className={cn(
              "aspect-[4/3] rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer transition-colors",
              isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
              uploading && "opacity-50 cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} />
            <div className="text-center p-4">
              <ImagePlus className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {isDragActive ? t("Déposez vos images ici") : t("Glissez-déposez ou cliquez pour ajouter")}
              </p>
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        {value.length} {t("sur")} {maxFiles} {t("images")} {(maxFiles - value.length)} {t("restantes")}
      </p>
    </div>
  )
}
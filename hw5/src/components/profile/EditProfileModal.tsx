"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { X, Camera, Image as ImageIcon } from "lucide-react"

interface EditProfileModalProps {
  user: any
  onClose: () => void
}

export default function EditProfileModal({ user, onClose }: EditProfileModalProps) {
  const [name, setName] = useState(user.name || "")
  const [bio, setBio] = useState(user.bio || "")
  const [image, setImage] = useState(user.image || "")
  const [coverImage, setCoverImage] = useState(user.coverImage || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [uploading, setUploading] = useState<'avatar' | 'cover' | null>(null)
  
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  // 處理圖片上傳到 Cloudinary
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'echo_preset') // 使用者需要在 Cloudinary 設定
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )
    
    if (!response.ok) {
      throw new Error('圖片上傳失敗')
    }
    
    const data = await response.json()
    return data.secure_url
  }

  // 處理頭像上傳
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 檢查檔案大小 (最大 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('圖片大小不能超過 5MB')
      return
    }

    // 檢查檔案類型
    if (!file.type.startsWith('image/')) {
      setError('只能上傳圖片檔案')
      return
    }

    setUploading('avatar')
    setError('')

    try {
      // 如果有設定 Cloudinary，上傳到雲端
      if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
        const url = await uploadImage(file)
        setImage(url)
      } else {
        // 否則使用 base64（僅供開發）
        const reader = new FileReader()
        reader.onloadend = () => {
          setImage(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    } catch (err) {
      setError('圖片上傳失敗，請稍後再試')
    } finally {
      setUploading(null)
    }
  }

  // 處理背景圖上傳
  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('圖片大小不能超過 5MB')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('只能上傳圖片檔案')
      return
    }

    setUploading('cover')
    setError('')

    try {
      if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
        const url = await uploadImage(file)
        setCoverImage(url)
      } else {
        const reader = new FileReader()
        reader.onloadend = () => {
          setCoverImage(reader.result as string)
        }
        reader.readAsDataURL(file)
      }
    } catch (err) {
      setError('圖片上傳失敗，請稍後再試')
    } finally {
      setUploading(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch(`/api/users/${user.userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, image, coverImage }),
      })

      if (res.ok) {
        onClose()
      } else {
        const data = await res.json()
        setError(data.error || "更新失敗")
      }
    } catch (error) {
      setError("發生錯誤，請稍後再試")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="flex items-center gap-4 w-full">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
            <DialogTitle className="flex-1">編輯個人資料</DialogTitle>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "儲存中..." : "儲存"}
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          {/* 背景圖預覽 */}
          <div>
            <label className="block text-sm font-medium mb-2">背景圖</label>
            <div className="relative h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg overflow-hidden group">
              {coverImage && (
                <img 
                  src={coverImage} 
                  alt="背景圖預覽" 
                  className="w-full h-full object-cover"
                />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                <Button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={uploading !== null}
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 bg-opacity-75 hover:bg-opacity-90"
                >
                  {uploading === 'cover' ? (
                    "上傳中..."
                  ) : (
                    <>
                      <ImageIcon className="h-4 w-4 mr-2" />
                      上傳背景圖
                    </>
                  )}
                </Button>
              </div>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
            </div>
            <Input
              type="url"
              placeholder="或輸入背景圖 URL（選填）"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="mt-2"
              disabled={uploading !== null}
            />
          </div>

          {/* 頭像預覽 */}
          <div>
            <label className="block text-sm font-medium mb-2">頭像</label>
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={image} />
                  <AvatarFallback className="bg-blue-500 text-white text-2xl">
                    {name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploading !== null}
                  className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 rounded-full transition-all flex items-center justify-center cursor-pointer"
                >
                  <Camera className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>
              <div className="flex-1 space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploading !== null}
                  className="w-full"
                >
                  {uploading === 'avatar' ? "上傳中..." : "上傳頭像"}
                </Button>
                <Input
                  type="url"
                  placeholder="或輸入頭像 URL（選填）"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  disabled={uploading !== null}
                />
              </div>
            </div>
          </div>

          {/* 姓名 */}
          <div>
            <label className="block text-sm font-medium mb-2">姓名</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="輸入姓名"
              maxLength={50}
              required
            />
          </div>

          {/* 自我介紹 */}
          <div>
            <label className="block text-sm font-medium mb-2">自我介紹</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="介紹一下自己..."
              maxLength={160}
              rows={3}
            />
            <p className="text-sm text-gray-500 mt-1 text-right">
              {bio.length} / 160
            </p>
          </div>

          {/* 使用者 ID（不可編輯） */}
          <div>
            <label className="block text-sm font-medium mb-2">使用者 ID</label>
            <Input
              type="text"
              value={user.userId}
              disabled
              className="bg-gray-100"
            />
            <p className="text-sm text-gray-500 mt-1">
              使用者 ID 無法修改
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}


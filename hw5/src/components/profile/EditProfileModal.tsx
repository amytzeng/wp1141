"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { X } from "lucide-react"

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
            <div className="h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg overflow-hidden">
              {coverImage && (
                <img 
                  src={coverImage} 
                  alt="背景圖預覽" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <Input
              type="url"
              placeholder="背景圖 URL（選填）"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="mt-2"
            />
          </div>

          {/* 頭像預覽 */}
          <div>
            <label className="block text-sm font-medium mb-2">頭像</label>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={image} />
                <AvatarFallback className="bg-blue-500 text-white text-2xl">
                  {name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <Input
                type="url"
                placeholder="頭像 URL（選填）"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="flex-1"
              />
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


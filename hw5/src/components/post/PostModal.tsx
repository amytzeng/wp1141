"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { X, FileText } from "lucide-react"
import { calculateCharCount } from "@/lib/validations/post"
import { useRouter } from "next/navigation"
import DraftsModal from "./DraftsModal"

interface PostModalProps {
  onClose: () => void
  initialContent?: string
}

export default function PostModal({ onClose, initialContent = "" }: PostModalProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [content, setContent] = useState(initialContent)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [showDraftsModal, setShowDraftsModal] = useState(false)

  const charCount = calculateCharCount(content)
  const remaining = 280 - charCount

  const handlePost = async () => {
    if (charCount > 280 || content.trim().length === 0) return

    setLoading(true)
    setError("")
    
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      if (res.ok) {
        onClose()
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || "發文失敗")
      }
    } catch (error) {
      setError("發生錯誤，請稍後再試")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (content.trim().length > 0) {
      setShowDiscardDialog(true)
    } else {
      onClose()
    }
  }

  const handleSaveDraft = async () => {
    try {
      await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })
      onClose()
    } catch (error) {
      console.error("儲存草稿失敗:", error)
    }
  }

  const handleDiscard = () => {
    onClose()
  }

  const handleLoadDraft = (draftContent: string) => {
    setContent(draftContent)
    setShowDraftsModal(false)
  }

  return (
    <>
      <Dialog open onOpenChange={handleClose}>
        <DialogContent className="max-w-xl">
          <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
            >
              <X className="h-5 w-5" />
            </Button>
            <span className="text-lg font-semibold">撰寫新貼文</span>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowDraftsModal(true)}
              className="text-blue-600"
            >
              <FileText className="mr-1 h-4 w-4" />
              草稿
            </Button>
          </DialogHeader>

          <div className="flex gap-3 pt-4">
            <Avatar>
              <AvatarImage src={session?.user?.image || ""} />
              <AvatarFallback className="bg-blue-500 text-white">
                {session?.user?.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <Textarea
                placeholder="有什麼新鮮事？"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[120px] resize-none border-0 focus-visible:ring-0 text-lg"
                autoFocus
              />

              {error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium ${
                      remaining < 0
                        ? "text-red-500"
                        : remaining < 20
                        ? "text-yellow-500"
                        : "text-gray-500"
                    }`}
                  >
                    {remaining < 20 && `${remaining}`}
                  </span>
                  {remaining < 0 && (
                    <span className="text-xs text-red-500">超過字數限制</span>
                  )}
                </div>

                <Button
                  onClick={handlePost}
                  disabled={loading || charCount > 280 || content.trim().length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "發文中..." : "發文"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 放棄確認對話框 */}
      {showDiscardDialog && (
        <Dialog open onOpenChange={() => setShowDiscardDialog(false)}>
          <DialogContent className="max-w-sm">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">儲存草稿？</h3>
              <p className="text-sm text-gray-600">
                您可以將此貼文儲存為草稿，或是直接捨棄。
              </p>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={handleSaveDraft}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  儲存
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleDiscard}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  捨棄
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowDiscardDialog(false)}
                >
                  取消
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* 草稿列表 Modal */}
      {showDraftsModal && (
        <DraftsModal
          onClose={() => setShowDraftsModal(false)}
          onSelectDraft={handleLoadDraft}
        />
      )}
    </>
  )
}


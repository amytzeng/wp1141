"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { X, Trash } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { zhTW } from "date-fns/locale"

interface DraftsModalProps {
  onClose: () => void
  onSelectDraft: (content: string) => void
}

export default function DraftsModal({ onClose, onSelectDraft }: DraftsModalProps) {
  const [drafts, setDrafts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDrafts()
  }, [])

  const fetchDrafts = async () => {
    try {
      const res = await fetch("/api/drafts")
      const data = await res.json()
      if (res.ok) {
        setDrafts(data.drafts)
      }
    } catch (error) {
      console.error("獲取草稿錯誤:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (draftId: string) => {
    if (!confirm("確定要刪除這則草稿嗎？")) return

    try {
      const res = await fetch(`/api/drafts/${draftId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        setDrafts(drafts.filter(d => d.id !== draftId))
      }
    } catch (error) {
      console.error("刪除草稿錯誤:", error)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div className="flex items-center gap-4 w-full">
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
            <DialogTitle className="flex-1">草稿</DialogTitle>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <p>載入中...</p>
            </div>
          ) : drafts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>沒有草稿</p>
            </div>
          ) : (
            <div className="space-y-3">
              {drafts.map((draft) => (
                <div
                  key={draft.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    onSelectDraft(draft.content)
                    handleDelete(draft.id)
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-gray-900 line-clamp-3">{draft.content}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        {formatDistanceToNow(new Date(draft.updatedAt), {
                          addSuffix: true,
                          locale: zhTW,
                        })}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(draft.id)
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}


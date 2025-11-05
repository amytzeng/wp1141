"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { calculateCharCount } from "@/lib/validations/post"

interface InlinePostComposerProps {
  onPostCreated: () => void
}

export default function InlinePostComposer({ onPostCreated }: InlinePostComposerProps) {
  const { data: session } = useSession()
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [error, setError] = useState("")

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
        setContent("")
        setExpanded(false)
        onPostCreated()
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

  return (
    <div className="border-b border-gray-200 p-4">
      <div className="flex gap-3">
        <Avatar className="h-12 w-12">
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
            onFocus={() => setExpanded(true)}
            className={`resize-none border-0 focus-visible:ring-0 text-lg ${
              expanded ? "min-h-[120px]" : "min-h-[50px]"
            }`}
          />

          {expanded && (
            <>
              {error && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <div className="flex items-center justify-between mt-3 pt-3 border-t">
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
            </>
          )}
        </div>
      </div>
    </div>
  )
}


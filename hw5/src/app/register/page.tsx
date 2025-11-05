"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RegisterPage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [userId, setUserId] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(userId)) {
      setError("使用者 ID 需為 3-20 個字符（僅限字母、數字和底線）")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "註冊失敗")
        return
      }

      await update()
      router.push("/home")
    } catch (err) {
      setError("發生錯誤，請稍後再試")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">選擇您的使用者 ID</h1>
          <p className="text-gray-600">
            這將是您在 Echo 上的唯一識別碼
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="輸入使用者 ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value.toLowerCase())}
              maxLength={20}
              required
              className="text-lg"
            />
            <p className="text-sm text-gray-500 mt-2">
              3-20 個字符，僅限字母、數字和底線
            </p>
          </div>
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700" 
            disabled={loading}
          >
            {loading ? "處理中..." : "繼續"}
          </Button>
        </form>
      </div>
    </div>
  )
}


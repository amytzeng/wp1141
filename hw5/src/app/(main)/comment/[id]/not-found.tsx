import Link from "next/link"
import { MessageCircle } from "lucide-react"

export default function CommentNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <MessageCircle className="h-24 w-24 text-gray-300 mb-4" />
      <h1 className="text-2xl font-bold text-gray-900 mb-2">找不到此留言</h1>
      <p className="text-gray-500 mb-6 text-center">
        此留言可能已被刪除或不存在
      </p>
      <Link
        href="/home"
        className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
      >
        返回首頁
      </Link>
    </div>
  )
}


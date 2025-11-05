import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">找不到此使用者</h2>
        <p className="text-gray-600 mb-8">
          這個使用者不存在，或者可能已經刪除帳號。
        </p>
        <Link href="/home">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <ArrowLeft className="mr-2 h-4 w-4" />
            回到首頁
          </Button>
        </Link>
      </div>
    </div>
  )
}


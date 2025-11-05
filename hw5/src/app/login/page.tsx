"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Chrome, Github, Facebook } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">Echo</h1>
          <p className="text-gray-600">連結你我，分享生活</p>
        </div>
        
        <div className="space-y-4">
          <Button
            onClick={() => signIn("google", { callbackUrl: "/home" })}
            className="w-full bg-white hover:bg-gray-50 text-gray-800 border border-gray-300"
            variant="outline"
          >
            <Chrome className="mr-2 h-5 w-5 text-red-500" />
            使用 Google 繼續
          </Button>
          
          <Button
            onClick={() => signIn("github", { callbackUrl: "/home" })}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white"
          >
            <Github className="mr-2 h-5 w-5" />
            使用 GitHub 繼續
          </Button>
          
          <Button
            onClick={() => signIn("facebook", { callbackUrl: "/home" })}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Facebook className="mr-2 h-5 w-5" />
            使用 Facebook 繼續
          </Button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600">
          登入即表示您同意我們的服務條款和隱私政策
        </p>
      </div>
    </div>
  )
}


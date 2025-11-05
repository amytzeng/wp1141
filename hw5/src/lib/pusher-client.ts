"use client"

import PusherClient from "pusher-js"

// 開發環境啟用日誌
if (process.env.NODE_ENV === "development") {
  PusherClient.logToConsole = true
}

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_KEY || '',
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap3',
  }
)

// 檢查 Pusher 是否已配置
export const isPusherConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_PUSHER_KEY &&
    process.env.NEXT_PUBLIC_PUSHER_CLUSTER
  )
}


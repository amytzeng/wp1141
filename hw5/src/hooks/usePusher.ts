"use client"

import { useEffect, useState } from "react"
import { pusherClient, isPusherConfigured } from "@/lib/pusher-client"
import type { Channel } from "pusher-js"

export function usePusher(channelName: string) {
  const [channel, setChannel] = useState<Channel | null>(null)

  useEffect(() => {
    if (!isPusherConfigured()) {
      console.warn('Pusher 尚未配置，即時更新功能將無法使用')
      return
    }

    const pusherChannel = pusherClient.subscribe(channelName)
    setChannel(pusherChannel)

    return () => {
      pusherChannel.unsubscribe()
    }
  }, [channelName])

  return channel
}

// 專門用於貼文實時更新的 Hook
export function usePostUpdates(postId?: string) {
  const channelName = postId ? `post-${postId}` : "posts"
  const channel = usePusher(channelName)

  return {
    channel,
    subscribe: (event: string, callback: (data: any) => void) => {
      if (channel) {
        channel.bind(event, callback)
        return () => channel.unbind(event, callback)
      }
      return () => {}
    },
  }
}


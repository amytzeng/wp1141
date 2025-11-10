import { z } from "zod"

// 解析貼文內容
export function parsePostContent(content: string) {
  // 提取 hashtags
  const hashtags = Array.from(content.matchAll(/#(\w+)/g)).map((m) => m[1])
  
  // 提取 mentions
  const mentions = Array.from(content.matchAll(/@(\w+)/g)).map((m) => m[1])
  
  // 提取 URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const links = Array.from(content.matchAll(urlRegex)).map((m) => m[0])
  
  return {
    hashtags: hashtags.join(','),
    mentions: mentions.join(','),
    links: links.join(','),
  }
}

// 計算字符數（不包括 hashtags 和 mentions，URL 計為 23 字符）
export function calculateCharCount(content: string): number {
  let text = content
  
  // 移除 hashtags
  text = text.replace(/#\w+/g, "")
  
  // 移除 mentions
  text = text.replace(/@\w+/g, "")
  
  // 查找 URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const urls = text.match(urlRegex) || []
  
  // 移除 URLs 並計算剩餘字符
  text = text.replace(urlRegex, "")
  let count = text.trim().length
  
  // 每個 URL 計為 23 字符
  count += urls.length * 23
  
  return count
}

export const postSchema = z.object({
  content: z.string().min(1, "貼文不能為空").refine(
    (content) => {
      const charCount = calculateCharCount(content)
      return charCount <= 280
    },
    { message: "貼文超過 280 字符限制" }
  ),
})


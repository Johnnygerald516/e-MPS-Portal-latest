"use client"

import { ChatBot } from "./chat-ui"
import { chatbotConfig } from "@/config/chatbot-config"

export function FloatingChat() {
  // Return null if chatbot is disabled
  if (!chatbotConfig.enabled) {
    return null
  }
  
  return <ChatBot />
}

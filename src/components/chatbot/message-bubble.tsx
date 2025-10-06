"use client"

import { ChatMessage } from "@/lib/chat-service"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { TypingAnimation } from "./typing-animation"
import ReactMarkdown from "react-markdown"
import { MessageFeedback } from "./message-feedback"
import { feedbackService } from "@/lib/feedback-service"

interface MessageBubbleProps {
  message: ChatMessage
  isLatestAssistantMessage: boolean
}

export function MessageBubble({ message, isLatestAssistantMessage }: MessageBubbleProps) {
  const [isTypingComplete, setIsTypingComplete] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const isAssistant = message.role === 'assistant'
  
  // Detect mobile devices on client side only
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Initial check
    checkIfMobile()
    
    // Add resize listener
    window.addEventListener('resize', checkIfMobile)
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile)
  }, [])
  
  // Handle feedback submission
  const handleFeedback = async (messageId: string, isHelpful: boolean, comment?: string) => {
    try {
      // Determine the source of the answer (custom_qa or openai)
      // This is a simplified detection - in a real app, you'd track this with the message
      const source = message.content.includes('OpenAI') ? 'openai' : 'custom_qa';
      
      await feedbackService.saveFeedback(messageId, isHelpful, comment, source);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  }
  
  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "flex w-max max-w-[80%] rounded-lg px-3 py-2 text-sm",
          isAssistant
            ? "bg-muted"
            : "ml-auto bg-primary text-primary-foreground"
        )}
        // Show feedback options on hover for assistant messages
        onMouseEnter={() => isAssistant && setShowFeedback(true)}
        onMouseLeave={() => isAssistant && setShowFeedback(false)}
      >
        {isAssistant && isLatestAssistantMessage ? (
          <TypingAnimation
            content={message.content}
            isComplete={isTypingComplete}
            onComplete={() => setIsTypingComplete(true)}
          />
        ) : isAssistant ? (
          <ReactMarkdown
            components={{
              // Style links
              a: ({ node, ...props }) => (
                <a 
                  {...props} 
                  className="text-blue-600 hover:underline" 
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
              // Style lists
              ul: ({ node, ...props }) => (
                <ul {...props} className="list-disc pl-4 my-2" />
              ),
              ol: ({ node, ...props }) => (
                <ol {...props} className="list-decimal pl-4 my-2" />
              ),
              // Style bold text
              strong: ({ node, ...props }) => (
                <strong {...props} className="font-semibold" />
              ),
              // Style code blocks
              code: ({ node, ...props }) => (
                <code {...props} className="bg-slate-100 px-1 py-0.5 rounded text-xs" />
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        ) : (
          message.content
        )}
      </div>
      
      {/* Show feedback UI for assistant messages that are fully displayed */}
      {isAssistant && (isTypingComplete || !isLatestAssistantMessage) && 
        (showFeedback || isMobile) && (
          <div className="ml-1">
            <MessageFeedback 
              messageId={message.id} 
              onFeedback={handleFeedback} 
            />
          </div>
        )
      }
    </div>
  )
}

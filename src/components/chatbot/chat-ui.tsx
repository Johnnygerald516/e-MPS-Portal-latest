"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet"
import { ChatMessage, chatService } from '@/lib/chat-service'
import { MessageCircle, Send, ArrowDown, Loader2, Trash2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { HelpSuggestions } from './help-suggestions'
import { conversationStorage } from '@/lib/conversation-storage'
import { MessageBubble } from './message-bubble'

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasHistory, setHasHistory] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  // Initialize messages from storage or with welcome message
  useEffect(() => {
    const hasStored = conversationStorage.hasStoredConversation();
    setHasHistory(hasStored);
    
    if (hasStored) {
      const storedMessages = conversationStorage.loadConversation();
      setMessages(storedMessages);
    } else {
      setMessages([
        {
          id: 'welcome',
          content: 'Hello! I\'m your Migrant Assistant. How can I help you today?',
          role: 'assistant',
          timestamp: new Date()
        }
      ]);
    }
  }, [])

  // Auto-scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 10),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    }
    
    // Update messages with user message
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages)
    setInputValue('')
    setIsLoading(true)
    setHasHistory(true) // We now have conversation history
    
    try {
      // Get AI response with conversation history
      // Only send the last 10 messages to keep context manageable
      const conversationHistory = updatedMessages.slice(-10);
      const response = await chatService.getResponse(userMessage.content, conversationHistory)
      
      // Update messages with AI response
      const messagesWithResponse = [...updatedMessages, response];
      setMessages(messagesWithResponse)
      
      // Save conversation to storage
      conversationStorage.saveConversation(messagesWithResponse);
    } catch (error) {
      // Handle error
      const errorMessage: ChatMessage = {
        id: 'error-' + Math.random().toString(36).substring(2, 10),
        content: 'Sorry, I had trouble processing that. Please try again.',
        role: 'assistant',
        timestamp: new Date()
      }
      
      // Update messages with error
      const messagesWithError = [...updatedMessages, errorMessage];
      setMessages(messagesWithError)
      
      // Save conversation to storage
      conversationStorage.saveConversation(messagesWithError);
    } finally {
      setIsLoading(false)
    }
  }

  // Handle clicking on a suggestion
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    // Focus the input field after selecting a suggestion
    setTimeout(() => inputRef.current?.focus(), 100);
  };
  
  // Clear conversation history
  const handleClearConversation = () => {
    // Reset to initial welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome-' + Math.random().toString(36).substring(2, 10),
      content: 'Hello! I\'m your Migrant Assistant. How can I help you today?',
      role: 'assistant',
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    setHasHistory(false);
    conversationStorage.clearConversation();
    scrollToBottom();
  };

  return (
    <>
      {/* Floating chat button */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg"
            size="icon"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col h-full">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Migrant Assistant
            </SheetTitle>
          </SheetHeader>
          
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => {
              // Check if this is the latest assistant message for typing animation
              const isLatestAssistantMessage = 
                message.role === 'assistant' && 
                index === messages.findLastIndex(m => m.role === 'assistant');
                
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isLatestAssistantMessage={isLatestAssistantMessage}
                />
              );
            })}
            
            {isLoading && (
              <div className="flex w-max max-w-[80%] rounded-lg px-3 py-2 text-sm bg-muted">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
            
            {/* Show help suggestions only when there's just the welcome message */}
            {messages.length === 1 && !isLoading && (
              <div className="w-full max-w-[80%]">
                <HelpSuggestions onSuggestionClick={handleSuggestionClick} />
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Scroll to bottom button */}
          {messages.length > 3 && (
            <Button
              size="icon"
              variant="ghost"
              className="absolute bottom-16 right-4 h-8 w-8 rounded-full opacity-70 hover:opacity-100"
              onClick={scrollToBottom}
            >
              <ArrowDown className="h-4 w-4" />
            </Button>
          )}
          
          {/* Footer with controls */}
          <SheetFooter className="border-t">
            {/* Clear conversation button - only show if there's history */}
            {hasHistory && (
              <div className="w-full flex justify-center py-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-muted-foreground flex gap-1"
                  onClick={handleClearConversation}
                >
                  <Trash2 className="h-3 w-3" />
                  Clear conversation
                </Button>
              </div>
            )}
            
            {/* Input area */}
            <div className="w-full p-4 pt-2">
              <form
                className="flex space-x-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSendMessage()
                }}
              >
                <Input
                  ref={inputRef}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={!inputValue.trim() || isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}

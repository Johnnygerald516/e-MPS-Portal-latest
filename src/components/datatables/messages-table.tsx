"use client"

import React, { useState } from "react"
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MessageCircle, Star, ArrowUpDown, MoreHorizontal, User, Search, Filter } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

// Message data structure
type Message = {
  id: string
  sender: string
  subject: string
  content: string
  isRead: boolean
  isStarred: boolean
  dateReceived: string
}

// Sample data (replace with actual data fetching logic)
const demoMessages: Message[] = [
  {
    id: "MSG-001",
    sender: "System Admin",
    subject: "Welcome to Seasonal Portal",
    content: "Thank you for registering with our Seasonal Portal. Here's how to get started...",
    isRead: false,
    isStarred: true,
    dateReceived: "2025-07-26T08:30:00",
  },
  {
    id: "MSG-002",
    sender: "Support Team",
    subject: "Your Recent Inquiry",
    content: "We've received your inquiry about seasonal work permits and wanted to follow up...",
    isRead: true,
    isStarred: false,
    dateReceived: "2025-07-25T14:45:00",
  },
  {
    id: "MSG-003",
    sender: "Notifications",
    subject: "Document Verification Complete",
    content: "Your documents have been verified successfully. The next steps are...",
    isRead: false,
    isStarred: false,
    dateReceived: "2025-07-24T11:20:00",
  },
  {
    id: "MSG-004",
    sender: "Marketing",
    subject: "New Seasonal Opportunities Available",
    content: "We're pleased to announce new seasonal work opportunities in the agricultural sector...",
    isRead: true,
    isStarred: true,
    dateReceived: "2025-07-23T09:15:00",
  },
]

export function MessagesTable() {
  const [messages, setMessages] = useState<Message[]>(demoMessages)
  const [filteredMessages, setFilteredMessages] = useState<Message[]>(demoMessages)
  const [sortColumn, setSortColumn] = useState<keyof Message>("dateReceived")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [starredFilter, setStarredFilter] = useState<string>('all')
  const [readFilter, setReadFilter] = useState<string>('all')

  const handleSort = (column: keyof Message) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("desc") // Default to most recent first for messages
    }

    const sortedMessages = [...filteredMessages].sort((a, b) => {
      if (sortDirection === "asc") {
        return a[column] > b[column] ? 1 : -1
      } else {
        return a[column] < b[column] ? 1 : -1
      }
    })

    setFilteredMessages(sortedMessages)
  }
  
  // Handle search functionality
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)
    filterMessages(query, starredFilter, readFilter)
  }
  
  // Handle filter functionality
  const handleStarredFilter = (value: string) => {
    setStarredFilter(value)
    filterMessages(searchQuery, value, readFilter)
  }
  
  const handleReadFilter = (value: string) => {
    setReadFilter(value)
    filterMessages(searchQuery, starredFilter, value)
  }
  
  // Combined filter function
  const filterMessages = (query: string, starred: string, read: string) => {
    let filtered = [...messages]
    
    // Apply search query filter
    if (query) {
      filtered = filtered.filter(message => 
        message.subject.toLowerCase().includes(query) || 
        message.content.toLowerCase().includes(query) ||
        message.sender.toLowerCase().includes(query)
      )
    }
    
    // Apply starred filter
    if (starred !== 'all') {
      const isStarred = starred === 'starred'
      filtered = filtered.filter(message => message.isStarred === isStarred)
    }
    
    // Apply read filter
    if (read !== 'all') {
      const isRead = read === 'read'
      filtered = filtered.filter(message => message.isRead === isRead)
    }
    
    setFilteredMessages(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const toggleStar = (id: string) => {
    setMessages(
      messages.map((message) =>
        message.id === id ? { ...message, isStarred: !message.isStarred } : message
      )
    )
  }

  const markAsRead = (id: string) => {
    setMessages(
      messages.map((message) =>
        message.id === id ? { ...message, isRead: true } : message
      )
    )
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredMessages.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)
  
  const unreadCount = messages.filter((message) => !message.isRead).length

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Messages</h2>
        <Badge variant="secondary">
          <MessageCircle className="h-4 w-4 mr-1" />
          {unreadCount} Unread
        </Badge>
      </div>
      
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by sender, subject, or content..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-2">
            <Select value={starredFilter} onValueChange={handleStarredFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Starred" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="starred">Starred</SelectItem>
                <SelectItem value="unstarred">Unstarred</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={readFilter} onValueChange={handleReadFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Read status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Table>
        <TableCaption>Your messages inbox</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead className="w-10"></TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("sender")}
            >
              Sender
              <ArrowUpDown className="ml-1 h-4 w-4 inline" />
            </TableHead>
            <TableHead>Subject</TableHead>
            <TableHead className="hidden md:table-cell">Preview</TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort("dateReceived")}
            >
              Received
              <ArrowUpDown className="ml-1 h-4 w-4 inline" />
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((message) => (
            <TableRow key={message.id} className={message.isRead ? "" : "font-medium bg-muted/20"}>
              <TableCell className="w-10">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => toggleStar(message.id)}
                  className={message.isStarred ? "text-yellow-500" : "text-muted-foreground"}
                >
                  <Star className="h-4 w-4" />
                </Button>
              </TableCell>
              <TableCell className="w-10">
                {!message.isRead && (
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {message.sender}
                </div>
              </TableCell>
              <TableCell>{message.subject}</TableCell>
              <TableCell className="hidden md:table-cell max-w-xs truncate">{message.content}</TableCell>
              <TableCell>{formatDate(message.dateReceived)}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>View Message</DropdownMenuItem>
                    {!message.isRead && (
                      <DropdownMenuItem onClick={() => markAsRead(message.id)}>
                        Mark as Read
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>Reply</DropdownMenuItem>
                    <DropdownMenuItem>Forward</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={7} className="text-right">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredMessages.length)} of {filteredMessages.length} Messages
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      
      {/* Pagination Controls */}
      <div className="mt-4 flex items-center justify-end space-x-2">
        <Select value={String(itemsPerPage)} onValueChange={(value) => setItemsPerPage(Number(value))}>
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder="Per page" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationLink 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              >
                Previous
              </PaginationLink>
            </PaginationItem>
            
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              // Show first page, last page, current page and pages around current
              let pageToShow = i + 1;
              
              if (totalPages > 5) {
                if (currentPage > 3 && currentPage < totalPages - 1) {
                  pageToShow = i === 0 ? 1 : i === 4 ? totalPages : currentPage + i - 2;
                } else if (currentPage >= totalPages - 1) {
                  pageToShow = totalPages - 4 + i;
                }
              }
              
              return (
                <PaginationItem key={pageToShow}>
                  <PaginationLink
                    onClick={() => paginate(pageToShow)}
                    isActive={currentPage === pageToShow}
                  >
                    {pageToShow}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            
            {totalPages > 5 && currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            
            <PaginationItem>
              <PaginationLink 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              >
                Next
              </PaginationLink>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}

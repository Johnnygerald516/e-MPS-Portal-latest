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
import { Bell, Check, ArrowUpDown, Clock, MoreHorizontal, Search, Filter } from "lucide-react"
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

// Notification data structure
type Notification = {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "success" | "error"
  isRead: boolean
  dateReceived: string
}

// Sample data (replace with actual data fetching logic)
const demoNotifications: Notification[] = [
  {
    id: "NOT-001",
    title: "Application Updated",
    message: "Your seasonal work permit application has been updated.",
    type: "info",
    isRead: false,
    dateReceived: "2025-07-26T10:30:00",
  },
  {
    id: "NOT-002",
    title: "Document Required",
    message: "Please upload your identification documents.",
    type: "warning",
    isRead: false,
    dateReceived: "2025-07-25T14:15:00",
  },
  {
    id: "NOT-003",
    title: "Application Approved",
    message: "Your application has been approved. Congratulations!",
    type: "success",
    isRead: true,
    dateReceived: "2025-07-24T09:45:00",
  },
  {
    id: "NOT-004",
    title: "System Maintenance",
    message: "The system will undergo maintenance on July 30th.",
    type: "error",
    isRead: true,
    dateReceived: "2025-07-23T16:20:00",
  },
]

export function NotificationsTable() {
  const [notifications, setNotifications] = useState<Notification[]>(demoNotifications)
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>(demoNotifications)
  const [sortColumn, setSortColumn] = useState<keyof Notification | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [readFilter, setReadFilter] = useState<string>('all')

  const handleSort = (column: keyof Notification) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("desc") // Default to most recent first for notifications
    }

    const sortedNotifications = [...filteredNotifications].sort((a, b) => {
      if (sortDirection === "asc") {
        return a[column] > b[column] ? 1 : -1
      } else {
        return a[column] < b[column] ? 1 : -1
      }
    })

    setFilteredNotifications(sortedNotifications)
  }
  
  // Handle search functionality
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)
    filterNotifications(query, typeFilter, readFilter)
  }
  
  // Handle filter functionality
  const handleTypeFilter = (value: string) => {
    setTypeFilter(value)
    filterNotifications(searchQuery, value, readFilter)
  }
  
  const handleReadFilter = (value: string) => {
    setReadFilter(value)
    filterNotifications(searchQuery, typeFilter, value)
  }
  
  // Combined filter function
  const filterNotifications = (query: string, type: string, read: string) => {
    let filtered = [...notifications]
    
    // Apply search query filter
    if (query) {
      filtered = filtered.filter(notification => 
        notification.title.toLowerCase().includes(query) || 
        notification.message.toLowerCase().includes(query)
      )
    }
    
    // Apply type filter
    if (type !== 'all') {
      filtered = filtered.filter(notification => notification.type === type)
    }
    
    // Apply read filter
    if (read !== 'all') {
      const isRead = read === 'read'
      filtered = filtered.filter(notification => notification.isRead === isRead)
    }
    
    setFilteredNotifications(filtered)
    setCurrentPage(1) // Reset to first page when filtering
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getTypeBadge = (type: Notification["type"]) => {
    switch (type) {
      case "info":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Info</Badge>
      case "warning":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Warning</Badge>
      case "success":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Success</Badge>
      case "error":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Error</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification
      )
    )
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredNotifications.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)
  
  const unreadCount = notifications.filter((notification) => !notification.isRead).length

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Notifications</h2>
        <Badge variant="secondary">
          <Bell className="h-4 w-4 mr-1" />
          {unreadCount} Unread
        </Badge>
      </div>
      
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by title or message..."
            className="pl-8"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={handleTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
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
        <TableCaption>Your notifications</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="hidden md:table-cell">Message</TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort("dateReceived")}
            >
              Date Received
              <ArrowUpDown className="ml-1 h-4 w-4 inline" />
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((notification) => (
            <TableRow key={notification.id} className={notification.isRead ? "" : "font-medium bg-muted/20"}>
              <TableCell>
                {notification.isRead ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <Clock className="h-5 w-5 text-blue-500" />
                )}
              </TableCell>
              <TableCell>{getTypeBadge(notification.type)}</TableCell>
              <TableCell>{notification.title}</TableCell>
              <TableCell className="hidden md:table-cell max-w-xs truncate">{notification.message}</TableCell>
              <TableCell>{formatDate(notification.dateReceived)}</TableCell>
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
                    {!notification.isRead && (
                      <DropdownMenuItem onClick={() => markAsRead(notification.id)}>
                        <Check className="mr-2 h-4 w-4" />
                        Mark as Read
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Archive</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6} className="text-right">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredNotifications.length)} of {filteredNotifications.length} Notifications
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
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
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
              <PaginationNext 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}

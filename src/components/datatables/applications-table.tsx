"use client"

import React, { useState, useEffect } from "react"
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
import { Eye, ArrowUpDown, MoreHorizontal, FileText, Search, Filter, Printer, Receipt, FileCheck, Download, CheckSquare } from "lucide-react"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
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

// Import application type and endpoints
import { Application, applicationsEndpoints } from "@/lib/api/endpoints/applications"

// Fallback demo data in case API fails
const demoApplications: Application[] = [
  {
    id: "APP-001",
    applicantName: "John Doe",
    applicationType: "Seasonal Work Permit",
    dateSubmitted: "2025-07-15",
    status: "pending",
    documents: 3,
  },
  {
    id: "APP-002",
    applicantName: "Jane Smith",
    applicationType: "Agricultural Work Permit",
    dateSubmitted: "2025-07-10",
    status: "approved",
    documents: 5,
  },
]

export function ApplicationsTable() {
  const [applications, setApplications] = useState<Application[]>([])
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([])
  const [sortColumn, setSortColumn] = useState<keyof Application | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // Selected rows
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  
  // Fetch applications data from API
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setIsLoading(true)
        const response = await applicationsEndpoints.getAll()
        if (response && response.data) {
          setApplications(response.data)
          setFilteredApplications(response.data)
        } else {
          // Fallback to demo data if API response format is unexpected
          console.warn('API response format unexpected, using demo data')
          setApplications(demoApplications)
          setFilteredApplications(demoApplications)
        }
      } catch (err) {
        console.error('Failed to fetch applications:', err)
        setError('Failed to load applications. Using demo data.')
        // Fallback to demo data on error
        setApplications(demoApplications)
        setFilteredApplications(demoApplications)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchApplications()
  }, [])

  const handleSort = (column: keyof Application) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }

    const sortedApplications = [...filteredApplications].sort((a, b) => {
      if (sortDirection === "asc") {
        return a[column] > b[column] ? 1 : -1
      } else {
        return a[column] < b[column] ? 1 : -1
      }
    })

    setFilteredApplications(sortedApplications)
  }
  
  // Handle search functionality
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase()
    setSearchQuery(query)
    const filtered = filterApplications(query, statusFilter)
    setFilteredApplications(filtered)
    setCurrentPage(1) // Reset to first page when search changes
  }
  
  // Handle filter functionality
  const handleStatusFilter = (value: string) => {
    setStatusFilter(value)
    const filtered = filterApplications(searchQuery, value)
    setFilteredApplications(filtered)
    setCurrentPage(1) // Reset to first page when filter changes
  }
  
  // Combined filter function
  const filterApplications = (query: string, status: string): Application[] => {
    let filtered = [...applications]
    
    // Apply search query filter
    if (query) {
      filtered = filtered.filter(app => 
        app.applicantName.toLowerCase().includes(query) || 
        app.id.toLowerCase().includes(query) ||
        app.applicationType.toLowerCase().includes(query)
      )
    }
    
    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(app => app.status === status)
    }
    
    return filtered;
  }
  
  // Sample data generation for PDFs
  const generateBillPDF = (app: Application) => {
    // In a real app, this would use a library like pdfmake or jspdf to generate a PDF
    // For this example, we'll just simulate the download
    
    // Create sample bill data
    const billData = {
      billNo: `BILL-${app.id}-${Date.now().toString().slice(-6)}`,
      applicantName: app.applicantName,
      applicationType: app.applicationType,
      dateIssued: new Date().toLocaleDateString(),
      applicationDate: app.dateSubmitted,
      items: [
        { description: 'Application Processing Fee', amount: 25000 },
        { description: 'Document Verification', amount: 15000 },
        { description: 'Administrative Charges', amount: 5000 }
      ],
      total: 45000,
      status: 'UNPAID'
    }
    
    console.log('Generated Bill PDF Data:', billData)
    return billData
  }
  
  const generateReceiptPDF = (app: Application) => {
    // Create sample receipt data
    const receiptData = {
      receiptNo: `RCP-${app.id}-${Date.now().toString().slice(-6)}`,
      applicantName: app.applicantName,
      applicationType: app.applicationType,
      dateIssued: new Date().toLocaleDateString(),
      paymentDate: new Date().toLocaleDateString(),
      paymentMethod: 'Mobile Money',
      transactionRef: `TXN${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      items: [
        { description: 'Application Processing Fee', amount: 25000 },
        { description: 'Document Verification', amount: 15000 },
        { description: 'Administrative Charges', amount: 5000 }
      ],
      total: 45000,
      status: 'PAID'
    }
    
    console.log('Generated Receipt PDF Data:', receiptData)
    return receiptData
  }
  
  const generatePassPDF = (app: Application) => {
    // Create sample pass data
    const passData = {
      passNo: `PASS-${app.id}-${Date.now().toString().slice(-6)}`,
      applicantName: app.applicantName,
      applicationType: app.applicationType,
      issueDate: new Date().toLocaleDateString(),
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
      validRegions: ['Eastern Region', 'Central Region', 'Northern Region'],
      restrictions: 'None',
      status: app.status === 'approved' ? 'VALID' : 'PENDING APPROVAL',
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PASS${app.id}`
    }
    
    console.log('Generated Pass PDF Data:', passData)
    return passData
  }
  
  // Handle print functionality
  const handlePrintBill = (id: string) => {
    const app = applications.find(a => a.id === id)
    if (!app) return
    
    const billData = generateBillPDF(app)
    toast.success(`Bill for application ${id} generated and sent to printer`, {
      description: `Bill Number: ${billData.billNo} - Amount: TSh ${billData.total.toLocaleString()}`,
      action: {
        label: "Download PDF",
        onClick: () => {
          console.log(`Downloading bill PDF for ${id}`)
          toast.info(`Bill PDF for application ${id} is being downloaded`)
        }
      }
    })
  }
  
  const handlePrintReceipt = (id: string) => {
    const app = applications.find(a => a.id === id)
    if (!app) return
    
    const receiptData = generateReceiptPDF(app)
    toast.success(`Receipt for application ${id} generated and sent to printer`, {
      description: `Receipt Number: ${receiptData.receiptNo} - Paid: TSh ${receiptData.total.toLocaleString()}`,
      action: {
        label: "Download PDF",
        onClick: () => {
          console.log(`Downloading receipt PDF for ${id}`)
          toast.info(`Receipt PDF for application ${id} is being downloaded`)
        }
      }
    })
  }
  
  const handlePrintPass = (id: string) => {
    const app = applications.find(a => a.id === id)
    if (!app) return
    
    const passData = generatePassPDF(app)
    toast.success(`Pass for application ${id} generated and sent to printer`, {
      description: `Pass Number: ${passData.passNo} - Status: ${passData.status}`,
      action: {
        label: "Download PDF",
        onClick: () => {
          console.log(`Downloading pass PDF for ${id}`)
          toast.info(`Pass PDF for application ${id} is being downloaded`)
        }
      }
    })
  }
  
  // Handle row selection
  const handleRowSelect = (id: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedRows(prev => [...prev, id])
    } else {
      setSelectedRows(prev => prev.filter(rowId => rowId !== id))
    }
  }
  
  // Handle bulk actions
  const handleBulkAction = (action: string) => {
    if (selectedRows.length === 0) {
      toast.error("No applications selected")
      return
    }
    
    switch(action) {
      case "print-bill":
        toast.success(`Printing bills for ${selectedRows.length} applications`)
        break
      case "print-receipt":
        toast.success(`Printing receipts for ${selectedRows.length} applications`)
        break
      case "print-pass":
        toast.success(`Printing passes for ${selectedRows.length} applications`)
        break
      default:
        break
    }
  }

  const getStatusBadge = (status: Application["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "approved":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Approved</Badge>
      case "rejected":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>
      case "review":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Under Review</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredApplications.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredApplications.length / itemsPerPage)

  // Pagination handler
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search applications..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-8 w-full"
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="review">Under Review</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          {selectedRows.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedRows.length} selected
              </span>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => handleBulkAction("print-bill")}
              >
                <Printer className="h-4 w-4" /> Print Bills
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => handleBulkAction("print-receipt")}
              >
                <Receipt className="h-4 w-4" /> Print Receipts
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={() => handleBulkAction("print-pass")}
              >
                <FileCheck className="h-4 w-4" /> Print Passes
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading applications...</span>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <Table>
          <TableCaption>Applications List</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox 
                checked={selectedRows.length === currentItems.length && currentItems.length > 0}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setSelectedRows(currentItems.map(app => app.id))
                  } else {
                    setSelectedRows([])
                  }
                }}
                aria-label="Select all applications"
              />
            </TableHead>
            <TableHead>Application ID</TableHead>
            <TableHead>
              <div className="flex items-center cursor-pointer" onClick={() => handleSort("applicantName")}>
                Applicant Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center cursor-pointer" onClick={() => handleSort("dateSubmitted")}>
                Date Submitted
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </div>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Print</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentItems.map((application) => (
            <TableRow key={application.id}>
              <TableCell>
                <Checkbox 
                  checked={selectedRows.includes(application.id)}
                  onCheckedChange={(checked) => handleRowSelect(application.id, !!checked)}
                  aria-label={`Select application ${application.id}`}
                />
              </TableCell>
              <TableCell>{application.id}</TableCell>
              <TableCell>{application.applicantName}</TableCell>
              <TableCell>{application.dateSubmitted}</TableCell>
              <TableCell>
                {getStatusBadge(application.status)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                    onClick={() => handlePrintBill(application.id)}
                    title="Print Bill"
                  >
                    <Printer className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-green-600 hover:text-green-800 hover:bg-green-100"
                    onClick={() => handlePrintReceipt(application.id)}
                    title="Print Receipt"
                  >
                    <Receipt className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-amber-600 hover:text-amber-800 hover:bg-amber-100"
                    onClick={() => handlePrintPass(application.id)}
                    title="Print Pass"
                  >
                    <FileCheck className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
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
                    <DropdownMenuItem onClick={() => toast.info(`Viewing details for ${application.id}`)}>
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePrintBill(application.id)}>
                      <Printer className="mr-2 h-4 w-4 text-blue-600" />
                      Print Bill
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePrintReceipt(application.id)}>
                      <Receipt className="mr-2 h-4 w-4 text-green-600" />
                      Print Receipt
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handlePrintPass(application.id)}>
                      <FileCheck className="mr-2 h-4 w-4 text-amber-600" />
                      Print Pass
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => toast.info(`Status update for ${application.id}`)}>
                      Update Status
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.info(`Documents for ${application.id} downloading`)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download Documents
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={7} className="text-right">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredApplications.length)} of {filteredApplications.length} Applications
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
      )}
      
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

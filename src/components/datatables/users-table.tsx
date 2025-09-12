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
import { User, ArrowUpDown, MoreHorizontal, Mail, Phone, UserCircle, Shield } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// User data structure
type UserData = {
  id: string
  name: string
  email: string
  phone: string
  role: "admin" | "employer" | "worker" | "company"
  status: "active" | "inactive" | "pending" | "suspended"
  dateRegistered: string
}

// Sample data (replace with actual data fetching logic)
const demoUsers: UserData[] = [
  {
    id: "USR-001",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+255712345678",
    role: "employer",
    status: "active",
    dateRegistered: "2025-06-15",
  },
  {
    id: "USR-002",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    phone: "+255723456789",
    role: "worker",
    status: "active",
    dateRegistered: "2025-06-20",
  },
  {
    id: "USR-003",
    name: "Robert Johnson",
    email: "robert.johnson@example.com",
    phone: "+255734567890",
    role: "admin",
    status: "active",
    dateRegistered: "2025-05-10",
  },
  {
    id: "USR-004",
    name: "ABC Agriculture Ltd",
    email: "info@abcagri.com",
    phone: "+255745678901",
    role: "company",
    status: "pending",
    dateRegistered: "2025-07-01",
  },
  {
    id: "USR-005",
    name: "Sarah Williams",
    email: "sarah.williams@example.com",
    phone: "+255756789012",
    role: "worker",
    status: "suspended",
    dateRegistered: "2025-06-25",
  },
]

export function UsersTable() {
  const [users, setUsers] = useState<UserData[]>(demoUsers)
  const [sortColumn, setSortColumn] = useState<keyof UserData | null>(null)
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  const handleSort = (column: keyof UserData) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }

    const sortedUsers = [...users].sort((a, b) => {
      if (sortDirection === "asc") {
        return a[column] > b[column] ? 1 : -1
      } else {
        return a[column] < b[column] ? 1 : -1
      }
    })

    setUsers(sortedUsers)
  }

  const getRoleBadge = (role: UserData["role"]) => {
    switch (role) {
      case "admin":
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Admin</Badge>
      case "employer":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Employer</Badge>
      case "worker":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Worker</Badge>
      case "company":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Company</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusBadge = (status: UserData["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Active</Badge>
      case "inactive":
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Inactive</Badge>
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "suspended":
        return <Badge variant="outline" className="bg-red-100 text-red-800">Suspended</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getRoleIcon = (role: UserData["role"]) => {
    switch (role) {
      case "admin":
        return <Shield className="h-4 w-4 mr-2" />
      case "employer":
        return <UserCircle className="h-4 w-4 mr-2" />
      case "worker":
        return <User className="h-4 w-4 mr-2" />
      case "company":
        return <UserCircle className="h-4 w-4 mr-2" />
      default:
        return <User className="h-4 w-4 mr-2" />
    }
  }

  return (
    <div className="w-full">
      <Table>
        <TableCaption>List of registered users</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort("name")}
            >
              Name
              <ArrowUpDown className="ml-1 h-4 w-4 inline" />
            </TableHead>
            <TableHead>Contact Info</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort("dateRegistered")}
            >
              Registered Date
              <ArrowUpDown className="ml-1 h-4 w-4 inline" />
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.id}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Mail className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <div className="flex items-center mt-1">
                  <Phone className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                  <span className="text-sm">{user.phone}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  {getRoleIcon(user.role)}
                  {getRoleBadge(user.role)}
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(user.status)}</TableCell>
              <TableCell>{user.dateRegistered}</TableCell>
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
                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                    <DropdownMenuItem>Edit User</DropdownMenuItem>
                    <DropdownMenuItem>Change Status</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-600">Deactivate Account</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={6} className="text-right">
              Total Users: {users.length}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  )
}

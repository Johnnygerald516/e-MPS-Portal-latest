import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MessageSquare, Settings, Database, BarChart3, Users } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <MessageSquare className="mr-2 h-5 w-5" />
              Chatbot
            </CardTitle>
            <CardDescription>Manage the Migrant Assistant</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Configure chatbot settings, view analytics, and manage Q&A data.
            </p>
            <div className="flex flex-col space-y-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/chatbot/feedback">View Feedback</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/admin/chatbot/qa">Manage Q&A</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Users
            </CardTitle>
            <CardDescription>Manage system users</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              View and manage user accounts, permissions, and activity.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Analytics
            </CardTitle>
            <CardDescription>System usage statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              View system analytics, usage patterns, and performance metrics.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/analytics">View Analytics</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Database className="mr-2 h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>Manage system data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Import, export, and manage system data and configurations.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/data">Manage Data</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center">
              <Settings className="mr-2 h-5 w-5" />
              Settings
            </CardTitle>
            <CardDescription>System configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4">
              Configure system settings, API keys, and integration options.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/settings">Manage Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-800">
        <h3 className="font-medium mb-2">Admin Dashboard</h3>
        <p className="text-sm">
          This is a demonstration of the admin interface for the eMPS Portal. 
          Currently, only the Chatbot Feedback Analytics section is fully implemented.
        </p>
      </div>
    </div>
  )
}

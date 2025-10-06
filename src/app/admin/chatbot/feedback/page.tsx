"use client"

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from 'date-fns'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface FeedbackItem {
  messageId: string
  isHelpful: boolean
  comment?: string
  source?: 'custom_qa' | 'openai'
  topic?: string
  timestamp: string
}

export default function FeedbackAnalyticsPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchFeedback() {
      try {
        const response = await fetch('/api/admin/feedback')
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`)
        }
        
        const data = await response.json()
        setFeedback(data.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load feedback data')
        console.error('Error fetching feedback:', err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchFeedback()
  }, [])
  
  // Calculate statistics
  const totalFeedback = feedback.length
  const helpfulCount = feedback.filter(item => item.isHelpful).length
  const unhelpfulCount = totalFeedback - helpfulCount
  const helpfulPercentage = totalFeedback > 0 ? Math.round((helpfulCount / totalFeedback) * 100) : 0
  
  // Source breakdown
  const customQaCount = feedback.filter(item => item.source === 'custom_qa').length
  const openaiCount = feedback.filter(item => item.source === 'openai').length
  
  // Prepare chart data
  const helpfulnessData = [
    { name: 'Helpful', value: helpfulCount },
    { name: 'Unhelpful', value: unhelpfulCount }
  ]
  
  const sourceData = [
    { name: 'Custom Q&A', value: customQaCount },
    { name: 'OpenAI', value: openaiCount }
  ]
  
  // Topic breakdown for bar chart
  const topicData = feedback.reduce((acc: Record<string, {helpful: number, unhelpful: number}>, item) => {
    if (!item.topic) return acc
    
    if (!acc[item.topic]) {
      acc[item.topic] = { helpful: 0, unhelpful: 0 }
    }
    
    if (item.isHelpful) {
      acc[item.topic].helpful++
    } else {
      acc[item.topic].unhelpful++
    }
    
    return acc
  }, {})
  
  const barChartData = Object.entries(topicData).map(([topic, counts]) => ({
    topic,
    helpful: counts.helpful,
    unhelpful: counts.unhelpful
  }))
  
  // Colors for charts
  const COLORS = ['#4ade80', '#f87171']
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading feedback data...</div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-red-500">Error: {error}</div>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Chatbot Feedback Analytics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Feedback</CardTitle>
            <CardDescription>All collected responses</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalFeedback}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Helpful Responses</CardTitle>
            <CardDescription>User satisfaction rate</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold text-green-500">{helpfulPercentage}%</p>
            <p className="text-sm text-muted-foreground">{helpfulCount} out of {totalFeedback}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Source Breakdown</CardTitle>
            <CardDescription>Response source distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between">
              <div>
                <p className="text-sm">Custom Q&A: <span className="font-bold">{customQaCount}</span></p>
                <p className="text-sm">OpenAI: <span className="font-bold">{openaiCount}</span></p>
              </div>
              <div>
                <p className="text-sm">Unknown: <span className="font-bold">{totalFeedback - customQaCount - openaiCount}</span></p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="charts">
        <TabsList className="mb-4">
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="data">Raw Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Helpfulness Distribution</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={helpfulnessData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {helpfulnessData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Source Distribution</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sourceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={['#60a5fa', '#a78bfa'][index % 2]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Topic Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={barChartData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="topic" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="helpful" name="Helpful" fill="#4ade80" />
                  <Bar dataKey="unhelpful" name="Unhelpful" fill="#f87171" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableCaption>Feedback collected from chatbot users</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Helpful</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Topic</TableHead>
                    <TableHead>Comment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {feedback.map((item) => (
                    <TableRow key={item.messageId}>
                      <TableCell>
                        {format(new Date(item.timestamp), 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.isHelpful ? "success" : "destructive"}>
                          {item.isHelpful ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.source === 'custom_qa' ? 'Custom Q&A' : 
                         item.source === 'openai' ? 'OpenAI' : 'Unknown'}
                      </TableCell>
                      <TableCell>{item.topic || 'N/A'}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {item.comment || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

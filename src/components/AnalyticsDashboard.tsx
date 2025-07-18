import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'
import { Calendar, TrendingUp, Target, Clock, Filter, Download } from 'lucide-react'
import { Task } from '../types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

interface AnalyticsDashboardProps {
  tasks: Task[]
  boardTitle: string
}

const COLORS = {
  primary: '#6366f1',
  accent: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6'
}

export default function AnalyticsDashboard({ tasks, boardTitle }: AnalyticsDashboardProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [filterBy, setFilterBy] = useState<'all' | 'priority' | 'status'>('all')

  // Filter tasks based on time range
  const filteredTasks = useMemo(() => {
    if (timeRange === 'all') return tasks
    
    const now = new Date()
    const daysAgo = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const cutoffDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000)
    
    return tasks.filter(task => new Date(task.createdAt) >= cutoffDate)
  }, [tasks, timeRange])

  // Calculate completion data by day
  const completionData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const data = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const completedTasks = filteredTasks.filter(task => {
        if (!task.completed) return false
        const taskDate = new Date(task.updatedAt).toISOString().split('T')[0]
        return taskDate === dateStr
      }).length
      
      const createdTasks = filteredTasks.filter(task => {
        const taskDate = new Date(task.createdAt).toISOString().split('T')[0]
        return taskDate === dateStr
      }).length
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        completed: completedTasks,
        created: createdTasks,
        fullDate: dateStr
      })
    }
    
    return data
  }, [filteredTasks, timeRange])

  // Priority distribution
  const priorityData = useMemo(() => {
    const priorities = { high: 0, medium: 0, low: 0 }
    filteredTasks.forEach(task => {
      priorities[task.priority]++
    })
    
    return [
      { name: 'High Priority', value: priorities.high, color: COLORS.danger },
      { name: 'Medium Priority', value: priorities.medium, color: COLORS.warning },
      { name: 'Low Priority', value: priorities.low, color: COLORS.info }
    ]
  }, [filteredTasks])

  // Status distribution
  const statusData = useMemo(() => {
    const completed = filteredTasks.filter(task => task.completed).length
    const overdue = filteredTasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < new Date() && !task.completed
    ).length
    const onTime = filteredTasks.length - completed - overdue
    
    return [
      { name: 'Completed', value: completed, color: COLORS.success },
      { name: 'On Time', value: onTime, color: COLORS.primary },
      { name: 'Overdue', value: overdue, color: COLORS.danger }
    ]
  }, [filteredTasks])

  // Calculate key metrics
  const metrics = useMemo(() => {
    const total = filteredTasks.length
    const completed = filteredTasks.filter(task => task.completed).length
    const overdue = filteredTasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < new Date() && !task.completed
    ).length
    const highPriority = filteredTasks.filter(task => task.priority === 'high').length
    const completionRate = total > 0 ? (completed / total) * 100 : 0
    
    // Calculate average completion time
    const completedTasks = filteredTasks.filter(task => task.completed)
    const avgCompletionTime = completedTasks.length > 0 
      ? completedTasks.reduce((acc, task) => {
          const created = new Date(task.createdAt)
          const updated = new Date(task.updatedAt)
          return acc + (updated.getTime() - created.getTime())
        }, 0) / completedTasks.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0
    
    return {
      total,
      completed,
      overdue,
      highPriority,
      completionRate,
      avgCompletionTime: Math.round(avgCompletionTime * 10) / 10
    }
  }, [filteredTasks])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.dataKey === 'completed' ? 'Completed' : 'Created'}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p style={{ color: data.payload.color }}>
            Count: {data.value}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Insights and metrics for {boardTitle}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{metrics.completionRate.toFixed(1)}%</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed Tasks</p>
                <p className="text-2xl font-bold">{metrics.completed}</p>
              </div>
              <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue Tasks</p>
                <p className="text-2xl font-bold">{metrics.overdue}</p>
              </div>
              <div className="h-10 w-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg. Completion</p>
                <p className="text-2xl font-bold">{metrics.avgCompletionTime}d</p>
              </div>
              <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="completion" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="completion">Task Completion</TabsTrigger>
          <TabsTrigger value="priority">Priority Distribution</TabsTrigger>
          <TabsTrigger value="status">Status Overview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="completion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Task Activity</CardTitle>
              <CardDescription>
                Track task creation and completion over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={completionData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar 
                      dataKey="created" 
                      fill={COLORS.primary} 
                      radius={[2, 2, 0, 0]}
                      name="Created"
                    />
                    <Bar 
                      dataKey="completed" 
                      fill={COLORS.success} 
                      radius={[2, 2, 0, 0]}
                      name="Completed"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="priority" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Priority Distribution</CardTitle>
                <CardDescription>
                  Breakdown of tasks by priority level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={priorityData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {priorityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Priority Breakdown</CardTitle>
                <CardDescription>
                  Detailed view of task priorities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {priorityData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <Badge variant="secondary">{item.value} tasks</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="status" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Task Status Overview</CardTitle>
                <CardDescription>
                  Current status of all tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Status Summary</CardTitle>
                <CardDescription>
                  Overview of task completion status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {statusData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <Badge variant="secondary">{item.value} tasks</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
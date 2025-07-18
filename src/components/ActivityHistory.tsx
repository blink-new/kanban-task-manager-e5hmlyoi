import { useState, useEffect } from 'react'
import { Clock, User, ArrowRight, Plus, Edit, Trash2, CheckCircle, Calendar } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'
import { Button } from './ui/button'

export interface ActivityItem {
  id: string
  type: 'created' | 'updated' | 'deleted' | 'moved' | 'completed' | 'priority_changed' | 'due_date_changed'
  taskTitle: string
  taskId: string
  userId: string
  userName: string
  timestamp: string
  details: {
    from?: string
    to?: string
    field?: string
    oldValue?: any
    newValue?: any
  }
}

interface ActivityHistoryProps {
  activities: ActivityItem[]
  onLoadMore?: () => void
  hasMore?: boolean
  loading?: boolean
}

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'created':
      return <Plus className="h-4 w-4 text-green-600" />
    case 'updated':
      return <Edit className="h-4 w-4 text-blue-600" />
    case 'deleted':
      return <Trash2 className="h-4 w-4 text-red-600" />
    case 'moved':
      return <ArrowRight className="h-4 w-4 text-purple-600" />
    case 'completed':
      return <CheckCircle className="h-4 w-4 text-green-600" />
    case 'priority_changed':
      return <Badge className="h-4 w-4 text-orange-600" />
    case 'due_date_changed':
      return <Calendar className="h-4 w-4 text-blue-600" />
    default:
      return <Clock className="h-4 w-4 text-gray-600" />
  }
}

const getActivityMessage = (activity: ActivityItem) => {
  const { type, details, taskTitle } = activity
  
  switch (type) {
    case 'created':
      return `created task "${taskTitle}"`
    case 'updated':
      return `updated task "${taskTitle}"`
    case 'deleted':
      return `deleted task "${taskTitle}"`
    case 'moved':
      return `moved "${taskTitle}" from ${details.from} to ${details.to}`
    case 'completed':
      return `completed task "${taskTitle}"`
    case 'priority_changed':
      return `changed priority of "${taskTitle}" from ${details.oldValue} to ${details.newValue}`
    case 'due_date_changed':
      if (details.newValue) {
        return `set due date for "${taskTitle}" to ${new Date(details.newValue).toLocaleDateString()}`
      } else {
        return `removed due date from "${taskTitle}"`
      }
    default:
      return `performed an action on "${taskTitle}"`
  }
}

const getActivityColor = (type: ActivityItem['type']) => {
  switch (type) {
    case 'created':
      return 'border-l-green-500'
    case 'updated':
      return 'border-l-blue-500'
    case 'deleted':
      return 'border-l-red-500'
    case 'moved':
      return 'border-l-purple-500'
    case 'completed':
      return 'border-l-green-500'
    case 'priority_changed':
      return 'border-l-orange-500'
    case 'due_date_changed':
      return 'border-l-blue-500'
    default:
      return 'border-l-gray-500'
  }
}

const formatTimeAgo = (timestamp: string) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  } else {
    return time.toLocaleDateString()
  }
}

export default function ActivityHistory({ 
  activities, 
  onLoadMore, 
  hasMore = false, 
  loading = false 
}: ActivityHistoryProps) {
  const [groupedActivities, setGroupedActivities] = useState<{ [key: string]: ActivityItem[] }>({})

  useEffect(() => {
    // Group activities by date
    const grouped = activities.reduce((acc, activity) => {
      const date = new Date(activity.timestamp).toDateString()
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(activity)
      return acc
    }, {} as { [key: string]: ActivityItem[] })

    // Sort activities within each group by timestamp (newest first)
    Object.keys(grouped).forEach(date => {
      grouped[date].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    })

    setGroupedActivities(grouped)
  }, [activities])

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    }
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activity History
          </CardTitle>
          <CardDescription>
            Track all changes and updates to your tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No activity yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Task changes and updates will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activity History
        </CardTitle>
        <CardDescription>
          Recent changes and updates to your tasks
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <div className="p-6 space-y-6">
            {Object.keys(groupedActivities)
              .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
              .map((date) => (
                <div key={date} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      {formatDateHeader(date)}
                    </h4>
                    <Separator className="flex-1" />
                  </div>
                  
                  <div className="space-y-3">
                    {groupedActivities[date].map((activity, index) => (
                      <div 
                        key={activity.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border-l-4 bg-muted/30 ${getActivityColor(activity.type)}`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {getActivityIcon(activity.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm font-medium">
                                {activity.userName || 'You'}
                              </span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                              {getActivityMessage(activity)}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(activity.timestamp)}
                            </span>
                            
                            {activity.type === 'priority_changed' && (
                              <div className="flex items-center gap-1">
                                <Badge 
                                  variant="outline" 
                                  className="text-xs"
                                >
                                  {activity.details.oldValue}
                                </Badge>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <Badge 
                                  variant="outline" 
                                  className="text-xs"
                                >
                                  {activity.details.newValue}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            
            {hasMore && (
              <div className="text-center pt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onLoadMore}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
import { useState } from 'react'
import { Calendar, Clock, MoreHorizontal, AlertTriangle, CheckCircle, Edit, Trash2 } from 'lucide-react'
import { Task, Board } from '../types'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { ScrollArea } from './ui/scroll-area'
import { Separator } from './ui/separator'

interface TaskListModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  tasks: Task[]
  boards: Board[]
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
  onNavigateToBoard: (boardId: string) => void
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200'
}

const priorityIcons = {
  low: '🔵',
  medium: '🟡',
  high: '🔴'
}

export default function TaskListModal({
  open,
  onOpenChange,
  title,
  description,
  tasks,
  boards,
  onEditTask,
  onDeleteTask,
  onNavigateToBoard
}: TaskListModalProps) {
  const formatDueDate = (dateString?: string) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-50 dark:bg-red-950', icon: '🚨' }
    if (diffDays === 0) return { text: 'Due today', color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-950', icon: '⚠️' }
    if (diffDays === 1) return { text: 'Due tomorrow', color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-950', icon: '⏰' }
    if (diffDays <= 3) return { text: `Due in ${diffDays} days`, color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-950', icon: '📅' }
    return { text: `Due in ${diffDays} days`, color: 'text-muted-foreground', bgColor: '', icon: '📅' }
  }

  const getBoardTitle = (boardId: string) => {
    const board = boards.find(b => b.id === boardId)
    return board?.title || 'Unknown Board'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {tasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No tasks found</p>
              </div>
            ) : (
              tasks.map((task, index) => {
                const dueDateInfo = task.dueDate ? formatDueDate(task.dueDate) : null
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed
                const isDueSoon = task.dueDate && !task.completed && new Date(task.dueDate).getTime() - new Date().getTime() <= 3 * 24 * 60 * 60 * 1000

                return (
                  <div key={task.id}>
                    <Card 
                      className={`cursor-pointer hover:shadow-md transition-all duration-200 group ${
                        task.completed ? 'opacity-75 bg-green-50 dark:bg-green-950/20' : ''
                      } ${
                        isOverdue ? 'border-l-4 border-l-red-500 shadow-red-100 dark:shadow-red-900/20' : 
                        isDueSoon ? 'border-l-4 border-l-yellow-500 shadow-yellow-100 dark:shadow-yellow-900/20' : 
                        'hover:border-l-4 hover:border-l-primary/50'
                      }`}
                      onClick={() => onNavigateToBoard(task.boardId)}
                    >
                      <CardHeader className="pb-2">
                        {/* Deadline Alert Banner */}
                        {(isOverdue || isDueSoon) && dueDateInfo && (
                          <div className={`absolute top-0 left-0 right-0 px-2 py-1 text-xs font-medium text-center ${dueDateInfo.bgColor} ${dueDateInfo.color} rounded-t-lg`}>
                            <div className="flex items-center justify-center gap-1">
                              <span>{dueDateInfo.icon}</span>
                              <span>{dueDateInfo.text}</span>
                            </div>
                          </div>
                        )}
                        
                        <div className={`flex items-start justify-between ${(isOverdue || isDueSoon) ? 'mt-6' : ''}`}>
                          <div className="flex-1">
                            <CardTitle className={`text-sm font-medium leading-tight ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </CardTitle>
                            <CardDescription className="text-xs text-muted-foreground mt-1">
                              {getBoardTitle(task.boardId)}
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-1">
                            {task.completed && (
                              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onEditTask(task)
                                  }}
                                >
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Task
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onNavigateToBoard(task.boardId)
                                  }}
                                >
                                  View Board
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-destructive"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onDeleteTask(task.id)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Task
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        {task.description && (
                          <CardDescription className={`text-xs line-clamp-2 ${task.completed ? 'line-through' : ''}`}>
                            {task.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      
                      <CardContent className="pt-0 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs flex items-center gap-1 ${priorityColors[task.priority]}`}
                          >
                            <span>{priorityIcons[task.priority]}</span>
                            {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                          </Badge>
                          
                          {task.completed && (
                            <Badge variant="outline" className="text-xs text-green-600 dark:text-green-400 border-green-200">
                              ✓ Done
                            </Badge>
                          )}
                        </div>
                        
                        {dueDateInfo && !isOverdue && !isDueSoon && (
                          <div className={`flex items-center text-xs ${dueDateInfo.color}`}>
                            <Calendar className="h-3 w-3 mr-1" />
                            <span className="mr-1">{dueDateInfo.icon}</span>
                            {dueDateInfo.text}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(task.createdAt).toLocaleDateString()}
                          </div>
                          
                          {/* Priority indicator for high priority tasks */}
                          {task.priority === 'high' && !task.completed && (
                            <div className="flex items-center text-red-600 dark:text-red-400">
                              <AlertTriangle className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    {index < tasks.length - 1 && <Separator className="my-2" />}
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
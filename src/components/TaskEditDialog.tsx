import { useState, useEffect } from 'react'
import { CalendarIcon, Plus, X, Check, Clock, User, Tag, FileText, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { Column, Task, Subtask } from '../types'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Calendar as CalendarComponent } from './ui/calendar'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Checkbox } from './ui/checkbox'
import { cn } from '../lib/utils'

interface TaskEditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void
  onDeleteTask: (taskId: string) => void
  columns: Column[]
  subtasks: Subtask[]
  onCreateSubtask: (subtask: Partial<Subtask>) => void
  onUpdateSubtask: (subtaskId: string, updates: Partial<Subtask>) => void
  onDeleteSubtask: (subtaskId: string) => void
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

export default function TaskEditDialog({
  open,
  onOpenChange,
  task,
  onUpdateTask,
  onDeleteTask,
  columns,
  subtasks,
  onCreateSubtask,
  onUpdateSubtask,
  onDeleteSubtask
}: TaskEditDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [columnId, setColumnId] = useState('')
  const [dueDate, setDueDate] = useState<Date>()
  const [completed, setCompleted] = useState(false)
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('')

  // Initialize form with task data
  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description || '')
      setPriority(task.priority)
      setColumnId(task.columnId)
      setDueDate(task.dueDate ? new Date(task.dueDate) : undefined)
      setCompleted(task.completed)
    }
  }, [task])

  const handleSubmit = () => {
    if (!task || !title.trim()) return

    onUpdateTask(task.id, {
      title,
      description,
      priority,
      columnId,
      dueDate: dueDate?.toISOString(),
      completed,
      updatedAt: new Date().toISOString()
    })

    onOpenChange(false)
  }

  const handleDelete = () => {
    if (!task) return
    onDeleteTask(task.id)
    onOpenChange(false)
  }

  const handleAddSubtask = () => {
    if (!task || !newSubtaskTitle.trim()) return

    onCreateSubtask({
      title: newSubtaskTitle,
      taskId: task.id,
      completed: false,
      position: subtasks.length
    })

    setNewSubtaskTitle('')
  }

  const handleSubtaskToggle = (subtaskId: string, completed: boolean) => {
    onUpdateSubtask(subtaskId, { completed })
  }

  const taskSubtasks = subtasks.filter(s => s.taskId === task?.id)
  const completedSubtasks = taskSubtasks.filter(s => s.completed).length
  const progressPercentage = taskSubtasks.length > 0 ? (completedSubtasks / taskSubtasks.length) * 100 : 0

  const formatDueDate = (dateString?: string) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { text: 'Overdue', color: 'text-red-600 dark:text-red-400' }
    if (diffDays === 0) return { text: 'Due today', color: 'text-orange-600 dark:text-orange-400' }
    if (diffDays === 1) return { text: 'Due tomorrow', color: 'text-yellow-600 dark:text-yellow-400' }
    return { text: `Due in ${diffDays} days`, color: 'text-muted-foreground' }
  }

  const dueDateInfo = task?.dueDate ? formatDueDate(task.dueDate) : null

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl">Edit Task</DialogTitle>
              <DialogDescription className="mt-1">
                Update task details and manage subtasks
              </DialogDescription>
            </div>
            <Badge 
              variant="outline" 
              className={`${priorityColors[task.priority]} flex items-center gap-1`}
            >
              <span>{priorityIcons[task.priority]}</span>
              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
            </Badge>
          </div>
          
          {/* Task Status and Progress */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Created {new Date(task.createdAt).toLocaleDateString()}
            </div>
            {dueDateInfo && (
              <div className={`flex items-center gap-1 ${dueDateInfo.color}`}>
                <CalendarIcon className="h-4 w-4" />
                {dueDateInfo.text}
              </div>
            )}
            {taskSubtasks.length > 0 && (
              <div className="flex items-center gap-1">
                <Check className="h-4 w-4" />
                {completedSubtasks}/{taskSubtasks.length} subtasks
              </div>
            )}
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Basic Task Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Task Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter task title..."
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter task description..."
                rows={3}
                className="mt-1"
              />
            </div>
          </div>

          <Separator />

          {/* Task Properties */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="column" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Column
              </Label>
              <Select value={columnId} onValueChange={setColumnId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map((column) => (
                    <SelectItem key={column.id} value={column.id}>
                      {column.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={(value: 'low' | 'medium' | 'high') => setPriority(value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <span>🔵</span> Low
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <span>🟡</span> Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <span>🔴</span> High
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Task Completion */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="completed"
              checked={completed}
              onCheckedChange={(checked) => setCompleted(checked as boolean)}
            />
            <Label htmlFor="completed" className="text-sm font-medium">
              Mark task as completed
            </Label>
          </div>

          <Separator />

          {/* Subtasks Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">
                Subtasks ({completedSubtasks}/{taskSubtasks.length})
              </Label>
              {taskSubtasks.length > 0 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  {Math.round(progressPercentage)}%
                </div>
              )}
            </div>

            {/* Add New Subtask */}
            <div className="flex gap-2">
              <Input
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add a subtask..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddSubtask()}
                className="flex-1"
              />
              <Button 
                onClick={handleAddSubtask}
                disabled={!newSubtaskTitle.trim()}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Subtasks List */}
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {taskSubtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center gap-2 p-2 rounded-lg border bg-muted/30">
                  <Checkbox
                    checked={subtask.completed}
                    onCheckedChange={(checked) => handleSubtaskToggle(subtask.id, checked as boolean)}
                  />
                  <span className={`flex-1 text-sm ${subtask.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {subtask.title}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteSubtask(subtask.id)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-between">
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            className="mr-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Task
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!title.trim()}>
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
import { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { ArrowLeft, Plus, Search, MoreHorizontal, Users, Calendar, TrendingUp, BarChart3, Activity } from 'lucide-react'
import { blink } from '../lib/blink'
import { Board, Column, Task, User, Subtask } from '../types'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import Header from '../components/Header'
import KanbanColumn from '../components/KanbanColumn'
import TaskCard from '../components/TaskCard'
import CreateTaskDialog from '../components/CreateTaskDialog'
import CreateColumnDialog from '../components/CreateColumnDialog'
import TaskEditDialog from '../components/TaskEditDialog'
import AnalyticsDashboard from '../components/AnalyticsDashboard'
import TaskFilter, { TaskFilters } from '../components/TaskFilter'
import ActivityHistory, { ActivityItem } from '../components/ActivityHistory'
import { toast } from 'react-hot-toast'

export default function KanbanBoard() {
  const { boardId } = useParams<{ boardId: string }>()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [board, setBoard] = useState<Board | null>(null)
  const [columns, setColumns] = useState<Column[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false)
  const [isCreateColumnDialogOpen, setIsCreateColumnDialogOpen] = useState(false)
  const [isTaskEditDialogOpen, setIsTaskEditDialogOpen] = useState(false)
  const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [currentView, setCurrentView] = useState<'board' | 'analytics' | 'activity'>('board')
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [filters, setFilters] = useState<TaskFilters>({
    priorities: [],
    statuses: [],
    dueDateRange: 'all',
    columns: []
  })

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Load board data with user-specific filtering
  const loadBoardData = useCallback(async (currentUser: User) => {
    try {
      setLoading(true)
      
      if (!currentUser?.id) return

      // Try to load from Blink database first, fallback to mock data
      try {
        const [boardData, columnsData, tasksData, subtasksData] = await Promise.all([
          blink.db.boards.list({ where: { id: boardId, userId: currentUser.id } }),
          blink.db.columns.list({ where: { boardId, userId: currentUser.id }, orderBy: { position: 'asc' } }),
          blink.db.tasks.list({ where: { boardId, userId: currentUser.id }, orderBy: { position: 'asc' } }),
          blink.db.subtasks.list({ where: { userId: currentUser.id }, orderBy: { position: 'asc' } })
        ])

        if (boardData.length > 0) {
          setBoard(boardData[0])
          setColumns(columnsData)
          setTasks(tasksData)
          setSubtasks(subtasksData)
          
          // If we have a board but no columns, create default columns
          if (columnsData.length === 0) {
            const defaultColumns = [
              {
                id: 'col-1',
                title: '📋 To Do',
                boardId: boardId!,
                position: 0,
                userId: currentUser.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'col-2',
                title: '🚀 In Progress',
                boardId: boardId!,
                position: 1,
                userId: currentUser.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'col-3',
                title: '👀 Review',
                boardId: boardId!,
                position: 2,
                userId: currentUser.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              },
              {
                id: 'col-4',
                title: '✅ Done',
                boardId: boardId!,
                position: 3,
                userId: currentUser.id,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              }
            ]
            
            // Save default columns to database
            for (const column of defaultColumns) {
              try {
                await blink.db.columns.create(column)
              } catch (error) {
                console.log('Error creating default column:', error)
              }
            }
            
            setColumns(defaultColumns)
          }
          
          return
        }
      } catch (error) {
        console.log('Database not available, using mock data')
      }

      // Fallback to enhanced mock data with user-specific storage
      const mockBoard: Board = {
        id: boardId!,
        title: boardId === '1' ? 'Website Redesign Project' : 'Mobile App Development',
        description: boardId === '1' ? 'Complete overhaul of company website with modern design' : 'Build cross-platform iOS and Android applications',
        userId: currentUser.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      const mockColumns: Column[] = [
        {
          id: 'col-1',
          title: '📋 To Do',
          boardId: boardId!,
          position: 0,
          userId: currentUser.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'col-2',
          title: '🚀 In Progress',
          boardId: boardId!,
          position: 1,
          userId: currentUser.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'col-3',
          title: '👀 Review',
          boardId: boardId!,
          position: 2,
          userId: currentUser.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'col-4',
          title: '✅ Done',
          boardId: boardId!,
          position: 3,
          userId: currentUser.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]

      const mockTasks: Task[] = [
        {
          id: 'task-1',
          title: 'Design new homepage layout',
          description: 'Create wireframes and mockups for the new homepage design with modern UI/UX principles',
          columnId: 'col-1',
          boardId: boardId!,
          position: 0,
          priority: 'high',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          completed: false,
          userId: currentUser.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'task-2',
          title: 'Set up development environment',
          description: 'Configure local development setup with all necessary tools and dependencies',
          columnId: 'col-2',
          boardId: boardId!,
          position: 0,
          priority: 'medium',
          completed: false,
          userId: currentUser.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'task-3',
          title: 'Research competitor analysis',
          description: 'Analyze competitor websites and document findings for strategic insights',
          columnId: 'col-4',
          boardId: boardId!,
          position: 0,
          priority: 'low',
          completed: true,
          userId: currentUser.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'task-4',
          title: 'Implement responsive navigation',
          description: 'Build mobile-first navigation component with smooth animations',
          columnId: 'col-2',
          boardId: boardId!,
          position: 1,
          priority: 'high',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          completed: false,
          userId: currentUser.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'task-5',
          title: 'Content strategy planning',
          description: 'Plan content structure and create content calendar for the website',
          columnId: 'col-3',
          boardId: boardId!,
          position: 0,
          priority: 'medium',
          completed: false,
          userId: currentUser.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]

      const mockSubtasks: Subtask[] = [
        {
          id: 'subtask-1',
          title: 'Create wireframes',
          taskId: 'task-1',
          completed: true,
          position: 0,
          userId: currentUser.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'subtask-2',
          title: 'Design mockups',
          taskId: 'task-1',
          completed: false,
          position: 1,
          userId: currentUser.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'subtask-3',
          title: 'Install Node.js',
          taskId: 'task-2',
          completed: true,
          position: 0,
          userId: currentUser.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'subtask-4',
          title: 'Configure VS Code',
          taskId: 'task-2',
          completed: true,
          position: 1,
          userId: currentUser.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]

      setBoard(mockBoard)
      setColumns(mockColumns)
      setTasks(mockTasks)
      setSubtasks(mockSubtasks)
    } catch (error) {
      console.error('Error loading board data:', error)
      toast.error('Failed to load board data')
    } finally {
      setLoading(false)
    }
  }, [boardId])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user && boardId) {
        loadBoardData(state.user)
      }
    })
    return unsubscribe
  }, [boardId, loadBoardData])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find the active task
    const activeTask = tasks.find(task => task.id === activeId)
    if (!activeTask) return

    // Determine the new column
    let newColumnId = overId
    if (overId.startsWith('task-')) {
      const overTask = tasks.find(task => task.id === overId)
      newColumnId = overTask?.columnId || activeTask.columnId
    }

    // Update task position
    if (activeTask.columnId !== newColumnId) {
      updateTask(activeId, { columnId: newColumnId })
      toast.success('Task moved successfully!')
    }
  }

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over logic if needed
  }

  const createTask = async (taskData: Partial<Task>) => {
    try {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: taskData.title || '',
        description: taskData.description || '',
        columnId: taskData.columnId || columns[0]?.id || '',
        boardId: boardId!,
        position: tasks.filter(t => t.columnId === taskData.columnId).length,
        priority: taskData.priority || 'medium',
        dueDate: taskData.dueDate,
        completed: false,
        userId: user?.id || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Try to save to database, fallback to local state
      try {
        await blink.db.tasks.create(newTask)
      } catch (error) {
        console.log('Database not available, using local state')
      }

      setTasks(prev => [...prev, newTask])
      addActivity('created', newTask.title, newTask.id)
      toast.success('Task created successfully!')
    } catch (error) {
      console.error('Error creating task:', error)
      toast.error('Failed to create task')
    }
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const originalTask = tasks.find(t => t.id === taskId)
      if (!originalTask) return

      const updatedTask = { ...updates, updatedAt: new Date().toISOString() }
      
      // Try to update in database, fallback to local state
      try {
        await blink.db.tasks.update(taskId, updatedTask)
      } catch (error) {
        console.log('Database not available, using local state')
      }

      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updatedTask } : task
      ))

      // Track specific changes
      if (updates.columnId && updates.columnId !== originalTask.columnId) {
        const fromColumn = columns.find(c => c.id === originalTask.columnId)?.title || 'Unknown'
        const toColumn = columns.find(c => c.id === updates.columnId)?.title || 'Unknown'
        addActivity('moved', originalTask.title, taskId, { from: fromColumn, to: toColumn })
      } else if (updates.completed !== undefined && updates.completed !== originalTask.completed) {
        addActivity('completed', originalTask.title, taskId)
      } else if (updates.priority && updates.priority !== originalTask.priority) {
        addActivity('priority_changed', originalTask.title, taskId, { 
          oldValue: originalTask.priority, 
          newValue: updates.priority 
        })
      } else if (updates.dueDate !== originalTask.dueDate) {
        addActivity('due_date_changed', originalTask.title, taskId, { 
          oldValue: originalTask.dueDate, 
          newValue: updates.dueDate 
        })
      } else {
        addActivity('updated', originalTask.title, taskId)
      }

      toast.success('Task updated successfully!')
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error('Failed to update task')
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const taskToDelete = tasks.find(t => t.id === taskId)
      if (!taskToDelete) return

      // Try to delete from database, fallback to local state
      try {
        await blink.db.tasks.delete(taskId)
        await blink.db.subtasks.list({ where: { taskId } }).then(subtasks => 
          Promise.all(subtasks.map(s => blink.db.subtasks.delete(s.id)))
        )
      } catch (error) {
        console.log('Database not available, using local state')
      }

      setTasks(prev => prev.filter(task => task.id !== taskId))
      setSubtasks(prev => prev.filter(subtask => subtask.taskId !== taskId))
      addActivity('deleted', taskToDelete.title, taskId)
      toast.success('Task deleted successfully!')
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
    }
  }

  const createColumn = async (title: string) => {
    try {
      const newColumn: Column = {
        id: `col-${Date.now()}`,
        title,
        boardId: boardId!,
        position: columns.length,
        userId: user?.id || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Try to save to database, fallback to local state
      try {
        await blink.db.columns.create(newColumn)
      } catch (error) {
        console.log('Database not available, using local state')
      }

      setColumns(prev => [...prev, newColumn])
      toast.success('Column created successfully!')
    } catch (error) {
      console.error('Error creating column:', error)
      toast.error('Failed to create column')
    }
  }

  const createSubtask = async (subtaskData: Partial<Subtask>) => {
    try {
      const newSubtask: Subtask = {
        id: `subtask-${Date.now()}`,
        title: subtaskData.title || '',
        taskId: subtaskData.taskId || '',
        completed: false,
        position: subtaskData.position || 0,
        userId: user?.id || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Try to save to database, fallback to local state
      try {
        await blink.db.subtasks.create(newSubtask)
      } catch (error) {
        console.log('Database not available, using local state')
      }

      setSubtasks(prev => [...prev, newSubtask])
      toast.success('Subtask created successfully!')
    } catch (error) {
      console.error('Error creating subtask:', error)
      toast.error('Failed to create subtask')
    }
  }

  const updateSubtask = async (subtaskId: string, updates: Partial<Subtask>) => {
    try {
      const updatedSubtask = { ...updates, updatedAt: new Date().toISOString() }
      
      // Try to update in database, fallback to local state
      try {
        await blink.db.subtasks.update(subtaskId, updatedSubtask)
      } catch (error) {
        console.log('Database not available, using local state')
      }

      setSubtasks(prev => prev.map(subtask => 
        subtask.id === subtaskId ? { ...subtask, ...updatedSubtask } : subtask
      ))
    } catch (error) {
      console.error('Error updating subtask:', error)
      toast.error('Failed to update subtask')
    }
  }

  const deleteSubtask = async (subtaskId: string) => {
    try {
      // Try to delete from database, fallback to local state
      try {
        await blink.db.subtasks.delete(subtaskId)
      } catch (error) {
        console.log('Database not available, using local state')
      }

      setSubtasks(prev => prev.filter(subtask => subtask.id !== subtaskId))
    } catch (error) {
      console.error('Error deleting subtask:', error)
      toast.error('Failed to delete subtask')
    }
  }

  const handleEditTask = (task: Task) => {
    setSelectedTask(task)
    setIsTaskEditDialogOpen(true)
  }

  // Add activity tracking
  const addActivity = (type: ActivityItem['type'], taskTitle: string, taskId: string, details: any = {}) => {
    const newActivity: ActivityItem = {
      id: `activity-${Date.now()}`,
      type,
      taskTitle,
      taskId,
      userId: user?.id || '',
      userName: user?.displayName || user?.email?.split('@')[0] || 'You',
      timestamp: new Date().toISOString(),
      details
    }
    setActivities(prev => [newActivity, ...prev])
  }

  // Enhanced task filtering
  const filteredTasks = useMemo(() => {
    let filtered = tasks.filter(task =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    // Apply priority filter
    if (filters.priorities.length > 0) {
      filtered = filtered.filter(task => filters.priorities.includes(task.priority))
    }

    // Apply status filter
    if (filters.statuses.length > 0) {
      filtered = filtered.filter(task => {
        if (filters.statuses.includes('completed') && task.completed) return true
        if (filters.statuses.includes('overdue') && task.dueDate && new Date(task.dueDate) < new Date() && !task.completed) return true
        if (filters.statuses.includes('pending') && !task.completed && (!task.dueDate || new Date(task.dueDate) >= new Date())) return true
        return false
      })
    }

    // Apply due date filter
    if (filters.dueDateRange !== 'all') {
      const now = new Date()
      filtered = filtered.filter(task => {
        if (!task.dueDate) return false
        const dueDate = new Date(task.dueDate)
        
        switch (filters.dueDateRange) {
          case 'today':
            return dueDate.toDateString() === now.toDateString()
          case 'week': {
            const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
            return dueDate >= now && dueDate <= weekFromNow
          }
          case 'overdue':
            return dueDate < now && !task.completed
          default:
            return true
        }
      })
    }

    // Apply column filter
    if (filters.columns.length > 0) {
      filtered = filtered.filter(task => filters.columns.includes(task.columnId))
    }

    return filtered
  }, [tasks, searchQuery, filters])

  // Count active filters
  const activeFilterCount = useMemo(() => {
    return filters.priorities.length + 
           filters.statuses.length + 
           (filters.dueDateRange !== 'all' ? 1 : 0) + 
           filters.columns.length
  }, [filters])

  // Calculate board statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(task => task.completed).length
  const overdueTasks = tasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date() && !task.completed
  ).length
  const highPriorityTasks = tasks.filter(task => task.priority === 'high').length
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-8 bg-muted rounded w-64"></div>
                <div className="h-4 bg-muted rounded w-96"></div>
              </div>
              <div className="flex gap-2">
                <div className="h-10 bg-muted rounded w-32"></div>
                <div className="h-10 bg-muted rounded w-24"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-6 bg-muted rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="h-6 bg-muted rounded"></div>
                  <div className="space-y-2">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-32 bg-muted rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!board) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h1 className="text-2xl font-bold">Board not found</h1>
            <p className="text-muted-foreground">The board you're looking for doesn't exist or you don't have access to it.</p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6">
        {/* Board Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="flex items-start space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="mt-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {board.title}
              </h1>
              {board.description && (
                <p className="text-muted-foreground text-lg">{board.description}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateColumnDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Column
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setSelectedColumnId(columns[0]?.id || null)
                setIsCreateTaskDialogOpen(true)
              }}
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Board Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold">{totalTasks}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{completedTasks}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                  <span className="text-green-600 dark:text-green-400 text-sm font-bold">✓</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold">{overdueTasks}</p>
                </div>
                <div className="h-8 w-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                  <p className="text-2xl font-bold">{highPriorityTasks}</p>
                </div>
                <div className="h-8 w-8 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 dark:text-orange-400 text-sm">🔴</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Project Progress</h3>
              <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{completedTasks} completed</span>
              <span>{totalTasks - completedTasks} remaining</span>
            </div>
          </CardContent>
        </Card>

        {/* View Tabs */}
        <Tabs value={currentView} onValueChange={(value: any) => setCurrentView(value)} className="mb-8">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="board" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Board
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Activity
            </TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="space-y-8">
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <TaskFilter
                  filters={filters}
                  onFiltersChange={setFilters}
                  availableColumns={columns}
                  activeFilterCount={activeFilterCount}
                />
                <Button variant="outline" size="sm">
                  <Users className="h-4 w-4 mr-2" />
                  Assign
                </Button>
              </div>
            </div>

            {/* Kanban Board */}
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {columns.map((column) => (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    tasks={filteredTasks.filter(task => task.columnId === column.id)}
                    onAddTask={() => {
                      setSelectedColumnId(column.id)
                      setIsCreateTaskDialogOpen(true)
                    }}
                    onEditTask={handleEditTask}
                  />
                ))}
              </div>
            </DndContext>
          </TabsContent>

          <TabsContent value="analytics">
            <AnalyticsDashboard tasks={tasks} boardTitle={board.title} />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityHistory activities={activities} />
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <CreateTaskDialog
          open={isCreateTaskDialogOpen}
          onOpenChange={setIsCreateTaskDialogOpen}
          onCreateTask={createTask}
          columns={columns}
          selectedColumnId={selectedColumnId}
        />

        <CreateColumnDialog
          open={isCreateColumnDialogOpen}
          onOpenChange={setIsCreateColumnDialogOpen}
          onCreateColumn={createColumn}
        />

        <TaskEditDialog
          open={isTaskEditDialogOpen}
          onOpenChange={setIsTaskEditDialogOpen}
          task={selectedTask}
          onUpdateTask={updateTask}
          onDeleteTask={deleteTask}
          columns={columns}
          subtasks={subtasks}
          onCreateSubtask={createSubtask}
          onUpdateSubtask={updateSubtask}
          onDeleteSubtask={deleteSubtask}
        />
      </main>
    </div>
  )
}
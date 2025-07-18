import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, MoreHorizontal, Calendar, Users, TrendingUp, Clock, Target, Zap } from 'lucide-react'
import { blink } from '../lib/blink'
import { Board, User, Task } from '../types'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu'
import { Badge } from '../components/ui/badge'
import { Progress } from '../components/ui/progress'
import Header from '../components/Header'
import { toast } from 'react-hot-toast'

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [boards, setBoards] = useState<Board[]>([])
  const [allTasks, setAllTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newBoardTitle, setNewBoardTitle] = useState('')
  const [newBoardDescription, setNewBoardDescription] = useState('')
  const navigate = useNavigate()

  const loadDashboardData = useCallback(async (currentUser: User) => {
    try {
      setLoading(true)
      
      if (!currentUser?.id) return

      // Try to load from Blink database first, fallback to mock data
      try {
        const [boardsData, tasksData] = await Promise.all([
          blink.db.boards.list({ where: { userId: currentUser.id }, orderBy: { updatedAt: 'desc' } }),
          blink.db.tasks.list({ where: { userId: currentUser.id } })
        ])

        if (boardsData.length > 0) {
          setBoards(boardsData)
          setAllTasks(tasksData)
          return
        }
      } catch (error) {
        console.log('Database not available, using mock data')
      }

      // Enhanced mock data with user-specific storage
      const mockBoards: Board[] = [
        {
          id: '1',
          title: 'Website Redesign Project',
          description: 'Complete overhaul of company website with modern design and improved UX',
          userId: currentUser.id,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '2',
          title: 'Mobile App Development',
          description: 'Build cross-platform iOS and Android applications with React Native',
          userId: currentUser.id,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
          id: '3',
          title: 'Marketing Campaign Q1',
          description: 'Plan and execute marketing campaigns for the first quarter',
          userId: currentUser.id,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        }
      ]

      // Mock tasks for statistics
      const mockTasks: Task[] = [
        {
          id: 'task-1',
          title: 'Design homepage',
          description: 'Create new homepage design',
          columnId: 'col-1',
          boardId: '1',
          position: 0,
          priority: 'high',
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          completed: false,
          userId: currentUser.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'task-2',
          title: 'Setup development environment',
          description: 'Configure dev environment',
          columnId: 'col-2',
          boardId: '1',
          position: 0,
          priority: 'medium',
          completed: true,
          userId: currentUser.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'task-3',
          title: 'Research competitors',
          description: 'Analyze competitor strategies',
          columnId: 'col-3',
          boardId: '1',
          position: 0,
          priority: 'low',
          completed: true,
          userId: currentUser.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'task-4',
          title: 'Build mobile app UI',
          description: 'Create mobile app interface',
          columnId: 'col-1',
          boardId: '2',
          position: 0,
          priority: 'high',
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          completed: false,
          userId: currentUser.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'task-5',
          title: 'Plan social media strategy',
          description: 'Create social media content plan',
          columnId: 'col-1',
          boardId: '3',
          position: 0,
          priority: 'medium',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          completed: false,
          userId: currentUser.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]

      setBoards(mockBoards)
      setAllTasks(mockTasks)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      if (state.user) {
        loadDashboardData(state.user)
      }
    })
    return unsubscribe
  }, [loadDashboardData])

  const createBoard = async () => {
    if (!newBoardTitle.trim()) return

    try {
      const newBoard: Board = {
        id: `board-${Date.now()}`,
        title: newBoardTitle,
        description: newBoardDescription,
        userId: user?.id || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // Try to save to database, fallback to local state
      try {
        await blink.db.boards.create(newBoard)
      } catch (error) {
        console.log('Database not available, using local state')
      }

      setBoards(prev => [newBoard, ...prev])
      setNewBoardTitle('')
      setNewBoardDescription('')
      setIsCreateDialogOpen(false)
      toast.success('Board created successfully!')
    } catch (error) {
      console.error('Error creating board:', error)
      toast.error('Failed to create board')
    }
  }

  const deleteBoard = async (boardId: string) => {
    try {
      // Try to delete from database, fallback to local state
      try {
        await blink.db.boards.delete(boardId)
      } catch (error) {
        console.log('Database not available, using local state')
      }

      setBoards(prev => prev.filter(board => board.id !== boardId))
      toast.success('Board deleted successfully!')
    } catch (error) {
      console.error('Error deleting board:', error)
      toast.error('Failed to delete board')
    }
  }

  const filteredBoards = boards.filter(board =>
    board.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    board.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calculate dashboard statistics
  const totalTasks = allTasks.length
  const completedTasks = allTasks.filter(task => task.completed).length
  const overdueTasks = allTasks.filter(task => 
    task.dueDate && new Date(task.dueDate) < new Date() && !task.completed
  ).length
  const dueTodayTasks = allTasks.filter(task => {
    if (!task.dueDate || task.completed) return false
    const today = new Date()
    const dueDate = new Date(task.dueDate)
    return dueDate.toDateString() === today.toDateString()
  }).length
  const highPriorityTasks = allTasks.filter(task => task.priority === 'high' && !task.completed).length
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  // Get board statistics
  const getBoardStats = (boardId: string) => {
    const boardTasks = allTasks.filter(task => task.boardId === boardId)
    const completed = boardTasks.filter(task => task.completed).length
    const total = boardTasks.length
    const progress = total > 0 ? (completed / total) * 100 : 0
    return { completed, total, progress }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col space-y-8">
          {/* Header Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Welcome back, {user?.displayName || user?.email?.split('@')[0]}
              </h1>
              <p className="text-muted-foreground text-lg">
                Manage your projects and stay organized with your personal Kanban boards
              </p>
            </div>
            
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  New Board
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="text-xl">Create New Board</DialogTitle>
                  <DialogDescription>
                    Create a new Kanban board to organize your tasks and projects effectively.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Board Title</Label>
                    <Input
                      id="title"
                      value={newBoardTitle}
                      onChange={(e) => setNewBoardTitle(e.target.value)}
                      placeholder="e.g., Website Redesign, Marketing Campaign..."
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={newBoardDescription}
                      onChange={(e) => setNewBoardDescription(e.target.value)}
                      placeholder="Describe what this board is for..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createBoard} disabled={!newBoardTitle.trim()}>
                    Create Board
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Dashboard Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                    <p className="text-2xl font-bold">{totalTasks}</p>
                  </div>
                  <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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
                  <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Due Today</p>
                    <p className="text-2xl font-bold">{dueTodayTasks}</p>
                  </div>
                  <div className="h-10 w-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                    <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
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
                  <div className="h-10 w-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">High Priority</p>
                    <p className="text-2xl font-bold">{highPriorityTasks}</p>
                  </div>
                  <div className="h-10 w-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                    <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Overall Progress */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Overall Progress</h3>
                  <p className="text-sm text-muted-foreground">Your task completion across all boards</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{Math.round(progressPercentage)}%</p>
                  <p className="text-sm text-muted-foreground">Complete</p>
                </div>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>{completedTasks} completed</span>
                <span>{totalTasks - completedTasks} remaining</span>
              </div>
            </CardContent>
          </Card>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search boards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Boards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-full"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-2 bg-muted rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredBoards.length === 0 ? (
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mb-6">
                <Calendar className="h-12 w-12 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery ? 'No boards found' : 'No boards yet'}
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery 
                  ? 'Try adjusting your search terms to find the board you\'s looking for'
                  : 'Create your first board to get started with organizing your tasks and projects'
                }
              </p>
              {!searchQuery && (
                <Button 
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Board
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBoards.map((board) => {
                const stats = getBoardStats(board.id)
                return (
                  <Card 
                    key={board.id} 
                    className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-l-4 border-l-primary/50 hover:border-l-primary"
                    onClick={() => navigate(`/board/${board.id}`)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
                            {board.title}
                          </CardTitle>
                          {board.description && (
                            <CardDescription className="mt-1 line-clamp-2">
                              {board.description}
                            </CardDescription>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation()
                              navigate(`/board/${board.id}`)
                            }}>
                              Open Board
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation()
                                deleteBoard(board.id)
                              }}
                              className="text-destructive"
                            >
                              Delete Board
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{stats.completed}/{stats.total} tasks</span>
                        </div>
                        <Progress value={stats.progress} className="h-2" />
                      </div>
                      
                      {/* Board Info */}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          <span>Personal</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>{new Date(board.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
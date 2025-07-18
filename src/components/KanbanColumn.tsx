import { useDroppable } from '@dnd-kit/core'
import { Plus, MoreHorizontal } from 'lucide-react'
import { Column, Task } from '../types'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import TaskCard from './TaskCard'

interface KanbanColumnProps {
  column: Column
  tasks: Task[]
  onAddTask: () => void
  onEditTask: (task: Task) => void
}

export default function KanbanColumn({ column, tasks, onAddTask, onEditTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  return (
    <Card className={`h-fit ${isOver ? 'ring-2 ring-primary' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {column.title}
            <span className="bg-muted text-muted-foreground text-xs px-2 py-1 rounded-full">
              {tasks.length}
            </span>
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onAddTask}>
                Add Task
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Delete Column
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3" ref={setNodeRef}>
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onEditTask={onEditTask} />
        ))}
        
        {tasks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">No tasks yet</p>
          </div>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onAddTask}
          className="w-full justify-start text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add a task
        </Button>
      </CardContent>
    </Card>
  )
}
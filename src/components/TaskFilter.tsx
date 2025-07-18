import { useState } from 'react'
import { Filter, X, Calendar, Tag, CheckCircle, Clock } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Checkbox } from './ui/checkbox'
import { Label } from './ui/label'
import { Separator } from './ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

export interface TaskFilters {
  priorities: ('low' | 'medium' | 'high')[]
  statuses: ('completed' | 'pending' | 'overdue')[]
  dueDateRange: 'all' | 'today' | 'week' | 'overdue'
  columns: string[]
}

interface TaskFilterProps {
  filters: TaskFilters
  onFiltersChange: (filters: TaskFilters) => void
  availableColumns: { id: string; title: string }[]
  activeFilterCount: number
}

export default function TaskFilter({ 
  filters, 
  onFiltersChange, 
  availableColumns,
  activeFilterCount 
}: TaskFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handlePriorityChange = (priority: 'low' | 'medium' | 'high', checked: boolean) => {
    const newPriorities = checked
      ? [...filters.priorities, priority]
      : filters.priorities.filter(p => p !== priority)
    
    onFiltersChange({ ...filters, priorities: newPriorities })
  }

  const handleStatusChange = (status: 'completed' | 'pending' | 'overdue', checked: boolean) => {
    const newStatuses = checked
      ? [...filters.statuses, status]
      : filters.statuses.filter(s => s !== status)
    
    onFiltersChange({ ...filters, statuses: newStatuses })
  }

  const handleColumnChange = (columnId: string, checked: boolean) => {
    const newColumns = checked
      ? [...filters.columns, columnId]
      : filters.columns.filter(c => c !== columnId)
    
    onFiltersChange({ ...filters, columns: newColumns })
  }

  const handleDueDateRangeChange = (range: 'all' | 'today' | 'week' | 'overdue') => {
    onFiltersChange({ ...filters, dueDateRange: range })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      priorities: [],
      statuses: [],
      dueDateRange: 'all',
      columns: []
    })
  }

  const hasActiveFilters = activeFilterCount > 0

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="relative">
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {hasActiveFilters && (
              <Badge 
                variant="secondary" 
                className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filter Tasks</h4>
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="h-auto p-1 text-xs"
                >
                  Clear all
                </Button>
              )}
            </div>

            <Separator />

            {/* Priority Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <Label className="font-medium">Priority</Label>
              </div>
              <div className="space-y-2">
                {[
                  { value: 'high', label: 'High Priority', color: 'text-red-600', icon: '🔴' },
                  { value: 'medium', label: 'Medium Priority', color: 'text-yellow-600', icon: '🟡' },
                  { value: 'low', label: 'Low Priority', color: 'text-blue-600', icon: '🔵' }
                ].map((priority) => (
                  <div key={priority.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`priority-${priority.value}`}
                      checked={filters.priorities.includes(priority.value as any)}
                      onCheckedChange={(checked) => 
                        handlePriorityChange(priority.value as any, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`priority-${priority.value}`}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <span>{priority.icon}</span>
                      <span className={priority.color}>{priority.label}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Status Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <Label className="font-medium">Status</Label>
              </div>
              <div className="space-y-2">
                {[
                  { value: 'completed', label: 'Completed', color: 'text-green-600', icon: '✅' },
                  { value: 'pending', label: 'In Progress', color: 'text-blue-600', icon: '⏳' },
                  { value: 'overdue', label: 'Overdue', color: 'text-red-600', icon: '🚨' }
                ].map((status) => (
                  <div key={status.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`status-${status.value}`}
                      checked={filters.statuses.includes(status.value as any)}
                      onCheckedChange={(checked) => 
                        handleStatusChange(status.value as any, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`status-${status.value}`}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <span>{status.icon}</span>
                      <span className={status.color}>{status.label}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Due Date Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <Label className="font-medium">Due Date</Label>
              </div>
              <Select 
                value={filters.dueDateRange} 
                onValueChange={handleDueDateRangeChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tasks</SelectItem>
                  <SelectItem value="today">Due today</SelectItem>
                  <SelectItem value="week">Due this week</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Column Filter */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <Label className="font-medium">Columns</Label>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {availableColumns.map((column) => (
                  <div key={column.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`column-${column.id}`}
                      checked={filters.columns.includes(column.id)}
                      onCheckedChange={(checked) => 
                        handleColumnChange(column.id, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={`column-${column.id}`}
                      className="text-sm cursor-pointer truncate"
                    >
                      {column.title}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex items-center gap-1 flex-wrap">
          {filters.priorities.map((priority) => (
            <Badge 
              key={priority} 
              variant="secondary" 
              className="text-xs"
            >
              {priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🔵'} {priority}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto w-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => handlePriorityChange(priority, false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          {filters.statuses.map((status) => (
            <Badge 
              key={status} 
              variant="secondary" 
              className="text-xs"
            >
              {status === 'completed' ? '✅' : status === 'pending' ? '⏳' : '🚨'} {status}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto w-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => handleStatusChange(status, false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          
          {filters.dueDateRange !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              📅 {filters.dueDateRange}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto w-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => handleDueDateRangeChange('all')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
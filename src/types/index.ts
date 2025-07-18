export interface Board {
  id: string
  title: string
  description?: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Column {
  id: string
  title: string
  boardId: string
  position: number
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description?: string
  columnId: string
  boardId: string
  position: number
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  completed: boolean
  userId: string
  createdAt: string
  updatedAt: string
}

export interface Subtask {
  id: string
  title: string
  taskId: string
  completed: boolean
  position: number
  userId: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  displayName?: string
}
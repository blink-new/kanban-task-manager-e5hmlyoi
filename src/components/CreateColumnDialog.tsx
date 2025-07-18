import { useState } from 'react'
import { Button } from './ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog'
import { Input } from './ui/input'
import { Label } from './ui/label'

interface CreateColumnDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateColumn: (title: string) => void
}

export default function CreateColumnDialog({
  open,
  onOpenChange,
  onCreateColumn
}: CreateColumnDialogProps) {
  const [title, setTitle] = useState('')

  const handleSubmit = () => {
    if (!title.trim()) return

    onCreateColumn(title)
    setTitle('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Column</DialogTitle>
          <DialogDescription>
            Add a new column to organize your tasks. For example: "To Do", "In Progress", "Done".
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="column-title">Column Title</Label>
            <Input
              id="column-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter column title..."
              className="mt-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!title.trim()}>
            Create Column
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
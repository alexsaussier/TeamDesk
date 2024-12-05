import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface DeleteConsultantModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  consultantName: string
}

export default function DeleteConsultantModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  consultantName 
}: DeleteConsultantModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Consultant</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p>Are you sure you want to delete {consultantName}?</p>
          <p className="text-sm text-muted-foreground mt-2">
            This action cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 
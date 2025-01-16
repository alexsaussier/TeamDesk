import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Download, Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface BatchUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

const csvFormats = {
  consultants: "name,level,skills\nJohn Doe,manager,\"javascript,react,nodejs\"",
  projects: "name,client,requiredSkills,startDate,endDate,teamSize.junior,teamSize.manager,teamSize.partner,status,chanceToClose\nProject Alpha,Client Co,\"react,nodejs\",2024-04-01,2024-08-31,2,1,0.5,Discussions,80"
}

export function BatchUploadModal({ isOpen, onClose, onSuccess }: BatchUploadModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [type, setType] = useState<'consultants' | 'projects'>('consultants')
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])

  const handleUpload = async () => {
    if (!file) return

    setIsUploading(true)
    setError(null)
    setValidationErrors([])

    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)

    try {
      const response = await fetch('/api/batch-upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          setValidationErrors(data.errors)
          throw new Error('Please fix the validation errors below')
        } else if (data.details) {
          throw new Error(`${data.error}: ${data.details}`)
        } else {
          throw new Error(data.error || 'Upload failed')
        }
      }
      else{
        console.log('Upload successful')
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <div className="max-h-[80vh] overflow-y-auto pr-2">
          <DialogHeader className="mb-4">
            <DialogTitle>Batch Upload</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <RadioGroup value={type} onValueChange={(v) => setType(v as 'consultants' | 'projects')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="consultants" id="consultants" />
                <Label htmlFor="consultants">Workforce</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-white border shadow-lg">
                      <pre className="text-xs text-gray-900">{csvFormats.consultants}</pre>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="projects" id="projects" />
                <Label htmlFor="projects">Projects</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-white border shadow-lg">
                      <pre className="text-xs text-gray-900">{csvFormats.projects}</pre>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </RadioGroup>

            <div className="space-y-2">
              <Label>Upload File (.csv, .xlsx, .xls)</Label>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {validationErrors.length > 0 && (
              <Alert variant="destructive" className="space-y-2">
                <AlertDescription>
                  <div className="font-medium">Validation errors found:</div>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {validationErrors.map((error, index) => (
                      <li key={index}>
                        Row {error.row}: {error.field} - {error.message}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => {
                // Download template logic here
              }}>
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
              <Button onClick={handleUpload} disabled={!file || isUploading}>
                {isUploading ? 'Uploading...' : 'Upload'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Consultant, Project } from '@/types'

interface SAPConfig {
  baseUrl: string;
  apiKey: string;
}

interface PreviewData {
  consultants: Consultant[];
  projects: Project[];
}

export function SAPImportButton({ onImportComplete }: { onImportComplete: () => void }) {
  const [isImporting, setIsImporting] = useState(false)
  const [showConfig, setShowConfig] = useState(false)
  const [step, setStep] = useState<'config' | 'preview'>('config')
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [config, setConfig] = useState<SAPConfig>({
    baseUrl: '',
    apiKey: ''
  })
  const { toast } = useToast()

  const handlePreview = async () => {
    try {
      const response = await fetch('/api/integrations/sap/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'preview',
          config
        })
      })
      
      if (!response.ok) throw new Error('Preview failed')
      
      const data = await response.json()
      setPreviewData(data)
      setStep('preview')
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Failed to fetch preview data'
      toast({
        title: 'Preview Failed',
        description: error,
        variant: 'destructive'
      })
    }
  }

  const handleImport = async () => {
    try {
      setIsImporting(true)
      const response = await fetch('/api/integrations/sap/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action: 'import',
          config
        })
      })
      
      if (!response.ok) throw new Error('Import failed')
      
      const data = await response.json()
      toast({
        title: 'Import Successful',
        description: `Imported ${data.consultantsImported} consultants and ${data.projectsImported} projects`
      })
      onImportComplete()
    } catch (err: unknown) {
      const error = err instanceof Error ? err.message : 'Failed to import data from SAP'
      toast({
        title: 'Import Failed',
        description: error,
        variant: 'destructive'
      })
    } finally {
      setIsImporting(false)
      setShowConfig(false)
      setStep('config')
      setPreviewData(null)
    }
  }

  const renderPreview = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-medium">Consultants to Import ({previewData?.consultants.length})</h3>
        <div className="max-h-40 overflow-y-auto border rounded-md p-2">
          {previewData?.consultants.map(consultant => (
            <div key={consultant.id} className="py-1">
              {consultant.name} - {consultant.level}
            </div>
          ))}
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="font-medium">Projects to Import ({previewData?.projects.length})</h3>
        <div className="max-h-40 overflow-y-auto border rounded-md p-2">
          {previewData?.projects.map(project => (
            <div key={project.id} className="py-1">
              {project.name} - {project.client}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={() => setStep('config')}>Back</Button>
        <Button onClick={handleImport} disabled={isImporting}>
          {isImporting ? 'Importing...' : 'Confirm Import'}
        </Button>
      </div>
    </div>
  )

  return (
    <>
      <Button 
        onClick={() => setShowConfig(true)} 
        disabled={isImporting}
        className="flex items-center gap-2"
      >
        {isImporting ? 'Importing...' : 'Import from SAP'}
      </Button>

      <Dialog open={showConfig} onOpenChange={setShowConfig}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>SAP Integration Configuration</DialogTitle>
          </DialogHeader>
          
          {step === 'config' ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="baseUrl">Base URL</Label>
                <Input
                  id="baseUrl"
                  placeholder="https://your-sap-instance.com"
                  value={config.baseUrl}
                  onChange={e => setConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={config.apiKey}
                  onChange={e => setConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                />
              </div>
              <Button 
                className="w-full" 
                onClick={handlePreview}
                disabled={!config.baseUrl || !config.apiKey}
              >
                Preview Import
              </Button>
            </div>
          ) : (
            renderPreview()
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

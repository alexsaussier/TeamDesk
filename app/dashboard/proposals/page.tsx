"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, FileText } from "lucide-react";

export default function ProposalPage() {
  const [file, setFile] = useState<File | null>(null);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB
      setDraft('Error: File size too large. Please upload a smaller file.');
      return;
    }

    setDraft("");
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("rfp", file);
      console.log('Sending request from FE to /api/proposals with formdata');

      const response = await fetch("/api/proposals", {
        method: "POST",
        body: formData,
      });

      console.log('Response:', response);

      if (response.status === 404) {
        throw new Error('API route not found. Please check server configuration.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        setDraft(prev => prev + decoder.decode(value, { stream: true }));
      }
    } catch (error) {
      console.error(error);
      setDraft('Error: Failed to process the file. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">AI Proposal Generator</h1>
        </div>

        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Upload RFP Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rfp">Upload RFP PDF Document</Label>
                <div className="flex gap-4">
                  <input
                    id="rfp"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium"
                  />
                  <Button 
                    type="submit" 
                    disabled={!file || isLoading}
                    className="bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        Generate Proposal
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-gray-50">
          <CardHeader>
            <CardTitle>Generated Proposal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative min-h-[300px] rounded-lg border bg-white p-4 overflow-auto">
              {draft ? (
                <div className="text-sm break-words whitespace-pre-wrap font-mono">
                  {draft}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                  {isLoading ? "Generating proposal..." : "Upload an RFP to generate a proposal"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

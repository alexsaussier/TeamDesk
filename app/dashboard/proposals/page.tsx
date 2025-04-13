"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Wand2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { GradientButton } from "@/components/GradientButton";

export default function ProposalPage() {
  const [file, setFile] = useState<File | null>(null);
  const [draft, setDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

      const response = await fetch("/api/proposals", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No reader available');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        setDraft(prev => prev + text);
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
          <h1 className="text-3xl font-bold">Proposals (Beta Version)</h1>
        </div>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text">
            Generate proposals with AI
          </h3>
          <Wand2 className="w-4 h-4 text-purple-500" />
        </div>

        <Card className="bg-gradient-to-l from-blue-300 to-blue-500 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-white" />
              Upload RFP Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rfp">Upload a RFP document (pdf format). Our tool will read the RFP and generate a tailored proposal.</Label>
                <div className="flex gap-4">
                  <div className="relative">
                    <label 
                      htmlFor="rfp" 
                      className="flex h-10 w-full items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-blue-500 hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      Choose RFP File
                    </label>
                    <input
                      id="rfp"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 opacity-0 w-full h-full"
                    />
                    {file && (
                      <p className="mt-2 text-sm text-gray-600">
                        Selected file: {file.name}
                      </p>
                    )}
                  </div>
                  <GradientButton
                    label="Generate Proposal"
                    variant="gray"
                    icon={Wand2}
                    type="submit" 
                    disabled={!file || isLoading}
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
                  </GradientButton>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-l from-blue-300 to-blue-500 text-white">
          <CardHeader>
            <CardTitle>Generated Proposal</CardTitle>
          </CardHeader>
          <CardContent className="text-black">
            <div className="relative min-h-[300px] rounded-lg border bg-white p-4 overflow-auto ">
              {draft ? (
                <div className="prose prose-sm max-w-none [&>*]:mb-4 [&>h1]:mt-8 [&>h2]:mt-6 [&>h3]:mt-4">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-4">{children}</p>,
                      h1: ({ children }) => <h1 className="mt-8 mb-4">{children}</h1>,
                      h2: ({ children }) => <h2 className="mt-6 mb-4">{children}</h2>,
                      h3: ({ children }) => <h3 className="mt-4 mb-3">{children}</h3>,
                      ul: ({ children }) => <ul className="mb-4 list-disc pl-6">{children}</ul>,
                      ol: ({ children }) => <ol className="mb-4 list-decimal pl-6">{children}</ol>,
                      li: ({ children }) => <li className="mb-1">{children}</li>,
                    }}
                  >
                    {draft}
                  </ReactMarkdown>
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

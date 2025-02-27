"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Mic, FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface JobDescriptionCreatorProps {
  onComplete: (description: string) => void;
  onCancel: () => void;
}

export default function JobDescriptionCreator({ onComplete, onCancel }: JobDescriptionCreatorProps) {
  const [inputMethod, setInputMethod] = useState<"chat" | "voice">("chat");
  const [chatInput, setChatInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // For voice recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleChatSubmit = async () => {
    if (!chatInput.trim()) {
      toast({
        title: "Input required",
        description: "Please enter some details about the job position.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/recruitment/generate-jd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: chatInput, method: "text" }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate job description");
      }

      const data = await response.json();
      setGeneratedDescription(data.description);
    } catch (error) {
      console.error("Error generating job description:", error);
      toast({
        title: "Error",
        description: "Failed to generate job description. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        await processAudioInput(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      toast({
        title: "Recording started",
        description: "Speak clearly about the job position you want to create.",
      });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Error",
        description: "Could not access your microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const processAudioInput = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob);

      const response = await fetch("/api/recruitment/generate-jd", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process audio input");
      }

      const data = await response.json();
      setGeneratedDescription(data.description);
    } catch (error) {
      console.error("Error processing audio:", error);
      toast({
        title: "Error",
        description: "Failed to process audio. Please try again or use text input.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditDescription = () => {
    // Allow editing the generated description
    setChatInput(generatedDescription || "");
    setGeneratedDescription(null);
  };

  const handleComplete = () => {
    if (generatedDescription) {
      onComplete(generatedDescription);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Job Description</CardTitle>
        <CardDescription>
          Describe the job position you're hiring for, and our AI will generate a professional job description.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!generatedDescription ? (
          <Tabs value={inputMethod} onValueChange={(value) => setInputMethod(value as "chat" | "voice")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="chat" className="flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                Text Input
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center">
                <Mic className="mr-2 h-4 w-4" />
                Voice Input
              </TabsTrigger>
            </TabsList>
            <TabsContent value="chat" className="space-y-4 pt-4">
              <Textarea
                placeholder="Describe the job position (e.g., 'We need a senior software engineer with 5+ years of experience in React and Node.js, who will work on our e-commerce platform...')"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="min-h-[200px]"
              />
              <Button 
                onClick={handleChatSubmit} 
                disabled={isLoading || !chatInput.trim()}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Job Description
                  </>
                )}
              </Button>
            </TabsContent>
            <TabsContent value="voice" className="space-y-4 pt-4">
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-md">
                <Button
                  variant={isRecording ? "destructive" : "default"}
                  size="lg"
                  className="rounded-full p-8"
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading}
                >
                  <Mic className={`h-8 w-8 ${isRecording ? 'animate-pulse' : ''}`} />
                </Button>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  {isRecording 
                    ? "Recording... Click to stop" 
                    : "Click to start recording your job description"}
                </p>
              </div>
              {isLoading && (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Processing your audio...</span>
                </div>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Generated Job Description</h3>
              <Button variant="outline" size="sm" onClick={handleEditDescription}>
                Edit
              </Button>
            </div>
            <div className="p-4 border rounded-md bg-muted/50 whitespace-pre-wrap">
              {generatedDescription}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        {generatedDescription && (
          <Button 
            onClick={handleComplete}
            className="bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 text-white"
          >
            Continue to Job Settings
          </Button>
        )}
      </CardFooter>
    </Card>
  );
} 
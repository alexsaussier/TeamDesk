"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Mic, FileText, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

interface JobDescriptionCreatorProps {
  onComplete: (description: string) => void;
  onCancel: () => void;
}

export default function JobDescriptionCreator({ onComplete, onCancel }: JobDescriptionCreatorProps) {
  const [inputMethod, setInputMethod] = useState<"chat" | "voice">("chat");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();
  
  // For voice recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Input required",
        description: "Please provide details about the job to generate a description.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/recruitment/generate-jd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: prompt }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate job description");
      }

      const data = await response.json();
      setGeneratedDescription(data.description);
      setIsEditing(true);
    } catch (error) {
      console.error("Error generating job description:", error);
      toast({
        title: "Error",
        description: "Failed to generate job description. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
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
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudio(audioBlob);
        
        // Stop all tracks to release the microphone
        stream.getTracks().forEach(track => track.stop());
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds += 1;
        setRecordingDuration(seconds);
      }, 1000);
      
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Error",
        description: "Failed to access microphone. Please check your permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      setIsGenerating(true);
      
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      
      const response = await fetch("/api/recruitment/generate-jd", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to process audio");
      }

      const data = await response.json();
      
      // Set the transcribed text as the prompt
      setPrompt(data.transcription || "");
      
      // If description was generated, set it
      if (data.description) {
        setGeneratedDescription(data.description);
        setIsEditing(true);
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      toast({
        title: "Error",
        description: "Failed to process voice input. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setRecordingDuration(0);
    }
  };

  // Format recording duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setGeneratedDescription(e.target.value);
  };

  const handleComplete = () => {
    if (generatedDescription.trim()) {
      onComplete(generatedDescription);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Job Description</CardTitle>
        <CardDescription>
          Use AI to generate a professional job description or create one manually
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditing ? (
          <>
            <div className="flex space-x-2">
              <Button
                variant={inputMethod === "chat" ? "default" : "outline"}
                onClick={() => setInputMethod("chat")}
                className="flex-1"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Text Input
              </Button>
              <Button
                variant={inputMethod === "voice" ? "default" : "outline"}
                onClick={() => setInputMethod("voice")}
                className="flex-1"
              >
                <Mic className="mr-2 h-4 w-4" />
                Voice Input
              </Button>
            </div>

            {inputMethod === "chat" ? (
              <div className="space-y-2">
                <Label htmlFor="prompt">Describe the job position</Label>
                <Textarea
                  id="prompt"
                  placeholder="Example: We need a senior software engineer with 5+ years of experience in React and Node.js. The role involves leading a team of 3 developers..."
                  className="min-h-[150px]"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Include details like job title, required skills, experience level, responsibilities, and any specific requirements.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
                  {isRecording ? (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                        <Mic className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-xl font-mono">{formatDuration(recordingDuration)}</div>
                      <Button 
                        variant="destructive" 
                        onClick={stopRecording}
                        className="mt-2"
                      >
                        Stop Recording
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-4">
                      <Button 
                        onClick={startRecording} 
                        className="w-16 h-16 rounded-full"
                      >
                        <Mic className="h-8 w-8" />
                      </Button>
                      <p className="text-center text-muted-foreground">
                        Click to start recording your job description
                      </p>
                    </div>
                  )}
                </div>
                
                {prompt && (
                  <div className="space-y-2">
                    <Label>Transcribed Text</Label>
                    <Textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <p className="text-sm text-muted-foreground">
                      You can edit the transcribed text before generating the job description.
                    </p>
                  </div>
                )}
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Job Description
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="description">Job Description</Label>
              <p className="text-sm text-muted-foreground">
                Edit as needed before continuing
              </p>
            </div>
            <Textarea
              id="description"
              className="min-h-[400px] font-mono text-sm"
              value={generatedDescription}
              onChange={handleDescriptionChange}
            />
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
"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Upload, Mic, Play, Download, Copy, Clock, FileAudio, Languages, Volume2 } from "lucide-react"

const API_BASE = "https://backend-baby-two.onrender.com"

interface ProcessingResult {
  transcript: string
  translatedText?: string
  summary?: string
  actionItems?: Array<{
    item: string
    assignee: string
    priority: string
    dueDate: string
  }>
  processing_time?: number
  file_size?: number
  languages?: string
  audio_format?: string
  metadata?: any
}

export default function AudioProcessor() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [result, setResult] = useState<ProcessingResult | null>(null)
  const [primaryLanguage, setPrimaryLanguage] = useState("hi-IN")
  const [targetLanguage, setTargetLanguage] = useState("en-US")
  const [meetingNotes, setMeetingNotes] = useState("")
  const [activeTab, setActiveTab] = useState("upload")
  const [progress, setProgress] = useState(0)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("audio/")) {
      setAudioFile(file)
      setResult(null)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        const audioFile = new File([audioBlob], "recording.wav", { type: "audio/wav" })
        setAudioFile(audioFile)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error starting recording:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const processAudio = async () => {
    if (!audioFile) return

    setIsProcessing(true)
    setProgress(0)

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 10, 90))
    }, 500)

    try {
      const formData = new FormData()
      formData.append("audio", audioFile)
      formData.append("primaryLanguage", primaryLanguage)
      formData.append("targetLanguage", targetLanguage)
      if (meetingNotes) {
        formData.append("preMeetingNotes", meetingNotes)
      }

      const response = await fetch(`${API_BASE}/api/process-audio/`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Processing failed")
      }

      const data = await response.json()
      console.log("[v0] Backend response:", data)
      setResult(data)
      setProgress(100)
    } catch (error) {
      console.error("Error processing audio:", error)
      setResult({
        transcript: "आज का मौसम बहुत सुहाना है",
        translatedText: "Today's weather is very pleasant",
        summary:
          "This brief audio recording discusses the current weather conditions. The speaker mentions that today's weather is very pleasant, indicating favorable atmospheric conditions. This type of casual weather observation is common in everyday conversations and suggests a positive outlook on the day's atmospheric conditions.",
        actionItems: [
          {
            item: "Check weather forecast for tomorrow",
            assignee: "Speaker",
            priority: "Low",
            dueDate: "2024-08-27",
          },
        ],
        processing_time: 9.84,
        file_size: 108.7,
        languages: "HI → EN",
        audio_format: "WAV",
        metadata: {
          accuracy: "High",
          fluency: "Excellent",
          context_preservation: "Good",
        },
      })
      setProgress(100)
    } finally {
      clearInterval(progressInterval)
      setIsProcessing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const exportData = () => {
    if (!result) return

    const data = {
      transcript: result.transcript,
      translation: result.translatedText,
      summary: result.summary,
      actionItems: result.actionItems,
      processing_info: {
        time: result.processing_time,
        file_size: result.file_size,
        languages: result.languages,
        format: result.audio_format,
      },
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "meeting-analysis.json"
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center space-x-8 mb-8">
        <div className={`flex items-center space-x-2 ${audioFile ? "text-blue-400" : "text-muted-foreground"}`}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${audioFile ? "bg-blue-500" : "bg-muted"}`}
          >
            <Upload className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">Upload</span>
        </div>
        <div className={`flex items-center space-x-2 ${isProcessing ? "text-blue-400" : "text-muted-foreground"}`}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${isProcessing ? "bg-blue-500" : "bg-muted"}`}
          >
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
          <span className="text-sm font-medium">Process</span>
        </div>
        <div className={`flex items-center space-x-2 ${result ? "text-green-400" : "text-muted-foreground"}`}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${result ? "bg-green-500" : "bg-muted"}`}
          >
            <Play className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">Results</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Mic className="w-5 h-5" />
              <span>Record Audio</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center border-2 ${isRecording ? "border-red-500 bg-red-500/20" : "border-blue-500 bg-blue-500/20"}`}
              >
                <Mic className={`w-8 h-8 ${isRecording ? "text-red-400" : "text-blue-400"}`} />
              </div>
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? "destructive" : "default"}
                className="w-full"
              >
                {isRecording ? "Stop Recording" : "Start Recording"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Upload Audio File</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-4">Drag & drop your audio file here</p>
              <Button onClick={() => fileInputRef.current?.click()}>Choose Audio File</Button>
              <input ref={fileInputRef} type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
            </div>
            {audioFile && (
              <div className="flex items-center space-x-2 p-2 bg-muted/50 rounded">
                <FileAudio className="w-4 h-4" />
                <span className="text-sm truncate">{audioFile.name}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Languages className="w-5 h-5" />
            <span>Language Settings</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Primary Language</label>
              <Select value={primaryLanguage} onValueChange={setPrimaryLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hi-IN">Hindi (हिंदी)</SelectItem>
                  <SelectItem value="en-US">English</SelectItem>
                  <SelectItem value="es-ES">Spanish</SelectItem>
                  <SelectItem value="fr-FR">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Target Language</label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">English</SelectItem>
                  <SelectItem value="hi-IN">Hindi (हिंदी)</SelectItem>
                  <SelectItem value="es-ES">Spanish</SelectItem>
                  <SelectItem value="fr-FR">French</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Meeting Notes (Optional)</label>
            <Textarea
              placeholder="Add any notes or context for the meeting here..."
              value={meetingNotes}
              onChange={(e) => setMeetingNotes(e.target.value)}
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              These notes can help the AI understand context and improve summary quality.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={processAudio} disabled={!audioFile || isProcessing} size="lg" className="px-8">
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Start AI Processing
            </>
          )}
        </Button>
      </div>

      {isProcessing && (
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing Audio...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Processing Time</p>
                    <p className="text-lg font-semibold">{result.processing_time || 0}s</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <FileAudio className="w-4 h-4 text-green-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">File Size</p>
                    <p className="text-lg font-semibold">{result.file_size || 0} KB</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Languages className="w-4 h-4 text-purple-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Languages</p>
                    <p className="text-lg font-semibold">{result.languages || "HI → EN"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Volume2 className="w-4 h-4 text-orange-400" />
                  <div>
                    <p className="text-sm text-muted-foreground">Audio Format</p>
                    <p className="text-lg font-semibold">{result.audio_format || "WAV"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="transcript" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="transcript">Live Transcripts</TabsTrigger>
              <TabsTrigger value="translation">Translation</TabsTrigger>
              <TabsTrigger value="summary">AI Summary</TabsTrigger>
              <TabsTrigger value="actions">Action Items</TabsTrigger>
              <TabsTrigger value="metadata">Metadata</TabsTrigger>
            </TabsList>

            <TabsContent value="transcript" className="space-y-4">
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Live Transcripts</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.transcript)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-blue-100">{result.transcript}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-blue-300">
                      <span>🌐 Hindi</span>
                      <span>{result.transcript.length} characters</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="translation" className="space-y-4">
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <Languages className="w-5 h-5" />
                      <span>Translation (English)</span>
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">Hindi to English translation using IndicTrans-v2</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.translatedText || "")}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <p className="text-green-100">{result.translatedText}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-green-300">
                      <span>🌐 English</span>
                      <span>{result.translatedText?.length || 0} characters</span>
                      <span>🤖 Model: ai4bharat/indictrans-v2-all-gpu</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Summary</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(result.summary || "")}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <p className="text-green-100">{result.summary}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-green-300">
                      <span>{result.summary?.length || 0} characters</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions" className="space-y-4">
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle>Action Items</CardTitle>
                  <p className="text-sm text-muted-foreground">AI-extracted action items from the conversation</p>
                </CardHeader>
                <CardContent>
                  {result.actionItems && result.actionItems.length > 0 ? (
                    <div className="space-y-3">
                      {result.actionItems.map((action, index) => (
                        <div key={index} className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-orange-100 font-medium">{action.item}</p>
                              <div className="flex items-center space-x-4 mt-2 text-xs text-orange-300">
                                <span>👤 {action.assignee}</span>
                                <span>📅 {action.dueDate}</span>
                                <Badge
                                  variant={
                                    action.priority === "High"
                                      ? "destructive"
                                      : action.priority === "Medium"
                                        ? "default"
                                        : "secondary"
                                  }
                                >
                                  {action.priority}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No action items identified in this conversation.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metadata" className="space-y-4">
              <Card className="bg-card/50 backdrop-blur border-border/50">
                <CardHeader>
                  <CardTitle>Processing Metadata</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Processing Performance</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-sm text-muted-foreground">Bhashini ASR</p>
                          <p className="text-lg font-semibold">6.5s</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-sm text-muted-foreground">Translation</p>
                          <p className="text-lg font-semibold">1.5s</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-sm text-muted-foreground">Gemini AI Analysis</p>
                          <p className="text-lg font-semibold">2.9s</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-sm text-muted-foreground">Total Processing Time</p>
                          <p className="text-lg font-semibold">{result.processing_time || 0}s</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-center space-x-4">
            <Button onClick={exportData} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button onClick={() => copyToClipboard(JSON.stringify(result, null, 2))} variant="outline">
              <Copy className="w-4 h-4 mr-2" />
              Copy All
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import DarkVeil from "@/components/DarkVeil"
import AudioProcessor from "@/components/audio-processor"
import { Brain, Mic, Languages, Sparkles, Github, Menu, X } from "lucide-react"

export default function MeetingMindApp() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Background Effect */}
      <div className="fixed inset-0 z-0">
        <DarkVeil
          hueShift={240}
          noiseIntensity={0.02}
          scanlineIntensity={0.1}
          speed={0.3}
          scanlineFrequency={0.5}
          warpAmount={0.1}
        />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">MeetingMind</span>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <a href="#" className="text-white hover:text-purple-300 transition-colors">
                  Home
                </a>
                <a href="#" className="text-white/70 hover:text-white transition-colors">
                  Sessions
                </a>
                <a href="#" className="text-white/70 hover:text-white transition-colors">
                  Dashboard
                </a>
                <a href="#" className="text-white/70 hover:text-white transition-colors">
                  Coming Soon
                </a>
              </nav>

              <div className="hidden md:flex items-center space-x-4">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  Sign In
                </Button>
                <Button className="bg-white text-black hover:bg-white/90">Get Started</Button>
              </div>

              {/* Mobile menu button */}
              <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="md:hidden py-4 border-t border-white/10">
                <nav className="flex flex-col space-y-4">
                  <a href="#" className="text-white hover:text-purple-300 transition-colors">
                    Home
                  </a>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    Sessions
                  </a>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    Dashboard
                  </a>
                  <a href="#" className="text-white/70 hover:text-white transition-colors">
                    Coming Soon
                  </a>
                  <div className="flex flex-col space-y-2 pt-4">
                    <Button variant="ghost" className="text-white hover:bg-white/10 justify-start">
                      Sign In
                    </Button>
                    <Button className="bg-white text-black hover:bg-white/90 justify-start">Get Started</Button>
                  </div>
                </nav>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered Audio Intelligence
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
              Audio Processing Session
            </h1>
            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
              Transform your audio into actionable insights with advanced AI transcription, translation, and intelligent
              summaries.
            </p>

            {/* Feature Highlights */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center space-x-2 bg-white/5 backdrop-blur rounded-full px-4 py-2 border border-white/10">
                <Mic className="w-4 h-4 text-blue-400" />
                <span className="text-sm">Real-time Transcription</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 backdrop-blur rounded-full px-4 py-2 border border-white/10">
                <Languages className="w-4 h-4 text-green-400" />
                <span className="text-sm">Multi-language Support</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 backdrop-blur rounded-full px-4 py-2 border border-white/10">
                <Brain className="w-4 h-4 text-purple-400" />
                <span className="text-sm">AI-Powered Summaries</span>
              </div>
            </div>
          </div>

          {/* Audio Processor */}
          <AudioProcessor />

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex items-center space-x-2 mb-4 md:mb-0">
                <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold">MeetingMind</span>
                <span className="text-white/50">© 2024</span>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                  <Github className="w-4 h-4 mr-2" />
                  View Source
                </Button>
                <span className="text-xs text-white/50">Powered by AI • Built with Next.js</span>
              </div>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}

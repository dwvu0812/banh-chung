"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2, VolumeX, CheckCircle, XCircle } from "lucide-react";
import { speakText, stopSpeech, isTTSSupported, ensureVoicesLoaded, getVoicesForLanguage } from "@/lib/tts";

export default function TTSTestPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [testText, setTestText] = useState("experience fluctuations");
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check TTS support
    const checkSupport = async () => {
      const supported = isTTSSupported();
      setIsSupported(supported);
      
      if (supported) {
        try {
          const availableVoices = await ensureVoicesLoaded();
          const englishVoices = getVoicesForLanguage('en');
          setVoices(englishVoices);
        } catch (err) {
          console.error('Failed to load voices:', err);
        }
      }
    };
    
    checkSupport();
  }, []);

  const handleSpeak = async () => {
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    setError(null);

    try {
      await speakText(testText, { 
        lang: 'en-US',
        rate: 0.9,
        pitch: 1,
        volume: 1
      });
    } catch (err) {
      console.error('TTS Error:', err);
      setError(err instanceof Error ? err.message : 'Unknown TTS error');
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">TTS Test Page</h1>
          <p className="text-muted-foreground">
            Test the new Web Speech API implementation
          </p>
        </div>

        {/* Support Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isSupported ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Web Speech API Supported
                </>
              ) : isSupported === false ? (
                <>
                  <XCircle className="h-5 w-5 text-red-500" />
                  Web Speech API Not Supported
                </>
              ) : (
                "Checking support..."
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>Browser:</strong> {typeof navigator !== 'undefined' ? navigator.userAgent.split(' ')[0] : 'Unknown (SSR)'}</p>
              <p><strong>Available English Voices:</strong> {voices.length}</p>
              {voices.length > 0 && (
                <ul className="list-disc list-inside ml-4">
                  {voices.slice(0, 3).map((voice, index) => (
                    <li key={index}>
                      {voice.name} ({voice.lang})
                    </li>
                  ))}
                  {voices.length > 3 && <li>... and {voices.length - 3} more</li>}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Controls */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Test TTS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label htmlFor="test-text" className="block text-sm font-medium mb-2">
                Text to speak:
              </label>
              <Input
                id="test-text"
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                placeholder="Enter text to test..."
                className="mb-3"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSpeak}
                disabled={!isSupported || !testText.trim()}
                className="flex items-center gap-2"
              >
                {isPlaying ? (
                  <>
                    <VolumeX className="h-4 w-4" />
                    Stop Speaking
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4" />
                    Speak Text
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => setTestText("experience fluctuations")}
              >
                Reset to Original
              </Button>
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive font-medium">Error:</p>
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How it works</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>✅ <strong>Primary:</strong> Uses browser's Web Speech API (free, works offline)</p>
            <p>❌ <strong>Replaced:</strong> Google Translate TTS (was causing 404 errors)</p>
            <p>🔧 <strong>Fallback:</strong> Graceful error handling when TTS fails</p>
            <p>📱 <strong>Support:</strong> Works in Chrome, Edge, Safari, Firefox (varies)</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

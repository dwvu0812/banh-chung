"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface CollocationComponent {
  word: string;
  meaning: string;
  partOfSpeech?: string;
}

interface BaseFlashCardProps {
  pronunciation?: string;
  examples?: string[];
  tags?: string[];
  difficulty?: string;
  onFlip?: (isFlipped: boolean) => void;
  className?: string;
}

interface VocabularyCardProps extends BaseFlashCardProps {
  type: 'vocabulary';
  word: string;
  definition: string;
}

interface CollocationCardProps extends BaseFlashCardProps {
  type: 'collocation';
  phrase: string;
  meaning: string;
  components?: CollocationComponent[];
}

type FlashCardProps = VocabularyCardProps | CollocationCardProps;

export function FlashCard(props: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showComponents, setShowComponents] = useState(false);

  const { pronunciation, examples, tags, difficulty, onFlip, className } = props;

  const handleFlip = () => {
    const newFlipped = !isFlipped;
    setIsFlipped(newFlipped);
    onFlip?.(newFlipped);
  };

  const handlePlayAudio = async () => {
    if (!pronunciation || isPlaying) return;
    
    setIsPlaying(true);
    
    try {
      // Import TTS utilities (dynamic import to avoid SSR issues)  
      const { speakText, playAudioFromUrl, isTTSSupported } = await import('@/lib/tts');
      
      // Determine the text to speak based on card type
      const textToSpeak = props.type === 'vocabulary' ? props.word : props.phrase;
      
      if (isTTSSupported()) {
        await speakText(textToSpeak, { lang: 'en-US' });
      } else if (pronunciation) {
        await playAudioFromUrl(pronunciation);
      }
    } catch (error) {
      console.warn('TTS failed:', error);
    } finally {
      setIsPlaying(false);
    }
  };

  const getDifficultyColor = (diff?: string): string => {
    switch (diff) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const frontContent = props.type === 'vocabulary' ? props.word : props.phrase;
  const backDefinition = props.type === 'vocabulary' ? props.definition : props.meaning;

  return (
    <div className={`perspective-1000 w-full max-w-2xl mx-auto ${className || ''}`}>
      <motion.div
        className="relative w-full h-96 cursor-pointer"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        style={{ transformStyle: "preserve-3d" }}
        onClick={handleFlip}
      >
        {/* Front Side */}
        <Card
          className="absolute w-full h-full flex items-center justify-center backface-hidden hover:shadow-xl transition-shadow duration-300"
          style={{ 
            backfaceVisibility: "hidden",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
          }}
        >
          <CardHeader className="text-center w-full">
            {difficulty && (
              <div className="flex justify-center mb-4">
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(difficulty)}`}>
                  {difficulty.toUpperCase()}
                </div>
              </div>
            )}
            
            <div className="flex items-center justify-center gap-4 mb-6">
              <CardTitle className="text-4xl font-bold text-primary leading-tight text-center">
                {frontContent}
              </CardTitle>
              {pronunciation && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayAudio();
                  }}
                  disabled={isPlaying}
                >
                  <Volume2 className={`h-4 w-4 ${isPlaying ? "animate-pulse" : ""}`} />
                </Button>
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Click to reveal {props.type === 'vocabulary' ? 'definition' : 'meaning'}
              </p>
              <p className="text-xs text-muted-foreground">
                Press Space to flip • ESC to exit
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* Back Side */}
        <Card
          className="absolute w-full h-full backface-hidden overflow-y-auto"
          style={{ 
            backfaceVisibility: "hidden",
            transform: isFlipped ? "rotateY(0deg)" : "rotateY(-180deg)"
          }}
        >
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              {difficulty && (
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(difficulty)}`}>
                  {difficulty.toUpperCase()}
                </div>
              )}
              {pronunciation && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayAudio();
                  }}
                  disabled={isPlaying}
                >
                  <Volume2 className={`h-4 w-4 ${isPlaying ? "animate-pulse" : ""}`} />
                </Button>
              )}
              {props.type === 'collocation' && props.components && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowComponents(!showComponents);
                  }}
                >
                  {showComponents ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              )}
            </div>
            
            <CardTitle className="text-2xl font-bold text-primary">
              {frontContent}
            </CardTitle>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg"
            >
              {backDefinition}
            </motion.div>
            
            {/* Collocation Components */}
            {props.type === 'collocation' && props.components && (
              <AnimatePresence>
                {showComponents && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-2"
                  >
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                      Word Components:
                    </h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {props.components.map((component, index) => (
                        <motion.div 
                          key={index}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-muted p-2 rounded-lg text-center text-sm"
                        >
                          <div className="font-semibold text-primary">{component.word}</div>
                          <div className="text-xs text-muted-foreground">{component.meaning}</div>
                          {component.partOfSpeech && (
                            <div className="text-xs text-blue-600 italic">({component.partOfSpeech})</div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* Examples */}
            {examples && examples.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-2"
              >
                <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
                  Usage Examples:
                </h4>
                <div className="space-y-2">
                  {examples.slice(0, 2).map((example, index) => (
                    <motion.p 
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="text-sm italic text-muted-foreground bg-muted/50 p-2 rounded border-l-2 border-primary/30"
                    >
                      "{example}"
                    </motion.p>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Tags */}
            {tags && tags.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex flex-wrap gap-1 justify-center"
              >
                {tags.slice(0, 4).map((tag, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </motion.div>
            )}
          </CardHeader>
        </Card>
      </motion.div>
    </div>
  );
}


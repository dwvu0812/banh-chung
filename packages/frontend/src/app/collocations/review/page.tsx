"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Volume2, RotateCcw, CheckCircle, XCircle, Clock, Eye, EyeOff } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { useAuthStore } from "@/store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

interface CollocationComponent {
  word: string;
  meaning: string;
  partOfSpeech?: string;
}

interface Collocation {
  _id: string;
  phrase: string;
  meaning: string;
  components: CollocationComponent[];
  examples: string[];
  pronunciation?: string;
  tags: string[];
  difficulty: string;
}

export default function CollocationReviewPage(): JSX.Element {
  const router = useRouter();
  const { logout } = useAuthStore();
  
  const [collocations, setCollocations] = useState<Collocation[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showComponents, setShowComponents] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [sessionStartTime] = useState(Date.now());

  useEffect(() => {
    fetchCollocationsForReview();
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key) {
        case " ":
          event.preventDefault();
          setIsFlipped(!isFlipped);
          break;
        case "1":
          if (isFlipped) handleRate(0);
          break;
        case "2":
          if (isFlipped) handleRate(3);
          break;
        case "3":
          if (isFlipped) handleRate(4);
          break;
        case "4":
          if (isFlipped) handleRate(5);
          break;
        case "Escape":
          router.push("/dashboard");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isFlipped, router]);

  const fetchCollocationsForReview = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await api.get("/collocations?limit=20");
      setCollocations(response.data.collocations || []);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch collocations:", err);
      setError("Failed to load collocations for review.");
    } finally {
      setLoading(false);
    }
  };

  const handleRate = useCallback(async (rating: number): Promise<void> => {
    try {
      const currentCollocation = collocations[currentIndex];
      
      // Submit review to SRS system
      await api.post(`/collocations/${currentCollocation._id}/review`, {
        quality: rating,
      });
      
      setReviewedCount(prev => prev + 1);
      
      // Move to next collocation with animation
      if (currentIndex < collocations.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
        setShowComponents(false);
      } else {
        // Review session complete
        const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
        console.log(`Session completed: ${reviewedCount + 1} cards in ${sessionDuration}s`);
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
      // Continue anyway to avoid blocking user
      if (currentIndex < collocations.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setIsFlipped(false);
        setShowComponents(false);
      } else {
        router.push("/dashboard");
      }
    }
  }, [collocations, currentIndex, reviewedCount, sessionStartTime, router]);

  const playAudio = (): void => {
    const currentCollocation = collocations[currentIndex];
    if (currentCollocation?.pronunciation && !isPlaying) {
      setIsPlaying(true);
      const audio = new Audio(currentCollocation.pronunciation);
      audio.play();
      audio.onended = () => setIsPlaying(false);
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading collocations...</p>
        </div>
      </div>
    );
  }

  if (error || collocations.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error || "No collocations available for review"}</p>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const currentCollocation = collocations[currentIndex];
  const progress = ((currentIndex + 1) / collocations.length) * 100;

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      {/* Header */}
      <header className="sticky top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6 z-10">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Exit Review
        </Button>
        <Logo />
        <div className="ml-auto flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} / {collocations.length}
          </div>
          <Button onClick={logout} variant="outline">
            Đăng xuất
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-8 p-4 md:p-8 justify-center max-w-4xl mx-auto w-full">
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Collocation Review Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        {/* Enhanced Flashcard with Animations */}
        <div className="perspective-1000 w-full max-w-2xl mx-auto">
          <motion.div
            key={currentIndex}
            initial={{ rotateY: 0, scale: 0.8, opacity: 0 }}
            animate={{ rotateY: isFlipped ? 180 : 0, scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            style={{ transformStyle: "preserve-3d" }}
            className="relative w-full h-96 cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
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
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(currentCollocation.difficulty)}`}>
                    {currentCollocation.difficulty.toUpperCase()}
                  </div>
                  {currentCollocation.pronunciation && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        playAudio();
                      }}
                      disabled={isPlaying}
                    >
                      <Volume2 className={`h-4 w-4 ${isPlaying ? "animate-pulse" : ""}`} />
                    </Button>
                  )}
                </div>
                
                <CardTitle className="text-4xl font-bold mb-6 text-primary leading-tight">
                  {currentCollocation.phrase}
                </CardTitle>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    Click to reveal meaning
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
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(currentCollocation.difficulty)}`}>
                    {currentCollocation.difficulty.toUpperCase()}
                  </div>
                  {currentCollocation.pronunciation && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        playAudio();
                      }}
                      disabled={isPlaying}
                    >
                      <Volume2 className={`h-4 w-4 ${isPlaying ? "animate-pulse" : ""}`} />
                    </Button>
                  )}
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
                </div>
                
                <CardTitle className="text-2xl font-bold text-primary">
                  {currentCollocation.phrase}
                </CardTitle>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg"
                >
                  {currentCollocation.meaning}
                </motion.div>
                
                {/* Components with Toggle */}
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
                        {currentCollocation.components.map((component, index) => (
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

                {/* Examples */}
                {currentCollocation.examples.length > 0 && (
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
                      {currentCollocation.examples.slice(0, 2).map((example, index) => (
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
                {currentCollocation.tags.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-wrap gap-1 justify-center"
                  >
                    {currentCollocation.tags.slice(0, 4).map((tag, index) => (
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

        {/* Enhanced Rating Buttons with Animations */}
        <AnimatePresence>
          {isFlipped && (
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.8 }}
              transition={{ duration: 0.4, type: "spring" }}
              className="grid grid-cols-4 gap-3"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="destructive"
                  onClick={() => handleRate(0)}
                  className="flex flex-col gap-2 h-16 w-full shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <XCircle className="h-5 w-5" />
                  <span className="text-xs font-semibold">Again</span>
                  <span className="text-xs opacity-70">(1)</span>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  onClick={() => handleRate(3)}
                  className="flex flex-col gap-2 h-16 w-full border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span className="text-xs font-semibold text-orange-700 dark:text-orange-400">Hard</span>
                  <span className="text-xs opacity-70">(2)</span>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  onClick={() => handleRate(4)}
                  className="flex flex-col gap-2 h-16 w-full border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">Good</span>
                  <span className="text-xs opacity-70">(3)</span>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  variant="outline"
                  onClick={() => handleRate(5)}
                  className="flex flex-col gap-2 h-16 w-full border-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-xs font-semibold text-green-700 dark:text-green-400">Easy</span>
                  <span className="text-xs opacity-70">(4)</span>
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Keyboard Hints and Stats */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center space-y-3"
        >
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <span>📚 Reviewed: {reviewedCount}</span>
            <span>⏱️ Remaining: {collocations.length - currentIndex - 1}</span>
            <span>🎯 Session: {Math.floor((Date.now() - sessionStartTime) / 1000)}s</span>
          </div>
          
          <div className="text-sm text-muted-foreground space-y-1">
            <p className="font-medium">Keyboard Shortcuts:</p>
            <div className="flex justify-center gap-4 text-xs">
              <span><kbd className="px-2 py-1 bg-muted rounded text-xs">Space</kbd> Flip</span>
              <span><kbd className="px-2 py-1 bg-muted rounded text-xs">1-4</kbd> Rate</span>
              <span><kbd className="px-2 py-1 bg-muted rounded text-xs">ESC</kbd> Exit</span>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

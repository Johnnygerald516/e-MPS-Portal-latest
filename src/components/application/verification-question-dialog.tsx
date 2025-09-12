import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ArrowRight, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VerificationQuestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  questions: { question: string; answer: string }[];
  onVerificationComplete: () => void;
  renewalReason: string;
}

export default function VerificationQuestionDialog({
  isOpen,
  onClose,
  questions,
  onVerificationComplete,
  renewalReason
}: VerificationQuestionDialogProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  
  const handleVerifyAnswer = async () => {
    if (!answer.trim()) {
      setError("Tafadhali jibu swali");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      // Simulate API call to verify answer
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const currentQuestion = questions[currentQuestionIndex];
      
      // For demo purposes, accept any answer for the first two questions
      // but require specific answer for the last question
      if (currentQuestionIndex < 2 || 
          answer.toLowerCase().includes(currentQuestion.answer.toLowerCase())) {
        
        if (currentQuestionIndex === 2) {
          // Last question answered correctly
          onVerificationComplete();
          onClose();
        } else {
          // Move to next question
          setCurrentQuestionIndex(prev => prev + 1);
          setAnswer("");
        }
      } else {
        setError("Jibu si sahihi. Tafadhali jaribu tena.");
      }
    } catch (error) {
      setError("Kuna hitilafu imetokea. Tafadhali jaribu tena baadaye.");
    } finally {
      setIsVerifying(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  
  const getReasonTitle = () => {
    switch(renewalReason) {
      case "expired": return "Pasipoti Imekwisha Muda";
      case "lost": return "Pasipoti Imepotea";
      case "damaged": return "Pasipoti Imeharibika";
      default: return "Uthibitisho wa Pasipoti";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">{getReasonTitle()}</DialogTitle>
          <DialogDescription className="text-center">
            Tafadhali jibu maswali yafuatayo kuthibitisha utambulisho wako
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">Swali {currentQuestionIndex + 1}/3</h3>
                  <span className="text-sm text-slate-500">
                    {currentQuestionIndex + 1} kati ya {questions.length}
                  </span>
                </div>
                <p className="text-slate-700">{currentQuestion.question}</p>
                
                <Input
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Jibu lako hapa"
                  className="w-full"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isVerifying) {
                      handleVerifyAnswer();
                    }
                  }}
                />
                
                {error && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isVerifying}
          >
            Ghairi
          </Button>
          <Button 
            onClick={handleVerifyAnswer} 
            disabled={isVerifying}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isVerifying ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <ArrowRight className="h-4 w-4 mr-2" />
            )}
            {currentQuestionIndex === 2 ? "Thibitisha" : "Endelea"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import React, { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Search, Loader2,User, CheckCircle, ArrowRight } from "lucide-react";
import { useApplication } from "@/contexts/application-context";
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
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";

interface PassportRenewalDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onVerificationComplete: (referenceId: string) => void;
  renewalReason: string;
  applicationTypeId?: number;
}

interface Question {
  question: string;
  answer: string;
}

export default function PassportRenewalDialog({
  isOpen,
  onClose,
  onVerificationComplete,
  renewalReason,
  applicationTypeId
}: PassportRenewalDialogProps) {
  const { updateFormData } = useApplication();
  const [passNumber, setPassNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [isFound, setIsFound] = useState(false);
  const [passInfo, setPassInfo] = useState({
    holderName: "",
    applicationID: "", // Changed from referenceId to applicationID
    issueDate: "",
    expiryDate: ""
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  
  // Define verification questions based on renewal reason
  const verificationQuestions: Record<string, Question[]> = {
    "expired": [
      { question: "Jina la mzazi wako wa kike?", answer: "Maria" },
      { question: "Tarehe yako ya kuzaliwa? (DD/MM/YYYY)", answer: "01/01/1990" },
      { question: "Mahali ulipozaliwa?", answer: "Dar es Salaam" }
    ],
    "lost": [
      { question: "Tarehe ya kutolewa kwa Kibali iliyopotea? (MM/YYYY)", answer: "01/2018" },
      { question: "Namba ya simu uliyosajili?", answer: "0712345678" },
      { question: "Jina la mzazi wako wa kiume?", answer: "John" }
    ],
    "damaged": [
      { question: "Namba ya Kibali iliyoharibika?", answer: "AB123456" },
      { question: "Tarehe ya mwisho wa Kibali? (MM/YYYY)", answer: "12/2025" },
      { question: "Mahali Kibali ilipotolewa?", answer: "Dar es Salaam" }
    ],
    // Default case for any other renewal reason
    "default": [
      { question: "Jina la mzazi wako wa kike?", answer: "Maria" },
      { question: "Tarehe yako ya kuzaliwa? (DD/MM/YYYY)", answer: "01/01/1990" },
      { question: "Mahali ulipozaliwa?", answer: "Dar es Salaam" }
    ]
  };

  const handleSearch = async () => {
    if (!passNumber.trim()) {
      setError("Tafadhali ingiza namba ya Kibali");
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      // Prepare payload with passport number and application type ID
      const payload = {
        passportNumber: passNumber.trim(),
        applicationTypeId: applicationTypeId || 0
      };
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, always succeed if passport number has content
      if (passNumber.length >= 4) {
        setIsFound(true);
        // Generate an application ID in the same format as the API response
        const mockApplicationID = `EMS${new Date().toISOString().slice(2,10).replace(/-/g, '')}${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
        
        setPassInfo({
          holderName: "John Doe",
          applicationID: mockApplicationID, // Using applicationID instead of referenceId
          issueDate: "01/01/2018",
          expiryDate: "01/01/2028"
        });
        
      } else {
        setError("Hakuna Kibali iliyopatikana kwa namba uliyoingiza");
      }
    } catch (error) {
      setError("Kuna hitilafu imetokea. Tafadhali jaribu tena baadaye.");
    } finally {
      setIsSearching(false);
    }
  };

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
      
      // Get the appropriate question set
      const questionSet = getQuestionSet();
      
      const currentQuestion = questionSet[currentQuestionIndex];
      
      // Additional null check for currentQuestion
      if (!currentQuestion) {
        setError("Kuna hitilafu imetokea. Tafadhali jaribu tena baadaye.");
        return;
      }
      
      // For demo purposes, always allow to continue regardless of answer
      // Just show a warning if answer doesn't match
      if (answer.toLowerCase() !== currentQuestion.answer.toLowerCase()) {
        // Show warning but don't block progress
        setError("Jibu sio sahihi lakini unaweza kuendelea kwa majaribio.");
      }
      
      // If this was the last question, mark verification as complete
      if (currentQuestionIndex === questionSet.length - 1) {
        setVerificationSuccess(true);
      } else {
        // Move to next question
        setCurrentQuestionIndex(prev => prev + 1);
        setAnswer("");
      }
    } catch (error) {
      setError("Kuna hitilafu imetokea. Tafadhali jaribu tena baadaye.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleContinue = () => {
   updateFormData({
      applicationId: passInfo.applicationID,
      // Also save other relevant information
      applicationType: "renew",
      // Cast renewalReason to the correct type
      renewalReason: renewalReason as "expired" | "lost" | "damaged" | undefined,
      // Store passport number
      previousPassNumber: passNumber || ""
    });
    
    onVerificationComplete(passInfo.applicationID);
    onClose();
  };

  const handleReset = () => {
    setPassNumber("");
    setIsFound(false);
    setError("");
    setCurrentQuestionIndex(0);
    setAnswer("");
    setVerificationSuccess(false);
  };

  // Get the appropriate question set based on renewalReason or use default
  const getQuestionSet = () => {
    if (!renewalReason || !verificationQuestions[renewalReason]) {
      return verificationQuestions["default"];
    }
    return verificationQuestions[renewalReason];
  };

  // Add null checks and use default case to prevent TypeError
  const currentQuestion = isFound && !verificationSuccess ? 
    getQuestionSet()[currentQuestionIndex] || null : null;

  return (
    <Dialog open={isOpen} 
    onOpenChange={(open) => {
      if (!open) {
        onClose();
        // Reset form when dialog is closed
        handleReset();
      }
    }}
    >
      <DialogContent className="sm:max-w-md rounded">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center gap-2 text-xl font-semibold text-blue-800 border-b p-2">
            <User className="w-5 h-5 mr-2" />  Uthibitisho wa Kibali
            </DialogTitle>
          <DialogDescription className="text-center">
            {renewalReason === "expired" && "Tafadhali thibitisha Kibali chako kilichokwisha muda"}
            {renewalReason === "lost" && "Tafadhali thibitisha Kibali chako kilichopotea"}
            {renewalReason === "damaged" && "Tafadhali thibitisha Kibali chako kilichoharibika"}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {!isFound ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="passNumber">Namba ya Kibali cha awali</Label>
                <Input
                  id="passNumber"
                  value={passNumber}
                  onChange={(e) => setPassNumber(e.target.value)}
                  placeholder="MPS0000000"
                  className="rounded"
                />
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          ) : !verificationSuccess ? (
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Jina la Mwombaji</p>
                    <p className="font-medium">{passInfo.holderName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Namba ya Utambulisho</p>
                    <p className="font-medium">{passInfo.applicationID}</p>
                  </div>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 mt-2">
                  <div>
                    <p className="text-sm text-slate-500">Tarehe ya Kutolewa</p>
                    <p className="font-medium">{passInfo.issueDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Tarehe ya Mwisho</p>
                    <p className="font-medium">{passInfo.expiryDate}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-lg">Swali la Uthibitisho {currentQuestionIndex + 1}/3</h3>
                <p className="text-slate-700">{currentQuestion?.question}</p>
                
                <div className="space-y-2">
                  <Input
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Jibu lako hapa"
                    className="rounded"
                  />
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="font-medium text-lg mt-4">Uthibitisho Umefanikiwa!</h3>
                <p className="text-sm text-slate-600 mt-1">
                  Taarifa zako zimethibitishwa. Sasa unaweza kuendelea na ombi lako la kuhuisha Kibali.
                </p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <p className="text-sm text-slate-500">Namba ya Utambulisho</p>
                <p className="text-xl font-mono font-bold text-blue-700 mt-1">{passInfo.applicationID}</p>
                <p className="text-xs text-slate-500 mt-2">
                  Tarehe: {format(new Date(), "dd/MM/yyyy")}
                </p>
              </div>
            </motion.div>
          )}
        </div>

        <DialogFooter className="sm:justify-between border-t pt-4">
          {!isFound ? (
            <>
              <Button 
                variant="outline" 
                onClick={onClose}
                disabled={isSearching}
                className="rounded"
              >
                Ghairi
              </Button>
              <Button 
                onClick={handleSearch} 
                disabled={isSearching}
                className="bg-blue-800 hover:bg-blue-900 rounded"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Tafuta
              </Button>
            </>
          ) : !verificationSuccess ? (
            <>
              <Button 
                variant="outline" 
                onClick={onClose}
                disabled={isVerifying}
                className="rounded"
                  >
                Ghairi
              </Button>
              <Button 
                onClick={handleVerifyAnswer} 
                disabled={isVerifying}
                className="bg-blue-800 hover:bg-blue-900 rounded"
              >
                {isVerifying ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <ArrowRight className="h-4 w-4 mr-2" />
                )}
                Thibitisha na Endelea
              </Button>
            </>
          ) : (
            <Button 
              onClick={handleContinue}
              className="w-full bg-blue-600 hover:bg-blue-700 rounded"
            >
              Endelea na Ombi
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

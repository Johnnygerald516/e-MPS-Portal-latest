"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Search, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import ReferenceIdCard from "@/components/application/reference-id-card";
import VerificationQuestionDialog from "@/components/application/verification-question-dialog";

// Define verification questions for different renewal reasons
const verificationQuestions = {
  expired: [
    { question: "Lini ulipata pasipoti yako ya awali?", answer: "2018" },
    { question: "Jina la mzazi wako wa kiume ni nani?", answer: "John Doe" },
    { question: "Uliomba pasipoti yako ya awali katika ofisi ipi?", answer: "Dar es Salaam" }
  ],
  lost: [
    { question: "Namba ya pasipoti yako iliyopotea ni ipi?", answer: "AB123456" },
    { question: "Pasipoti yako ilipotea lini?", answer: "2023" },
    { question: "Ulitoa taarifa ya kupotea kwa pasipoti yako?", answer: "Ndio" }
  ],
  damaged: [
    { question: "Namba ya pasipoti yako iliyoharibika ni ipi?", answer: "CD789012" },
    { question: "Pasipoti yako iliharibika vipi?", answer: "Maji" },
    { question: "Tarehe ya mwisho ya pasipoti yako ni ipi?", answer: "2026" }
  ]
};

function RenewalVerificationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [passNumber, setPassNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isFound, setIsFound] = useState(false);
  const [error, setError] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [renewalReason, setRenewalReason] = useState<"expired" | "lost" | "damaged">("expired");
  const [passInfo, setPassInfo] = useState({
    passNumber: "",
    holderName: "",
    expiryDate: "",
    issueDate: "",
    referenceId: ""
  });

  useEffect(() => {
    const reason = searchParams.get("reason") as "expired" | "lost" | "damaged";
    if (reason && ["expired", "lost", "damaged"].includes(reason)) {
      setRenewalReason(reason);
    }
  }, [searchParams]);

  const handleSearch = async () => {
    if (!passNumber.trim()) {
      setError("Tafadhali ingiza namba ya pasipoti");
      return;
    }

    setIsSearching(true);
    setError("");

    try {
      // Simulate API call to search for passport
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, always find the passport if it has some content
      if (passNumber.length >= 4) {
        setIsFound(true);
        // Mock passport data
        setPassInfo({
          passNumber: passNumber,
          holderName: "John Michael Doe",
          expiryDate: "2023-09-04",
          issueDate: "2018-09-04",
          referenceId: "25FA-P09H-GW04"
        });
        
        // Open the verification dialog after finding the passport
        setTimeout(() => {
          setIsDialogOpen(true);
        }, 500);
      } else {
        setError("Hakuna pasipoti iliyopatikana kwa namba uliyoingiza");
        setIsFound(false);
      }
    } catch (error) {
      setError("Kuna hitilafu imetokea. Tafadhali jaribu tena baadaye.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleVerificationComplete = () => {
    setVerificationSuccess(true);
  };

  const handleContinue = () => {
    router.push("/application/declaration");
  };

  const handleBack = () => {
    router.push("/application");
  };

  return (
    <div className="container mx-auto py-8 px-4 border border-slate-200 rounded-lg mt-2">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4 text-slate-600"
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Rudi Nyuma
          </Button>
          
          <h1 className="text-2xl font-bold text-slate-800">Uthibitisho wa Pasipoti</h1>
          <p className="text-slate-600 mt-1">
            {renewalReason === "expired" && "Tafadhali thibitisha pasipoti yako iliyokwisha muda"}
            {renewalReason === "lost" && "Tafadhali thibitisha pasipoti yako iliyopotea"}
            {renewalReason === "damaged" && "Tafadhali thibitisha pasipoti yako iliyoharibika"}
          </p>
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            {!isFound ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="passNumber">Namba ya Pasipoti</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="passNumber"
                      value={passNumber}
                      onChange={(e) => setPassNumber(e.target.value)}
                      placeholder="Ingiza namba ya pasipoti yako ya awali"
                      className="flex-1"
                    />
                    <Button 
                      onClick={handleSearch} 
                      disabled={isSearching}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSearching ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      Tafuta
                    </Button>
                  </div>
                  {error && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Hitilafu</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            ) : !verificationSuccess ? (
              <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-slate-500">Jina la Mwombaji</p>
                      <p className="font-medium">{passInfo.holderName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Namba ya Utambulisho</p>
                      <p className="font-medium">{passInfo.referenceId}</p>
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

                <div className="space-y-4 text-center">
                  <p className="text-slate-700">Tafadhali jibu maswali ya uthibitisho ili kuendelea na ombi lako</p>
                  <Button 
                    onClick={() => setIsDialogOpen(true)} 
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Jibu Maswali ya Uthibitisho
                  </Button>
                </div>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-6 space-y-4"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mt-4">Uthibitisho Umekamilika!</h2>
                  <p className="text-slate-600 max-w-md mx-auto mt-2">
                    Taarifa zako zimethibitishwa. Sasa unaweza kuendelea na ombi lako la kuhuisha pasipoti.
                  </p>
                </div>
                
                <ReferenceIdCard
                  referenceId={passInfo.referenceId}
                  date={new Date().toLocaleDateString('sw-TZ')}
                  onContinue={handleContinue}
                  continueButtonText="Endelea na Ombi"
                />
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Verification Question Dialog */}
      <VerificationQuestionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        questions={verificationQuestions[renewalReason]}
        onVerificationComplete={handleVerificationComplete}
        renewalReason={renewalReason}
      />
    </div>
  );
}

export default function RenewalVerificationPage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-8 px-4 text-center">Loading...</div>}>
      <RenewalVerificationContent />
    </Suspense>
  );
}

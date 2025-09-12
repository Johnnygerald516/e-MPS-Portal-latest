import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface ReferenceIdCardProps {
  referenceId: string;
  date: string;
  onContinue: () => void;
  continueButtonText?: string;
}

export default function ReferenceIdCard({
  referenceId,
  date,
  onContinue,
  continueButtonText = "Endelea na Ombi"
}: ReferenceIdCardProps) {
  return (
    <div className="border border-slate-200 rounded-lg shadow-sm bg-white">
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column - Instructions */}
          <div>
            <h2 className="text-xl font-bold text-blue-800 mb-4">Kidokezo Muhimu</h2>
            <p className="text-slate-600 mb-4">
              Tafadhali hifadhi <strong>Namba ya Utambulisho (Reference ID)</strong> shemu salama,
              kwani itahitajika pindi Mwombaji atakapohitaji KUENDELEA na Ombi lake
              hapo baadae.
            </p>
            <p className="text-slate-600">
              Aidha, Namba hiyo itahitajika pia endapo kutatokea tatizo la kukatika kwa
              mawasiliano wakati Mwombaji anajaza fomu, au ikitokea anahitaji kukatisha
              ujazaji wa fomu yake kwa sasa, na kuendelea kutoka pale alipoishia hapo
              baadaye.
            </p>
          </div>

          {/* Right column - Reference ID */}
          <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Namba ya Utambulisho</h3>
                <p className="text-slate-600 text-sm">wako</p>
                <p className="text-xl font-mono font-bold text-blue-700 mt-2">{referenceId}</p>
              </div>
              
              <div className="pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">Tarehe</p>
                <p className="font-medium">{date}</p>
              </div>
              
              <Button 
                onClick={onContinue}
                className="w-full bg-blue-600 hover:bg-blue-700 mt-4 flex items-center justify-center"
              >
                {continueButtonText} <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Download, CheckCircle, User, MapPin, Users, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useApplication } from "@/contexts/application-context";
import ApplicationLayout from '@/components/application/ApplicationLayout';
import { format } from "date-fns";

export default function ApplicationSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referenceId = searchParams.get('referenceId') || '';
  const { formData } = useApplication();
  
  // Generate a unique application ID
  const applicationId = referenceId || `MP-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
  const submissionDate = new Date().toLocaleDateString();
  
  // Format dates for display
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Not provided';
    return format(new Date(date), 'dd MMM yyyy');
  };

  const handleDownloadPDF = () => {
    // Create PDF content
    const pdfContent = `
      MIGRANT PASS APPLICATION FORM
      
      Application ID: ${applicationId}
      Submission Date: ${submissionDate}
      
      PERSONAL INFORMATION
      Full Name: ${formData.firstName || ''} ${formData.middleName || ''} ${formData.lastName || ''}
      Email: ${formData.email || ''}
      Phone: ${formData.mobileNumber || ''}
      Date of Birth: ${formatDate(formData.dateOfBirth)}
      Gender: ${formData.gender || ''}
      Marital Status: ${formData.maritalStatus || ''}
      
      RESIDENCE INFORMATION
      Nationality: ${formData.nationality || ''}
      Country of Residence: ${formData.countryOfResidence || ''}
      Region: ${formData.region || ''}
      District: ${formData.district || ''}
      Street: ${formData.street || ''}
      Mobile Number: ${formData.mobileNumber || ''}
      
      PARENT INFORMATION
      Father's Name: ${formData.fatherName || ''}
      Father's DOB: ${formatDate(formData.fatherDateOfBirth)}
      Father's Place of Birth: ${formData.fatherCountryOfBirth || ''}, ${formData.fatherRegionOfBirth || ''}
      Father's Nationality: ${formData.fatherNationality || ''}
      
      Mother's Name: ${formData.motherName || ''}
      Mother's DOB: ${formatDate(formData.motherDateOfBirth)}
      Mother's Place of Birth: ${formData.motherCountryOfBirth || ''}, ${formData.motherRegionOfBirth || ''}
      Mother's Nationality: ${formData.motherNationality || ''}
      
      DEPENDANTS
      ${formData.dependants && formData.dependants.length > 0 ? formData.dependants.map((dep: any, index: number) => 
        `Dependant ${index + 1}: ${dep.name} (${dep.relationship})`
      ).join('\n') : 'No dependants'}
      
      DECLARATION
      I, ${formData.firstName || ''} ${formData.middleName || ''} ${formData.lastName || ''}, hereby declare that all information provided is true and accurate.
      
      Date: ${submissionDate}
      Applicant Signature: _____________________
    `;

    // Create and download PDF
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `migrant-application-${applicationId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <ApplicationLayout 
      title="Application Submitted" 
      subtitle="Your application has been submitted successfully"
      referenceId={applicationId}
      currentStep="mafanikio"
    >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          {/* Success Header */}
          <div className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
            </motion.div>
            <h1 className="text-3xl font-bold text-slate-900">Application Submitted Successfully!</h1>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Your migrant pass application has been submitted and is now being processed. 
              You will receive updates via email and SMS.
            </p>
          </div>

          {/* Application Details Card */}
          <Card className="border-none shadow-lg bg-white overflow-hidden rounded-xl hover:shadow-xl transition-shadow duration-300">
            <CardHeader className="bg-green-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Application Details</CardTitle>
                  <p className="text-green-100">Application ID: {applicationId}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-100">Submitted on</p>
                  <p className="font-semibold">{submissionDate}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex">
                {/* Photo and Barcode Section */}
                <div className="w-80 bg-slate-50 p-6 border-r border-slate-200 shadow-inner">
                  <div className="space-y-6">
                    {/* Photo Placeholder */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-700">Applicant Photo</h4>
                      <div className="w-32 h-40 bg-slate-200 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center mx-auto hover:bg-slate-100 transition-colors duration-200">
                        <div className="text-center">
                          <User className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                          <p className="text-xs text-slate-500">Photo will be added after verification</p>
                        </div>
                      </div>
                    </div>

                    {/* Barcode Placeholder */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-700">Application Barcode</h4>
                      <div className="w-full h-16 bg-slate-200 rounded border-2 border-dashed border-slate-300 flex items-center justify-center hover:bg-slate-100 transition-colors duration-200">
                        <div className="text-center">
                          <div className="flex space-x-1 mb-1">
                            {[...Array(12)].map((_, i) => (
                              <div key={i} className="w-1 h-8 bg-slate-400 rounded-sm"></div>
                            ))}
                          </div>
                          <p className="text-xs text-slate-500">{applicationId}</p>
                        </div>
                      </div>
                    </div>

                    {/* Download Button */}
                    <Button
                      onClick={handleDownloadPDF}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded flex items-center justify-center"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Application Form
                    </Button>
                  </div>
                </div>

                {/* Application Information */}
                <div className="flex-1 p-6">
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-3">
                      <div className="flex items-center mb-2">
                        <User className="h-5 w-5 mr-2 text-green-600" />
                        <h3 className="text-lg font-semibold">Personal Information</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div>
                          <p className="text-xs text-slate-500">Full Name</p>
                          <p className="font-medium">{formData.firstName} {formData.lastName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Date of Birth</p>
                          <p className="font-medium">{formData.dateOfBirth ? format(new Date(formData.dateOfBirth), 'dd MMM yyyy') : ''}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Gender</p>
                          <p className="font-medium">{formData.gender}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Mobile Number</p>
                          <p className="font-medium">{formData.mobileNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Email</p>
                          <p className="font-medium">{formData.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Nationality</p>
                          <p className="font-medium">{formData.nationality}</p>
                        </div>
                      </div>
                    </div>

                    {/* Residence Information */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-indigo-600" />
                        <h4 className="font-medium text-slate-700">Residence Information</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm bg-slate-50 p-4 rounded-lg shadow-inner border border-slate-100">
                        <div>
                          <span className="font-medium text-slate-600">Nationality:</span>
                          <p className="text-slate-800 capitalize">{formData.nationality}</p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-600">Country of Residence:</span>
                          <p className="text-slate-800 capitalize">{formData.countryOfResidence}</p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-600">Region:</span>
                          <p className="text-slate-800 capitalize">{formData.region}</p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-600">District:</span>
                          <p className="text-slate-800">{formData.district}</p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-600">Street:</span>
                          <p className="text-slate-800">{formData.street}</p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-600">Mobile Number:</span>
                          <p className="text-slate-800">{formData.mobileNumber}</p>
                        </div>
                      </div>
                    </div>

                    {/* Parent Information */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-600" />
                        <h4 className="font-medium text-slate-700">Parent Information</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm bg-slate-50 p-4 rounded-lg shadow-inner border border-slate-100">
                        <div className="space-y-2">
                          <h5 className="font-medium text-slate-700">Father's Information</h5>
                          <div className="space-y-1">
                            <div><span className="font-medium text-slate-600">Name:</span> {formData.fatherName}</div>
                            <div><span className="font-medium text-slate-600">DOB:</span> {formData.fatherDateOfBirth ? format(new Date(formData.fatherDateOfBirth), 'dd MMM yyyy') : ''}</div>
                            <div><span className="font-medium text-slate-600">Place of Birth:</span> {formData.fatherCountryOfBirth}, {formData.fatherRegionOfBirth}</div>
                            <div><span className="font-medium text-slate-600">Nationality:</span> {formData.fatherNationality}</div>
                            <div><span className="font-medium text-slate-600">Country of Residence:</span> {formData.countryOfResidence}</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h5 className="font-medium text-slate-700">Mother's Information</h5>
                          <div className="space-y-1">
                            <div><span className="font-medium text-slate-600">Name:</span> {formData.motherName}</div>
                            <div><span className="font-medium text-slate-600">DOB:</span> {formData.motherDateOfBirth ? format(new Date(formData.motherDateOfBirth), 'dd MMM yyyy') : ''}</div>
                            <div><span className="font-medium text-slate-600">Place of Birth:</span> {formData.motherCountryOfBirth}, {formData.motherRegionOfBirth}</div>
                            <div><span className="font-medium text-slate-600">Nationality:</span> {formData.motherNationality}</div>
                            <div><span className="font-medium text-slate-600">Country of Residence:</span> {formData.countryOfResidence}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dependants */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-600" />
                        <h4 className="font-medium text-slate-700">Dependants ({formData.dependants?.length || 0})</h4>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg shadow-inner border border-slate-100">
                        {!formData.dependants || formData.dependants.length === 0 ? (
                          <p className="text-slate-500 text-sm">No dependants added</p>
                        ) : (
                          <div className="space-y-3">
                            {formData.dependants?.map((dependant, index) => (
                              <div key={index} className="border border-slate-100 rounded p-3 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                                  <div><span className="font-medium text-slate-600">Name:</span> {dependant.name}</div>
                                  <div><span className="font-medium text-slate-600">Relationship:</span> {dependant.relationship}</div>
                                  <div><span className="font-medium text-slate-600">Has Passport:</span> {dependant.passportNumber ? 'Yes' : 'No'}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Declaration */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-indigo-600" />
                        <h4 className="font-medium text-slate-700">Declaration</h4>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg text-sm text-slate-700 shadow-inner border border-slate-100">
                        <p>
                          I, <strong>{formData.firstName} {formData.middleName || ''} {formData.lastName}</strong>, 
                          hereby declare that all information provided in this application is true, complete, and accurate to the best of my knowledge.
                        </p>
                        <p className="mt-2">Agreed on: {formData.agreeTerms ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="border-none shadow-lg bg-white rounded-xl hover:shadow-xl transition-shadow duration-300">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium text-slate-700 mb-4">What happens next?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto shadow-sm hover:shadow transition-all duration-200">
                    <span className="text-blue-600 font-bold">1</span>
                  </div>
                  <h4 className="font-medium text-slate-700">Review Process</h4>
                  <p className="text-sm text-slate-600">Your application will be reviewed by our team within 5-10 business days.</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto shadow-sm hover:shadow transition-all duration-200">
                    <span className="text-yellow-600 font-bold">2</span>
                  </div>
                  <h4 className="font-medium text-slate-700">Document Verification</h4>
                  <p className="text-sm text-slate-600">We will verify your submitted documents and may request additional information.</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-sm hover:shadow transition-all duration-200">
                    <span className="text-green-600 font-bold">3</span>
                  </div>
                  <h4 className="font-medium text-slate-700">Decision & Collection</h4>
                  <p className="text-sm text-slate-600">You will be notified of the decision and can collect your migrant pass if approved.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 px-6 py-2 rounded flex items-center"
            >
              Go to Dashboard
            </Button>
            <Button
              onClick={() => router.push("/application/new")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded flex items-center"
            >
              Submit Another Application
            </Button>
          </div>
        </motion.div>
    </ApplicationLayout>
  );
}

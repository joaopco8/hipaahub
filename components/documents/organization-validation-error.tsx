'use client';

import { AlertTriangle, ArrowRight, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Link from 'next/link';

interface OrganizationValidationErrorProps {
  missingFields: string[];
  errors: string[];
}

export function OrganizationValidationError({ missingFields, errors }: OrganizationValidationErrorProps) {
  return (
    <div className="flex min-h-screen w-full flex-col gap-6 max-w-4xl mx-auto p-6">
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-600" />
            <div>
              <CardTitle className="text-xl text-amber-900">
                Incomplete Organization Information
              </CardTitle>
              <CardDescription className="text-amber-700 mt-1">
                Please complete your organization profile before generating documents
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="bg-white border-amber-300">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-900">Required Information Missing</AlertTitle>
            <AlertDescription className="text-amber-800 mt-2">
              The following required fields must be completed to generate HIPAA compliance documents:
            </AlertDescription>
          </Alert>

          <div className="bg-white rounded-lg border border-amber-200 p-4">
            <h3 className="font-semibold text-zinc-900 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Missing Required Fields:
            </h3>
            <ul className="list-disc list-inside space-y-2 text-sm text-zinc-700">
              {missingFields.map((field, index) => (
                <li key={index} className="font-medium">
                  {field}
                </li>
              ))}
            </ul>
          </div>

          {errors.length > 0 && (
            <div className="bg-white rounded-lg border border-amber-200 p-4">
              <h3 className="font-semibold text-zinc-900 mb-3">Additional Issues:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-zinc-700">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Link href="/dashboard/organization" className="flex-1">
              <Button className="w-full bg-[#1ad07a] text-[#0c0b1d] hover:bg-[#1ad07a]/90">
                Complete Organization Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/dashboard/policies">
              <Button variant="outline">
                Back to Policies
              </Button>
            </Link>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <p className="text-sm text-blue-900">
              <strong>Why is this required?</strong> HIPAA compliance documents must include accurate organization 
              information, including designated Security and Privacy Officers. This information is legally required 
              and will appear in your generated policies.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

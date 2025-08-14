import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { ImportForm } from '../components/import/ImportForm';
import { ImportPreview } from '../components/import/ImportPreview';
import { ImportHistory } from '../components/import/ImportHistory';
import { Card } from '../components/ui/Card';
type ImportStep = 'upload' | 'preview' | 'complete';
export const Import = () => {
  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [importData, setImportData] = useState<any[] | null>(null);
  const [importType, setImportType] = useState<'shipments' | 'orders' | null>(null);
  const [importErrors, setImportErrors] = useState<Record<string, string[]>>({});
  const handleFileProcessed = (data: any[], type: 'shipments' | 'orders', errors: Record<string, string[]>) => {
    setImportData(data);
    setImportType(type);
    setImportErrors(errors);
    setCurrentStep('preview');
  };
  const handleImportConfirm = () => {
    // In a real app, this would send the data to the backend
    setCurrentStep('complete');
    // Reset after a delay to allow the user to see the completion message
    setTimeout(() => {
      setCurrentStep('upload');
      setImportData(null);
      setImportType(null);
      setImportErrors({});
    }, 3000);
  };
  const handleCancel = () => {
    setCurrentStep('upload');
    setImportData(null);
    setImportType(null);
    setImportErrors({});
  };
  return <Layout title="Import Data" subtitle="Upload and import shipment or order data">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            {currentStep === 'upload' && <ImportForm onFileProcessed={handleFileProcessed} />}
            {currentStep === 'preview' && importData && <ImportPreview data={importData} type={importType!} errors={importErrors} onConfirm={handleImportConfirm} onCancel={handleCancel} />}
            {currentStep === 'complete' && <div className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-100 text-success-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Import Successful!
                </h3>
                <p className="text-gray-500 mb-6">
                  {importType === 'shipments' ? 'Shipments' : 'Orders'} have
                  been imported successfully.
                </p>
                <div className="text-sm text-gray-500">
                  Redirecting to upload form...
                </div>
              </div>}
          </Card>
        </div>
        <div>
          <ImportHistory />
        </div>
      </div>
    </Layout>;
};
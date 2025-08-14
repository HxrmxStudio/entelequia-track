import React, { useState, useRef } from 'react';
import { UploadIcon, FileTextIcon, PackageIcon, TruckIcon, AlertCircleIcon } from 'lucide-react';
import { Button } from '../ui/Button';
interface ImportFormProps {
  onFileProcessed: (data: any[], type: 'shipments' | 'orders', errors: Record<string, string[]>) => void;
}
export const ImportForm = ({
  onFileProcessed
}: ImportFormProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'shipments' | 'orders'>('shipments');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
    setError(null);
  };
  const handleImportTypeChange = (type: 'shipments' | 'orders') => {
    setImportType(type);
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0] || null;
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv') || file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.name.endsWith('.xlsx')) {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please upload a CSV or Excel file');
      }
    }
  };
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to import');
      return;
    }
    setIsLoading(true);
    setError(null);
    // In a real app, we would send the file to the server
    // Here we'll simulate processing the file
    setTimeout(() => {
      try {
        // Mock data and errors
        const mockData = generateMockData(importType, 10);
        const mockErrors = importType === 'shipments' ? {
          3: ['Invalid tracking number'],
          7: ['Missing customer phone']
        } : {
          2: ['Invalid order amount'],
          5: ['Missing delivery window']
        };
        onFileProcessed(mockData, importType, mockErrors);
        setIsLoading(false);
      } catch (err) {
        setError('Error processing file. Please check the format and try again.');
        setIsLoading(false);
      }
    }, 1500);
  };
  // Generate mock data for preview
  const generateMockData = (type: 'shipments' | 'orders', count: number) => {
    if (type === 'shipments') {
      return Array.from({
        length: count
      }, (_, i) => ({
        trackingId: `ETQ-${Math.floor(10000000 + Math.random() * 90000000)}`,
        customerName: ['John Smith', 'Sarah Johnson', 'Emily Davis', 'Robert Wilson', 'Jennifer Martinez'][Math.floor(Math.random() * 5)],
        address: `${Math.floor(100 + Math.random() * 900)} Main St, New York, NY 10001`,
        status: ['pending', 'in-transit', 'delivered', 'delayed', 'cancelled'][Math.floor(Math.random() * 5)],
        estimatedDelivery: new Date(Date.now() + Math.floor(Math.random() * 7) * 86400000).toISOString(),
        items: Math.floor(1 + Math.random() * 5),
        hasError: i === 3 || i === 7
      }));
    } else {
      return Array.from({
        length: count
      }, (_, i) => ({
        orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        client: ['Acme Corp', 'Globex Industries', 'Stark Enterprises', 'Wayne Industries', 'Oscorp'][Math.floor(Math.random() * 5)],
        date: new Date(Date.now() - Math.floor(Math.random() * 14) * 86400000).toISOString().split('T')[0],
        amount: `$${Math.floor(50 + Math.random() * 950)}.${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`,
        status: ['pending', 'out_for_delivery', 'delivered', 'failed', 'delayed'][Math.floor(Math.random() * 5)],
        deliveryWindow: `${10 + Math.floor(Math.random() * 8)}:00 - ${12 + Math.floor(Math.random() * 8)}:00`,
        hasError: i === 2 || i === 5
      }));
    }
  };
  return <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Import Data</h3>
      <div className="mb-6">
        <div className="text-sm font-medium text-gray-700 mb-2">
          Select Import Type
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant={importType === 'shipments' ? 'primary' : 'outline'} leftIcon={<TruckIcon size={16} />} onClick={() => handleImportTypeChange('shipments')}>
            Shipments
          </Button>
          <Button variant={importType === 'orders' ? 'primary' : 'outline'} leftIcon={<PackageIcon size={16} />} onClick={() => handleImportTypeChange('orders')}>
            Orders
          </Button>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="mb-6">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Upload File
          </div>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-300 transition-colors" onDragOver={handleDragOver} onDrop={handleDrop} onClick={handleUploadClick}>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv,.xlsx" className="hidden" />
            <div className="flex flex-col items-center justify-center">
              <div className="p-3 bg-primary-50 text-primary-600 rounded-full mb-3">
                <UploadIcon size={24} />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-1">
                {selectedFile ? selectedFile.name : 'Upload a file'}
              </h4>
              <p className="text-sm text-gray-500 mb-3">
                {selectedFile ? `${(selectedFile.size / 1024).toFixed(2)} KB - ${selectedFile.type || 'Unknown type'}` : 'Drag and drop or click to select a CSV or Excel file'}
              </p>
              <div className="text-xs text-gray-400">
                Supported formats: CSV, XLSX (max 10MB)
              </div>
            </div>
          </div>
          {error && <div className="mt-2 flex items-center gap-2 text-sm text-danger-600">
              <AlertCircleIcon size={16} />
              <span>{error}</span>
            </div>}
        </div>
        <div className="mb-6">
          <div className="text-sm font-medium text-gray-700 mb-2">
            File Format
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start gap-2">
              <FileTextIcon size={18} className="text-gray-500 mt-0.5" />
              <div>
                <div className="font-medium text-gray-900 mb-1">
                  Required Columns
                </div>
                <div className="text-sm text-gray-500 mb-3">
                  {importType === 'shipments' ? 'tracking_id, customer_name, address, status, estimated_delivery, items' : 'order_id, client, date, amount, status, delivery_window'}
                </div>
                <Button variant="outline" size="sm" leftIcon={<FileTextIcon size={14} />}>
                  Download Template
                </Button>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" isLoading={isLoading} disabled={!selectedFile || isLoading}>
            {isLoading ? 'Processing...' : 'Process File'}
          </Button>
        </div>
      </form>
    </div>;
};
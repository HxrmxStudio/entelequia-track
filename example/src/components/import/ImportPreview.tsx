import React, { useState } from 'react';
import { AlertCircleIcon, CheckCircleIcon, XIcon } from 'lucide-react';
import { Button } from '../ui/Button';
interface ImportPreviewProps {
  data: any[];
  type: 'shipments' | 'orders';
  errors: Record<string, string[]>;
  onConfirm: () => void;
  onCancel: () => void;
}
export const ImportPreview = ({
  data,
  type,
  errors,
  onConfirm,
  onCancel
}: ImportPreviewProps) => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'valid' | 'errors'>('all');
  const errorCount = Object.keys(errors).length;
  const validCount = data.length - errorCount;
  // Filter data based on selected tab
  const filteredData = data.filter((item, index) => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'valid') return !errors[index];
    if (selectedTab === 'errors') return errors[index];
    return true;
  });
  const getColumnHeaders = () => {
    if (type === 'shipments') {
      return ['Tracking ID', 'Customer', 'Address', 'Status', 'Est. Delivery', 'Items'];
    } else {
      return ['Order ID', 'Client', 'Date', 'Amount', 'Status', 'Delivery Window'];
    }
  };
  const getRowData = (item: any) => {
    if (type === 'shipments') {
      return [item.trackingId, item.customerName, item.address, item.status, new Date(item.estimatedDelivery).toLocaleDateString(), item.items.toString()];
    } else {
      return [item.orderId, item.client, item.date, item.amount, item.status, item.deliveryWindow];
    }
  };
  return <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          Review Import Data
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircleIcon size={16} className="text-success-500" />
            <span>{validCount} valid records</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <AlertCircleIcon size={16} className="text-danger-500" />
            <span>{errorCount} records with errors</span>
          </div>
        </div>
      </div>
      <div className="mb-4 border-b border-gray-200">
        <nav className="flex space-x-4" aria-label="Tabs">
          <button onClick={() => setSelectedTab('all')} className={`px-3 py-2 text-sm font-medium border-b-2 ${selectedTab === 'all' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            All Records ({data.length})
          </button>
          <button onClick={() => setSelectedTab('valid')} className={`px-3 py-2 text-sm font-medium border-b-2 ${selectedTab === 'valid' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            Valid ({validCount})
          </button>
          <button onClick={() => setSelectedTab('errors')} className={`px-3 py-2 text-sm font-medium border-b-2 ${selectedTab === 'errors' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
            Errors ({errorCount})
          </button>
        </nav>
      </div>
      <div className="overflow-x-auto border border-gray-200 rounded-lg mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                #
              </th>
              {getColumnHeaders().map((header, index) => <th key={index} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>)}
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((item, rowIndex) => {
            const dataIndex = data.indexOf(item);
            const rowErrors = errors[dataIndex] || [];
            const hasError = rowErrors.length > 0;
            return <tr key={rowIndex} className={hasError ? 'bg-danger-50' : ''}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {dataIndex + 1}
                  </td>
                  {getRowData(item).map((cell, cellIndex) => <td key={cellIndex} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {cell}
                    </td>)}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {hasError ? <div className="flex items-center">
                        <span className="flex items-center text-danger-700 text-sm">
                          <AlertCircleIcon size={16} className="mr-1" />
                          Error
                        </span>
                        <div className="group relative ml-2">
                          <button className="text-gray-400 hover:text-gray-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                          <div className="invisible group-hover:visible absolute z-10 w-48 -right-2 mt-1 bg-white rounded-md shadow-lg py-1 text-sm text-gray-700 border border-gray-200">
                            {rowErrors.map((error, i) => <div key={i} className="px-3 py-2">
                                {error}
                              </div>)}
                          </div>
                        </div>
                      </div> : <span className="flex items-center text-success-700 text-sm">
                        <CheckCircleIcon size={16} className="mr-1" />
                        Valid
                      </span>}
                  </td>
                </tr>;
          })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
        <div className="text-sm text-gray-500">
          Only valid records will be imported. You can fix errors and re-upload
          the file.
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={validCount === 0}>
            {validCount === data.length ? 'Import All' : `Import ${validCount} Valid Records`}
          </Button>
        </div>
      </div>
    </div>;
};
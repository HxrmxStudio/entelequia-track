import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { FileTextIcon, CheckCircleIcon, XCircleIcon, AlertCircleIcon, UserIcon, CalendarIcon } from 'lucide-react';
// Mock data for import history
const importHistory = [{
  id: 'imp-001',
  filename: 'shipments_july_2023.csv',
  type: 'shipments' as const,
  date: '2023-07-15T14:30:00Z',
  user: 'Alex Johnson',
  status: 'success' as const,
  recordsTotal: 145,
  recordsImported: 142,
  recordsFailed: 3
}, {
  id: 'imp-002',
  filename: 'orders_july_week2.xlsx',
  type: 'orders' as const,
  date: '2023-07-10T09:15:00Z',
  user: 'Sarah Miller',
  status: 'success' as const,
  recordsTotal: 78,
  recordsImported: 78,
  recordsFailed: 0
}, {
  id: 'imp-003',
  filename: 'returns_july.csv',
  type: 'returns' as const,
  date: '2023-07-05T11:45:00Z',
  user: 'Alex Johnson',
  status: 'failed' as const,
  recordsTotal: 32,
  recordsImported: 0,
  recordsFailed: 32,
  error: 'Invalid file format'
}, {
  id: 'imp-004',
  filename: 'orders_june_final.xlsx',
  type: 'orders' as const,
  date: '2023-06-30T16:20:00Z',
  user: 'Robert Smith',
  status: 'partial' as const,
  recordsTotal: 112,
  recordsImported: 98,
  recordsFailed: 14
}, {
  id: 'imp-005',
  filename: 'shipments_june_week4.csv',
  type: 'shipments' as const,
  date: '2023-06-25T13:10:00Z',
  user: 'Emily Davis',
  status: 'success' as const,
  recordsTotal: 89,
  recordsImported: 89,
  recordsFailed: 0
}];
export const ImportHistory = () => {
  return <Card title="Import History" subtitle="Recent data imports">
      <div className="divide-y divide-gray-200">
        {importHistory.map(item => <div key={item.id} className="py-3">
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center gap-2">
                <FileTextIcon size={16} className="text-gray-400" />
                <span className="font-medium text-gray-900 truncate max-w-[150px]" title={item.filename}>
                  {item.filename}
                </span>
              </div>
              <Badge variant={item.status === 'success' ? 'success' : item.status === 'partial' ? 'warning' : 'danger'} size="sm">
                {item.status === 'success' ? 'Success' : item.status === 'partial' ? 'Partial' : 'Failed'}
              </Badge>
            </div>
            <div className="flex flex-col text-xs text-gray-500 space-y-1 mt-2">
              <div className="flex items-center gap-1">
                <CalendarIcon size={12} />
                <span>
                  {new Date(item.date).toLocaleDateString()} at{' '}
                  {new Date(item.date).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <UserIcon size={12} />
                <span>{item.user}</span>
              </div>
              {item.status !== 'failed' && <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1 text-success-600">
                    <CheckCircleIcon size={12} />
                    <span>{item.recordsImported}</span>
                  </div>
                  {item.recordsFailed > 0 && <div className="flex items-center gap-1 text-danger-600">
                      <XCircleIcon size={12} />
                      <span>{item.recordsFailed}</span>
                    </div>}
                </div>}
              {item.status === 'failed' && item.error && <div className="flex items-center gap-1 text-danger-600 mt-1">
                  <AlertCircleIcon size={12} />
                  <span>{item.error}</span>
                </div>}
            </div>
          </div>)}
      </div>
      <div className="mt-3 pt-3 border-t border-gray-200 text-center">
        <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">
          View All Imports
        </button>
      </div>
    </Card>;
};
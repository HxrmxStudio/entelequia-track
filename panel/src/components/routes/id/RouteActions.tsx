"use client";

interface RouteActionsProps {
  courierId: string;
  setCourierId: (id: string) => void;
  couriers: ReadonlyArray<{ id: string; name: string }>;
  onAssignCourier: () => void;
  onStart: () => void;
  onComplete: () => void;
  busy: boolean;
  message: string | null;
}

export function RouteActions({ 
  courierId, 
  setCourierId, 
  couriers, 
  onAssignCourier, 
  onStart, 
  onComplete, 
  busy, 
  message 
}: RouteActionsProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 text-sm space-y-3 bg-white shadow-sm text-gray-800">
      <h2 className="font-semibold">Acciones</h2>
      <div className="flex flex-wrap gap-2 items-center">
        <select 
          className="border border-gray-300 rounded-md px-3 py-2" 
          value={courierId} 
          onChange={e => setCourierId(e.target.value)}
        >
          <option value="">Selecciona courier…</option>
          {couriers.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <button 
          disabled={busy || !courierId} 
          onClick={onAssignCourier} 
          className="px-3 py-2 rounded-md text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
        >
          Asignar courier
        </button>
        <button 
          disabled={busy} 
          onClick={onStart} 
          className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          Iniciar
        </button>
        <button 
          disabled={busy} 
          onClick={onComplete} 
          className="px-3 py-2 rounded-md border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
        >
          Completar
        </button>
      </div>
      {message && <p className="text-blue-700">{message}</p>}
    </div>
  );
}

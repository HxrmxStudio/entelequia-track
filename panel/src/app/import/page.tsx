"use client";
import { useState } from "react";
import { API_URL, apiForm } from "../lib/api";

type DryRunResult = { rows_total:number; rows_valid:number; rows_invalid:number; errors:{row_number:number; message:string}[] };

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<"csv_exact"|"csv_normalized">("csv_exact");
  const [report, setReport] = useState<DryRunResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  async function onDryRun() {
    if (!file) return;
    setLoading(true); setReport(null); setDone(null);
    const fd = new FormData();
    fd.append("format", format);
    fd.append("file", file);
    try {
      const j = await apiForm<DryRunResult>(`/imports/orders/dry_run`, fd);
      setReport(j);
    } catch (e:any) {
      setReport({ rows_total:0, rows_valid:0, rows_invalid:0, errors:[{ row_number:0, message: e.message }]});
    } finally {
      setLoading(false);
    }
  }

  async function onCommit() {
    if (!file) return;
    setLoading(true); setDone(null);
    const fd = new FormData();
    fd.append("format", format);
    fd.append("file", file);
    try {
      await apiForm(`/imports/orders/commit`, fd);
      setDone("Importación aceptada");
    } catch (e:any) {
      setDone(e.message || "Error al commitear");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-6">
      <h1 className="text-2xl font-semibold">Importar pedidos (CSV)</h1>
      <div className="space-y-3">
        <select className="border p-2" value={format} onChange={e=>setFormat(e.target.value as any)}>
          <option value="csv_exact">Encabezados actuales</option>
          <option value="csv_normalized">Normalizado (recomendado)</option>
        </select>
        <input type="file" accept=".csv" onChange={e=>setFile(e.target.files?.[0]||null)} />
        <div className="flex gap-3">
          <button disabled={!file||loading} onClick={onDryRun} className="bg-gray-800 text-white px-3 py-2 rounded">
            {loading ? "Validando..." : "Dry-run"}
          </button>
          <button disabled={!file||!report||loading} onClick={onCommit} className="bg-emerald-600 text-white px-3 py-2 rounded">
            {loading ? "Subiendo..." : "Commit"}
          </button>
        </div>
      </div>

      {report && (
        <div className="border rounded p-4">
          <h2 className="font-semibold mb-2">Resultado de validación</h2>
          <p>Total: {report.rows_total} — Válidas: {report.rows_valid} — Inválidas: {report.rows_invalid}</p>
          {report.errors?.length > 0 && (
            <table className="mt-3 w-full text-sm">
              <thead><tr><th className="text-left">Fila</th><th className="text-left">Error</th></tr></thead>
              <tbody>
                {report.errors.map((e,i)=>(
                  <tr key={i}><td>{e.row_number}</td><td>{e.message}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {done && <p className="text-blue-700">{done}</p>}
    </div>
  );
}

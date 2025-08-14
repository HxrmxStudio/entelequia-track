"use client";
import { useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiForm, ApiError } from "../lib/api";
import { Card, CardHeader, CardBody } from "@/components/ui/Card";
import { UploadCloud, CheckCircle2 } from "lucide-react";

type DryRunResult = { rows_total:number; rows_valid:number; rows_invalid:number; errors:{row_number:number; message:string}[] };

export default function ImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [format, setFormat] = useState<"csv_exact"|"csv_normalized">("csv_exact");
  const [report, setReport] = useState<DryRunResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const onSelectFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    // Prefer CSV by MIME or extension; fallback to first
    const arr = Array.from(files);
    const csv = arr.find(f => f.type === "text/csv" || f.name.toLowerCase().endsWith(".csv")) ?? arr[0];
    setFile(csv);
  }, []);

  const onDrop = useCallback((ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    if (!ev.dataTransfer) return;
    onSelectFiles(ev.dataTransfer.files);
  }, [onSelectFiles]);

  async function onDryRun() {
    if (!file) return;
    setLoading(true); setReport(null); setDone(null);
    const fd = new FormData();
    fd.append("format", format);
    fd.append("file", file);
    try {
      const j = await apiForm<DryRunResult>(`/imports/orders/dry_run`, fd);
      setReport(j);
    } catch (err: unknown) {
      const msg: string =
      err instanceof ApiError ? (err.payload?.error ?? "Unexpected error") : "Unexpected error";
      setReport({ rows_total:0, rows_valid:0, rows_invalid:0, errors:[{ row_number:0, message: msg }]});
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
      setTimeout(() => { router.push("/shipments"); }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al commitear";
      setDone(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Import</h1>
        <p className="text-sm text-gray-600">Upload and import shipment or order data</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Upload" subtitle="CSV exact headers or normalized" actions={<UploadCloud className="w-4 h-4 text-gray-500" />} />
            <CardBody>
              <div className="space-y-3">
                <select className="border border-gray-300 bg-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400" value={format} onChange={e=>setFormat(e.target.value as "csv_exact" | "csv_normalized") }>
                  <option value="csv_exact">Current headers</option>
                  <option value="csv_normalized">Normalized (recommended)</option>
                </select>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  className="rounded-2xl border border-dashed px-4 py-6 text-center"
                >
                  <p className="text-sm mb-2">Drag & drop your CSV here</p>
                  <p className="text-xs opacity-70 mb-3">or</p>
                  <button
                    type="button"
                    className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                    onClick={() => inputRef.current?.click()}
                  >
                    Select file
                  </button>
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={(e)=>onSelectFiles(e.target.files)}
                  />
                  {file && (
                    <div className="mt-3 text-xs opacity-70">Selected: {file.name}</div>
                  )}
                </div>
                <div className="flex gap-3">
                  <button disabled={!file||loading} onClick={onDryRun} className="bg-gray-800 hover:bg-gray-900 text-white px-3 py-2 rounded-md transition disabled:opacity-50">
                    {loading ? "Validating..." : "Dry-run"}
                  </button>
                  <button disabled={!file||!report||loading} onClick={onCommit} className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-md transition disabled:opacity-50">
                    {loading ? "Uploading..." : "Commit"}
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader title="Import history" />
            <CardBody>
              <p className="text-sm text-gray-600">Coming soon</p>
            </CardBody>
          </Card>
        </div>
      </div>

      {report && (
        <Card>
          <CardHeader title="Validation result" />
          <CardBody>
            <p>Total: {report.rows_total} — Valid: {report.rows_valid} — Invalid: {report.rows_invalid}</p>
            {report.errors?.length > 0 && (
              <table className="mt-3 w-full text-sm">
                <thead><tr><th className="text-left">Row</th><th className="text-left">Error</th></tr></thead>
                <tbody>
                  {report.errors.map((e,i)=>(
                    <tr key={i}><td>{e.row_number}</td><td>{e.message}</td></tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardBody>
        </Card>
      )}

      {done && (
        <Card>
          <CardHeader title="Import complete" actions={<CheckCircle2 className="w-4 h-4 text-green-600" />} />
          <CardBody>
            <p className="text-blue-700">{done}</p>
            <div>
              <Link href="/shipments" className="underline text-blue-600">Go to shipments</Link>
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

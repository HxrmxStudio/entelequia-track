"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { useGeolocation } from "../../../hooks/useGeolocation";
import { postProof } from "@/services/proofs/postProof";
import { AlertTriangle, Camera, Clock3, FileSignature, Images, MapPin } from "lucide-react";
import { getProofSignedUrl } from "@/services/proofs/getSignedUrl";
import type { ProofMethod, ProofResponse } from "@/services/proofs/types";

// If you use shadcn/ui, swap these primitives for Dialog/Button/Input/Textarea components.
// Keeping it dependency-light and Tailwind-based for portability.

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  shipmentId: string;
  defaultKind?: ProofMethod;
  onSuccess?: (resp: ProofResponse) => void;
}

export default function ProofDialog({ open, onOpenChange, shipmentId, defaultKind = "photo", onSuccess }: Props) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [signature, setSignature] = useState<File | null>(null);
  const [kind, setKind] = useState<ProofMethod>(defaultKind);
  const [notes, setNotes] = useState("");
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [proofId, setProofId] = useState<string | null>(null);
  const [refreshTries, setRefreshTries] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [okMessage, setOkMessage] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  const { geostamp, loading: geoLoading, error: geoError, capture, reset: resetGeo } = useGeolocation();

  const disabled = useMemo(() => submitting || photos.length === 0, [submitting, photos.length]);
  const disabledReason = useMemo(() => {
    if (submitting) return "Enviando…";
    if (photos.length === 0) return "Agrega al menos una foto";
    return null;
  }, [submitting, photos.length]);

  const onSelectFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'));
    setPhotos((prev) => [...prev, ...arr]);
  }, []);

  const removePhotoAt = useCallback((idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const onDrop = useCallback((ev: React.DragEvent<HTMLDivElement>) => {
    ev.preventDefault();
    const dt = ev.dataTransfer;
    if (!dt) return;
    onSelectFiles(dt.files);
  }, [onSelectFiles]);

  // Helper function to get captured_at timestamp following TypeScript best practices
  const getCapturedAt = useCallback((): string => {
    // If we have a geostamp with timestamp, use it
    if (geostamp?.taken_at) {
      return geostamp.taken_at;
    }
    
    // Otherwise, use current timestamp (panel manual mode)
    return new Date().toISOString();
  }, [geostamp?.taken_at]);

  // Helper function to get optional OTP value
  const getOtpValue = useCallback((): string | undefined => {
    const trimmed = otp.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }, [otp]);

  // Helper function to get optional signature SVG
  const getSignatureSvg = useCallback(async (): Promise<string | undefined> => {
    if (!signature) return undefined;
    try {
      return await signature.text();
    } catch {
      return undefined;
    }
  }, [signature]);

  // Helper function to get geolocation coordinates
  const getGeolocationData = useCallback((): { lat?: number; lon?: number } => {
    if (!geostamp?.lat || !geostamp?.lon) {
      return {};
    }
    return {
      lat: geostamp.lat,
      lon: geostamp.lon
    };
  }, [geostamp?.lat, geostamp?.lon]);

  // Type-safe payload builder for proof creation
  const buildProofPayload = useCallback(async (): Promise<{
    method: ProofMethod;
    photo: File;
    key: string;
    lat?: number;
    lon?: number;
    captured_at: string;
    otp?: string;
    signature_svg?: string;
  }> => {
    return {
      method: kind,
      photo: photos[0],
      key: "", // service presigns and sets real key
      ...getGeolocationData(),
      captured_at: getCapturedAt(),
      otp: getOtpValue(),
      signature_svg: await getSignatureSvg()
    };
  }, [kind, photos, getGeolocationData, getCapturedAt, getOtpValue, getSignatureSvg]);
  

  const onSubmit = useCallback(async () => {
    if (photos.length === 0) {
      setError("Debes adjuntar al menos una foto");
      return;
    }
    setSubmitting(true);
    setError(null);
    setOkMessage(null);

    try {
      const resp = await postProof(shipmentId, await buildProofPayload());
      try {
        setProofId(resp.proof_id);
        const url = await getProofSignedUrl(resp.proof_id);
        setPreviewUrl(url);
        setRefreshTries(0);
      } catch {}

      setOkMessage("Prueba enviada correctamente");
      // reset local state for next time
      setPhotos([]);
      setSignature(null);
      setNotes("");
      setOtp("");
      resetGeo();
      onSuccess?.(resp);
      onOpenChange(false);
    } catch (e: unknown) {
      let message = "No se pudo enviar la prueba";
      if (e instanceof Error) {
        message = e.message;
      } else if (typeof e === "object" && e !== null && "error" in e) {
        const maybe = (e as { error?: unknown }).error;
        if (typeof maybe === "string") message = maybe;
      }
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }, [shipmentId, buildProofPayload, onSuccess, onOpenChange, resetGeo, photos.length]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Fondo */}
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange(false)} />

      {/* Diálogo */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-white dark:bg-neutral-900 shadow-xl ring-1 ring-black/10">
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-white/10">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Camera className="h-5 w-5" /> Comprobante de Entrega
          </h2>
          <div className="text-xs text-gray-600 flex items-center gap-2"><AlertTriangle className="h-3.5 w-3.5"/> Adjunta al menos una foto. La geolocalización es opcional en el panel.</div>
          <button className="rounded-lg px-2 py-1 text-sm hover:bg-black/5 dark:hover:bg-white/10" onClick={() => onOpenChange(false)}>Cerrar</button>
        </div>

        <div className="px-5 py-4 grid gap-4">
          {/* Paso 1 · Tipo de comprobante */}
          <div className="grid gap-1">
            <label className="text-sm font-medium flex items-center gap-2"><Images className="h-4 w-4"/> Tipo</label>
            <select className="w-full rounded-xl border px-3 py-2 bg-transparent" value={kind} onChange={(e) => setKind(e.target.value as ProofMethod)}>
              <option value="photo">Foto</option>
              <option value="otp">OTP</option>
              <option value="qr" disabled>QR (pendiente)</option>
              <option value="signature">Firma</option>
            </select>
          </div>

          {/* Paso 2 · Notas y OTP (opcional) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-1">
              <label className="text-sm font-medium">Notas (opcional)</label>
              <textarea className="min-h-[80px] w-full rounded-xl border px-3 py-2 bg-transparent" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej: entregado al destinatario" />
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-medium">OTP (opcional)</label>
              <input className="w-full rounded-xl border px-3 py-2 bg-transparent" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Código de 6 dígitos" />
            </div>
          </div>

          {/* Paso 3 · Firma (opcional) */}
          <div className="grid gap-1">
            <label className="text-sm font-medium flex items-center gap-2"><FileSignature className="h-4 w-4"/> Firma (opcional)</label>
            <input type="file" accept="image/*" onChange={(e) => setSignature(e.target.files?.[0] ?? null)} />
            {signature && (
              <div className="text-xs opacity-70">Seleccionado: {signature.name}</div>
            )}
          </div>

          {/* Paso 4 · Fotos (obligatorio) */}
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2"><Images className="h-4 w-4"/> Fotos (mínimo 1)</label>
              <div className="text-xs opacity-70">{photos.length} seleccionada(s)</div>
            </div>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              className="rounded-2xl border border-dashed px-4 py-6 text-center"
            >
              <p className="text-sm mb-2">Arrastra y suelta imágenes aquí</p>
              <p className="text-xs opacity-70 mb-3">o</p>
              <button
                className="rounded-xl border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10"
                onClick={() => inputRef.current?.click()}
                type="button"
              >
                Seleccionar archivos
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => onSelectFiles(e.target.files)}
              />
            </div>
            {photos.length > 0 && (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {photos.map((file, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={URL.createObjectURL(file)} alt={`photo-${idx + 1}`} className="h-24 w-full object-cover" />
                    <button
                      className="absolute right-1 top-1 rounded-md bg-black/50 text-white text-xs px-2 py-0.5"
                      onClick={() => removePhotoAt(idx)}
                      type="button"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Paso 5 · Geolocalización (opcional para Panel) */}
          <div className="grid gap-2">
            {geostamp ? (
              <div className="flex items-center gap-3">
                <div className="text-xs opacity-80">
                  lat {geostamp.lat.toFixed(6)} • lon {geostamp.lon.toFixed(6)} • <span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5"/>{new Date(geostamp.taken_at).toLocaleTimeString()}</span>
                </div>
                <button
                  type="button"
                  onClick={() => capture({ force: true })}
                  className="text-xs rounded-md border px-2 py-1 hover:bg-gray-50"
                  disabled={geoLoading}
                >
                  Re-capturar
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => capture()}
                  disabled={geoLoading}
                  className="rounded-xl border px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10 disabled:opacity-50"
                >
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4"/>
                    {geoLoading ? "Capturando ubicación…" : "Capturar ubicación"}
                  </span>
                </button>
              </div>
            )}
            {geoError && <div className="text-xs text-red-600">{geoError}</div>}
          </div>

          {previewUrl && (
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Vista previa</label>
                <button
                  type="button"
                  className="text-xs rounded-md border px-2 py-1 hover:bg-gray-50"
                  onClick={async () => {
                    if (!proofId) return;
                    try {
                      const url = await getProofSignedUrl(proofId);
                      setPreviewUrl(url);
                      setRefreshTries(0);
                    } catch {}
                  }}
                >
                  Actualizar
                </button>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="POD"
                className="h-36 w-auto rounded-md border"
                onError={async () => {
                  if (!proofId) return;
                  if (refreshTries >= 3) return;
                  const tries = refreshTries + 1;
                  setRefreshTries(tries);
                  const delay = Math.min(tries * 1000, 4000);
                  setTimeout(async () => {
                    try {
                      const url = await getProofSignedUrl(proofId);
                      setPreviewUrl(url);
                    } catch {}
                  }, delay);
                }}
              />
            </div>
          )}

          {/* Mensajes */}
          {error && <div className="rounded-xl border border-red-300 px-3 py-2 text-sm text-red-700">{error}</div>}
          {okMessage && <div className="rounded-xl border border-emerald-300 px-3 py-2 text-sm text-emerald-700">{okMessage}</div>}
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-black/5 dark:border-white/10">
          <button className="rounded-xl px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10" onClick={() => onOpenChange(false)} type="button">Cancelar</button>
          <button
            className="rounded-xl px-4 py-2 text-sm font-medium border disabled:opacity-50"
            disabled={disabled}
            onClick={onSubmit}
            type="button"
          >
            {submitting ? "Enviando…" : "Enviar comprobante"}
          </button>
          {disabled && disabledReason && (
            <span className="text-xs text-gray-600">{disabledReason}</span>
          )}
        </div>
      </div>
    </div>
  );
}
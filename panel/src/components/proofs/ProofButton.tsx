"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import ProofDialog from "@/components/proofs/ProofDialog";
import { FileCheck2 } from "lucide-react";
import type { ProofResponse } from "@/services/proofs/types";

interface Props { shipmentId: string; onCreated?: (resp: ProofResponse) => void }
export default function ProofButton({ shipmentId, onCreated }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-white bg-primary-600 hover:bg-primary-700"
        onClick={() => setOpen(true)}
        type="button"
      >
        <FileCheck2 className="h-4 w-4" />
        Añadir comprobante
      </button>

      <ProofDialog
        open={open}
        onOpenChange={setOpen}
        shipmentId={shipmentId}
        onSuccess={(resp) => {
          if (resp.warning) {
            toast.warning(resp.warning);
          }
          toast.success("Comprobante creado correctamente");
          onCreated?.(resp);
        }}
      />
    </>
  );
}
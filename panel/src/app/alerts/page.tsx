"use client";
import { Suspense } from "react";


export default function AlertsPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading alerts...</div>}>
    
    </Suspense>
  );
}

"use client";
import { Suspense } from "react";
import AlertsPageContent from "./AlertsPageContent";

export default function AlertsPage() {
  return (
    <Suspense fallback={<div className="p-4">Loading alerts...</div>}>
      <AlertsPageContent />
    </Suspense>
  );
}

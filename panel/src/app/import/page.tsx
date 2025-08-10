"use client";

import { useState } from "react";

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="mb-4 text-2xl font-semibold text-gray-900">CSV Import</h1>

      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <div className="mb-4">
          <label htmlFor="csv" className="mb-2 block text-sm font-medium text-gray-700">Upload CSV</label>
          <input
            id="csv"
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full cursor-pointer rounded-md border px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-blue-700"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">Selected: {file.name}</p>
          )}
        </div>

        <div className="mt-6">
          <h2 className="mb-2 text-lg font-medium text-gray-900">Field Mapping (stub)</h2>
          <p className="text-sm text-gray-600">Define mapping between CSV columns and system fields here.</p>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-md border p-4">
              <p className="mb-2 text-sm font-medium text-gray-700">CSV Columns</p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>column_a</li>
                <li>column_b</li>
                <li>column_c</li>
              </ul>
            </div>
            <div className="rounded-md border p-4">
              <p className="mb-2 text-sm font-medium text-gray-700">Target Fields</p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li>name</li>
                <li>email</li>
                <li>phone</li>
              </ul>
            </div>
          </div>
          <button className="mt-6 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">Process</button>
        </div>
      </section>
    </main>
  );
}

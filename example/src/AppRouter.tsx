import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { App } from './App';
import { Dashboard } from './pages/Dashboard';
import { Orders } from './pages/Orders';
import { Shipments } from './pages/Shipments';
import { Import } from './pages/Import';
export function AppRouter() {
  return <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/shipments" element={<Shipments />} />
        <Route path="/import" element={<Import />} />
      </Routes>
    </BrowserRouter>;
}
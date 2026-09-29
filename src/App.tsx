/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './pages/Dashboard';
import { Applications } from './pages/Applications';
import { NewApplication } from './pages/NewApplication';
import { UnderwritingWorkspace } from './pages/UnderwritingWorkspace';
import { CreditMemoPage } from './pages/CreditMemoPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { Login } from './pages/Login';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/applications/new" element={<NewApplication />} />
          <Route path="/applications/:id" element={<UnderwritingWorkspace />} />
          <Route path="/applications/:id/memo" element={<CreditMemoPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/audit-trail" element={<AuditLogsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

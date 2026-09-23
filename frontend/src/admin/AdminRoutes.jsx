import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminGuard from './AdminGuard';
import AdminLayout from './AdminLayout';
import AdminLogin from './pages/AdminLogin/AdminLogin';
import Dashboard from './pages/Dashboard/Dashboard';
import Add from './pages/AddFood/Add';
import List from './pages/FoodList/List';
import Orders from './pages/Orders/Orders';
import Settings from './pages/Settings/Settings';

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Dedicated Admin Login route (accessible without existing admin session) */}
      <Route path="login" element={<AdminLogin />} />

      {/* Protected Admin Console Routes */}
      <Route
        path="*"
        element={
          <AdminGuard>
            <Routes>
              <Route element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="foods" element={<List />} />
                <Route path="foods/add" element={<Add />} />
                <Route path="orders" element={<Orders />} />
                <Route path="settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Route>
            </Routes>
          </AdminGuard>
        }
      />
    </Routes>
  );
};

export default AdminRoutes;

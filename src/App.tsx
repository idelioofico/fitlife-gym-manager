import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Login from "./pages/Login";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Members from "./pages/Members";
import MembersFixed from "./pages/MembersFixed";
import Plans from "./pages/Plans";
import Payments from "./pages/Payments";
import Schedules from "./pages/Schedules";
import CheckIn from "./pages/CheckIn";
import Workouts from "./pages/Workouts";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import POS from "./pages/POS";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import SalesReports from "./pages/SalesReports";
import Expenses from "./pages/Expenses";
import Documents from "./pages/Documents";
import ExpenseReports from "./pages/ExpenseReports";
import Inventory from "./pages/Inventory";
import Suppliers from "./pages/Suppliers";
import TestPage from "./pages/TestPage";
import TestMemberForm from "./pages/TestMemberForm";
import Billing from "./pages/Billing";

import ProductsFixed from "./pages/ProductsFixed";
import SalesFixed from "./pages/SalesFixed";
import POSFixed from "./pages/POSFixed";
import ExpensesFixed from "./pages/ExpensesFixed";
import DocumentsFixed from "./pages/DocumentsFixed";
import InventoryFixed from "./pages/InventoryFixed";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/members" element={
              <ProtectedRoute>
                <MembersFixed />
              </ProtectedRoute>
            } />
            <Route path="/plans" element={
              <ProtectedRoute>
                <Plans />
              </ProtectedRoute>
            } />
            <Route path="/payments" element={
              <ProtectedRoute>
                <Payments />
              </ProtectedRoute>
            } />
            <Route path="/schedules" element={
              <ProtectedRoute>
                <Schedules />
              </ProtectedRoute>
            } />
            <Route path="/checkin" element={
              <ProtectedRoute>
                <CheckIn />
              </ProtectedRoute>
            } />
            <Route path="/workouts" element={
              <ProtectedRoute>
                <Workouts />
              </ProtectedRoute>
            } />
            <Route path="/pos" element={
              <ProtectedRoute>
                <POSFixed />
              </ProtectedRoute>
            } />
            <Route path="/products" element={
              <ProtectedRoute>
                <ProductsFixed />
              </ProtectedRoute>
            } />
            <Route path="/sales" element={
              <ProtectedRoute>
                <SalesFixed />
              </ProtectedRoute>
            } />
            <Route path="/sales/reports" element={
              <ProtectedRoute>
                <SalesFixed />
              </ProtectedRoute>
            } />
            <Route path="/expenses" element={
              <ProtectedRoute>
                <ExpensesFixed />
              </ProtectedRoute>
            } />
            <Route path="/documents" element={
              <ProtectedRoute>
                <DocumentsFixed />
              </ProtectedRoute>
            } />
            <Route path="/expenses/reports" element={
              <ProtectedRoute>
                <ExpensesFixed />
              </ProtectedRoute>
            } />
            <Route path="/inventory" element={
              <ProtectedRoute>
                <InventoryFixed />
              </ProtectedRoute>
            } />
            <Route path="/suppliers" element={
              <ProtectedRoute>
                <InventoryFixed />
              </ProtectedRoute>
            } />
            <Route path="/test" element={
              <ProtectedRoute>
                <TestMemberForm />
              </ProtectedRoute>
            } />
            <Route path="/billing" element={
              <ProtectedRoute requireAdmin={true}>
                <Billing />
              </ProtectedRoute>
            } />

            <Route path="/settings" element={
              <ProtectedRoute requireAdmin={true}>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

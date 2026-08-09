import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import ToastContainer from "./components/ToastContainer";
import NavBar from "./components/NavBar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import RootRedirect from "./components/RootRedirect";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import SnippetDetail from "./pages/SnippetDetail";
import SnippetForm from "./pages/SnippetForm";
import Profile from "./pages/Profile";
import AdminAnalytics from "./pages/AdminAnalytics";

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>
            <NavBar />
            <ToastContainer />
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/explore" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/snippets/:id" element={<SnippetDetail />} />
            <Route
              path="/snippets/new"
              element={
                <ProtectedRoute>
                  <SnippetForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/snippets/:id/edit"
              element={
                <ProtectedRoute>
                  <SnippetForm />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute adminOnly>
                  <AdminAnalytics />
                </ProtectedRoute>
              }
            />
          </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

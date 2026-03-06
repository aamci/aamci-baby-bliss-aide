import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Onboarding from "./pages/Onboarding";
import Home from "./pages/Home";
import Assistant from "./pages/Assistant";
import Contents from "./pages/Contents";
import Tracking from "./pages/Tracking";
import Profile from "./pages/Profile";
import ArticleDetail from "./pages/ArticleDetail";
import Notifications from "./pages/Notifications";
import Documents from "./pages/Documents";
import ChildProfile from "./pages/ChildProfile";
import NotificationSettings from "./pages/NotificationSettings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResetPassword from "./pages/ResetPassword";
import CoParenting from "./pages/CoParenting";
import SavedContents from "./pages/SavedContents";
import Teleconsultation from "./pages/Teleconsultation";
import Appointments from "./pages/Appointments";
import AppLayout from "./components/AppLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route path="/home" element={<Home />} />
              <Route path="/contents" element={<Contents />} />
              <Route path="/tracking" element={<Tracking />} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/assistant" element={<Assistant />} />
            </Route>
            <Route path="/article/:slug" element={<ProtectedRoute><ArticleDetail /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
            <Route path="/child-profile" element={<ProtectedRoute><ChildProfile /></ProtectedRoute>} />
            <Route path="/notification-settings" element={<ProtectedRoute><NotificationSettings /></ProtectedRoute>} />
            <Route path="/coparenting" element={<ProtectedRoute><CoParenting /></ProtectedRoute>} />
            <Route path="/saved-contents" element={<ProtectedRoute><SavedContents /></ProtectedRoute>} />
            <Route path="/teleconsultation" element={<ProtectedRoute><Teleconsultation /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

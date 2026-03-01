import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import AppLayout from "./components/AppLayout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Onboarding />} />
          <Route element={<AppLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/contents" element={<Contents />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/assistant" element={<Assistant />} />
          </Route>
          <Route path="/article/:slug" element={<ArticleDetail />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/child-profile" element={<ChildProfile />} />
          <Route path="/notification-settings" element={<NotificationSettings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SplashScreen } from "@/components/SplashScreen";
import { AuthProvider } from "@/hooks/useAuth";
import { SettingsProvider } from "@/hooks/useSettings";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Catalogue from "./pages/Catalogue";
import CreateMSP from "./pages/CreateMSP";
import MSPDetail from "./pages/MSPDetail";
import EditMSP from "./pages/EditMSP";
import PublicMSP from "./pages/PublicMSP";
import Scanner from "./pages/Scanner";
import Sites from "./pages/Sites";
import Carte from "./pages/Carte";
import SiteDetail from "./pages/SiteDetail";
import CreateSite from "./pages/CreateSite";
import EditSite from "./pages/EditSite";
import Settings from "./pages/Settings";
import Aide from "./pages/Aide";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Admin from "./pages/Admin";
import ResetPassword from "./pages/ResetPassword";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Check if this is a PWA standalone mode or first visit
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;
    
    const hasSeenSplash = sessionStorage.getItem('splashShown');
    
    // Show splash only in standalone mode (PWA) or first session visit
    if (!isStandalone && hasSeenSplash) {
      setShowSplash(false);
      setAppReady(true);
    } else {
      sessionStorage.setItem('splashShown', 'true');
    }
  }, []);

  const handleSplashComplete = () => {
    setAppReady(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            
            {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
            
            {appReady && (
              <BrowserRouter>
                <Routes>
                  {/* Routes publiques */}
                  <Route path="/connexion" element={<Login />} />
                  <Route path="/inscription" element={<Signup />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/public/:slug" element={<PublicMSP />} />
                  
                  {/* Routes protégées */}
                  <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                  <Route path="/catalogue" element={<ProtectedRoute><Catalogue /></ProtectedRoute>} />
                  <Route path="/creer" element={<ProtectedRoute><CreateMSP /></ProtectedRoute>} />
                  <Route path="/msp/:slug" element={<ProtectedRoute><MSPDetail /></ProtectedRoute>} />
                  <Route path="/msp/:slug/edit" element={<ProtectedRoute><EditMSP /></ProtectedRoute>} />
                  <Route path="/scanner" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
                  <Route path="/sites" element={<ProtectedRoute><Sites /></ProtectedRoute>} />
                  <Route path="/carte" element={<ProtectedRoute><Carte /></ProtectedRoute>} />
                  <Route path="/sites/nouveau" element={<ProtectedRoute><CreateSite /></ProtectedRoute>} />
                  <Route path="/sites/:slug" element={<ProtectedRoute><SiteDetail /></ProtectedRoute>} />
                  <Route path="/sites/:slug/edit" element={<ProtectedRoute><EditSite /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                  <Route path="/aide" element={<ProtectedRoute><Aide /></ProtectedRoute>} />
                  <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                  
                  {/* Route admin */}
                  <Route path="/admin" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
                  
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            )}
          </TooltipProvider>
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

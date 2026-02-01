import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SplashScreen } from "@/components/SplashScreen";
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
      <TooltipProvider>
        <Toaster />
        <Sonner />
        
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
        
        {appReady && (
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/catalogue" element={<Catalogue />} />
              <Route path="/creer" element={<CreateMSP />} />
              <Route path="/msp/:slug" element={<MSPDetail />} />
              <Route path="/msp/:slug/edit" element={<EditMSP />} />
              <Route path="/public/:slug" element={<PublicMSP />} />
              <Route path="/scanner" element={<Scanner />} />
              <Route path="/sites" element={<Sites />} />
              <Route path="/carte" element={<Carte />} />
              <Route path="/sites/nouveau" element={<CreateSite />} />
              <Route path="/sites/:slug" element={<SiteDetail />} />
              <Route path="/sites/:slug/edit" element={<EditSite />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/aide" element={<Aide />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

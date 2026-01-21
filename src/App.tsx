import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Catalogue from "./pages/Catalogue";
import CreateMSP from "./pages/CreateMSP";
import MSPDetail from "./pages/MSPDetail";
import EditMSP from "./pages/EditMSP";
import PublicMSP from "./pages/PublicMSP";
import Scanner from "./pages/Scanner";
import Sites from "./pages/Sites";
import SiteDetail from "./pages/SiteDetail";
import CreateSite from "./pages/CreateSite";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
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
          <Route path="/sites/nouveau" element={<CreateSite />} />
          <Route path="/sites/:slug" element={<SiteDetail />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

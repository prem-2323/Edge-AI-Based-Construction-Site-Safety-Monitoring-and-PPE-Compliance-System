import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { DetectionProvider } from "@/contexts/DetectionContext";
import { ZoneProvider } from "@/contexts/ZoneContext";
import Index from "./pages/Index";
import LiveCameras from "./pages/LiveCameras";
import ViolationsLog from "./pages/ViolationsLog";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <DetectionProvider>
        <ZoneProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/cameras" element={<LiveCameras />} />
                <Route path="/violations" element={<ViolationsLog />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </ZoneProvider>
      </DetectionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import Export from "./pages/Export";
import ExportPreview from "./pages/ExportPreview";
import Charts from "./pages/Charts";
import NotFound from "./pages/NotFound";
import JsonReference from "./pages/JsonReference";
import JsonViewer from "./pages/JsonViewer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/export" element={<Export />} />
            <Route path="/export/preview" element={<ExportPreview />} />
            <Route path="/json-reference" element={<JsonReference />} />
            <Route path="/json-viewer" element={<JsonViewer />} />
            <Route path="/charts" element={<Charts />} />
            

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

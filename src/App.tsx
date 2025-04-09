
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Bellendar from "./pages/Bellendar";
import SmartClock from "./pages/SmartClock";
import TaskLadder from "./pages/TaskLadder";
import ProcessMap from "./pages/ProcessMap";
import Delegation from "./pages/Delegation";
import BellRest from "./pages/BellRest";
import IdentityCore from "./pages/IdentityCore";
import PomodoroTimer from "./pages/PomodoroTimer";
import NotFound from "./pages/NotFound";
import LanguageToggle from "./components/LanguageToggle";
import BellGPT from "./components/BellGPT";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <LanguageToggle />
        <BellGPT />
        <BrowserRouter>
          <Routes>
            <Route 
              path="/" 
              element={<Layout><Index /></Layout>} 
            />
            <Route 
              path="/calendar" 
              element={<Layout><Bellendar /></Layout>} 
            />
            <Route 
              path="/clock" 
              element={<Layout><SmartClock /></Layout>} 
            />
            <Route 
              path="/tasks" 
              element={<Layout><TaskLadder /></Layout>} 
            />
            <Route 
              path="/process" 
              element={<Layout><ProcessMap /></Layout>} 
            />
            <Route 
              path="/delegation" 
              element={<Layout><Delegation /></Layout>} 
            />
            <Route 
              path="/rest" 
              element={<Layout><BellRest /></Layout>} 
            />
            <Route 
              path="/identity" 
              element={<Layout><IdentityCore /></Layout>} 
            />
            <Route 
              path="/pomodoro" 
              element={<Layout><PomodoroTimer /></Layout>} 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;

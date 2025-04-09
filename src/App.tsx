
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import Bellendar from "./pages/Bellendar";
import SmartClock from "./pages/SmartClock";
import TaskLadder from "./pages/TaskLadder";
import PomodoroTimer from "./pages/PomodoroTimer";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
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
            path="/pomodoro" 
            element={<Layout><PomodoroTimer /></Layout>} 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;


import { useState, PropsWithChildren, useEffect } from "react";
import MainNav from "./MainNav";
import { TradeProvider } from "@/context/TradeContext";

interface LayoutProps {
  initialSection?: string;
}

const Layout = ({ children, initialSection = "dashboard" }: PropsWithChildren<LayoutProps>) => {
  const [currentSection, setCurrentSection] = useState(initialSection);
  
  // Allow changing the section via URL hash
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      setCurrentSection(hash);
    }
    
    const handleHashChange = () => {
      const newHash = window.location.hash.replace("#", "");
      if (newHash) {
        setCurrentSection(newHash);
      }
    };
    
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);
  
  // Update hash when section changes
  const handleNavigate = (section: string) => {
    setCurrentSection(section);
    window.location.hash = section;
  };
  
  return (
    <TradeProvider>
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
          <div className="container flex h-16 items-center justify-between">
            <div className="hidden md:block mr-4 font-bold text-lg">
              <div className="flex items-center">
                <img src="/placeholder.svg" alt="Logo" className="h-6 w-6 mr-2" />
                <span>CS2 Trade Tracker</span>
              </div>
            </div>
            <MainNav 
              onNavigate={handleNavigate} 
              currentSection={currentSection} 
              className="mx-6 flex-1" 
            />
          </div>
        </header>
        <main className="flex-1 container py-6 md:py-8 lg:py-10">
          {children}
        </main>
      </div>
    </TradeProvider>
  );
};

export default Layout;


import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import DashboardSummary from "@/components/DashboardSummary";
import TransactionForm from "@/components/TransactionForm";
import InventoryList from "@/components/InventoryList";
import TransactionHistory from "@/components/TransactionHistory";
import ExchangeRateChart from "@/components/ExchangeRateChart";
import CurrencyExchangeForm from "@/components/CurrencyExchangeForm";

const Index = () => {
  const [currentSection, setCurrentSection] = useState<string>("dashboard");

  // Get section from URL hash on load
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash) {
      setCurrentSection(hash);
    } else {
      window.location.hash = "dashboard";
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

  // Render the correct section
  const renderSection = () => {
    switch (currentSection) {
      case "dashboard":
        return (
          <div className="space-y-8">
            <DashboardSummary />
            <ExchangeRateChart />
          </div>
        );
      case "add-transaction":
        return <TransactionForm />;
      case "inventory":
        return <InventoryList />;
      case "transactions":
        return <TransactionHistory />;
      case "exchange":
        return (
          <div className="max-w-md mx-auto">
            <CurrencyExchangeForm />
          </div>
        );
      default:
        return <DashboardSummary />;
    }
  };

  return (
    <Layout initialSection={currentSection}>
      <div className="min-h-screen">
        {renderSection()}
      </div>
    </Layout>
  );
};

export default Index;

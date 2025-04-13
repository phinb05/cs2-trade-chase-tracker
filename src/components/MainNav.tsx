
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronRight,
  LineChart,
  Package,
  PlusCircle,
  History,
  ArrowRightLeft,
  Menu,
  X
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface MainNavProps {
  className?: string;
  onNavigate: (section: string) => void;
  currentSection: string;
}

export function MainNav({ 
  className, 
  onNavigate, 
  currentSection 
}: MainNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleNavigate = (section: string) => {
    onNavigate(section);
    setIsOpen(false);
  };

  const navItems = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: <LineChart className="h-4 w-4" />,
    },
    {
      id: "add-transaction",
      title: "Add Transaction",
      icon: <PlusCircle className="h-4 w-4" />,
    },
    {
      id: "inventory",
      title: "Inventory",
      icon: <Package className="h-4 w-4" />,
    },
    {
      id: "transactions",
      title: "Transaction History",
      icon: <History className="h-4 w-4" />,
    },
    {
      id: "exchange",
      title: "Exchange Currency",
      icon: <ArrowRightLeft className="h-4 w-4" />,
    },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <div className="flex md:hidden items-center justify-between w-full px-4 py-3 bg-background shadow-md">
        <div className="font-bold text-lg flex items-center">
          <img src="/placeholder.svg" alt="Logo" className="h-6 w-6 mr-2" />
          CS2 Trade Tracker
        </div>
        <Button variant="ghost" size="icon" onClick={toggleMenu}>
          {isOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* Mobile menu */}
      <div 
        className={cn(
          "md:hidden fixed inset-0 z-50 bg-background pt-16 transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <ScrollArea className="h-full px-6 pb-32">
          <div className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={currentSection === item.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => handleNavigate(item.id)}
              >
                <span className="mr-2">{item.icon}</span>
                {item.title}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Desktop navigation */}
      <nav
        className={cn(
          "hidden md:flex items-center space-x-4 lg:space-x-6",
          className
        )}
      >
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={currentSection === item.id ? "default" : "ghost"}
            size="sm"
            onClick={() => handleNavigate(item.id)}
            className="flex items-center"
          >
            <span className="mr-1">{item.icon}</span>
            {item.title}
            {currentSection === item.id && (
              <ChevronRight className="h-4 w-4 ml-1" />
            )}
          </Button>
        ))}
      </nav>
    </>
  );
}

export default MainNav;

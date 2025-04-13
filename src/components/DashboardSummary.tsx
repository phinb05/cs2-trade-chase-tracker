
import { useTrade } from "@/context/TradeContext";
import { formatCurrency } from "@/utils/transactionUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDollarSign, LineChart, Package, TrendingUp } from "lucide-react";
import AccountBalanceCard from "./AccountBalanceCard";

const DashboardSummary = () => {
  const { balances, transactions } = useTrade();
  
  // Calculate total profit
  const totalProfit = transactions
    .filter(t => t.status === 'Completed' && t.profit !== undefined)
    .reduce((sum, t) => sum + (t.profit || 0), 0);
  
  // Calculate average profit per trade
  const completedTransactions = transactions.filter(t => t.status === 'Completed' && t.profit !== undefined);
  const avgProfit = completedTransactions.length > 0 
    ? totalProfit / completedTransactions.length 
    : 0;
  
  // Count items in inventory
  const inventoryCount = transactions.filter(t => t.status === 'Resale Pending').length;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-cs2-teal" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalProfit >= 0 ? 'text-cs2-teal' : 'text-cs2-red'}`}>
              {formatCurrency(totalProfit, 'VND')}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Profit/Trade</CardTitle>
            <LineChart className="h-4 w-4 text-cs2-teal" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${avgProfit >= 0 ? 'text-cs2-teal' : 'text-cs2-red'}`}>
              {formatCurrency(avgProfit, 'VND')}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items in Inventory</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventoryCount}</div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-2xl font-bold tracking-tight mt-8">Account Balances</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AccountBalanceCard
          title="VND Cash (Before Buying)"
          amount={balances.vndCashBeforeBuying}
          currency="VND"
          icon={<CircleDollarSign />}
          className="border-green-600/20"
        />
        
        <AccountBalanceCard
          title="Inventory Value"
          amount={balances.inventory}
          currency="VND"
          icon={<Package />}
          className="border-amber-600/20"
        />
        
        <AccountBalanceCard
          title="Inventory Value (RMB)"
          amount={balances.inventoryRMB}
          currency="RMB"
          icon={<Package />}
          className="border-amber-600/20"
        />
        
        <AccountBalanceCard
          title="RMB on Youpin Platform"
          amount={balances.rmbYoupinPlatform}
          currency="RMB"
          icon={<CircleDollarSign />}
          className="border-blue-600/20"
        />
        
        <AccountBalanceCard
          title="RMB Cash"
          amount={balances.rmbCash}
          currency="RMB"
          icon={<CircleDollarSign />}
          className="border-blue-600/20"
        />
        
        <AccountBalanceCard
          title="VND Cash (After Resale)"
          amount={balances.vndCashAfterResale}
          currency="VND"
          icon={<CircleDollarSign />}
          className="border-green-600/20"
        />
      </div>
    </div>
  );
};

export default DashboardSummary;

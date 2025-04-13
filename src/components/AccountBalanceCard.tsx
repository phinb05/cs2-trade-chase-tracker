
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/transactionUtils";

interface AccountBalanceCardProps {
  title: string;
  amount: number;
  currency: "VND" | "RMB";
  icon: React.ReactNode;
  className?: string;
}

const AccountBalanceCard = ({ 
  title, 
  amount, 
  currency, 
  icon, 
  className 
}: AccountBalanceCardProps) => {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-primary h-4 w-4">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {formatCurrency(amount, currency)}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountBalanceCard;

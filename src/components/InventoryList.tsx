
import { useState } from "react";
import { useTrade } from "@/context/TradeContext";
import { calculateDaysRemaining, formatCurrency } from "@/utils/transactionUtils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ResaleForm } from "./ResaleForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Package, Clock } from "lucide-react";

const InventoryList = () => {
  const { transactions } = useTrade();
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Get only pending resale transactions
  const pendingTransactions = transactions.filter(t => t.status === 'Resale Pending');

  const handleResaleClick = (id: string) => {
    setSelectedTransaction(id);
    setIsDialogOpen(true);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Inventory</CardTitle>
            <CardDescription>
              Items waiting for resale ({pendingTransactions.length})
            </CardDescription>
          </div>
          <Package className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        {pendingTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mb-2" />
            <p>No items in inventory</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Purchase Price</TableHead>
                <TableHead className="hidden md:table-cell">Purchase Date</TableHead>
                <TableHead>Waiting Period</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingTransactions.map((transaction) => {
                const daysRemaining = calculateDaysRemaining(transaction.purchaseDate);
                
                return (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.itemName}
                      <div className="mt-1">
                        <Badge variant="outline">{transaction.condition}</Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(transaction.purchasePrice, 'VND')}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {format(new Date(transaction.purchaseDate), "PP")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {daysRemaining === 0 ? (
                          <Badge variant="outline" className="bg-cs2-teal text-white">
                            Ready for resale
                          </Badge>
                        ) : (
                          <span>{daysRemaining} days left</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        disabled={daysRemaining > 0}
                        onClick={() => handleResaleClick(transaction.id)}
                        variant={daysRemaining === 0 ? "default" : "outline"}
                      >
                        Record Resale
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Record Resale</DialogTitle>
              <DialogDescription>
                Enter the details of the resale transaction
              </DialogDescription>
            </DialogHeader>
            {selectedTransaction && (
              <ResaleForm 
                transactionId={selectedTransaction} 
                onComplete={() => setIsDialogOpen(false)} 
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default InventoryList;

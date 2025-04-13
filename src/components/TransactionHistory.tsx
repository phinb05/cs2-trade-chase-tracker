
import { useState } from "react";
import { useTrade } from "@/context/TradeContext";
import { formatCurrency } from "@/utils/transactionUtils";
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
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { History, Trash2, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const TransactionHistory = () => {
  const { transactions, deleteTransaction } = useTrade();
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");
  const [sortBy, setSortBy] = useState<"date" | "profit">("date");
  
  // Filter transactions
  let filteredTransactions = [...transactions];
  if (filter === "completed") {
    filteredTransactions = filteredTransactions.filter(t => t.status === 'Completed');
  } else if (filter === "pending") {
    filteredTransactions = filteredTransactions.filter(t => t.status === 'Resale Pending');
  }
  
  // Sort transactions
  if (sortBy === "date") {
    filteredTransactions.sort((a, b) => {
      return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
    });
  } else if (sortBy === "profit") {
    filteredTransactions.sort((a, b) => {
      const profitA = a.profit || 0;
      const profitB = b.profit || 0;
      return profitB - profitA;
    });
  }
  
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this transaction?")) {
      deleteTransaction(id);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Transaction History</CardTitle>
            <CardDescription>
              All transactions ({filteredTransactions.length})
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={filter} onValueChange={(value) => setFilter(value as any)}>
                  <DropdownMenuRadioItem value="all">All</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="completed">Completed</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="pending">Pending</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
                <DropdownMenuLabel className="mt-2">Sort By</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                  <DropdownMenuRadioItem value="date">Date</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="profit">Profit</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
            <History className="h-5 w-5 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mb-2" />
            <p>No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className="hidden md:table-cell">Condition</TableHead>
                  <TableHead>Purchase</TableHead>
                  <TableHead className="hidden md:table-cell">Resale</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Profit</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => {
                  const isProfitable = transaction.profit !== undefined && transaction.profit > 0;
                  const isLoss = transaction.profit !== undefined && transaction.profit < 0;
                  
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">
                        {transaction.itemName}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{transaction.condition}</Badge>
                      </TableCell>
                      <TableCell>
                        <div>{formatCurrency(transaction.purchasePrice, 'VND')}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {format(new Date(transaction.purchaseDate), "PP")}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {transaction.resalePrice ? (
                          <div>
                            <div>{formatCurrency(transaction.resalePrice, 'RMB')}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {transaction.resaleDate && format(new Date(transaction.resaleDate), "PP")}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Pending</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {transaction.status === 'Completed' ? (
                          <Badge className="bg-cs2-teal text-white">Completed</Badge>
                        ) : (
                          <Badge variant="outline">Pending</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {transaction.profit !== undefined ? (
                          <span className={
                            isProfitable ? "text-cs2-teal" : 
                            isLoss ? "text-cs2-red" : ""
                          }>
                            {formatCurrency(transaction.profit, 'VND')}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;

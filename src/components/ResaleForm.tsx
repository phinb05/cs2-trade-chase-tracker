
import { useState } from "react";
import { useTrade } from "@/context/TradeContext";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

interface ResaleFormProps {
  transactionId: string;
  onComplete: () => void;
}

const resaleFormSchema = z.object({
  resalePrice: z.coerce.number().positive("Price must be positive"),
  resaleFee: z.coerce.number().min(0, "Fee cannot be negative"),
  resaleFeeCurrency: z.enum(['VND', 'RMB'] as const),
  exchangeRateResale: z.coerce.number().positive("Exchange rate must be positive"),
  resaleDate: z.date()
});

export const ResaleForm = ({ transactionId, onComplete }: ResaleFormProps) => {
  const { transactions, recordResale } = useTrade();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const transaction = transactions.find(t => t.id === transactionId);
  
  const form = useForm<z.infer<typeof resaleFormSchema>>({
    resolver: zodResolver(resaleFormSchema),
    defaultValues: {
      resalePrice: 0,
      resaleFee: 0,
      resaleFeeCurrency: "RMB",
      exchangeRateResale: transaction?.exchangeRatePurchase || 3500,
      resaleDate: new Date(),
    },
  });

  const onSubmit = (values: z.infer<typeof resaleFormSchema>) => {
    if (!transaction) return;
    
    setIsSubmitting(true);
    
    try {
      recordResale(
        transactionId,
        values.resalePrice,
        values.resaleDate,
        values.exchangeRateResale,
        values.resaleFee,
        values.resaleFeeCurrency
      );

      toast({
        title: "Resale recorded",
        description: `Resale of ${transaction.itemName} has been recorded successfully.`,
        action: <CheckCircle className="text-green-500" />,
      });

      onComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record resale. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!transaction) {
    return <div>Transaction not found</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-4">
          <div className="p-4 bg-secondary/20 rounded-md mb-4">
            <h4 className="font-semibold">{transaction.itemName}</h4>
            <p className="text-sm text-muted-foreground">
              {transaction.condition} • Purchased for {new Intl.NumberFormat('vi-VN', { 
                style: 'currency', 
                currency: 'VND',
                maximumFractionDigits: 0
              }).format(transaction.purchasePrice)}
            </p>
          </div>

          <FormField
            control={form.control}
            name="resalePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resale Price (RMB)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormDescription>
                  Amount received in Chinese Yuan
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="exchangeRateResale"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Exchange Rate (VND per 1 RMB)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormDescription>
                  Current exchange rate
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="resaleFee"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormDescription>
                    Platform fee or other costs
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="resaleFeeCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee Currency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="VND">VND</SelectItem>
                      <SelectItem value="RMB">RMB</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Currency of the fee amount
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="resaleDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Resale Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => 
                        date > new Date() || date < new Date(transaction.purchaseDate.getTime() + 7 * 24 * 60 * 60 * 1000)
                      }
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  Must be at least 7 days after purchase date
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onComplete}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            Record Resale
          </Button>
        </div>
      </form>
    </Form>
  );
};

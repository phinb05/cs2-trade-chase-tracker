
import { useState } from "react";
import { useTrade } from "@/context/TradeContext";
import { ItemCondition } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

const formSchema = z.object({
  itemName: z.string().min(2, "Item name must be at least 2 characters"),
  condition: z.enum(['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'] as const),
  purchasePrice: z.coerce.number().positive("Price must be positive"),
  purchaseFee: z.coerce.number().min(0, "Fee cannot be negative"),
  purchaseFeeCurrency: z.enum(['VND', 'RMB'] as const),
  exchangeRatePurchase: z.coerce.number().positive("Exchange rate must be positive"),
  purchaseDate: z.date()
});

const TransactionForm = () => {
  const { addTransaction } = useTrade();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemName: "",
      condition: "Factory New",
      purchasePrice: 0,
      purchaseFee: 0,
      purchaseFeeCurrency: "VND",
      exchangeRatePurchase: 3500,
      purchaseDate: new Date(),
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      addTransaction({
        itemName: values.itemName,
        condition: values.condition as ItemCondition,
        purchasePrice: values.purchasePrice,
        purchaseFee: values.purchaseFee,
        purchaseFeeCurrency: values.purchaseFeeCurrency,
        exchangeRatePurchase: values.exchangeRatePurchase,
        purchaseDate: values.purchaseDate,
      });

      toast({
        title: "Transaction added",
        description: `${values.itemName} (${values.condition}) has been added to your inventory.`,
        action: <CheckCircle className="text-green-500" />,
      });

      // Reset form
      form.reset({
        itemName: "",
        condition: "Factory New",
        purchasePrice: 0,
        purchaseFee: 0,
        purchaseFeeCurrency: "VND",
        exchangeRatePurchase: values.exchangeRatePurchase, // Keep the last exchange rate
        purchaseDate: new Date(),
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add New Transaction</CardTitle>
        <CardDescription>Record a new CS2 item purchase</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="itemName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Item Name</FormLabel>
                    <FormControl>
                      <Input placeholder="AK-47 | Redline" {...field} />
                    </FormControl>
                    <FormDescription>
                      Enter the full name of the CS2 item
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Factory New">Factory New</SelectItem>
                        <SelectItem value="Minimal Wear">Minimal Wear</SelectItem>
                        <SelectItem value="Field-Tested">Field-Tested</SelectItem>
                        <SelectItem value="Well-Worn">Well-Worn</SelectItem>
                        <SelectItem value="Battle-Scarred">
                          Battle-Scarred
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the wear condition of the item
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchasePrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Price (VND)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1000" {...field} />
                    </FormControl>
                    <FormDescription>
                      Amount paid in Vietnamese Dong
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exchangeRatePurchase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exchange Rate (VND per 1 RMB)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Current exchange rate (e.g., 3500 for 1 RMB = 3500 VND)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchaseFee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fee</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormDescription>
                      Any additional fees for the purchase
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchaseFeeCurrency"
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

              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Purchase Date</FormLabel>
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
                          disabled={(date) => date > new Date()}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When the purchase was made
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              Add Transaction
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default TransactionForm;

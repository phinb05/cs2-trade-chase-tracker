import { useState } from "react";
import { useTrade } from "@/context/TradeContext";
import { formatCurrency } from "@/utils/transactionUtils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRightLeft, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const exchangeFormSchema = z.object({
  amount: z.coerce.number().positive("Amount must be positive"),
  exchangeRate: z.coerce.number().positive("Exchange rate must be positive"),
  fromAccount: z.enum(["rmbYoupinPlatform", "rmbCash"]),
});

const CurrencyExchangeForm = () => {
  const { balances, transferRMBToVND } = useTrade();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof exchangeFormSchema>>({
    resolver: zodResolver(exchangeFormSchema),
    defaultValues: {
      amount: 0,
      exchangeRate: 3500,
      fromAccount: "rmbYoupinPlatform",
    },
  });

  // Calculate the preview VND amount
  const amount = form.watch("amount");
  const exchangeRate = form.watch("exchangeRate");
  const fromAccount = form.watch("fromAccount");
  const previewVndAmount = amount * exchangeRate;

  // Check if the amount exceeds the available balance
  const maxAmount = fromAccount === "rmbYoupinPlatform" 
    ? balances.rmbYoupinPlatform 
    : balances.rmbCash;
  const isOverBudget = amount > maxAmount;

  const onSubmit = (values: z.infer<typeof exchangeFormSchema>) => {
    if (isOverBudget) {
      form.setError("amount", { 
        type: "manual", 
        message: `Insufficient funds. Maximum available: ${formatCurrency(maxAmount, 'RMB')}` 
      });
      return;
    }

    setIsSubmitting(true);

    try {
      transferRMBToVND(
        values.amount,
        values.fromAccount,
        values.exchangeRate
      );

      toast({
        title: "Currency exchanged",
        description: `${formatCurrency(values.amount, 'RMB')} has been converted to ${formatCurrency(values.amount * values.exchangeRate, 'VND')}`,
        action: <Check className="text-green-500" />,
      });

      // Reset form but keep the exchange rate
      form.reset({
        amount: 0,
        exchangeRate: values.exchangeRate,
        fromAccount: values.fromAccount,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to exchange currency. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Exchange RMB to VND</CardTitle>
            <CardDescription>
              Convert your RMB earnings to Vietnamese Dong
            </CardDescription>
          </div>
          <ArrowRightLeft className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fromAccount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Account</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select source account" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="rmbYoupinPlatform">
                        RMB on Youpin Platform ({formatCurrency(balances.rmbYoupinPlatform, 'RMB')})
                      </SelectItem>
                      <SelectItem value="rmbCash">
                        RMB Cash ({formatCurrency(balances.rmbCash, 'RMB')})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select where to withdraw RMB from
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount (RMB)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="0" 
                      step="0.01" 
                      {...field}
                      className={isOverBudget ? "border-cs2-red" : ""}
                    />
                  </FormControl>
                  <FormDescription>
                    {isOverBudget ? (
                      <span className="text-cs2-red">
                        Insufficient funds. Max: {formatCurrency(maxAmount, 'RMB')}
                      </span>
                    ) : (
                      `Available: ${formatCurrency(maxAmount, 'RMB')}`
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="exchangeRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exchange Rate (VND per 1 RMB)</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" step="1" {...field} />
                  </FormControl>
                  <FormDescription>
                    Current exchange rate
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-secondary/20 p-4 rounded-md mt-4">
              <div className="text-sm font-medium mb-1">Preview</div>
              <div className="flex items-center justify-between">
                <span className="text-blue-400">
                  {formatCurrency(amount, 'RMB')}
                </span>
                <ArrowRightLeft className="h-4 w-4 mx-2 text-muted-foreground" />
                <span className="text-green-400">
                  {formatCurrency(previewVndAmount, 'VND')}
                </span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || amount <= 0 || isOverBudget}
            >
              Exchange Currency
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default CurrencyExchangeForm;


import { useMemo } from "react";
import { useTrade } from "@/context/TradeContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format } from "date-fns";

const ExchangeRateChart = () => {
  const { exchangeRateHistory } = useTrade();
  
  // Process exchange rate data for the chart
  const chartData = useMemo(() => {
    // Sort by date
    const sortedData = [...exchangeRateHistory].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    return sortedData.map(point => ({
      date: format(new Date(point.date), "MMM dd"),
      fullDate: format(new Date(point.date), "PP"),
      rate: point.rate,
      source: point.source
    }));
  }, [exchangeRateHistory]);
  
  // Calculate the min and max for Y axis
  const yMin = useMemo(() => {
    if (chartData.length === 0) return 0;
    const min = Math.min(...chartData.map(d => d.rate));
    return Math.floor(min * 0.995); // 0.5% lower for better visualization
  }, [chartData]);
  
  const yMax = useMemo(() => {
    if (chartData.length === 0) return 4000;
    const max = Math.max(...chartData.map(d => d.rate));
    return Math.ceil(max * 1.005); // 0.5% higher for better visualization
  }, [chartData]);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Exchange Rate History (VND per 1 RMB)</CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-72 text-muted-foreground">
            No exchange rate data available
          </div>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fill: "#9CA3AF" }}
                  tickMargin={10}
                />
                <YAxis 
                  domain={[yMin, yMax]} 
                  tick={{ fill: "#9CA3AF" }}
                  tickMargin={10}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "0.375rem",
                    color: "#F9FAFB",
                  }}
                  formatter={(value: number) => [`${value.toLocaleString()} VND`, "Rate"]}
                  labelFormatter={(label) => {
                    const dataPoint = chartData.find(d => d.date === label);
                    return dataPoint ? dataPoint.fullDate : label;
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="rate"
                  stroke="#4ECDC4"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#4ECDC4" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExchangeRateChart;

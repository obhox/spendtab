"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CalendarIcon } from "lucide-react"
import { format, subMonths } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function ProfitabilityAnalytics() {
  const [period, setPeriod] = useState("6months")
  const [date, setDate] = useState<Date>(new Date())

  // Generate sample data for the past 6 months
  const generateMonthlyData = () => {
    const data = []
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i)
      const revenue = Math.floor(Math.random() * 20000) + 30000
      const expenses = Math.floor(Math.random() * 15000) + 20000
      const profit = revenue - expenses
      const profitMargin = (profit / revenue) * 100
      data.push({
        name: format(date, "MMM"),
        revenue: revenue,
        expenses: expenses,
        profit: profit,
        profitMargin: profitMargin.toFixed(2),
      })
    }
    return data
  }

  const data = generateMonthlyData()

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between">
        <div className="grid gap-2">
          <Label htmlFor="period">Analysis Period</Label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger id="period" className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="12months">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>End Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profitability Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#8884d8" />
              <Line yAxisId="left" type="monotone" dataKey="expenses" stroke="#82ca9d" />
              <Line yAxisId="left" type="monotone" dataKey="profit" stroke="#ffc658" />
              <Line yAxisId="right" type="monotone" dataKey="profitMargin" stroke="#ff7300" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}


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
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function ExpenseAnalytics() {
  const [period, setPeriod] = useState("6months")
  const [date, setDate] = useState<Date>(new Date())

  // Generate sample data for the past 6 months
  const generateMonthlyData = () => {
    const data = []
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i)
      data.push({
        name: format(date, "MMM"),
        salaries: Math.floor(Math.random() * 10000) + 15000,
        rent: Math.floor(Math.random() * 2000) + 3000,
        utilities: Math.floor(Math.random() * 1000) + 500,
        marketing: Math.floor(Math.random() * 3000) + 1000,
        other: Math.floor(Math.random() * 2000) + 1000,
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
          <CardTitle>Expense Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="salaries" stackId="a" fill="#8884d8" />
              <Bar dataKey="rent" stackId="a" fill="#82ca9d" />
              <Bar dataKey="utilities" stackId="a" fill="#ffc658" />
              <Bar dataKey="marketing" stackId="a" fill="#ff8042" />
              <Bar dataKey="other" stackId="a" fill="#0088fe" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}


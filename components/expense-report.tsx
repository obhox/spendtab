"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

export function ExpenseReport() {
  const [date, setDate] = useState<Date>(new Date())
  const [period, setPeriod] = useState("monthly")

  const data = [
    { name: "Salaries & Wages", value: 18500, color: "#3b82f6" },
    { name: "Rent", value: 3500, color: "#10b981" },
    { name: "Utilities", value: 1200, color: "#f59e0b" },
    { name: "Marketing", value: 2500, color: "#8b5cf6" },
    { name: "Software", value: 1800, color: "#ec4899" },
    { name: "Office Supplies", value: 750, color: "#6366f1" },
    { name: "Other", value: 1200, color: "#64748b" },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end justify-between">
        <div className="grid gap-2">
          <Label htmlFor="period">Report Period</Label>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger id="period" className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label>Date Range</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn("w-[240px] justify-start text-left font-normal", !date && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "MMMM yyyy") : <span>Select date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold">Expense Breakdown</h3>
              <p className="text-sm text-muted-foreground">{format(date, "MMMM yyyy")}</p>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold">Expense Details</h3>
              <p className="text-sm text-muted-foreground">{format(date, "MMMM yyyy")}</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">% of Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => {
                  const total = data.reduce((sum, item) => sum + item.value, 0)
                  const percentage = ((item.value / total) * 100).toFixed(1)

                  return (
                    <TableRow key={item.name}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right">${item.value.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{percentage}%</TableCell>
                    </TableRow>
                  )
                })}
                <TableRow className="font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell className="text-right">
                    ${data.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right">100%</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


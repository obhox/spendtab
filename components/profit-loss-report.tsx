"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useSelectedCurrency, formatCurrency as formatCurrencyUtil } from "@/components/currency-switcher"

export function ProfitLossReport() {
  const selectedCurrency = useSelectedCurrency()
  const [date, setDate] = useState<Date>(new Date())
  const [period, setPeriod] = useState("monthly")

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

      <Card>
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold">Profit & Loss Statement</h3>
            <p className="text-sm text-muted-foreground">{format(date, "MMMM yyyy")}</p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Revenue</TableCell>
                <TableCell className="text-right"></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Sales Revenue</TableCell>
                <TableCell className="text-right">{formatCurrencyUtil(42500, selectedCurrency.code, selectedCurrency.symbol)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Service Revenue</TableCell>
                <TableCell className="text-right">{formatCurrencyUtil(15750, selectedCurrency.code, selectedCurrency.symbol)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Other Revenue</TableCell>
                <TableCell className="text-right">{formatCurrencyUtil(1200, selectedCurrency.code, selectedCurrency.symbol)}</TableCell>
              </TableRow>
              <TableRow className="font-medium">
                <TableCell>Total Revenue</TableCell>
                <TableCell className="text-right">{formatCurrencyUtil(59450, selectedCurrency.code, selectedCurrency.symbol)}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell colSpan={2}>
                  <Separator className="my-2" />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Expenses</TableCell>
                <TableCell className="text-right"></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Salaries & Wages</TableCell>
                <TableCell className="text-right">{formatCurrencyUtil(18500, selectedCurrency.code, selectedCurrency.symbol)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Rent</TableCell>
                <TableCell className="text-right">{formatCurrencyUtil(3500, selectedCurrency.code, selectedCurrency.symbol)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Utilities</TableCell>
                <TableCell className="text-right">{formatCurrencyUtil(1200, selectedCurrency.code, selectedCurrency.symbol)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Marketing</TableCell>
                <TableCell className="text-right">{formatCurrencyUtil(2500, selectedCurrency.code, selectedCurrency.symbol)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Software & Subscriptions</TableCell>
                <TableCell className="text-right">{formatCurrencyUtil(1800, selectedCurrency.code, selectedCurrency.symbol)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Office Supplies</TableCell>
                <TableCell className="text-right">{formatCurrencyUtil(750, selectedCurrency.code, selectedCurrency.symbol)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Other Expenses</TableCell>
                <TableCell className="text-right">{formatCurrencyUtil(1200, selectedCurrency.code, selectedCurrency.symbol)}</TableCell>
              </TableRow>
              <TableRow className="font-medium">
                <TableCell>Total Expenses</TableCell>
                <TableCell className="text-right">{formatCurrencyUtil(29450, selectedCurrency.code, selectedCurrency.symbol)}</TableCell>
              </TableRow>

              <TableRow>
                <TableCell colSpan={2}>
                  <Separator className="my-2" />
                </TableCell>
              </TableRow>

              <TableRow className="font-bold">
                <TableCell>Net Profit</TableCell>
                <TableCell className="text-right">{formatCurrencyUtil(30000, selectedCurrency.code, selectedCurrency.symbol)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


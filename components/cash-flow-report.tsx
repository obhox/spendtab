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

export function CashFlowReport() {
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
            <h3 className="text-xl font-bold">Cash Flow Statement</h3>
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
                <TableCell className="font-medium">Operating Activities</TableCell>
                <TableCell className="text-right"></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Net Income</TableCell>
                <TableCell className="text-right">$30,000.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Accounts Receivable</TableCell>
                <TableCell className="text-right">-$5,000.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Accounts Payable</TableCell>
                <TableCell className="text-right">$2,500.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Inventory</TableCell>
                <TableCell className="text-right">-$1,500.00</TableCell>
              </TableRow>
              <TableRow className="font-medium">
                <TableCell>Net Cash from Operating Activities</TableCell>
                <TableCell className="text-right">$26,000.00</TableCell>
              </TableRow>

              <TableRow>
                <TableCell colSpan={2}>
                  <Separator className="my-2" />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Investing Activities</TableCell>
                <TableCell className="text-right"></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Purchase of Equipment</TableCell>
                <TableCell className="text-right">-$8,000.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Sale of Investments</TableCell>
                <TableCell className="text-right">$3,000.00</TableCell>
              </TableRow>
              <TableRow className="font-medium">
                <TableCell>Net Cash from Investing Activities</TableCell>
                <TableCell className="text-right">-$5,000.00</TableCell>
              </TableRow>

              <TableRow>
                <TableCell colSpan={2}>
                  <Separator className="my-2" />
                </TableCell>
              </TableRow>

              <TableRow>
                <TableCell className="font-medium">Financing Activities</TableCell>
                <TableCell className="text-right"></TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Loan Repayment</TableCell>
                <TableCell className="text-right">-$2,000.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-8">Dividends Paid</TableCell>
                <TableCell className="text-right">-$5,000.00</TableCell>
              </TableRow>
              <TableRow className="font-medium">
                <TableCell>Net Cash from Financing Activities</TableCell>
                <TableCell className="text-right">-$7,000.00</TableCell>
              </TableRow>

              <TableRow>
                <TableCell colSpan={2}>
                  <Separator className="my-2" />
                </TableCell>
              </TableRow>

              <TableRow className="font-bold">
                <TableCell>Net Increase in Cash</TableCell>
                <TableCell className="text-right">$14,000.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Beginning Cash Balance</TableCell>
                <TableCell className="text-right">$25,000.00</TableCell>
              </TableRow>
              <TableRow className="font-bold">
                <TableCell>Ending Cash Balance</TableCell>
                <TableCell className="text-right">$39,000.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


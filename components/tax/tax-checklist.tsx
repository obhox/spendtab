"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react"

export function TaxChecklist() {
  const [items, setItems] = useState([
    { id: "1", label: "Register for TIN (Tax Identification Number)", checked: false },
    { id: "2", label: "Register for VAT (if applicable)", checked: false },
    { id: "3", label: "Keep records of all business expenses", checked: false },
    { id: "4", label: "File VAT returns (monthly by 21st)", checked: false },
    { id: "5", label: "File CIT/PIT returns (annually)", checked: false },
    { id: "6", label: "Deduct Withholding Tax (WHT) from payments", checked: false },
    { id: "7", label: "Remit WHT to FIRS/SIRS", checked: false },
  ])

  const toggleItem = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ))
  }

  return (
    <Card style={{ backgroundColor: '#F0F9FF' }}>
      <CardHeader>
        <CardTitle>Compliance Checklist</CardTitle>
        <CardDescription>Keep track of your tax obligations.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex items-start space-x-2">
              <Checkbox 
                id={item.id} 
                checked={item.checked} 
                onCheckedChange={() => toggleItem(item.id)} 
              />
              <label
                htmlFor={item.id}
                className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                  item.checked ? "line-through text-muted-foreground" : ""
                }`}
              >
                {item.label}
              </label>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function IncomeExpenseChart() {
  const data = [
    {
      name: "Jan",
      income: 4000,
      expenses: 2400,
    },
    {
      name: "Feb",
      income: 3000,
      expenses: 1398,
    },
    {
      name: "Mar",
      income: 5000,
      expenses: 3800,
    },
    {
      name: "Apr",
      income: 8000,
      expenses: 3908,
    },
    {
      name: "May",
      income: 6000,
      expenses: 4800,
    },
    {
      name: "Jun",
      income: 7000,
      expenses: 3800,
    },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="income" fill="#3b82f6" name="Income" />
        <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
      </BarChart>
    </ResponsiveContainer>
  )
}


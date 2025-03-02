"use client"

import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export function CashFlowChart() {
  const data = [
    {
      name: "Jan",
      cashFlow: 1500,
    },
    {
      name: "Feb",
      cashFlow: 1800,
    },
    {
      name: "Mar",
      cashFlow: 1200,
    },
    {
      name: "Apr",
      cashFlow: 4000,
    },
    {
      name: "May",
      cashFlow: 1200,
    },
    {
      name: "Jun",
      cashFlow: 3200,
    },
  ]

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Area type="monotone" dataKey="cashFlow" fill="#10b981" stroke="#10b981" name="Cash Flow" />
      </AreaChart>
    </ResponsiveContainer>
  )
}


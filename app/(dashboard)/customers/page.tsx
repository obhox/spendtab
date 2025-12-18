"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ClientForm } from "@/components/clients/client-form"
import { ClientTable } from "@/components/clients/client-table"
import { useClientQuery } from "@/lib/hooks/useClientQuery"
import { Building2, Mail, Phone, MapPin } from "lucide-react"

export default function CustomersPage() {
  const { clients, isLoading } = useClientQuery();

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalClients = clients.length;
    const clientsWithEmail = clients.filter(c => c.email).length;
    const clientsWithPhone = clients.filter(c => c.phone).length;
    const clientsWithAddress = clients.filter(c => c.address && c.city).length;

    return {
      totalClients,
      clientsWithEmail,
      clientsWithPhone,
      clientsWithAddress
    };
  }, [clients]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
          <p className="text-muted-foreground">
            Manage your client contacts and information
          </p>
        </div>
        <ClientForm />
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Clients */}
        <Card style={{ backgroundColor: '#E6F1FD' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Clients
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalClients}
            </div>
            <p className="text-xs text-muted-foreground">
              Active customers
            </p>
          </CardContent>
        </Card>

        {/* Clients with Email */}
        <Card style={{ backgroundColor: '#EDEEFC' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              With Email
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.clientsWithEmail}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalClients > 0
                ? `${Math.round((metrics.clientsWithEmail / metrics.totalClients) * 100)}% of clients`
                : 'No clients yet'}
            </p>
          </CardContent>
        </Card>

        {/* Clients with Phone */}
        <Card style={{ backgroundColor: '#E6F1FD' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              With Phone
            </CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.clientsWithPhone}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalClients > 0
                ? `${Math.round((metrics.clientsWithPhone / metrics.totalClients) * 100)}% of clients`
                : 'No clients yet'}
            </p>
          </CardContent>
        </Card>

        {/* Clients with Address */}
        <Card style={{ backgroundColor: '#EDEEFC' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              With Address
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.clientsWithAddress}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalClients > 0
                ? `${Math.round((metrics.clientsWithAddress / metrics.totalClients) * 100)}% of clients`
                : 'No clients yet'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Client Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientTable />
        </CardContent>
      </Card>
    </div>
  );
}

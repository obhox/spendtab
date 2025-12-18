"use client"

import React, { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useClientQuery } from "@/lib/hooks/useClientQuery"
import { ClientForm } from "./client-form"
import { Plus, Building2 } from "lucide-react"

interface ClientSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
}

export function ClientSelector({ value, onValueChange, placeholder = "Select a client" }: ClientSelectorProps) {
  const { clients, isLoading } = useClientQuery();
  const [showClientForm, setShowClientForm] = useState(false);

  const handleClientAdded = () => {
    setShowClientForm(false);
    // The newly added client will appear in the list automatically via React Query
  };

  if (isLoading) {
    return (
      <Select disabled>
        <SelectTrigger>
          <SelectValue placeholder="Loading clients..." />
        </SelectTrigger>
      </Select>
    );
  }

  return (
    <div className="flex gap-2">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder={placeholder}>
            {value && clients.find(c => c.id === value) ? (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{clients.find(c => c.id === value)?.name}</span>
              </div>
            ) : (
              placeholder
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {clients.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No clients yet. Add your first client!
            </div>
          ) : (
            clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{client.name}</span>
                  {client.email && (
                    <span className="text-xs text-muted-foreground">{client.email}</span>
                  )}
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      <ClientForm
        onSuccess={handleClientAdded}
        trigger={
          <Button type="button" variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        }
      />
    </div>
  );
}

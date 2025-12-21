import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { useAccounts } from '../context/AccountContext';
import { toast } from 'sonner';

export interface InvoiceItem {
  id?: string;
  invoice_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount?: number;
  category?: string | null;
  line_order: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  client_id: string | null;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  invoice_date: string;
  due_date: string;
  paid_date?: string | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  notes?: string | null;
  terms?: string | null;
  transaction_id?: string | null;
  account_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  // Joined data
  client?: {
    id: string;
    name: string;
    email?: string | null;
  };
  items?: InvoiceItem[];
}

const CACHE_TIME = 30 * 60 * 1000; // 30 minutes
const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useInvoiceQuery() {
  const { currentAccount } = useAccounts();
  const queryClient = useQueryClient();

  const fetchInvoices = async () => {
    if (!currentAccount) return [];

    const { data, error } = await supabase
      .from('invoices')
      .select(`
        *,
        client:clients(id, name, email),
        items:invoice_items(*)
      `)
      .eq('account_id', currentAccount.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Failed to load invoices');
      throw error;
    }

    return data || [];
  };

  const query = useQuery<Invoice[], Error>({
    queryKey: ['invoices', currentAccount?.id, 'with-items'],
    queryFn: fetchInvoices,
    enabled: !!currentAccount,
    gcTime: CACHE_TIME,
    staleTime: STALE_TIME
  });

  const addInvoice = useMutation({
    mutationFn: async (newInvoice: Partial<Invoice> & { items: InvoiceItem[] }) => {
      if (!currentAccount) {
        throw new Error('No account selected');
      }

      const { items, client, ...invoiceData } = newInvoice;
      void client;

      // Get prefix from settings
      const { data: settings } = await supabase
        .from('invoice_settings')
        .select('invoice_prefix')
        .eq('account_id', currentAccount.id)
        .single();
      
      const prefix = settings?.invoice_prefix || 'INV';

      // Update invoice_sequences table with the current prefix so the DB function uses it
      // We do this best-effort, if it fails (e.g. row doesn't exist yet), the function will create it with default
      await supabase
        .from('invoice_sequences')
        .update({ prefix: prefix })
        .eq('account_id', currentAccount.id);

      // Get next invoice number
      const { data: rawInvoiceNumber, error: numberError } = await supabase
        .rpc('get_next_invoice_number', { p_account_id: currentAccount.id });

      if (numberError) {
        console.error('Error generating invoice number:', numberError);
        throw numberError;
      }

      // Ensure the invoice number uses the correct prefix
      // The DB function returns PREFIX-YEAR-NUMBER, but might use an old prefix if our update above failed or raced
      // So we parse and reconstruct it to be safe
      let invoiceNumber = rawInvoiceNumber;
      if (rawInvoiceNumber && typeof rawInvoiceNumber === 'string') {
        const parts = rawInvoiceNumber.split('-');
        if (parts.length >= 3) {
          const numberPart = parts.pop();
          const yearPart = parts.pop();
          // Reconstruct with correct prefix
          invoiceNumber = `${prefix}-${yearPart}-${numberPart}`;
        }
      }

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Insert invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          ...invoiceData,
          invoice_number: invoiceNumber,
          account_id: currentAccount.id,
          user_id: user.id,
        })
        .select()
        .single();

      if (invoiceError) {
        console.error('Error creating invoice:', invoiceError);
        throw invoiceError;
      }

      if (!invoice) {
        throw new Error('Failed to create invoice');
      }

      // Insert items
      if (items.length > 0) {
        const itemsToInsert = items.map((item, index) => ({
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          amount: item.quantity * item.unit_price,
          category: item.category,
          line_order: index,
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsToInsert);

        if (itemsError) {
          console.error('Error creating invoice items:', itemsError);
          throw itemsError;
        }
      }

      return invoice;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['invoices', currentAccount?.id] });
      toast.success('Invoice created successfully');
    },
    onError: (error: Error) => {
      console.error('Error adding invoice:', error);
      toast.error('Failed to create invoice: ' + error.message);
    }
  });

  const updateInvoice = useMutation({
    mutationFn: async ({
      id,
      data,
      items
    }: {
      id: string;
      data: Partial<Invoice>;
      items?: InvoiceItem[]
    }) => {
      // Clean up data for update
      const { client, items: _items, ...updateData } = data;
      void client;
      void _items;

      // Update invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', id);

      if (invoiceError) {
        console.error('Error updating invoice:', invoiceError);
        throw invoiceError;
      }

      // Update items if provided
      if (items) {
        // Delete existing items
        await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', id);

        // Insert new items
        if (items.length > 0) {
          const itemsToInsert = items.map((item, index) => ({
            invoice_id: id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            amount: item.quantity * item.unit_price,
            category: item.category,
            line_order: index,
          }));

          const { error: itemsError } = await supabase
            .from('invoice_items')
            .insert(itemsToInsert);

          if (itemsError) {
            console.error('Error updating invoice items:', itemsError);
            throw itemsError;
          }
        }
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['invoices', currentAccount?.id] });
      toast.success('Invoice updated successfully');
    },
    onError: (error: Error) => {
      console.error('Error updating invoice:', error);
      toast.error('Failed to update invoice: ' + error.message);
    }
  });

  const deleteInvoice = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting invoice:', error);
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['invoices', currentAccount?.id] });
      toast.success('Invoice deleted successfully');
    },
    onError: (error: Error) => {
      console.error('Error deleting invoice:', error);
      toast.error('Failed to delete invoice: ' + error.message);
    }
  });

  const markAsPaid = useMutation({
    mutationFn: async ({
      invoiceId,
      paidDate,
      paymentSource
    }: {
      invoiceId: string;
      paidDate: string;
      paymentSource: string;
    }) => {
      // Get invoice details
      const { data: invoice, error: fetchError } = await supabase
        .from('invoices')
        .select('*, client:clients(name), items:invoice_items(*)')
        .eq('id', invoiceId)
        .single();

      if (fetchError) {
        console.error('Error fetching invoice for payment:', fetchError);
        throw fetchError;
      }

      if (!invoice) {
        throw new Error('Invoice not found');
      }

      // Create income transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          date: paidDate,
          description: `Invoice ${invoice.invoice_number} - ${invoice.client?.name || 'Client'}`,
          category: 'Invoice Payment',
          amount: invoice.total_amount,
          type: 'income',
          user_id: invoice.user_id,
          account_id: invoice.account_id,
          payment_source: paymentSource,
          notes: `Payment for invoice ${invoice.invoice_number} via ${paymentSource}. Subtotal: ${invoice.subtotal}, Tax: ${invoice.tax_amount}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (transactionError) {
        console.error('Error creating transaction:', transactionError);
        throw transactionError;
      }

      // Update invoice status
      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          status: 'paid',
          paid_date: paidDate,
          transaction_id: transaction.id
        })
        .eq('id', invoiceId);

      if (updateError) {
        console.error('Error updating invoice status:', updateError);
        throw updateError;
      }

      return { invoice, transaction };
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['invoices', currentAccount?.id] });
      await queryClient.invalidateQueries({ queryKey: ['transactions', currentAccount?.id] });
      toast.success('Invoice marked as paid and transaction created');
    },
    onError: (error: Error) => {
      console.error('Error marking invoice as paid:', error);
      toast.error('Failed to mark invoice as paid: ' + error.message);
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({
      invoiceId,
      status
    }: {
      invoiceId: string;
      status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
    }) => {
      const { error } = await supabase
        .from('invoices')
        .update({ status })
        .eq('id', invoiceId);

      if (error) {
        console.error('Error updating invoice status:', error);
        throw error;
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['invoices', currentAccount?.id] });
      toast.success('Invoice status updated successfully');
    },
    onError: (error: Error) => {
      console.error('Error updating status:', error);
      toast.error('Failed to update status: ' + error.message);
    }
  });

  return {
    invoices: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    addInvoice: addInvoice.mutate,
    addInvoiceAsync: addInvoice.mutateAsync,
    updateInvoice: updateInvoice.mutate,
    deleteInvoice: deleteInvoice.mutate,
    markAsPaid: markAsPaid.mutate,
    updateStatus: updateStatus.mutate,
    updateStatusAsync: updateStatus.mutateAsync,
    refetch: query.refetch
  };
}

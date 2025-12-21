import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { toast } from 'sonner';
import { useAccounts } from '../context/AccountContext';

export interface InvoiceSettings {
  id: string;
  user_id: string;
  business_name?: string | null;
  business_email?: string | null;
  business_phone?: string | null;
  business_address?: string | null;
  business_city?: string | null;
  business_state?: string | null;
  business_postal_code?: string | null;
  business_country: string;
  business_tax_id?: string | null;
  business_website?: string | null;
  logo_url?: string | null;
  default_payment_terms: string;
  default_notes?: string | null;
  invoice_prefix: string;
  bank_name?: string | null;
  account_name?: string | null;
  account_number?: string | null;
  created_at: string;
  updated_at: string;
}

const CACHE_TIME = 30 * 60 * 1000; // 30 minutes
const STALE_TIME = 5 * 60 * 1000; // 5 minutes

export function useInvoiceSettings() {
  const queryClient = useQueryClient();
  const { currentAccount } = useAccounts();

  const fetchSettings = async () => {
    if (!currentAccount) return null;

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('invoice_settings')
      .select('*')
      .eq('account_id', currentAccount.id)
      .single();

    if (error) {
      // If no settings exist yet, return null (not an error)
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching invoice settings:', error);
      throw error;
    }

    return data;
  };

  const query = useQuery<InvoiceSettings | null, Error>({
    queryKey: ['invoice_settings', currentAccount?.id],
    queryFn: fetchSettings,
    enabled: !!currentAccount,
    gcTime: CACHE_TIME,
    staleTime: STALE_TIME
  });

  const saveSettings = useMutation({
    mutationFn: async (settings: Partial<InvoiceSettings>) => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      if (!currentAccount) {
        throw new Error('No account selected');
      }

      // Check if settings exist for this account
      const { data: existing } = await supabase
        .from('invoice_settings')
        .select('id')
        .eq('account_id', currentAccount.id)
        .single();

      if (existing) {
        // Update existing settings
        const { data, error } = await supabase
          .from('invoice_settings')
          .update(settings)
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert new settings
        const { data, error } = await supabase
          .from('invoice_settings')
          .insert({
            ...settings,
            user_id: user.id,
            account_id: currentAccount.id
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoice_settings', currentAccount?.id] });
      toast.success('Invoice settings saved successfully');
    },
    onError: (error: Error) => {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings: ' + error.message);
    }
  });

  const uploadLogo = async (file: File): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Create unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/logo.${fileExt}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('invoice-logos')
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      throw uploadError;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('invoice-logos')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  return {
    settings: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    saveSettings: saveSettings.mutate,
    saveSettingsAsync: saveSettings.mutateAsync,
    uploadLogo,
    refetch: query.refetch
  };
}

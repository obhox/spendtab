import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../supabase';
import { toast } from 'sonner';

export type BusinessType = 'individual' | 'small_company' | 'company';

export interface TaxSettings {
  user_id: string;
  business_type: BusinessType;
  is_professional_service: boolean;
  tax_id?: string;
  vat_registered: boolean;
  filing_status: string;
  last_filing_date?: string;
  tax_year: number;
  created_at: string;
  updated_at: string;
}

const TAX_SETTINGS_QUERY_KEY = ['taxSettings'];

export function useTaxQuery() {
  const queryClient = useQueryClient();

  const fetchTaxSettings = async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;
    if (!session) return null;

    const { data, error } = await supabase
      .from('tax_settings')
      .select('*')
      .eq('user_id', session.user.id)
      .maybeSingle(); // Use maybeSingle to return null if not found instead of error

    if (error) {
      console.error('Error fetching tax settings:', error);
      // If table doesn't exist yet, return default
      return null;
    }
    return data as TaxSettings | null;
  };

  const query = useQuery({
    queryKey: TAX_SETTINGS_QUERY_KEY,
    queryFn: fetchTaxSettings,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settings: Partial<TaxSettings>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if record exists
      const existing = query.data;

      let result;
      if (existing) {
        result = await supabase
          .from('tax_settings')
          .update({ ...settings, updated_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from('tax_settings')
          .insert({
            user_id: user.id,
            business_type: 'individual', // Default
            ...settings,
            updated_at: new Date().toISOString()
          })
          .select()
          .single();
      }

      if (result.error) throw result.error;
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAX_SETTINGS_QUERY_KEY });
      toast.success('Tax settings updated');
    },
    onError: (error) => {
      toast.error(`Failed to update settings: ${error.message}`);
    }
  });

  return {
    taxSettings: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateSettings: updateSettingsMutation.mutate,
    isUpdating: updateSettingsMutation.isPending
  };
}

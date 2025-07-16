import { supabase } from '@/integrations/supabase/client';

export const checkAndFixApiCredentialsTable = async () => {
  try {
    // Try to query the table structure
    const { data, error } = await supabase
      .from('api_credentials')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error checking api_credentials table:', error);
      return false;
    }

    console.log('api_credentials table is accessible');
    
    // Check if api_key_encrypted column exists by trying to select it
    const { data: columnTest, error: columnError } = await supabase
      .from('api_credentials')
      .select('api_key_encrypted')
      .limit(1);
    
    if (columnError && columnError.message.includes('column') && columnError.message.includes('does not exist')) {
      console.warn('api_key_encrypted column does not exist in the database');
      return { tableExists: true, hasEncryptedColumn: false };
    }
    
    console.log('api_key_encrypted column exists');
    return { tableExists: true, hasEncryptedColumn: true };
  } catch (error) {
    console.error('Failed to check api_credentials table:', error);
    return false;
  }
};

export const testApiCredentialsSave = async (userId: string) => {
  try {
    const testData = {
      user_id: userId,
      service_name: 'test_service',
      additional_config: {
        test: 'data'
      },
      is_active: true
    };

    const { data, error } = await supabase
      .from('api_credentials')
      .insert(testData)
      .select();

    if (error) {
      console.error('Test insert failed:', error);
      return { success: false, error };
    }

    // Clean up test data
    await supabase
      .from('api_credentials')
      .delete()
      .eq('service_name', 'test_service')
      .eq('user_id', userId);

    console.log('Test insert successful');
    return { success: true, data };
  } catch (error) {
    console.error('Test insert exception:', error);
    return { success: false, error };
  }
};
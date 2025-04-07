import { SupabaseClient } from '@supabase/supabase-js'

// Function to check if user's phone is verified
export async function isPhoneVerified(supabase: SupabaseClient): Promise<boolean> {
  try {
    // Get the user data
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return false;
    }
    
    return !!user.user_metadata.phone_verified
  } catch (error) {
    console.error('Error checking phone verification:', error)
    return false
  }
}

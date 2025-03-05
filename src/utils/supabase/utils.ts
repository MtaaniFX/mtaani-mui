import { SupabaseClient } from "@supabase/supabase-js";

export async function getUserData(supabase: SupabaseClient<any, "public", any>) {
    const { error, data } = await supabase.auth.getUser();
    if (error) {
        console.error(error);
        return null;
    }

    const userId = data.user.id;
    if (!userId) {
        console.error("User ID is undefined");
        return null;
    }

    return { UserId: userId, UserData: data.user };
}
import { createClient } from "@/utils/supabase/client";

// You might want a specific function for uploads for better organization
export const uploadGroupFile = async (file: File, bucket: string = 'group_member_ids'): Promise<string> => {
    const supabase = createClient();
    
    try {
        const fileExt = file.name.split('.').pop();
        // Create a unique file path, e.g., using timestamp or UUID
        // Consider adding user ID if relevant: `user_uploads/${userId}/${Date.now()}.${fileExt}`
        const filePath = `public/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

        console.log(`Uploading to bucket: ${bucket}, path: ${filePath}`);

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: '3600', // Optional: Cache control
                upsert: false, // Optional: Don't overwrite existing files (use true if needed)
            });

        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            throw new Error(`Upload failed: ${uploadError.message}`);
        }

        if (!uploadData?.path) {
             throw new Error('Upload succeeded but no path returned.');
        }

        console.log('Upload successful, getting public URL for path:', uploadData.path);

        // Get the public URL for the uploaded file
        const { data: urlData } = supabase.storage
            .from(bucket)
            .getPublicUrl(uploadData.path);

        if (!urlData?.publicUrl) {
            // This might happen if the file/path is wrong, but upload succeeded somehow
             console.warn('Could not get public URL, but upload seemed successful. Path:', uploadData.path);
             // Depending on bucket settings, the path itself might be part of the URL
             // Construct manually if necessary, but getPublicUrl is preferred.
             // Example fallback (adjust based on your Supabase URL structure):
             // return `${supabaseUrl}/storage/v1/object/public/${bucket}/${uploadData.path}`;
             throw new Error('Could not retrieve public URL for uploaded file.');
        }

        console.log('Public URL:', urlData.publicUrl);
        return urlData.publicUrl;

    } catch (error) {
        console.error('Error in uploadGroupFile:', error);
        // Re-throw the error so the calling component knows it failed
        if (error instanceof Error) {
            throw error;
        } else {
            throw new Error('An unknown error occurred during file upload.');
        }
    }
};

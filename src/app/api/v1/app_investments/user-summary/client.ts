// Define expected data structure for the summary
export interface UserInvestmentSummary {
    totalPaidInvestment: number; // or string if dealing with very large numerics
    totalAccruedReturns: number; // or string
    returnsPercentage: number;
}

// Define a common error structure
export interface ApiError {
    code: string;
    message: string;
}

// Define the result structure for SDK functions
export interface SdkResult<T> {
    data: T | null;
    error: ApiError | null;
}

/**
 * Fetches the current authenticated user's investment summary.
 * Requires the user to be logged in.
 *
 * @returns {Promise<SdkResult<UserInvestmentSummary>>} An object containing either the data or an error.
 */
export async function getUserInvestmentSummary(): Promise<SdkResult<UserInvestmentSummary>> {
    const apiUrl = '/api/v1/app_investments/user-summary'; // Relative path to the API route

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const responseBody = await response.json();

        if (!response.ok) {
            // Use error details from API response if available, otherwise create generic error
            const error: ApiError = responseBody && responseBody.code && responseBody.message
                ? { code: responseBody.code, message: responseBody.message }
                : { code: `HTTP_${response.status}`, message: `Request failed with status ${response.status}` };
             console.error(`API Error (${apiUrl}):`, error);
            return { data: null, error: error };
        }

        // Assuming the API returns the data directly on success
        return { data: responseBody as UserInvestmentSummary, error: null };

    } catch (e: any) {
        console.error(`Network or parsing error calling ${apiUrl}:`, e);
        // Handle network errors or issues parsing JSON
        const error: ApiError = {
            code: 'NETWORK_ERROR',
            message: `Failed to fetch investment summary: ${e.message || 'Network error'}`,
        };
        return { data: null, error: error };
    }
}

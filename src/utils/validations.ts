/**
 * Validates and formats a Kenyan phone number into international format.
 * 
 * The function checks whether the input phone number is 10 digits long and starts
 * with either '07' or '01'. It then returns the number in the international format
 * (e.g., '+254799999999'). Any whitespaces in the input are stripped before validation.
 * 
 * @param input - The phone number as a string. It can include spaces, which will be stripped.
 * 
 * @returns An object containing:
 *   - `phoneNumber`: The formatted phone number in international format (`+254...`), or `null` if invalid.
 *   - `error`: A short error message if the phone number is invalid, or `null` if valid.
 * 
 * @example
 * validatePhoneNumber("0799999999");
 * // Returns: { phoneNumber: "+254799999999", error: null }
 * 
 * validatePhoneNumber(" 01 799999999 ");
 * // Returns: { phoneNumber: "+254179999999", error: null }
 * 
 * validatePhoneNumber("12345");
 * // Returns: { phoneNumber: null, error: "Invalid phone number. The number must be 10 digits long and start with '07' or '01'." }
 */
export function validatePhoneNumber(input: string)
    : { phoneNumber: string | null, error: string | null } {
    // Clean the input by removing all whitespaces
    const cleanedInput = input.replace(/\s+/g, '');

    // Check if the cleaned input is exactly 10 digits and starts with '07' or '01'
    const validPhoneRegex = /^(07|01)\d{8}$/;

    if (!validPhoneRegex.test(cleanedInput)) {
        return {
            phoneNumber: null,
            error: "Phone number must be 10 digits long and start with '07' or '01'."
        };
    }

    // Format the number in international format, replacing the starting '0' with '+254'
    const internationalFormat = `+254${cleanedInput.substring(1)}`;

    return {
        phoneNumber: internationalFormat,
        error: null
    };
}

// Test cases
// console.log(validatePhoneNumber("0799999999")); // { phoneNumber: "+254799999999", error: null }
// console.log(validatePhoneNumber(" 01 799999999 ")); // { phoneNumber: "+254179999999", error: null }
// console.log(validatePhoneNumber(" 123456789 ")); // { phoneNumber: null, error: "Invalid phone number. The number must be 10 digits long and start with '07' or '01'." }

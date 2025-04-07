/**
 * Attempts to parse a number value from the given string, assumed to be in base 10. 
 * @param parse A string that contains a number.
 * @param defaultNumber Default value to return if the argument, parse, is not a valid number
 * @returns the parsed number if successful, else the given default number
 */ 
export function numberOrDefault(parse: string, defaultNumber: number): number {
    try {
        defaultNumber = Number.parseFloat(parse);
    } catch (e) {
        console.error(e);
    }

    return defaultNumber;
}

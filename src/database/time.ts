
// Example usage:
//   const timestampFromDb = "2025-03-21T12:34:56Z"; // Replace with your actual timestamp
//   const formattedTime = formatTimestampToLocalTime(timestampFromDb);
//   console.log(formattedTime); 
// // Outputs: "Friday, March 21, 2025, 12:34:56 PM" (formatted based on local time)
export function formatTimestampToLocalTime(timestamp: string) {
    // Parse the timestamp string (ISO 8601 format) into a Date object
    const date = new Date(timestamp);
  
    // You can format it using the browser's built-in `toLocaleString()` method.
    // This will format it according to the user's local timezone.
    const formattedDate = date.toLocaleString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // For 24-hour format
    });
  
    return formattedDate;
  }
  
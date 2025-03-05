import { ReactNode, useState } from "react";
import {
    Grid2 as Grid,
    TextField,
    Typography,
} from '@mui/material';
import * as React from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

export type PropsAppInvestmentDurationPicker = {
    children?: ReactNode,
    durationInMonths?: string,
    setDurationInMonths: (months: string) => void,
}

export default function AppInvestmentDurationPicker(
    {
        children,
        setDurationInMonths,
    }: PropsAppInvestmentDurationPicker) {
    // Whether to allow the user to specify the duration in years
    const [yearly, setYearly] = useState(false);
    const [months, setMonths] = useState('');
    const [years, setYears] = useState('');
    const [error, setError] = useState('');

    function onDurationChange(_type: 'months' | 'years', newDuration: string) {
        let duration: { totalMonths: number, errorMessage: string };
        if (_type === 'months') {
            duration = addDurations(newDuration, years);
            setMonths(newDuration);
        } else if (_type === 'years') {
            duration = addDurations(months, newDuration);
            setYears(newDuration);
        } else {
            throw Error("Invalid Duration Type");
        }

        setError(duration.errorMessage);
        if (duration.errorMessage) {
            setDurationInMonths('');
        } else {
            setDurationInMonths(duration.totalMonths.toString(10));
        }
    }

    function onYearsChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        onDurationChange('years', e.target.value);
    }

    function onMonthsChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        onDurationChange('months', e.target.value);
    }

    return (
        <>
            <Typography variant="body1" sx={{ mt: 2 }}>
                Specify the duration for your locked investment:
            </Typography>

            <FormGroup>
                <FormControlLabel
                    control={
                        <Switch
                            checked={yearly}
                            onChange={
                                (_, checked) => {
                                    setYearly(checked);
                                    if (!checked) {
                                        setYears('');
                                        setMonths('');
                                    }
                                }
                            } />
                    }
                    label="Yearly" />
            </FormGroup>

            <Grid container columnSpacing={2}>
                {/* Year Input */}
                {yearly && (
                    <Grid spacing={{ xs: 2, md: 3 }}>
                        <TextField
                            label="Years"
                            type="number"
                            value={years}
                            onChange={onYearsChange}
                            variant="outlined"
                            margin="normal"
                            error={!!error}
                            helperText={error || 'Duration in years'}
                        />
                    </Grid>
                )}

                {/* Month Input */}
                <Grid spacing={{ xs: 2, md: 3 }}>
                    <TextField
                        label="Months"
                        type="number"
                        value={months}
                        onChange={onMonthsChange}
                        variant="outlined"
                        margin="normal"
                        error={!!error}
                        helperText={error || 'Duration in months'}
                    />
                </Grid>
            </Grid>
            {children}
        </>
    )
}

/**
 * Adds two durations: one in months and one in years. The function converts years into months,
 * calculates the total duration in months, and checks if the total duration exceeds 3 years (36 months).
 * If any input is invalid or the total duration exceeds the limit, the function will return an error message.
 * 
 * @param durationInMonths - A string representing the duration in months (must be a valid number).
 * @param durationInYears - A string representing the duration in years (must be a valid number).
 * 
 * @returns An object containing:
 *   - `totalMonths`: The total duration in months, or `null` if an error occurred.
 *   - `errorMessage`: An error message indicating what went wrong (empty string if there is no error).
 * 
 * The function will return an error if:
 *   - Any of the input values cannot be parsed into a valid number.
 *   - The total duration exceeds 36 months (3 years).
 * 
 * Example:
 * 
 * ```typescript
 * const result = addDurations("12", "2");
 * console.log(result); 
 * // Output: { totalMonths: 36, errorMessage: '' }
 * 
 * const errorResult = addDurations("abc", "2");
 * console.log(errorResult); 
 * // Output: { totalMonths: null, errorMessage: 'Invalid duration input' }
 * ```
 */
function addDurations(durationInMonths: string, durationInYears: string): { totalMonths: number, errorMessage: string } {
    if (!durationInMonths) {
        durationInMonths = '0';
    }

    if (!durationInYears) {
        durationInYears = '0';
    }

    // Convert strings to numbers and handle invalid inputs
    const months = Number.parseInt(durationInMonths, 10);
    const years = Number.parseInt(durationInYears, 10);

    // Check if the inputs are valid numbers
    if (isNaN(months) || isNaN(years)) {
        return {
            totalMonths: 0,
            errorMessage: 'Invalid duration input'
        };
    }

    // Convert years to months
    const yearsInMonths = years * 12;

    // Calculate the total duration in months
    const totalDurationInMonths = months + yearsInMonths;

    // Check if the total duration exceeds 3 years (36 months)
    if (totalDurationInMonths > 36) {
        return {
            totalMonths: 0,
            errorMessage: 'Duration exceeds 3 years'
        };
    } else if (totalDurationInMonths < 1) {
        return {
            totalMonths: 0,
            errorMessage: 'Duration less than a month'
        };
    }

    return {
        totalMonths: totalDurationInMonths,
        errorMessage: ''
    };
}

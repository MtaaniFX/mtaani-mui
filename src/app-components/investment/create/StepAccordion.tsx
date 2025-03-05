import React, { useState, ReactElement, ReactNode } from 'react';
import { Accordion, AccordionSummary, AccordionDetails, Box, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Define the types for DivA, DivB, and DivC components
const DivA = 'AccordionActiveStep';
const DivB = 'AccordionSteps';
const DivC = 'AccordionContent';

export function AccordionActiveStep({children}:{children?: ReactNode}) {
    return (
        <>
        {children}
        </>
    )
}


export function AccordionSteps({children}:{children?: ReactNode}) {
    return (
        <>
        {children}
        </>
    )
}


export function AccordionContent({children}:{children?: ReactNode}) {
    return (
        <>
        {children}
        </>
    )
}

interface CustomAccordionProps {
    children: React.ReactNode;
}

const StepAccordion: React.FC<CustomAccordionProps> = ({ children }) => {
    const [expanded, setExpanded] = useState<boolean>(false);

    const handleAccordionChange = (event: React.SyntheticEvent, isExpanded: boolean) => {
        setExpanded(isExpanded);
    };

    // Extract children components and assign them based on type
    const childrenArray = React.Children.toArray(children);
    let [ divA, divB, divC] = [childrenArray[0], childrenArray[1], childrenArray[2]] 

    return (
        <Accordion expanded={expanded} onChange={handleAccordionChange}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
            >
                <Box>
                    {expanded ? divB : divA}
                </Box>
            </AccordionSummary>

            <AccordionDetails>
                <Box>
                    {divC}
                </Box>
            </AccordionDetails>
        </Accordion>
    );
};

export default StepAccordion;

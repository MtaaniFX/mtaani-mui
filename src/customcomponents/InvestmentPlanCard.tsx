import {Chip, Divider, Paper, Radio, Stack, Typography, CardActionArea} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import Box from "@mui/material/Box";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import * as React from "react";
import Button from "@mui/material/Button";

export type SelectionModeProps = {
    name: string,
    value: string,
    stateCurrentValue: string,
    stateSetCurrentValue:  React.Dispatch<React.SetStateAction<string>>,
}

const DefaultSelectionModeProps: SelectionModeProps = {
    name: "",
    stateCurrentValue: "",
    stateSetCurrentValue(value: ((prevState: string) => string) | string): void {},
    value: "",
}

export type InvestmentPlanCardProps = {
    selectionModeProps?: SelectionModeProps,
    recommended: boolean;
    recommendedText: string;
    plan: string;
    price: string;
    priceIntro: string;
    features: string[];
    actionText: string;
}

export const DefaultInvestmentPlanCardProps: InvestmentPlanCardProps = {
    recommended: false,
    recommendedText: "",
    plan: "",
    price: "",
    priceIntro: "",
    features: [],
    actionText: "",
};

export default function InvestmentPlanCard(props: InvestmentPlanCardProps) {
    const {recommended, recommendedText, plan, price, priceIntro, features, actionText} = props;
    const selectionMode = !!props.selectionModeProps;
    const selectionModeProps = !!props.selectionModeProps
        ? props.selectionModeProps
        : DefaultSelectionModeProps;

    const RecommendedChip = () => {
        return (<Chip sx={{ml: '1.5em'}} icon={<AutoAwesomeIcon/>} label={recommendedText}/>);
    }

    function paperOnclick() {
        selectionModeProps.stateSetCurrentValue(selectionModeProps.value);
    }

    return (
        <>
            <Paper variant='outlined' onClick={selectionMode ? paperOnclick: undefined} sx={[
                {borderRadius: '0.5em'},
                selectionMode && selectionModeProps.stateCurrentValue && selectionModeProps.stateCurrentValue === selectionModeProps.value
                    ? {borderColor: 'primary.main', borderWidth: 2}
                    : null,
                selectionMode ? {cursor: 'pointer'}: null,
            ]}>
                {selectionMode
                    ?
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: '0.25em',
                        ml: '0.35em',
                        mr: '0.75em',
                    }}>
                        <Radio
                            checked={selectionModeProps.stateCurrentValue === selectionModeProps.value}
                            onChange={(event) => {
                               selectionModeProps.stateSetCurrentValue(event.target.value);
                            }}
                            value={selectionModeProps.value}
                            name={selectionModeProps.name}
                            inputProps={{ 'aria-label': selectionModeProps.name}}
                        />
                        {recommended && <RecommendedChip/>}
                    </Box>
                    : null
                }

                <Stack sx={{px: '1em', py: '0.75em'}}>
                    {!selectionMode && !!plan
                        ? <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                            mt: '0.25em',
                        }}>
                            <Typography variant="h6">
                                {plan}
                            </Typography>
                            {recommended && <RecommendedChip/>}
                        </Box>
                        : <Typography variant="h6">
                            {plan}
                        </Typography>
                    }

                    {!!price
                        ?  <Typography variant="body2" component='span'>
                            {!!priceIntro
                                ? <>{priceIntro}&nbsp;</>
                                : ''
                            }
                            <Typography variant="h6" component='span'>
                                {price}
                            </Typography>
                        </Typography>
                        : null
                    }

                    {!!actionText
                        ? <Button variant={recommended ? 'contained' : 'outlined'}>{actionText}</Button>
                        : ''
                    }

                    {features.length > 0 && <>
                        <Divider sx={{mt: '1em', mb: '0.75em', opacity: 0.8, borderColor: 'divider'}}/>
                        <div>
                            {features.map((feature) => (
                                <Box
                                    key={feature}
                                    sx={{py: 0.5, display: 'flex', gap: 1.5, alignItems: 'center'}}
                                >
                                    <CheckCircleRoundedIcon
                                        sx={[
                                            {
                                                width: 20,
                                                color: 'primary.main'
                                            },
                                        ]}
                                    />
                                    <Typography
                                        variant="subtitle2"
                                        component={'span'}
                                    >
                                        {feature}
                                    </Typography>
                                </Box>
                            ))}
                        </div>
                    </>
                    }
                </Stack>
            </Paper>
        </>
    )
}

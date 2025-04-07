"use client";

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Divider,
  Avatar,
  Skeleton
} from '@mui/material';
import {
  AccountBalanceWallet,
  Verified,
  CreditCard,
  Group,
  CalendarMonth
} from '@mui/icons-material';
import { paths } from '@/lib/paths';
import TransactionsOverview, { Transaction } from './TransactionsOverview';
import { getUserInvestmentSummary } from "@/app/api/v1/app_investments/user-summary/client";

type Props = {
  accountBalance: number,
  referralEarnings: number,
  isVerified: boolean,
  daysToWithdrawal: number,
  withdrawalDate: Date,
  initialTransactions: Transaction[],
  fetchTransactions: () => Promise<Transaction[]>,
  totalInvestment?: number,
};

function formatDate(date: Date): string {
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();

  const nth = (day: number): string => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  return `${day}${nth(day)} ${month}, ${year}`;
}

function Dashboard(props: Props) {
  const [totalInvestment, setTotalInvestment] = useState<number | null>();
  const [growth, setGrowth] = useState<number | null>();

  useEffect(() => {
    const effect = async () => {
      let { data, error } = await getUserInvestmentSummary();
      if (error || !data) {
        console.error('[error] fetching user investment summary:', error);
        return;
      }

      setTotalInvestment(data.totalPaidInvestment);
      setGrowth(data.returnsPercentage);
    };

    effect();
  }, []);

  return (
    <Box sx={{
      flexGrow: 1,
      p: { xs: 2, md: 4 },
      bgcolor: 'background.default'
    }}>
      <Grid container spacing={3}>
        {/* Profile Verification Alert */}
        {!props.isVerified && (
          <Grid item xs={12}>
            <Card variant="outlined" >
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Verified sx={{ mr: 4 }} />
                <Box>
                  <Typography variant="h6">
                    Complete Your Profile Verification
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                    href={`/${paths.dashboard.profile}`}
                  >
                    Get verified
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Account Balance */}
        <Grid item xs={12} sm={6} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountBalanceWallet sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">
                  Account Balance
                </Typography>
              </Box>
              <Typography
                variant="h4"
                sx={{
                  mt: 2,
                  fontWeight: 'bold',
                  color: 'primary.main'
                }}
              >
                KSH {props.accountBalance.toLocaleString()}
              </Typography>
              <Button
                variant="outlined"
                color="primary"
                sx={{ mt: 2 }}
                href={`/${paths.dashboard.transactions}`}
              >
                View Details
              </Button>
              <Typography variant="body2">
                &nbsp;
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Next Withdrawal */}
        <Grid item xs={12} sm={6} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarMonth sx={{ mr: 2, color: 'success.main' }} />
                <Typography variant="h6">
                  Next Withdrawal
                </Typography>
              </Box>
              <Typography
                variant="h4"
                sx={{
                  mt: 2,
                  fontWeight: 'bold',
                  color: 'success.main'
                }}
              >
                {props.daysToWithdrawal === 0 ?
                  "Today" :
                  props.daysToWithdrawal === 1 ?
                    "Tomorrow" :
                    `${props.daysToWithdrawal} Days Left`
                }
              </Typography>
              <Typography variant="body2">
                Scheduled for {formatDate(props.withdrawalDate)}
              </Typography>
              <Button
                variant="outlined"
                color="success"
                sx={{ mt: 2 }}
                href={`/${paths.dashboard.withdrawals}`}
              >
                Withdrawals
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Referral Earnings */}
        <Grid item xs={12} sm={6} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Group sx={{ mr: 2, color: 'secondary.main' }} />
                <Typography variant="h6">
                  Referral Earnings
                </Typography>
              </Box>
              <Typography
                variant="h4"
                sx={{
                  mt: 2,
                  fontWeight: 'bold',
                  color: 'secondary.main'
                }}
              >
                KSH {props.referralEarnings.toLocaleString()}
              </Typography>

              <Button
                variant="outlined"
                color="secondary"
                href={`/${paths.dashboard.referrals}`}
                sx={{ mt: 2 }}
              >
                Referral Program
              </Button>
              <Typography variant="body2">
                &nbsp;
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Investment Summary */}
        <Grid item xs={12} md={8}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Investment Portfolio
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Total Invested
                  </Typography>
                  <Typography variant="h6">
                    {
                      totalInvestment || totalInvestment === 0
                        ? <>KSH {totalInvestment}</>
                        : <Skeleton />
                    }
                  </Typography>
                </Grid>
                <Grid item xs={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Portfolio Growth
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {
                      growth || growth === 0
                        ? (growth > 0 ? `+${growth}%` : '~')
                        : <Skeleton />
                    }
                  </Typography>

                </Grid>
                <Grid item xs={12} md={4}>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    href={`/${paths.dashboard.investments}`}
                  >
                    View Investments
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <TransactionsOverview
            initialTransactions={props.initialTransactions}
            fetchTransactions={props.fetchTransactions} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

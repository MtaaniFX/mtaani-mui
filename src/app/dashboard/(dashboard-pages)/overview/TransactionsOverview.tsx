import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Button} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { paths } from '@/lib/paths';

// Define Transaction interface
export interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
}

interface RecentTransactionsProps {
  fetchTransactions?: () => Promise<Transaction[]>;
  initialTransactions?: Transaction[];
}

const TransactionsOverview: React.FC<RecentTransactionsProps> = ({
  fetchTransactions,
  initialTransactions = []
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadTransactions = async () => {
    // Only attempt to fetch if fetchTransactions callback is provided
    if (!fetchTransactions) {
      console.error("No op, did you forget to set a `fetchTransactions` callback");
      return;
    } 

    setIsLoading(true);
    setError(null);
    try {
      const fetchedTransactions = await fetchTransactions();
      setTransactions(fetchedTransactions);
    } catch (err) {
      setError('Failed to load transactions');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTransactionAmount = (transaction: Transaction) => {
    const isDeposit = transaction.amount > 0;
    return (
      <Typography
        variant="body2"
        color={isDeposit ? 'success.main' : 'primary.main'}
      >
        {isDeposit ? '+' : '-'} {transaction.currency} {Math.abs(transaction.amount).toLocaleString()}
      </Typography>
    );
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Recent Activity
        </Typography>

        {transactions.length === 0 ? (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              mb: 2,
            }}
          >
            <Typography variant="body1" color="text.secondary">
              It’s a bit peaceful around here.
            </Typography>
            <Typography variant="body2" color="text.disabled">
              No activity to report just yet.
            </Typography>
            {error && <Typography color="error">{error}</Typography>}
            {fetchTransactions && (
              <Button variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadTransactions}
                loading={isLoading}
                sx={{ mt: 2 }}>
                Refresh
              </Button>
            )}
          </Box>
        ) : (
          <>
            {transactions.map((transaction, index) => (
              <React.Fragment key={transaction.id}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">{transaction.type}</Typography>
                  {renderTransactionAmount(transaction)}
                </Box>
                {index < transactions.length - 1 && <Divider sx={{ my: 1 }} />}
              </React.Fragment>
            ))}

            <Divider sx={{ my: 1 }} />
            <Button
              variant="text"
              color="primary"
              fullWidth
              href={`/${paths.dashboard.transactions}`}
            >
              View All Transactions
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionsOverview;

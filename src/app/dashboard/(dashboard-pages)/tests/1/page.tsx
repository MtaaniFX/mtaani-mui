// In your page file
import InvestmentInvoiceDetails, { InvestmentInvoiceProps } from './InvestmentInvoiceDetails';

// Use the component with your data
export default function Page() {

    // Mock data for testing
    const mockData: InvestmentInvoiceProps = {
        investment: {
            id: 'INV-2024-001',
            name: 'Tech Growth Fund',
            type: 'Mutual Fund',
            startDate: '2024-02-01',
            endDate: '2025-02-01',
            amount: 10000,
            expectedReturn: 1200,
            returnRate: 12,
            status: 'pending',
        },
        invoice: {
            id: 'INV-2024-001',
            amount: 10000,
            dueDate: '2024-02-15',
            processingFee: 25,
            totalAmount: 10025,
        },
        userBalance: 8000,
    };

    return <InvestmentInvoiceDetails {...mockData} />;
}
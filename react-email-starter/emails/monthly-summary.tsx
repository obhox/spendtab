import {
    Body,
    Container,
    Head,
    Heading,
    Html,
    Link,
    Preview,
    Section,
    Text,
    Hr,
  } from '@react-email/components';
  import * as React from 'react';
  
  interface MonthlySummaryProps {
    firstName?: string;
    fullName?: string;
    monthStartDate: string;
    monthEndDate: string;
    totalIncome: number;
    totalExpenses: number;
    netCashFlow: number;
    previousMonthIncome?: number;
    previousMonthExpenses?: number;
    savingsRate: number;
    topCategories: Array<{
      name: string;
      amount: number;
      percentage: number;
      trend: 'up' | 'down' | 'stable';
    }>;
    transactionCount: number;
  }
  
  const styles = {
    body: {
      backgroundColor: '#ffffff',
      fontFamily: 'Inter, system-ui, sans-serif',
    },
    container: {
      margin: '0 auto',
      padding: '20px 0 48px',
      maxWidth: '600px',
    },
    header: {
      padding: '0 24px',
    },
    content: {
      padding: '0 24px',
    },
    h1: {
      color: '#1a1a1a',
      fontSize: '24px',
      fontWeight: '600',
      lineHeight: '40px',
      margin: '0 0 20px',
    },
    h2: {
      color: '#1a1a1a',
      fontSize: '20px',
      fontWeight: '500',
      lineHeight: '28px',
      margin: '16px 0',
    },
    paragraph: {
      color: '#4b5563',
      fontSize: '15px',
      lineHeight: '24px',
      margin: '16px 0',
    },
    summaryBox: {
      backgroundColor: '#f9fafb',
      borderRadius: '8px',
      padding: '20px',
      margin: '20px 0',
    },
    summaryTable: {
      width: '100%',
      borderCollapse: 'collapse' as const,
    },
    summaryRow: {
      width: '100%',
    },
    summaryLabelCell: {
      width: '60%',
      padding: '8px 0',
      textAlign: 'left' as const,
    },
    summaryValueCell: {
      width: '40%',
      padding: '8px 0',
      textAlign: 'right' as const,
    },
    categoryItem: {
      margin: '8px 0',
    },
    amount: {
      fontWeight: '600',
    },
    positive: {
      color: '#059669',
    },
    negative: {
      color: '#dc2626',
    },
    trend: {
      fontSize: '14px',
      marginLeft: '8px',
    },
    divider: {
      borderTop: '1px solid #e5e7eb',
      margin: '32px 0',
    },
    footer: {
      textAlign: 'center' as const,
      padding: '0 24px',
    },
    footerText: {
      fontSize: '14px',
      color: '#6b7280',
      margin: '8px 0',
    },
    link: {
      color: '#2563eb',
      textDecoration: 'underline',
    },
    buttonContainer: {
      textAlign: 'center' as const,
      margin: '24px 0',
    },
    button: {
      backgroundColor: '#000000',
      color: '#ffffff',
      borderRadius: '6px',
      fontWeight: '600',
      padding: '12px 24px',
      textDecoration: 'none',
      textAlign: 'center' as const,
      display: 'inline-block',
      fontSize: '15px',
    },
  };
  
  export const MonthlySummary: React.FC<Readonly<MonthlySummaryProps>> = ({
    firstName,
    fullName,
    monthStartDate = 'April 1',
    monthEndDate = 'April 30',
    totalIncome = 0,
    totalExpenses = 0,
    netCashFlow = 0,
    previousMonthIncome = 0,
    previousMonthExpenses = 0,
    savingsRate = 0,
    topCategories = [],
    transactionCount = 0,
  }) => {
    const greeting = firstName || fullName || 'there';
    
    // Handle division by zero cases
    const incomeChange = previousMonthIncome > 0 
      ? ((totalIncome - previousMonthIncome) / previousMonthIncome) * 100
      : 0;
      
    const expenseChange = previousMonthExpenses > 0
      ? ((totalExpenses - previousMonthExpenses) / previousMonthExpenses) * 100
      : 0;
  
    return (
      <Html>
        <Head>
          <title>Your Monthly Financial Summary</title>
          <style dangerouslySetInnerHTML={{ __html: `
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          `}} />
        </Head>
        <Preview>Your Monthly Financial Summary ({monthStartDate} - {monthEndDate})</Preview>
        <Body style={styles.body}>
          <Container style={styles.container}>
            <Section style={styles.header}>
              <Text style={styles.h1}>Your Monthly Financial Summary</Text>
            </Section>
            
            <Section style={styles.content}>
              <Text style={styles.paragraph}>Hi {greeting},</Text>
              
              <Text style={styles.paragraph}>
                Here's your financial summary for the month of {monthStartDate} to {monthEndDate}.
                You had {transactionCount} transactions this month.
              </Text>
              
              <Section style={styles.summaryBox}>
                <Text style={styles.h2}>Monthly Overview</Text>
                <table style={styles.summaryTable}>
                  <tbody>
                    <tr style={styles.summaryRow}>
                      <td style={styles.summaryLabelCell}>Total Income:</td>
                      <td style={styles.summaryValueCell}>
                        <span style={styles.amount}>${totalIncome.toFixed(2)}</span>
                        {previousMonthIncome > 0 && incomeChange !== 0 && (
                          <span style={{
                            ...styles.trend,
                            ...(incomeChange > 0 ? styles.positive : styles.negative)
                          }}>
                            ({incomeChange > 0 ? '+' : ''}{incomeChange.toFixed(1)}%)
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr style={styles.summaryRow}>
                      <td style={styles.summaryLabelCell}>Total Expenses:</td>
                      <td style={styles.summaryValueCell}>
                        <span style={{...styles.amount, ...styles.negative}}>
                          -${totalExpenses.toFixed(2)}
                        </span>
                        {previousMonthExpenses > 0 && expenseChange !== 0 && (
                          <span style={{
                            ...styles.trend,
                            ...(expenseChange < 0 ? styles.positive : styles.negative)
                          }}>
                            ({expenseChange > 0 ? '+' : ''}{expenseChange.toFixed(1)}%)
                          </span>
                        )}
                      </td>
                    </tr>
                    <tr style={styles.summaryRow}>
                      <td style={styles.summaryLabelCell}>Net Cash Flow:</td>
                      <td style={styles.summaryValueCell}>
                        <span style={{
                          ...styles.amount,
                          ...(netCashFlow >= 0 ? styles.positive : styles.negative)
                        }}>
                          {netCashFlow >= 0 ? '+' : '-'}${Math.abs(netCashFlow).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                    <tr style={styles.summaryRow}>
                      <td style={styles.summaryLabelCell}>Savings Rate:</td>
                      <td style={styles.summaryValueCell}>
                        <span style={{
                          ...styles.amount,
                          ...(savingsRate > 0 ? styles.positive : styles.negative)
                        }}>
                          {savingsRate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Section>
              
              <Text style={styles.h2}>Top Spending Categories & Trends</Text>
              <Section style={styles.summaryBox}>
                <table style={styles.summaryTable}>
                  <tbody>
                    {topCategories.map((category, index) => (
                      <tr key={index} style={styles.summaryRow}>
                        <td style={styles.summaryLabelCell}>{category.name}</td>
                        <td style={styles.summaryValueCell}>
                          <span style={styles.amount}>
                            ${category.amount.toFixed(2)} ({category.percentage.toFixed(1)}%)
                          </span>
                          <span style={{
                            ...styles.trend,
                            ...(category.trend === 'down' ? styles.positive :
                                category.trend === 'up' ? styles.negative :
                                {})
                          }}>
                            {category.trend === 'up' ? '↑' :
                             category.trend === 'down' ? '↓' : '→'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Section>
              
              <Text style={styles.paragraph}>
                View your complete financial dashboard for more detailed insights:
              </Text>
              
              <Section style={styles.buttonContainer}>
                <Link href="https://app.spendtab.com/dashboard" style={styles.button}>
                  View Dashboard
                </Link>
              </Section>
              
              <Hr style={styles.divider} />
              
              <Section style={styles.footer}>
                <Text style={styles.footerText}>
                  You received this email because you're subscribed to monthly summaries from SpendTab.
                  <br />
                  <Link href="https://app.spendtab.com/dashboard" style={styles.link}>
                    Update your email preferences
                  </Link>
                </Text>
              </Section>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  };
  
  export default MonthlySummary;

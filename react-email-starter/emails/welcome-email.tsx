import * as React from 'react';
import { 
  Html, 
  Head, 
  Preview, 
  Body, 
  Container, 
  Section, 
  Text, 
  Link, 
  Hr 
} from '@react-email/components';

interface WelcomeEmailProps {
  firstName?: string;
  fullName?: string;
  loginUrl?: string;
}

export const WelcomeEmail: React.FC<Readonly<WelcomeEmailProps>> = ({
  firstName,
  fullName,
  loginUrl = 'https://app.spendtab.com/login',
}) => {
  const greeting = firstName || fullName || 'there';
  return (
    <Html>
      <Head>
        <title>Welcome to SpendTab</title>
        <style dangerouslySetInnerHTML={{ __html: `
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        `}} />
      </Head>
      <Preview>Welcome to SpendTab - Plan your Business Financial Health!</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Text style={styles.h1}>Welcome to SpendTab!</Text>
          </Section>
          
          <Section style={styles.content}>
            <Text style={styles.paragraph}>Hi {firstName},</Text>
            
            <Text style={styles.paragraph}>
              Thank you for choosing SpendTab as your business finance management solution. 
              We're excited to help you take control of your financial journey!
            </Text>
            
            <Text style={styles.h2}>Here's what you can do with SpendTab:</Text>
            
            <Section style={styles.steps}>
              <div style={styles.feature}>
                <span style={styles.featureIcon}>•</span>
                <span>Track your income and expenses effortlessly</span>
              </div>
              <div style={styles.feature}>
                <span style={styles.featureIcon}>•</span>
                <span>Create and manage budgets for better financial planning</span>
              </div>
              <div style={styles.feature}>
                <span style={styles.featureIcon}>•</span>
                <span>Generate detailed financial reports and insights</span>
              </div>
              <div style={styles.feature}>
                <span style={styles.featureIcon}>•</span>
                <span>Analyze your spending patterns to optimize savings</span>
              </div>
            </Section>
            
            <Text style={{ ...styles.paragraph, textAlign: 'center' }}>
              Ready to get started? Access your dashboard now:
            </Text>
            
            <Section style={{ textAlign: 'center' }}>
              <Link href={loginUrl} style={styles.button}>
                Get Started
              </Link>
            </Section>
            
            <Text style={styles.paragraph}>
              Our goal is to make managing your finances simple and stress-free. 
              If you have any questions along the way, our support team is here to help.
            </Text>
            
            <Hr style={styles.divider} />
            
            <Text style={{ ...styles.paragraph, textAlign: 'center' }}>
              Need help? <Link href="mailto:support@spendtab.com" style={styles.link}>support@spendtab.com</Link>
            </Text>
          </Section>
          
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              You received this email because you signed up for SpendTab.
            </Text>
            <Text style={styles.footerText}>
              <Link href="https://www.spendtab.com/privacy" style={styles.footerLink}>Privacy</Link> • 
              <Link href="https://www.spendtab.com/terms-of-service" style={styles.footerLink}>Terms</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const styles = {
  body: {
    fontFamily: "'Inter', sans-serif",
    lineHeight: 1.6,
    color: '#111111',
    margin: '0',
    padding: '0',
    backgroundColor: '#f8f8f8',
  },
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '40px 20px',
    backgroundColor: '#ffffff',
  },
  header: {
    textAlign: 'center' as const,
    padding: '30px 0',
    borderBottom: '1px solid #eeeeee',
  },
  h1: {
    fontWeight: '700',
    fontSize: '28px',
    letterSpacing: '-0.5px',
    marginTop: '20px',
    marginBottom: '10px',
  },
  h2: {
    fontWeight: '600',
    fontSize: '20px',
    letterSpacing: '-0.3px',
    marginTop: '30px',
    marginBottom: '15px',
  },
  content: {
    padding: '30px 15px',
  },
  paragraph: {
    fontSize: '16px',
    lineHeight: '26px',
    color: '#111111',
  },
  button: {
    display: 'inline-block',
    backgroundColor: '#000000',
    color: '#ffffff',
    textDecoration: 'none',
    padding: '14px 32px',
    borderRadius: '6px',
    fontWeight: '600',
    letterSpacing: '0.3px',
    margin: '25px 0',
  },
  link: {
    color: '#000000',
    fontWeight: '500',
    borderBottom: '1px dotted #888888',
    textDecoration: 'none',
  },
  steps: {
    backgroundColor: '#f8f8f8',
    padding: '25px',
    borderRadius: '8px',
    margin: '30px 0',
    borderLeft: '4px solid #000000',
  },
  feature: {
    marginBottom: '12px',
    display: 'flex',
  },
  featureIcon: {
    marginRight: '10px',
    fontWeight: 'bold',
  },
  divider: {
    border: 'none',
    height: '1px',
    backgroundColor: '#eeeeee',
    margin: '30px 0',
  },
  footer: {
    fontSize: '13px',
    color: '#777777',
    textAlign: 'center' as const,
    marginTop: '40px',
    paddingTop: '30px',
    borderTop: '1px solid #eeeeee',
  },
  footerText: {
    fontSize: '13px',
    color: '#777777',
    margin: '5px 0',
  },
  footerLink: {
    color: '#000000',
    textDecoration: 'none',
    fontWeight: '500',
    margin: '0 5px',
  },
};

export default WelcomeEmail;

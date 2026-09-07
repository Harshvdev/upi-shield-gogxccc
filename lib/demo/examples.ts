import { MessageSource } from '../ai/types';

export interface DemoScenario {
  id: string;
  title: string;
  category: 'high_risk' | 'low_risk';
  source: MessageSource;
  preview: string;
  text: string;
  expectedRisk: 'HIGH' | 'LOW';
  expectedTriggers: string[];
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'refund-verification',
    title: 'Verification Refund Scam',
    category: 'high_risk',
    source: 'sms',
    preview: 'Pay ₹1 to receive your pending refund within 10 mins...',
    text: 'Your refund of ₹4,999 is pending. For verification, send ₹1 to the UPI ID below within 10 minutes or your refund will be cancelled immediately.',
    expectedRisk: 'HIGH',
    expectedTriggers: ['Payment Demand', 'Artificial Urgency'],
  },
  {
    id: 'electricity-disconnection',
    title: 'Electricity Disconnection Threat',
    category: 'high_risk',
    source: 'whatsapp',
    preview: 'Your connection will be disconnected today at 9:30 PM...',
    text: 'Electricity Department Notice: Dear customer, your electricity power connection will be disconnected tonight at 9:30 PM because previous month bill was not updated. Immediately pay ₹50 bill penalty to our officer UPI ID to stop disconnection.',
    expectedRisk: 'HIGH',
    expectedTriggers: ['Authority Impersonation', 'Coercion & Threats', 'Payment Demand'],
  },
  {
    id: 'fake-bank-authority',
    title: 'Fake Bank Verification',
    category: 'high_risk',
    source: 'sms',
    preview: 'Bank verification department: Account will be blocked today...',
    text: 'Urgent: This is SBI bank security verification department. Your savings account will be permanently blocked today unless you complete UPI reverification by paying ₹10 token charge to verify account ownership.',
    expectedRisk: 'HIGH',
    expectedTriggers: ['Authority Impersonation', 'Coercion', 'Payment Demand'],
  },
  {
    id: 'kyc-expiry',
    title: 'UPI KYC Expiry Threat',
    category: 'high_risk',
    source: 'payment_note',
    preview: 'Payment note: KYC expired. Send token ₹5 to avoid freeze...',
    text: 'KYC Alert: Your UPI ID has expired. Immediate action required. Pay ₹5 to reactivate or your linked bank accounts will be blacklisted by NPCI within 2 hours.',
    expectedRisk: 'HIGH',
    expectedTriggers: ['Artificial Urgency', 'Coercion', 'Authority Impersonation'],
  },
  {
    id: 'upi-intent-reversal',
    title: 'Raw UPI Intent Refund Trap',
    category: 'high_risk',
    source: 'upi_intent',
    preview: 'upi://pay?pa=refund.verification@paytm&pn=Amazon+Refund&am=1.00...',
    text: 'upi://pay?pa=refund.verification@paytm&pn=Amazon+Refund+Desk&am=1.00&cu=INR&tn=Refund+verification+token',
    expectedRisk: 'HIGH',
    expectedTriggers: ['Payment Demand', 'Authority Impersonation'],
  },
  {
    id: 'cashback-lottery-trap',
    title: 'Lottery / Cashback Fee Scam',
    category: 'high_risk',
    source: 'payment_note',
    preview: 'Won ₹25,000 lottery! Pay ₹49 tax to release funds...',
    text: 'Congratulations! You won ₹25,000 Diwali lottery reward. Pay ₹49 government tax fee to release prize money to your bank account immediately.',
    expectedRisk: 'HIGH',
    expectedTriggers: ['Payment Demand', 'Artificial Urgency'],
  },
  {
    id: 'benign-utility-bill',
    title: 'Legitimate Utility Bill',
    category: 'low_risk',
    source: 'sms',
    preview: 'Electricity bill of ₹850 is due on 15 September...',
    text: 'Your electricity bill of ₹850 for consumer number 9823412 is due on 15 September. Please use the official electricity portal www.bescom.karnataka.gov.in to make your payment securely.',
    expectedRisk: 'LOW',
    expectedTriggers: [],
  },
  {
    id: 'benign-refund-status',
    title: 'Benign Refund Notification',
    category: 'low_risk',
    source: 'whatsapp',
    preview: 'Your refund has been initiated to your source account...',
    text: 'Your refund of ₹1,200 for order #4082 has been initiated by Amazon Pay. Please check your official bank application for the credit status within 3-5 business days. We will never ask for your PIN.',
    expectedRisk: 'LOW',
    expectedTriggers: [],
  },
];


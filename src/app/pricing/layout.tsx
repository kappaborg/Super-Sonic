import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pricing Plans | SecureSonic',
    description: 'Explore our pricing plans for voice authentication solutions that fit your business needs.',
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return children;
} 
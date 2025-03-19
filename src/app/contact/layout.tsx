import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us | SecureSonic',
    description: 'Get in touch with SecureSonic for inquiries about our voice authentication solutions.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return children;
} 
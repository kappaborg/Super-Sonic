import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Us | SecureSonic',
    description: 'Learn about SecureSonic, our mission and the team behind advanced voice authentication technology.',
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return children;
} 
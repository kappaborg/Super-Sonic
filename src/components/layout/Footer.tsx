import { Github, Linkedin, Twitter } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">SecureSonic</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Secure your digital identity with voice authentication technology
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="https://twitter.com/securesonic"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-500 hover:text-blue-500 transition-colors"
                            >
                                <Twitter size={20} />
                                <span className="sr-only">Twitter</span>
                            </a>
                            <a
                                href="https://github.com/securesonic"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                            >
                                <Github size={20} />
                                <span className="sr-only">GitHub</span>
                            </a>
                            <a
                                href="https://linkedin.com/company/securesonic"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-500 hover:text-blue-700 transition-colors"
                            >
                                <Linkedin size={20} />
                                <span className="sr-only">LinkedIn</span>
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider">Product</h3>
                        <ul className="mt-4 space-y-2">
                            <li>
                                <Link href="/features" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm">
                                    Features
                                </Link>
                            </li>
                            <li>
                                <Link href="/pricing" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm">
                                    Pricing
                                </Link>
                            </li>
                            <li>
                                <Link href="/security" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm">
                                    Security
                                </Link>
                            </li>
                            <li>
                                <Link href="/docs" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm">
                                    Documentation
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider">Company</h3>
                        <ul className="mt-4 space-y-2">
                            <li>
                                <Link href="/about" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm">
                                    Contact
                                </Link>
                            </li>
                            <li>
                                <Link href="/careers" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm">
                                    Careers
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm">
                                    Blog
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wider">Legal</h3>
                        <ul className="mt-4 space-y-2">
                            <li>
                                <Link href="/privacy" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm">
                                    Terms of Service
                                </Link>
                            </li>
                            <li>
                                <Link href="/cookies" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm">
                                    Cookie Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/gdpr" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm">
                                    GDPR
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
                        &copy; {new Date().getFullYear()} SecureSonic. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
} 
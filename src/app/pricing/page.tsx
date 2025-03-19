"use client";


export default function PricingPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-2 text-center text-gray-900 dark:text-white">Pricing Plans</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 text-center">Choose the plan that's right for your business</p>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {/* Basic Plan */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex flex-col">
                    <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Starter</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">For individuals and small teams</p>
                    <div className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">$19<span className="text-xl font-normal text-gray-600 dark:text-gray-400">/mo</span></div>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">per user, billed annually</p>

                    <ul className="space-y-3 mb-8 flex-grow text-gray-700 dark:text-gray-300">
                        <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Up to 5 users
                        </li>
                        <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            1,000 authentications/month
                        </li>
                        <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Standard voice authentication
                        </li>
                        <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Email support
                        </li>
                    </ul>

                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition w-full">
                        Get Started
                    </button>
                </div>

                {/* Business Plan */}
                <div className="bg-blue-50 dark:bg-blue-900 p-8 rounded-lg shadow-md border border-blue-200 dark:border-blue-700 flex flex-col relative transform scale-105">
                    <div className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                        POPULAR
                    </div>
                    <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Business</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">For growing businesses</p>
                    <div className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">$49<span className="text-xl font-normal text-gray-600 dark:text-gray-300">/mo</span></div>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">per user, billed annually</p>

                    <ul className="space-y-3 mb-8 flex-grow text-gray-700 dark:text-gray-200">
                        <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 dark:text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Up to 20 users
                        </li>
                        <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 dark:text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            5,000 authentications/month
                        </li>
                        <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 dark:text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Advanced voice authentication
                        </li>
                        <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 dark:text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Anti-spoofing protection
                        </li>
                        <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 dark:text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Priority email & chat support
                        </li>
                    </ul>

                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition w-full">
                        Get Started
                    </button>
                </div>

                {/* Enterprise Plan */}
                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 flex flex-col">
                    <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">Enterprise</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">For large organizations</p>
                    <div className="text-4xl font-bold mb-2 text-gray-900 dark:text-white">Custom</div>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Contact us for pricing</p>

                    <ul className="space-y-3 mb-8 flex-grow text-gray-700 dark:text-gray-300">
                        <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Unlimited users
                        </li>
                        <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Unlimited authentications
                        </li>
                        <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Enterprise-grade security
                        </li>
                        <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Custom integration support
                        </li>
                        <li className="flex items-start">
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            24/7 dedicated support
                        </li>
                    </ul>

                    <button className="bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition w-full">
                        Contact Sales
                    </button>
                </div>
            </div>

            <div className="mt-16 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md max-w-4xl mx-auto">
                <h2 className="text-2xl font-semibold mb-6 text-center text-gray-900 dark:text-white">Frequently Asked Questions</h2>

                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Can I change plans later?</h3>
                        <p className="text-gray-600 dark:text-gray-300">Yes, you can upgrade or downgrade your plan at any time. Changes to your subscription will be prorated.</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">What happens if I exceed my monthly authentications?</h3>
                        <p className="text-gray-600 dark:text-gray-300">If you exceed your plan's authentication limit, additional authentications will be billed at a per-use rate. We'll notify you when you reach 80% of your limit.</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">Is there a free trial available?</h3>
                        <p className="text-gray-600 dark:text-gray-300">Yes, we offer a 14-day free trial on our Starter and Business plans so you can experience SecureSonic before committing.</p>
                    </div>

                    <div>
                        <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-white">How secure is the voice authentication system?</h3>
                        <p className="text-gray-600 dark:text-gray-300">Our voice authentication system meets the highest security standards with 99.9% accuracy and anti-spoofing technology to prevent replay attacks and voice synthesis attempts.</p>
                    </div>
                </div>
            </div>
        </div>
    );
} 
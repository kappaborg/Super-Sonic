"use client";


export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">About SecureSonic</h1>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mb-12">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Our Mission</h2>
                    <p className="text-lg leading-relaxed mb-6 text-gray-700 dark:text-gray-300">
                        At SecureSonic, we're on a mission to revolutionize authentication by harnessing the power and uniqueness
                        of the human voice. We believe security shouldn't come at the expense of user experience.
                    </p>
                    <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                        Our voice biometric technology provides frictionless yet highly secure authentication, eliminating the
                        vulnerabilities of traditional passwords while creating a seamless experience for users. We're committed
                        to creating a future where your voice is your password.
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md mb-12">
                    <h2 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white">Our Story</h2>
                    <p className="text-lg leading-relaxed mb-4 text-gray-700 dark:text-gray-300">
                        SecureSonic was founded in 2020 by a team of cybersecurity experts and voice recognition pioneers who
                        recognized the limitations of traditional authentication methods. After witnessing countless data breaches
                        caused by password vulnerabilities, we set out to create a more secure alternative.
                    </p>
                    <p className="text-lg leading-relaxed mb-4 text-gray-700 dark:text-gray-300">
                        What began as a research project quickly evolved into a robust voice authentication platform. We assembled
                        a team of experts in machine learning, security, and user experience to develop our proprietary voice
                        recognition algorithms.
                    </p>
                    <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
                        Today, SecureSonic serves clients across multiple industries, from financial services to healthcare,
                        helping them enhance security while providing a seamless authentication experience for their users.
                    </p>
                </div>

                <div className="mb-16">
                    <h2 className="text-2xl font-semibold mb-8 text-center text-gray-900 dark:text-white">Our Core Values</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-medium text-center mb-2 text-gray-900 dark:text-white">Security First</h3>
                            <p className="text-center text-gray-700 dark:text-gray-300">
                                We never compromise on security and maintain the highest standards in data protection and privacy.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-medium text-center mb-2 text-gray-900 dark:text-white">Innovation</h3>
                            <p className="text-center text-gray-700 dark:text-gray-300">
                                We continuously push the boundaries of what's possible in voice biometrics and authentication technology.
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                </svg>
                            </div>
                            <h3 className="text-xl font-medium text-center mb-2 text-gray-900 dark:text-white">User-Centric</h3>
                            <p className="text-center text-gray-700 dark:text-gray-300">
                                We design our solutions with the end-user in mind, ensuring technology enhances rather than complicates.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-6 text-center text-gray-900 dark:text-white">Leadership Team</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <div className="h-32 w-32 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
                            <h3 className="text-xl font-medium mb-1 text-gray-900 dark:text-white">Alex Johnson</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-2">CEO & Co-Founder</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Former head of security at a Fortune 500 company with 15+ years in cybersecurity.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="h-32 w-32 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
                            <h3 className="text-xl font-medium mb-1 text-gray-900 dark:text-white">Sophia Chen</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-2">CTO & Co-Founder</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                AI expert with a Ph.D. in machine learning and speech recognition from MIT.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="h-32 w-32 bg-gray-300 dark:bg-gray-600 rounded-full mx-auto mb-4"></div>
                            <h3 className="text-xl font-medium mb-1 text-gray-900 dark:text-white">Marcus Williams</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-2">Chief Product Officer</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                                Product visionary with experience at leading tech companies in Silicon Valley.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 
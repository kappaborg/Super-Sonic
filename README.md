# Super-Sonic

A secure real-time communication platform built with Next.js, featuring voice authentication and encrypted messaging.

## Features

- 🔐 Voice-based authentication
- 💬 Real-time encrypted messaging
- 🎥 Video conferencing
- 🔒 End-to-end encryption
- 🌐 WebRTC integration
- 📱 Responsive design

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Supabase
- WebRTC
- Web Audio API

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/kappaborg/Super-Sonic.git
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. Start the development server:
```bash
npm run dev
```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_WEBSOCKET_URL=your_websocket_url
NEXT_PUBLIC_API_URL=your_api_url
JWT_SECRET=your_jwt_secret
NEXTAUTH_SECRET=your_nextauth_secret
```

## Project Structure

```
src/
├── app/           # Next.js app directory
├── components/    # React components
├── contexts/      # React contexts
├── hooks/         # Custom hooks
├── lib/           # Utility libraries
├── middleware.ts  # Next.js middleware
├── providers/     # Service providers
├── services/      # API services
├── styles/        # Global styles
├── types/         # TypeScript types
└── utils/         # Utility functions
```

## Security Features

- Voice biometric authentication
- JWT token-based authorization
- End-to-end encryption for messages
- Secure WebRTC connections
- HTTP security headers
- Rate limiting
- CORS protection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 
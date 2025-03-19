import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    try {
        // Create demo user if it doesn't exist
        const existingUser = await prisma.user.findUnique({
            where: { email: 'demo@securesonic.com' }
        });

        if (!existingUser) {
            const hashedPassword = await hash('password123', 12);

            // Create user
            const user = await prisma.user.create({
                data: {
                    email: 'demo@securesonic.com',
                    name: 'Demo User',
                    hashedPassword,
                    image: 'https://ui-avatars.com/api/?name=Demo+User&background=0D8ABC&color=fff',
                    profile: {
                        create: {
                            name: 'Demo User',
                            email: 'demo@securesonic.com',
                            avatarUrl: 'https://ui-avatars.com/api/?name=Demo+User&background=0D8ABC&color=fff',
                        }
                    }
                }
            });

            console.log('Demo user created:', user.email);
        } else {
            console.log('Demo user already exists');
        }
    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main(); 
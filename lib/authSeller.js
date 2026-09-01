import { clerkClient } from '@clerk/nextjs/server';

const authSeller  = async (userId) => {
    if (!userId) {
        return false;
    }

    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    return user.publicMetadata.role === 'seller';
};

export default authSeller

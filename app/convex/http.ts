import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

interface ClerkEmailAddress {
    id: string;
    email_address: string;
}

http.route({
    path: '/webhooks/clerk-users',
    method: 'POST',
    handler: httpAction(async (ctx, request) => {
        const { data, type } = await request.json()
        switch (type) {
            case 'user.created':
                await ctx.runMutation(internal.users.createUser, {
                    clerkId: data.id,
                    primary_email_address_id: data.primary_email_address_id,
                    email_addresses: data.email_addresses.map((email: ClerkEmailAddress) => ({
                        id: email.id,
                        email_address: email.email_address,
                    })),
                    name: data.first_name + ' ' + data.last_name,
                    imageUrl: data.image_url,
                })
                return new Response('User created', { status: 201 })
            case 'user.updated':
                await ctx.runMutation(internal.users.updateUser, {
                    clerkId: data.id,
                    primary_email_address_id: data.primary_email_address_id,
                    email_addresses: data.email_addresses.map((email: ClerkEmailAddress) => ({
                        id: email.id,
                        email_address: email.email_address,
                    })),
                    name: data.first_name + ' ' + data.last_name,
                    imageUrl: data.image_url,
                })
                return new Response('User updated', { status: 200 })
            case 'user.deleted':
                await ctx.runMutation(internal.users.deleteUser, {
                    clerkId: data.id,
                })
                return new Response('User deleted', { status: 200 })
            default:
                console.log('Ignored Clerk webhook event:', type)
                return new Response('Ignored Clerk webhook event', { status: 400 })
        }
    }),
});

export default http;

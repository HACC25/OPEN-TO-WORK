import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

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
                return new Response('Ignored Clerk webhook event', { status: 400 })
        }
    }),
});

http.route({
    path: "/file",
    method: "GET",
    handler: httpAction(async (ctx, request) => {
        const { searchParams } = new URL(request.url);
        const storageId = searchParams.get("id")! as Id<"_storage">;
        const blob = await ctx.storage.get(storageId);
        if (blob === null) {
            return new Response("File not found", {
                status: 404,
            });
        }
        return new Response(blob);
    }),
});

http.route({
    path: "/get-info",
    method: "GET",
    handler: httpAction(async (ctx) => {
        const projects = await ctx.runQuery(api.projects.getInfoForApi);
        return new Response(JSON.stringify(projects));
    }),
});

export default http;

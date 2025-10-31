import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createUser = internalMutation({
    args: {
        clerkId: v.string(),
        name: v.string(),
        imageUrl: v.string(),
        primary_email_address_id: v.string(),
        email_addresses: v.array(v.object({ id: v.string(), email_address: v.string() })),
    },
    async handler(ctx, args) {
        const primaryEmail = args.email_addresses.find(
            email => email.id === args.primary_email_address_id)?.email_address ||
            args.email_addresses[0]?.email_address;
        const existingUser = await ctx.db.query('users').withIndex('by_email', q => q.eq('email', primaryEmail)).first();
        if (existingUser) {
            return ctx.db.patch(existingUser._id, {
                clerkId: args.clerkId,
                name: args.name,
                imageUrl: args.imageUrl,
                role: 'user',
                isActive: true,
                updatedAt: Date.now(),
            })
        }
        return ctx.db.insert('users', {
            clerkId: args.clerkId,
            email: primaryEmail,
            name: args.name,
            imageUrl: args.imageUrl,
            role: 'user',
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        })
    }
});

export const updateUser = internalMutation({
    args: {
        clerkId: v.string(),
        name: v.string(),
        imageUrl: v.string(),
        primary_email_address_id: v.string(),
        email_addresses: v.array(v.object({ id: v.string(), email_address: v.string() })),
    },
    async handler(ctx, args) {
        const primaryEmail = args.email_addresses.find(
            email => email.id === args.primary_email_address_id)?.email_address ||
            args.email_addresses[0]?.email_address;
        const user = await ctx.db.query('users').withIndex('by_clerk_id', q => q.eq('clerkId', args.clerkId)).first();
        if (!user) {
            return ctx.db.insert('users', {
                clerkId: args.clerkId,
                email: primaryEmail,
                name: args.name,
                imageUrl: args.imageUrl,
                role: 'user',
                isActive: true,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            })
        }
        return ctx.db.patch(user._id, {
            email: primaryEmail,
            role: 'user',
            name: args.name,
            imageUrl: args.imageUrl,
            updatedAt: Date.now(),
        })
    }
});

export const deleteUser = internalMutation({
    args: { clerkId: v.string() },
    async handler(ctx, args) {
        const user = await ctx.db.query('users').withIndex('by_clerk_id', q => q.eq('clerkId', args.clerkId)).first();
        if (!user) {
            return;
        }
        return ctx.db.patch(user._id, {
            role: 'user',
            isActive: false,
            updatedAt: Date.now(),
        });
    }
});

export const isAdmin = query(async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        console.log('No identity found');
        return false;
    }
    const user = await ctx.db.query('users').withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject)).first();
    console.log('=====')
    console.log(user?.role === 'admin');
    return user?.role === 'admin';
});

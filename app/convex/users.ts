import { internalMutation, mutation, query } from "./_generated/server";
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
        return false;
    }
    const user = await ctx.db.query('users').withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject)).first();
    return user?.role === 'admin';
});

export const getUsers = query({
    args: {
        searchString: v.string(),
        role: v.optional(v.union(v.literal('admin'), v.literal('user'), v.literal('vendor')))
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error('User not authenticated');
        }
        const user = await ctx.db.query('users').withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject)).first();
        if (!user) {
            throw new Error('User not found in database');
        }
        if (user.role !== 'admin') {
            throw new Error('User is not authorized to view users');
        }
        const searchString = args.searchString.toLowerCase().trim();
        if (searchString === '') {
            if (args.role) {
                const role: 'admin' | 'user' | 'vendor' = args.role;
                return (await ctx.db
                    .query('users')
                    .withIndex('by_role', q => q.eq('role', role))
                    .collect());
            }
            return await ctx.db.query('users').collect();
        }
        const users = (await ctx.db.query('users').collect()).filter(user => {
            const matchesText = user.name.toLowerCase().includes(searchString) || user.email.toLowerCase().includes(searchString);
            const matchesRole = args.role ? user.role === args.role : true;
            return matchesText && matchesRole;
        });
        return users;
    }
});

export const updateUserMetadata = mutation({
    args: {
        _id: v.id('users'),
        isActive: v.boolean(),
        role: v.union(v.literal('admin'), v.literal('user'), v.literal('vendor')),
    },
    async handler(ctx, args) {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error('User not authenticated');
        }
        const user = await ctx.db
            .query('users')
            .withIndex('by_clerk_id', q => q.eq('clerkId', identity.subject))
            .first();
        if (!user) {
            throw new Error('User not found in database');
        }
        if (user.role !== 'admin') {
            throw new Error('User is not authorized to update user metadata');
        }
        return ctx.db.patch(args._id, {
            isActive: args.isActive,
            role: args.role,
            updatedAt: Date.now(),
        });
    }
});

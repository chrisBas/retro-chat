import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

export const listChats = query({
  args: {},
  handler: async (ctx) => {
    const email = (await ctx.auth.getUserIdentity())?.email;
    if (!email) {
      throw new ConvexError("Unauthorized");
    }
    const chats = await ctx.db.query("chats").collect();
    return {
      chats: chats
        .filter((chat) => chat.members.indexOf(email) >= 0)
        .map((chat) => chat.name),
      email: (await ctx.auth.getUserIdentity())?.email ?? null,
    };
  },
});

export const getChat = query({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const email = (await ctx.auth.getUserIdentity())?.email;
    if (!email) {
      throw new ConvexError("Unauthorized");
    }
    const chats = (await ctx.db.query("chats").collect())
      .filter((chat) => chat.name === args.name)
      .filter((chat) => chat.members.indexOf(email) >= 0);
    if (chats.length == 0) {
      throw new ConvexError("Chat does not exists");
    }
    return chats[0];
  },
});

export const addMemberToChat = mutation({
  args: {
    name: v.string(),
    member: v.string(),
  },
  handler: async (ctx, args) => {
    const createdBy = (await ctx.auth.getUserIdentity())?.email;
    if (!createdBy) {
      throw new ConvexError("Unauthorized");
    }
    const chatsWithSameName = await ctx.db
      .query("chats")
      .filter((q) => q.eq(q.field("name"), args.name))
      .collect();
    if (chatsWithSameName.length == 0) {
      throw new ConvexError("Chat does not exist");
    }
    if (chatsWithSameName[0].createdBy !== createdBy) {
      // this user is not the creator of the chat
      throw new ConvexError("Unauthorized, user does not own the chat");
    }
    ctx.db.patch(chatsWithSameName[0]._id, {
      members: [...chatsWithSameName[0].members, args.member],
    });
  },
});

export const addMessageToChat = mutation({
  args: {
    name: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const createdBy = (await ctx.auth.getUserIdentity())?.email;
    if (!createdBy) {
      throw new ConvexError("Unauthorized");
    }
    const chatsWithSameName = await ctx.db
      .query("chats")
      .filter((q) => q.eq(q.field("name"), args.name))
      .collect();
    if (chatsWithSameName.length == 0) {
      throw new ConvexError("Chat does not exist");
    }
    ctx.db.patch(chatsWithSameName[0]._id, {
      messages: [
        ...chatsWithSameName[0].messages,
        { sender: createdBy, msg: args.message },
      ],
    });
  },
});

export const createChat = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const createdBy = (await ctx.auth.getUserIdentity())?.email;
    if (!createdBy) {
      throw new ConvexError("Unauthorized");
    }
    const chatsWithSameName = await ctx.db
      .query("chats")
      .filter((q) => q.eq(q.field("name"), args.name))
      .collect();
    if (chatsWithSameName.length > 0) {
      throw new ConvexError("Chat with this name already exists");
    }
    ctx.db.insert("chats", {
      name: args.name,
      createdBy,
      messages: [],
      members: [createdBy],
    });
  },
});

export const deleteChat = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const createdBy = (await ctx.auth.getUserIdentity())?.email;
    if (!createdBy) {
      throw new ConvexError("Unauthorized");
    }
    const chatsWithSameName = await ctx.db
      .query("chats")
      .filter((q) => q.eq(q.field("name"), args.name))
      .collect();
    if (chatsWithSameName.length == 0) {
      throw new ConvexError("Chat does not exists");
    }
    if (chatsWithSameName[0].createdBy !== createdBy) {
      // this user is not the creator of the chat
      throw new ConvexError("Unauthorized, user does not own the chat");
    }
    ctx.db.delete(chatsWithSameName[0]._id);
  },
});

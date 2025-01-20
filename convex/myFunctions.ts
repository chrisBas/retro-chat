import { ConvexError, v } from "convex/values";
import { api } from "./_generated/api";
import { action, mutation, query } from "./_generated/server";

// Write your Convex functions in any file inside this directory (`convex`).
// See https://docs.convex.dev/functions for more.

// You can read data from the database via a query:
export const listNumbers = query({
  // Validators for arguments.
  args: {
    count: v.number(),
  },

  // Query implementation.
  handler: async (ctx, args) => {
    //// Read the database as many times as you need here.
    //// See https://docs.convex.dev/database/reading-data.
    const numbers = await ctx.db
      .query("numbers")
      // Ordered by _creationTime, return most recent
      .order("desc")
      .take(args.count);
    return {
      email: (await ctx.auth.getUserIdentity())?.email ?? null,
      viewer: (await ctx.auth.getUserIdentity())?.name ?? null,
      numbers: numbers.toReversed().map((number) => number.value),
    };
  },
});

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

// You can write data to the database via a mutation:
export const addNumber = mutation({
  // Validators for arguments.
  args: {
    value: v.number(),
  },

  // Mutation implementation.
  handler: async (ctx, args) => {
    //// Insert or modify documents in the database here.
    //// Mutations can also read from the database like queries.
    //// See https://docs.convex.dev/database/writing-data.

    const id = await ctx.db.insert("numbers", { value: args.value });

    console.log("Added new document with id:", id);
    // Optionally, return a value from your mutation.
    // return id;
  },
});

// You can fetch data from and send data to third-party APIs via an action:
export const myAction = action({
  // Validators for arguments.
  args: {
    first: v.number(),
    second: v.string(),
  },

  // Action implementation.
  handler: async (ctx, args) => {
    //// Use the browser-like `fetch` API to send HTTP requests.
    //// See https://docs.convex.dev/functions/actions#calling-third-party-apis-and-using-npm-packages.
    // const response = await ctx.fetch("https://api.thirdpartyservice.com");
    // const data = await response.json();

    //// Query data by running Convex queries.
    const data = await ctx.runQuery(api.myFunctions.listNumbers, {
      count: 10,
    });
    console.log(data);

    //// Write data by running Convex mutations.
    await ctx.runMutation(api.myFunctions.addNumber, {
      value: args.first,
    });
  },
});

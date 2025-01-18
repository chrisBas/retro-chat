import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { createRef, useEffect } from "react";
import "./ChatCard.css";

export function ChatCard() {
  // TODO: change this to chat feed, just used here for now to get email for ChatInput
  const { email } =
    useQuery(api.myFunctions.listNumbers, {
      count: 10,
    }) ?? {};

  return (
    <div className="border-2 border-black p-4 bg-slate-950">
      <ChatFeed />
      <ChatInput user={email || ""} />
    </div>
  );
}

function ChatFeed() {
  const mockChatFeed = [
    { from: "user1", message: "hello" },
    {
      from: "terminal",
      message:
        "Type 'help' for a list of commands\nFor example, 'help' or 'help <command>'",
    },
  ];
  return (
    <div className="flex flex-col">
      {mockChatFeed.map((chat, index) => (
        <div key={index}>
          <div className="text-green-200 flex justify-end">{chat.from}</div>
          {chat.message.split("\n").map((line, i) => (
            <div key={i} className="text-white">
              {line}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function ChatInput({ user }: { user: string }) {
  // TODO: .cursor class below is to show blinking on input focus - it is a placeholder for how it should be, but it doesnt work properly yet as you type
  // FYI: caret-color: rgba(0, 0, 0, 0); is the prop that removed the previous blinking
  const iRef = createRef<HTMLInputElement>();

  // TODO: this is to focus on init load - but autofocus should automatically do this, need to figure out why its not
  useEffect(() => {
    iRef.current?.focus();
  }, [iRef]);

  return (
    <div className="flex">
      <div className="text-green-500">{user}:</div>
      <div className="cursor w-full">
        <input
          ref={iRef}
          type="text"
          className="w-full border-none outline-none bg-slate-950"
          autoFocus
        />
        <i></i>
      </div>
    </div>
  );
}

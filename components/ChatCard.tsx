import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { ReactElement, useState } from "react";
import { ReactTerminal, TerminalContextProvider } from "react-terminal";
import "./ChatCard.css";

/**
 * See Docs for React Terminal: https://www.npmjs.com/package/react-terminal
 */
export function ChatCard() {
  // TODO: change this to chat feed, just used here for now to get email for ChatInput
  const { email } =
    useQuery(api.myFunctions.listNumbers, {
      count: 10,
    }) ?? {};
  const [path, setPath] = useState("/");
  const [chats, setChats] = useState<string[]>([]);
  const commands: {
    command: string;
    fn: (...args: string[]) => ReactElement | undefined;
    description: string;
  }[] = [
    {
      command: "help",
      description: "",
      fn: () => {
        return (
          <span>
            {commands
              .filter(({ command }) => command != "help")
              .map(({ command, description }, i) => {
                return (
                  <span key={command}>
                    <strong>{command}</strong>
                    <span> - {description}</span>
                    {i < commands.length - 2 && <br />}
                  </span>
                );
              })}
          </span>
        );
      },
    },
    {
      command: "pwd",
      description:
        "Prints the current working directory (which is the current chat)",
      fn: () => <span>{path}</span>,
    },
    {
      command: "cd <DIR>",
      description:
        "Changes the current working directory to <DIR> (which is a chat)",
      fn: (dir: string) => {
        if (dir === ".." || dir === "/") {
          if (path !== "/") {
            setPath("/");
          }
        } else {
          const realDir = dir.startsWith("/")
            ? dir.replaceAll(new RegExp("^/", "g"), "")
            : dir;
          if (chats.indexOf(realDir) !== -1) {
            setPath(realDir);
          }
        }
        return undefined;
      },
    },
    {
      command: "ls",
      description:
        "Lists the contents of the current directory (which is a list of chats)",
      fn: () => {
        if (path === "/") {
          if (chats.length === 0) {
            return undefined;
          }
          return <span>{chats.join(" ")}</span>;
        } else {
          // in a chat
          // TODO: return a list of people in the chat
          return undefined;
        }
      },
    },
    {
      command: "mkdir <DIR>",
      description: "Creates a new chat with the name <DIR>",
      fn: (dir: string) => {
        if (!chats.includes(dir)) {
          setChats((old) => [...old, dir]);
        } else {
          return (
            <span>{`mkdir: cannot create directory "${dir}": Chat exists`}</span>
          );
        }
        return undefined;
      },
    },
    {
      command: "rmdir <DIR>",
      description: "Removes the chat <DIR>",
      fn: (dir: string) => {
        if (chats.includes(dir)) {
          setChats((old) => old.filter((chat) => chat !== dir));
          return undefined;
        } else {
          return (
            <span>{`rmdir: failed to remove "${dir}": No such chat`}</span>
          );
        }
      },
    },
  ];

  return (
    <TerminalContextProvider>
      <ReactTerminal
        welcomeMessage={
          <span>
            <span>{"Welcome to Retro Chat!"}</span>
            <br />
            <span>{"Type 'help' to see available commands."}</span>
            <br />
            <br />
          </span>
        }
        commands={commands.reduce(
          (
            acc: Record<
              string,
              (...args: string[]) => ReactElement | undefined
            >,
            { command, fn }
          ) => {
            // remove any params in the command (like 'cd <DIR>' changes to 'cd')
            const formattedCommand = command
              .replaceAll(new RegExp("<.*>", "g"), "")
              .replaceAll(new RegExp("\\s+$", "g"), "");
            acc[formattedCommand] = fn;
            return acc;
          },
          {}
        )}
        prompt={
          <span>
            <span>{email}</span>
            <span>:</span>
            <span>{path}</span>
            <span>$</span>
          </span>
        }
      />
    </TerminalContextProvider>
  );
}

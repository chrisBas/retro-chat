import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { ReactElement, useState } from "react";
import { ReactTerminal, TerminalContextProvider } from "react-terminal";
import "./ChatCard.css";

/**
 * See Docs for React Terminal: https://www.npmjs.com/package/react-terminal
 */
export function ChatCard() {
  const [path, setPath] = useState("/");

  // global hooks
  const createChat = useMutation(api.myFunctions.createChat);
  const deleteChat = useMutation(api.myFunctions.deleteChat);
  const addMemberToChat = useMutation(api.myFunctions.addMemberToChat);
  const addMessageToChat = useMutation(api.myFunctions.addMessageToChat);
  const { chats, email } = useQuery(api.myFunctions.listChats) ?? {
    chats: [],
    email: null,
  };
  const chat = useQuery(
    api.myFunctions.getChat,
    path === "/" ? "skip" : { name: path }
  );

  // local vars
  const commands: {
    command: string;
    fn: (...args: string[]) => Promise<ReactElement | undefined>;
    description: string;
  }[] = [
    {
      command: "help",
      description: "",
      fn: async () => {
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
      fn: async () => <span>{path}</span>,
    },
    {
      command: "cd <DIR>",
      description:
        "Changes the current working directory to <DIR> (which is a chat)",
      fn: async (dir: string) => {
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
      fn: async () => {
        if (path === "/") {
          if (chats.length === 0) {
            return undefined;
          }
          return <span className="special-text">{chats.join(" ")}</span>;
        } else {
          // in a chat
          return <span>{chat.members.join(" ")}</span>;
        }
      },
    },
    {
      command: "history",
      description: "Lists the history of the current chat",
      fn: async () => {
        if (path === "/") {
          return undefined;
        } else {
          // in a chat
          const messages: { sender: string; msg: string }[] =
            chat?.messages || [];
          if (messages.length === 0) {
            return undefined;
          }
          return (
            <span>
              {messages.map(({ sender, msg }, i) => {
                return (
                  <span key={i}>
                    <span className="special-text">{sender}</span>
                    <span className="default-text">: </span>
                    <span>{msg}</span>
                    {i < messages.length - 1 && <br />}
                  </span>
                );
              })}
            </span>
          );
        }
      },
    },
    {
      command: "msg <MESSAGE>",
      description: "Sends a message to the current chat",
      fn: async (message: string) => {
        if (path === "/") {
          return undefined;
        } else {
          if (chat) {
            // in chat
            return addMessageToChat({ name: path, message })
              .then(() => {
                return undefined;
              })
              .catch((e) => {
                console.error(e);
                return (
                  <span>{`msg <MESSAGE>: failed to add message "${message}" to chat ${path}`}</span>
                );
              });
          }
          // TODO: handle error
        }
        return undefined;
      },
    },
    {
      command: "touch <FILE>",
      description: "Adds a member to the current chat",
      fn: async (file: string) => {
        if (path === "/") {
          return undefined;
        } else {
          if (chat) {
            // in chat
            return addMemberToChat({ name: path, member: file })
              .then(() => {
                return undefined;
              })
              .catch((e) => {
                console.error(e);
                return (
                  <span>{`touch <FILE>: failed to add member "${file}" to chat ${path}`}</span>
                );
              });
          }
          // TODO: handle error
        }
        return undefined;
      },
    },
    {
      command: "mkdir <DIR>",
      description: "Creates a new chat with the name <DIR>",
      fn: async (dir: string) => {
        return createChat({ name: dir })
          .then(() => {
            return undefined;
          })
          .catch((e) => {
            console.error(e);
            return (
              <span>{`mkdir: cannot create directory "${dir}": Chat exists`}</span>
            );
          });
      },
    },
    {
      command: "rmdir <DIR>",
      description: "Removes the chat <DIR>",
      fn: async (dir: string) => {
        return deleteChat({ name: dir })
          .then(() => {
            return undefined;
          })
          .catch((e) => {
            console.error(e);
            return (
              <span>{`rmdir: failed to remove "${dir}": No such chat`}</span>
            );
          });
      },
    },
  ];

  return (
    <TerminalContextProvider>
      <ReactTerminal
        theme="dark"
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
              (...args: string[]) => Promise<ReactElement | undefined>
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
            <span className="colored-text">{email}</span>
            <span className="default-text">:</span>
            <span className="special-text">{path}</span>
            <span className="default-text">$</span>
          </span>
        }
      />
    </TerminalContextProvider>
  );
}

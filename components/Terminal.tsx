import { api } from "@/convex/_generated/api";
import useClickOutsideEvent from "@/hooks/useClickOutside";
import { useQuery } from "convex/react";
import { createRef, MouseEventHandler, useEffect, useState } from "react";
import "./Terminal.css";

export function Terminal() {
  // TODO: change this to chat feed, just used here for now to get email for ChatInput
  const { email } =
    useQuery(api.myFunctions.listNumbers, {
      count: 10,
    }) ?? {};
  const path = "~";

  return (
    <div className="border-2 border-black bg-slate-950">
      <Editor user={email || ""} path={path} />
    </div>
  );
}

function Editor({ user, path }: { user: string; path: string }) {
  // refs
  const editorRef = createRef<HTMLInputElement>();

  // local state
  const [focus, setFocus] = useState(true);

  // local vars
  const handleEditorOnFocus: MouseEventHandler<HTMLDivElement> = () => {
    setFocus(true);
  };

  // events
  useClickOutsideEvent(editorRef, setFocus);
  // TODO: this is to focus on init load - but autofocus should automatically do this, need to figure out why its not
  useEffect(() => {
    editorRef.current?.focus();
  }, [editorRef]);

  return (
    <div
      ref={editorRef}
      className={"editor" + (focus ? " focus" : "")}
      onClick={handleEditorOnFocus}
    >
      <span className="user">{user}</span>
      <span>:</span>
      <span className="path">{path}</span>
      <span>$</span>
      <span></span>
      <span className="caret-wrapper">
        <span className="caret"></span>
      </span>
    </div>
  );
}

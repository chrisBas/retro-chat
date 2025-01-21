"use client";

import { RetroChatTerminal } from "@/components/RetroChatTerminal";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";

export default function Home() {
  return (
    <>
      <header className="text-3xl font-bold">
        Retro-Chat
        <SignInAndSignUpButtons />
      </header>
      <main>
        <h1>Retro-Chat</h1>
        <Authenticated>
          <RetroChatTerminal />
        </Authenticated>
        <Unauthenticated>
          <p>Click one of the buttons in the top right corner to sign in.</p>
        </Unauthenticated>
      </main>
    </>
  );
}

function SignInAndSignUpButtons() {
  return (
    <div>
      <Authenticated>
        <UserButton afterSignOutUrl="#" />
      </Authenticated>
      <Unauthenticated>
        <SignInButton mode="modal">
          <button>Sign in</button>
        </SignInButton>
        <SignUpButton mode="modal">
          <button>Sign up</button>
        </SignUpButton>
      </Unauthenticated>
    </div>
  );
}

import { redirect } from "next/navigation";
import { auth } from "../../../../lib/auth.js";
import { hasPermission } from "../../../../lib/permissions.js";
import ChatClient from "./ChatClient";

export default async function ChatPage() {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return (
    <ChatClient
      currentUser={{
        id: session.user.id,
        name: session.user.name,
        role: session.user.role,
      }}
    />
  );
}

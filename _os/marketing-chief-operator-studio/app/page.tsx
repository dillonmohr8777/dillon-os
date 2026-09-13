import seedSnapshot from "@/data/seed-snapshot.json";
import { StudioApp } from "./StudioApp";
import { isStudioOwner, requireChatGPTUser } from "./chatgpt-auth";
import type { StudioSnapshot } from "./studio-types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const user = await requireChatGPTUser("/");
  if (!isStudioOwner(user.email)) {
    return <main className="access-denied"><strong>Owner access required</strong><p>This operating surface is restricted to its configured owner.</p></main>;
  }
  return <StudioApp initialSnapshot={seedSnapshot as unknown as StudioSnapshot} owner={{ displayName: user.displayName, email: user.email }} />;
}

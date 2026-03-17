export const dynamic = "force-dynamic";
import { isS3Enabled } from "@/lib/s3.js";

export async function GET() {
  return Response.json({ enabled: isS3Enabled() });
}

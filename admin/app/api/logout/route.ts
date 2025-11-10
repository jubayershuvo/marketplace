import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = cookies();
  (await cookieStore).delete("adminToken");
  (await cookieStore).delete("adminRefreshToken");

  return Response.json({ success: true }, { status: 200 });
}

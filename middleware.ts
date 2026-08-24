import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isSupabaseConfigured } from "@/lib/env";

export async function middleware(request: NextRequest) {
  // Before the keys are filled in, let every request through so the app can
  // render a setup message rather than redirect-looping.
  if (!isSupabaseConfigured()) return NextResponse.next({ request });
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};

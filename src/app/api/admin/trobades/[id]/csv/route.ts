import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function cel(v: unknown) {
  let s = v == null ? "" : String(v);
  if (/^[=+\-@]/.test(s)) s = "'" + s; // evita injecció de fórmules a Excel
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new NextResponse("No autoritzat", { status: 401 });
  const { data: admin } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!admin) return new NextResponse("Prohibit", { status: 403 });

  const [{ data: t }, { data }] = await Promise.all([
    supabase.from("trobades").select("slug").eq("id", id).maybeSingle(),
    supabase.from("inscripcions").select("nom, email, modalitat, created_at").eq("trobada_id", id).order("created_at"),
  ]);
  if (!t) return new NextResponse("No trobada", { status: 404 });

  const files = [["Nom", "Correu", "Modalitat", "Data inscripció"], ...(data ?? []).map((i) => [i.nom, i.email, i.modalitat, i.created_at])];
  const csv = "﻿" + files.map((f) => f.map(cel).join(";")).join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inscripcions-${t.slug}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}

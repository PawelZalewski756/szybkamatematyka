import { resolveSeedMaterial } from "@/lib/trening/resolve-material";
import type { ExamType } from "@/types/database";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const examType = searchParams.get("examType") as ExamType | null;
  const category = searchParams.get("category");
  const topic = searchParams.get("topic");

  if (!examType || !category || !topic) {
    return NextResponse.json({ error: "Brak parametrów" }, { status: 400 });
  }

  const material = resolveSeedMaterial(examType, category, topic);

  if (!material) {
    return NextResponse.json({ material: null }, { status: 404 });
  }

  return NextResponse.json({ material });
}

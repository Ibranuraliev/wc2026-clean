import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Called by Vercel Cron at end of day to reveal correct answers
export async function POST(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const today = new Date().toISOString().split("T")[0];
  const { data: challenge } = await supabase
    .from("daily_challenges")
    .select("id, correct_option_id")
    .eq("active_date", today)
    .single();

  if (!challenge?.correct_option_id) {
    return NextResponse.json({ message: "No challenge or no answer set" });
  }

  // Update all submissions for today
  await supabase
    .from("daily_submissions")
    .update({ is_correct: false })
    .eq("challenge_id", challenge.id)
    .neq("option_id", challenge.correct_option_id);

  await supabase
    .from("daily_submissions")
    .update({ is_correct: true })
    .eq("challenge_id", challenge.id)
    .eq("option_id", challenge.correct_option_id);

  return NextResponse.json({ message: "Daily challenge resolved", date: today });
}

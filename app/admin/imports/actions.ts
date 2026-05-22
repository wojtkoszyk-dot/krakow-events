"use server";

import { revalidatePath } from "next/cache";
import { approveCandidate, rejectCandidate } from "@/lib/moderation";

export async function approveCandidateAction(candidateId: string) {
  await approveCandidate(candidateId);
  revalidatePath("/admin/imports");
}

export async function rejectCandidateAction(candidateId: string) {
  await rejectCandidate(candidateId);
  revalidatePath("/admin/imports");
}

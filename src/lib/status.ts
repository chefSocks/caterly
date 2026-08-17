import type { BadgeTone } from "@/components/ui";

export const statusTone: Record<string, BadgeTone> = {
  PROSPECTIVE: "slate",
  TENTATIVE: "amber",
  DEFINITE: "green",
  COMPLETED: "blue",
  CANCELLED: "red",
};

export const paymentMethodLabel: Record<string, string> = {
  CASH: "Cash",
  CHECK: "Check",
  CARD: "Card",
  ACH: "ACH / e-transfer",
  OTHER: "Other",
};

export const leadTone: Record<string, BadgeTone> = {
  NEW: "blue",
  CONTACTED: "amber",
  PROPOSAL_SENT: "amber",
  WON: "green",
  LOST: "red",
};

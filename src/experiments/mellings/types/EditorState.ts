export type Selection =
  | { kind: "platform"; index: number }
  | { kind: "start" }
  | { kind: "goal" }
  | null;

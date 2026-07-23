export type RiderLevel = "A" | "B" | "C" | "D" | "E" | "F";

export function batchToLevel(batch: number): RiderLevel {
  switch (batch) {
    case 1:
      return "A";

    case 2:
      return "B";

    case 3:
      return "C";

    case 4:
      return "D";

    case 5:
      return "E";

    case 6:
      return "F";

    default:
      return "F";
  }
}

export function levelToBatch(level: RiderLevel): number {
  switch (level) {
    case "A":
      return 1;

    case "B":
      return 2;

    case "C":
      return 3;

    case "D":
      return 4;

    case "E":
      return 5;

    case "F":
      return 6;
  }
}

export function isTopLevel(level: RiderLevel) {
  return level === "A";
}

export function isLowestLevel(level: RiderLevel) {
  return level === "F";
}
import { RiderLevel } from "./levelCalculator";

const BONUS = {
  A: 2.6,
  B: 2,
  C: 1.5,
  D: 1,
  E: 0.5,
  F: 0,
};

export function getQualityBonusPerOrder(level: RiderLevel) {
  return BONUS[level];
}

export function calculateQualityBonus(
  completedOrders: number,
  level: RiderLevel
) {
  return completedOrders * BONUS[level];
}
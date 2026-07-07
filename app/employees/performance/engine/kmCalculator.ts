export type KmCalculationResult = {
  totalKm: number;
  payableKm: number;
  averageKmPerOrder: number;
};

export function calculateAverageKm(
  totalKm: number,
  completedOrders: number
): number {
  if (completedOrders <= 0) return 0;

  return Number((totalKm / completedOrders).toFixed(2));
}

export function calculatePayableKm(
  totalKm: number,
  freeKm: number = 0
): number {
  return Math.max(totalKm - freeKm, 0);
}

export function calculateKmResult(
  totalKm: number,
  completedOrders: number,
  freeKm: number = 0
): KmCalculationResult {
  return {
    totalKm,
    payableKm: calculatePayableKm(totalKm, freeKm),
    averageKmPerOrder: calculateAverageKm(totalKm, completedOrders),
  };
}

export function isHighAverageKm(
  averageKmPerOrder: number,
  limit: number = 8
) {
  return averageKmPerOrder >= limit;
}

export function isLowAverageKm(
  averageKmPerOrder: number,
  limit: number = 4
) {
  return averageKmPerOrder <= limit;
}
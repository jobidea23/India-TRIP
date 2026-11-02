import type { FareSettings, FareBreakdown, VehicleCategory } from "@/types";

export function calculateFare(
  settings: FareSettings,
  category: VehicleCategory,
  distanceKm: number,
  durationMin: number,
  waitingMin = 0,
  isNight = false,
  discount = 0
): FareBreakdown {
  const cfg = settings[category];
  const baseFare = cfg.baseFare;
  const distanceCharge = cfg.perKm * distanceKm;
  const timeCharge = cfg.perMin * durationMin;
  const waitingCharge = (settings.waitingPerMin || 0) * waitingMin;
  let subtotal = baseFare + distanceCharge + timeCharge + waitingCharge;
  if (isNight) subtotal *= settings.nightMultiplier || 1;
  const nightCharge = isNight ? subtotal - (baseFare + distanceCharge + timeCharge + waitingCharge) : 0;
  const totalBeforeDiscount = Math.max(cfg.minFare, subtotal);
  const disc = Math.min(discount, totalBeforeDiscount);
  const total = Math.round(totalBeforeDiscount - disc);
  const commission = Math.round((total * (settings.platformCommissionPct || 0)) / 100);
  const driverEarnings = total - commission;
  return {
    baseFare: Math.round(baseFare),
    distanceCharge: Math.round(distanceCharge),
    timeCharge: Math.round(timeCharge),
    waitingCharge: Math.round(waitingCharge),
    nightCharge: Math.round(nightCharge),
    subtotal: Math.round(totalBeforeDiscount),
    discount: Math.round(disc),
    total,
    commission,
    driverEarnings,
  };
}

export function estimateDuration(distanceKm: number, category: VehicleCategory) {
  const speed = category === "bike" ? 25 : category === "auto" ? 22 : 30; // km/h avg city
  return Math.max(3, Math.round((distanceKm / speed) * 60));
}

export function isNightTime() {
  const h = new Date().getHours();
  return h >= 22 || h < 6;
}

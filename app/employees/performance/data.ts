import { HungerRow, KeetaRow } from "./types";

export const hungerRows: HungerRow[] = [
  {
    id: 4599496,
    name: "Ahmed Mohamed",
    batchNumber: 1,
    completedDeliveries: 456,

    workingDays: 28,
    inReport: true,

    attendanceRate: 96,
    acceptanceRate: 94,
    contactRate: 98,
    noShowPercent: 2,
    workingHours: 72,
    totalKm: 2420,
    payableKm: 1980,
    avgKm: 5.3,
  },
  {
    id: 4599480,
    name: "Mohamed Ali",
    batchNumber: 2,
    completedDeliveries: 398,

    workingDays: 27,
    inReport: true,

    attendanceRate: 95,
    acceptanceRate: 92,
    contactRate: 97,
    noShowPercent: 3,
    workingHours: 65,
    totalKm: 2100,
    payableKm: 1735,
    avgKm: 5.2,
  },
  {
    id: 4599462,
    name: "Saeed Al-Shahrani",
    batchNumber: 3,
    completedDeliveries: 356,

    workingDays: 26,
    inReport: true,

    attendanceRate: 93,
    acceptanceRate: 88,
    contactRate: 96,
    noShowPercent: 4,
    workingHours: 60,
    totalKm: 1985,
    payableKm: 1550,
    avgKm: 5.6,
  },
  {
    id: 4552582,
    name: "Nasser Al-Mutairi",
    batchNumber: 6,
    completedDeliveries: 58,

    workingDays: 14,
    inReport: true,

    attendanceRate: 70,
    acceptanceRate: 65,
    contactRate: 82,
    noShowPercent: 22,
    workingHours: 35,
    totalKm: 620,
    payableKm: 410,
    avgKm: 10.7,
  },
];

export const keetaRows: KeetaRow[] = [
  {
    id: 101,
    name: "Ahmed Mohamed",
    orders: 420,
    validDays: 26,
    onTime: 99,
    acceptance: 96,
    status: "valid",
  },
  {
    id: 102,
    name: "Mohamed Ali",
    orders: 350,
    validDays: 26,
    onTime: 97,
    acceptance: 94,
    status: "valid",
  },
  {
    id: 103,
    name: "Nasser Al-Mutairi",
    orders: 120,
    validDays: 14,
    onTime: 72,
    acceptance: 70,
    status: "invalid",
  },
];
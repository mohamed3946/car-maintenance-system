/* ===========================================================
   Employee Types
   DeliveryOS ERP
=========================================================== */

export type EmployeeStatus =
  | "active"
  | "inactive"
  | "suspended"
  | "vacation"
  | "terminated";

export type EmployeeType =
  | "courier"
  | "employee";

export type Gender =
  | "male"
  | "female";

export type EmploymentType =
  | "full-time"
  | "part-time"
  | "contract"
  | "temporary";

export interface Employee {

  /* =============================
     Basic
  ============================== */

  id: string;

  employeeNumber: string;

  firstNameAr: string;
  middleNameAr?: string;
  lastNameAr: string;

  firstNameEn: string;
  middleNameEn?: string;
  lastNameEn: string;

  photo?: string;

  gender: Gender;

  nationality: string;

  birthDate?: string;

  phone: string;

  email?: string;

  iqamaNumber: string;

  iqamaExpiry?: string;

  passportNumber?: string;

  passportExpiry?: string;

  /* =============================
     Work
  ============================== */

  employeeType: EmployeeType;

  jobTitleId: string;

  departmentId: string;

  branchId: string;

  managerId?: string;

  employmentType: EmploymentType;

  joiningDate: string;

  probationEndDate?: string;

  status: EmployeeStatus;

  notes?: string;

  /* =============================
     Payroll
  ============================== */

  baseSalary?: number;

  bankName?: string;

  iban?: string;

  paymentMethod?: "cash" | "bank";

  /* =============================
     System
  ============================== */

  createdAt: string;

  updatedAt: string;
}

export interface EmployeeApplication {

  id: string;

  employeeId: string;

  applicationId: string;

  riderId: string;

  active: boolean;

  joinedAt: string;

  leftAt?: string;

}

export interface EmployeeDocument {

  id: string;

  employeeId: string;

  type: string;

  fileUrl: string;

  expiryDate?: string;

}

export interface EmployeeAsset {

  id: string;

  employeeId: string;

  assetType: string;

  assetName: string;

  serialNumber?: string;

  assignedAt: string;

  returnedAt?: string;

}

export interface EmployeeEmergencyContact {

  id: string;

  employeeId: string;

  name: string;

  relation: string;

  phone: string;

}
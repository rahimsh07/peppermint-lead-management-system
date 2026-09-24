export type LeadCategory =
  | "Innerwear"
  | "Sportswear"
  | "Comfortwear"
  | "Fabric"
  | "Accessories"
  | "OEM/ODM"

export type LeadStatus =
  | "New"
  | "Contacted"
  | "Follow-up"
  | "Converted"
  | "Not Interested"

export interface Lead {
  id: string
  name: string
  company: string
  mobile: string
  email: string
  category: LeadCategory
  status: LeadStatus
  followUpDate?: string // YYYY-MM-DD
}

export type LeadStats = {
  totalLeads: number
  newLeads: number
  followUps: number
  convertedLeads: number
  dailyLeads: { name: string; leads: number }[]  // last 7 days, Mon..Sun
}

export type LeadFormData = Omit<Lead, "id">

export const CATEGORIES: LeadCategory[] = [
  "Innerwear",
  "Sportswear",
  "Comfortwear",
  "Fabric",
  "Accessories",
  "OEM/ODM",
]

export const STATUSES: LeadStatus[] = [
  "New",
  "Contacted",
  "Follow-up",
  "Converted",
  "Not Interested",
]

export const dummyLeads: Lead[] = [
  {
    id: "1",
    name: "Aarav Patel",
    company: "StyleKnit Apparels",
    mobile: "9876543210",
    email: "aarav@styleknit.com",
    category: "Innerwear",
    status: "New",
    followUpDate: "2026-09-26",
  },
  {
    id: "2",
    name: "Ishani Mehta",
    company: "ActiveWear Co.",
    mobile: "9123456789",
    email: "ishani@activewear.co",
    category: "Sportswear",
    status: "Follow-up",
    followUpDate: "2026-09-25",
  },
  {
    id: "3",
    name: "Rohan Gupta",
    company: "ComfortZone",
    mobile: "9988776655",
    email: "rohan@comfortzone.in",
    category: "Comfortwear",
    status: "Converted",
  },
  {
    id: "4",
    name: "Neha Singh",
    company: "FabricHub",
    mobile: "9871234560",
    email: "neha@fabrichub.com",
    category: "Fabric",
    status: "Contacted",
    followUpDate: "2026-09-27",
  },
  {
    id: "5",
    name: "Vikram Joshi",
    company: "OEM Solutions",
    mobile: "9123498765",
    email: "vikram@oemsolutions.com",
    category: "OEM/ODM",
    status: "Not Interested",
  },
]
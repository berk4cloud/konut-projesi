/**
 * Demo Data for Platform-First Multi-Tenant SaaS
 * 
 * Hierarchy:
 * - Platform Admin (ARPDO team)
 * - Tenants (Customer companies: Cova, Apple, OneFlex)
 * - Tenant Users (Each tenant's owner + users)
 * - Workers (Federated model)
 */

import type { 
  PlatformAdmin, 
  InsertPlatformAdmin,
  Tenant,
  InsertTenant,
  User,
  InsertUser,
  Country,
  InsertCountry
} from "@shared/schema";
import { randomUUID } from "crypto";

// ============================================
// COUNTRIES (Global Reference Data)
// ============================================

export const demoCountries: Country[] = [
  { isoCode: "DE", nameTr: "Almanya", nameEn: "Germany", nameDe: "Deutschland", nameNl: "Duitsland", nameFr: "Allemagne", namePl: "Niemcy", nameBg: "Германия", flagEmoji: "🇩🇪", phoneCode: "+49", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "NL", nameTr: "Hollanda", nameEn: "Netherlands", nameDe: "Niederlande", nameNl: "Nederland", nameFr: "Pays-Bas", namePl: "Holandia", nameBg: "Холандия", flagEmoji: "🇳🇱", phoneCode: "+31", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "TR", nameTr: "Türkiye", nameEn: "Turkey", nameDe: "Türkei", nameNl: "Turkije", nameFr: "Turquie", namePl: "Turcja", nameBg: "Турция", flagEmoji: "🇹🇷", phoneCode: "+90", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "PL", nameTr: "Polonya", nameEn: "Poland", nameDe: "Polen", nameNl: "Polen", nameFr: "Pologne", namePl: "Polska", nameBg: "Полша", flagEmoji: "🇵🇱", phoneCode: "+48", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "FR", nameTr: "Fransa", nameEn: "France", nameDe: "Frankreich", nameNl: "Frankrijk", nameFr: "France", namePl: "Francja", nameBg: "Франция", flagEmoji: "🇫🇷", phoneCode: "+33", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "BE", nameTr: "Belçika", nameEn: "Belgium", nameDe: "Belgien", nameNl: "België", nameFr: "Belgique", namePl: "Belgia", nameBg: "Белгия", flagEmoji: "🇧🇪", phoneCode: "+32", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "AT", nameTr: "Avusturya", nameEn: "Austria", nameDe: "Österreich", nameNl: "Oostenrijk", nameFr: "Autriche", namePl: "Austria", nameBg: "Австрия", flagEmoji: "🇦🇹", phoneCode: "+43", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "CH", nameTr: "İsviçre", nameEn: "Switzerland", nameDe: "Schweiz", nameNl: "Zwitserland", nameFr: "Suisse", namePl: "Szwajcaria", nameBg: "Швейцария", flagEmoji: "🇨🇭", phoneCode: "+41", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "GB", nameTr: "Birleşik Krallık", nameEn: "United Kingdom", nameDe: "Vereinigtes Königreich", nameNl: "Verenigd Koninkrijk", nameFr: "Royaume-Uni", namePl: "Wielka Brytania", nameBg: "Обединено кралство", flagEmoji: "🇬🇧", phoneCode: "+44", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "IE", nameTr: "İrlanda", nameEn: "Ireland", nameDe: "Irland", nameNl: "Ierland", nameFr: "Irlande", namePl: "Irlandia", nameBg: "Ирландия", flagEmoji: "🇮🇪", phoneCode: "+353", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "ES", nameTr: "İspanya", nameEn: "Spain", nameDe: "Spanien", nameNl: "Spanje", nameFr: "Espagne", namePl: "Hiszpania", nameBg: "Испания", flagEmoji: "🇪🇸", phoneCode: "+34", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "IT", nameTr: "İtalya", nameEn: "Italy", nameDe: "Italien", nameNl: "Italië", nameFr: "Italie", namePl: "Włochy", nameBg: "Италия", flagEmoji: "🇮🇹", phoneCode: "+39", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "PT", nameTr: "Portekiz", nameEn: "Portugal", nameDe: "Portugal", nameNl: "Portugal", nameFr: "Portugal", namePl: "Portugalia", nameBg: "Португалия", flagEmoji: "🇵🇹", phoneCode: "+351", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "RO", nameTr: "Romanya", nameEn: "Romania", nameDe: "Rumänien", nameNl: "Roemenië", nameFr: "Roumanie", namePl: "Rumunia", nameBg: "Румъния", flagEmoji: "🇷🇴", phoneCode: "+40", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "BG", nameTr: "Bulgaristan", nameEn: "Bulgaria", nameDe: "Bulgarien", nameNl: "Bulgarije", nameFr: "Bulgarie", namePl: "Bułgaria", nameBg: "България", flagEmoji: "🇧🇬", phoneCode: "+359", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "GR", nameTr: "Yunanistan", nameEn: "Greece", nameDe: "Griechenland", nameNl: "Griekenland", nameFr: "Grèce", namePl: "Grecja", nameBg: "Гърция", flagEmoji: "🇬🇷", phoneCode: "+30", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "CZ", nameTr: "Çekya", nameEn: "Czech Republic", nameDe: "Tschechien", nameNl: "Tsjechië", nameFr: "République tchèque", namePl: "Czechy", nameBg: "Чехия", flagEmoji: "🇨🇿", phoneCode: "+420", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "HU", nameTr: "Macaristan", nameEn: "Hungary", nameDe: "Ungarn", nameNl: "Hongarije", nameFr: "Hongrie", namePl: "Węgry", nameBg: "Унгария", flagEmoji: "🇭🇺", phoneCode: "+36", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "SK", nameTr: "Slovakya", nameEn: "Slovakia", nameDe: "Slowakei", nameNl: "Slowakije", nameFr: "Slovaquie", namePl: "Słowacja", nameBg: "Словакия", flagEmoji: "🇸🇰", phoneCode: "+421", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "SI", nameTr: "Slovenya", nameEn: "Slovenia", nameDe: "Slowenien", nameNl: "Slovenië", nameFr: "Slovénie", namePl: "Słowenia", nameBg: "Словения", flagEmoji: "🇸🇮", phoneCode: "+386", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "HR", nameTr: "Hırvatistan", nameEn: "Croatia", nameDe: "Kroatien", nameNl: "Kroatië", nameFr: "Croatie", namePl: "Chorwacja", nameBg: "Хърватия", flagEmoji: "🇭🇷", phoneCode: "+385", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "RS", nameTr: "Sırbistan", nameEn: "Serbia", nameDe: "Serbien", nameNl: "Servië", nameFr: "Serbie", namePl: "Serbia", nameBg: "Сърбия", flagEmoji: "🇷🇸", phoneCode: "+381", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "DK", nameTr: "Danimarka", nameEn: "Denmark", nameDe: "Dänemark", nameNl: "Denemarken", nameFr: "Danemark", namePl: "Dania", nameBg: "Дания", flagEmoji: "🇩🇰", phoneCode: "+45", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "SE", nameTr: "İsveç", nameEn: "Sweden", nameDe: "Schweden", nameNl: "Zweden", nameFr: "Suède", namePl: "Szwecja", nameBg: "Швеция", flagEmoji: "🇸🇪", phoneCode: "+46", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "NO", nameTr: "Norveç", nameEn: "Norway", nameDe: "Norwegen", nameNl: "Noorwegen", nameFr: "Norvège", namePl: "Norwegia", nameBg: "Норвегия", flagEmoji: "🇳🇴", phoneCode: "+47", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "FI", nameTr: "Finlandiya", nameEn: "Finland", nameDe: "Finnland", nameNl: "Finland", nameFr: "Finlande", namePl: "Finlandia", nameBg: "Финландия", flagEmoji: "🇫🇮", phoneCode: "+358", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "UA", nameTr: "Ukrayna", nameEn: "Ukraine", nameDe: "Ukraine", nameNl: "Oekraïne", nameFr: "Ukraine", namePl: "Ukraina", nameBg: "Украйна", flagEmoji: "🇺🇦", phoneCode: "+380", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "LT", nameTr: "Litvanya", nameEn: "Lithuania", nameDe: "Litauen", nameNl: "Litouwen", nameFr: "Lituanie", namePl: "Litwa", nameBg: "Литва", flagEmoji: "🇱🇹", phoneCode: "+370", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "LV", nameTr: "Letonya", nameEn: "Latvia", nameDe: "Lettland", nameNl: "Letland", nameFr: "Lettonie", namePl: "Łotwa", nameBg: "Латвия", flagEmoji: "🇱🇻", phoneCode: "+371", isActive: true, createdAt: new Date(), updatedAt: new Date() },
  { isoCode: "EE", nameTr: "Estonya", nameEn: "Estonia", nameDe: "Estland", nameNl: "Estland", nameFr: "Estonie", namePl: "Estonia", nameBg: "Естония", flagEmoji: "🇪🇪", phoneCode: "+372", isActive: true, createdAt: new Date(), updatedAt: new Date() },
];

// ============================================
// PLATFORM ADMINS (ARPDO Team)
// ============================================

export const demoPlatformAdmins: PlatformAdmin[] = [
  {
    id: "platform-admin-1",
    email: "tahir@arpdo.com",
    password: "$2b$10$u4sWHn3bMnlABUZYUgTMueiodv/FCOIS2Zsq4ndM82CORfyIEFOYi", // SecurePass123
    firstName: "Tahir",
    lastName: "Çetin",
    role: "super_admin",
    lastLoginAt: null,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "platform-admin-2",
    email: "admin@arpdo.com",
    password: "$2b$10$zvf1NaDn8ehyDQ5mOyMTzuU8Olb0pWE.2xTVSnie0pEN1AejxljI6", // AdminPass123
    firstName: "Platform",
    lastName: "Admin",
    role: "admin",
    lastLoginAt: null,
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
];

// ============================================
// TENANTS (Customer Companies)
// ============================================

export const demoTenants: Tenant[] = [
  // Cova B.V. - Staffing Agency
  {
    id: "tenant-cova",
    name: "Cova B.V.",
    slug: "cova-bv",
    type: "staffing_agency",
    status: "active",
    contactEmail: "info@cova.nl",
    contactPhone: "+31 40 1234567",
    plan: "professional",
    trialEndsAt: null,
    subscriptionStartsAt: new Date("2024-01-15"),
    modules: '{"workers":true,"planning":true,"accommodation":true,"transport":false,"finance":false}',
    currency: "EUR",
    favoriteCountries: ["DE", "NL", "TR", "PL", "FR", "BE"],
    defaultCountry: "NL",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
    createdBy: "platform-admin-1",
  },
  
  // Apple Netherlands - Direct Employer
  {
    id: "tenant-apple",
    name: "Apple Netherlands",
    slug: "apple-nl",
    type: "direct_employer",
    status: "trial",
    contactEmail: "hr@apple.nl",
    contactPhone: "+31 20 1234567",
    plan: "enterprise",
    trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    subscriptionStartsAt: null,
    modules: '{"workers":true,"planning":true,"accommodation":false,"transport":true,"finance":true}',
    currency: "EUR",
    favoriteCountries: ["NL", "GB", "US"],
    defaultCountry: "NL",
    createdAt: new Date("2024-10-01"),
    updatedAt: new Date("2024-10-01"),
    createdBy: "platform-admin-1",
  },
  
  // OneFlex - Staffing Agency
  {
    id: "tenant-oneflex",
    name: "OneFlex B.V.",
    slug: "oneflex",
    type: "staffing_agency",
    status: "active",
    contactEmail: "contact@oneflex.nl",
    contactPhone: "+31 20 9876543",
    plan: "professional",
    trialEndsAt: null,
    subscriptionStartsAt: new Date("2024-06-01"),
    modules: '{"workers":true,"planning":true,"accommodation":true,"transport":true,"finance":false}',
    currency: "EUR",
    favoriteCountries: ["NL", "DE", "BE"],
    defaultCountry: "NL",
    createdAt: new Date("2024-06-01"),
    updatedAt: new Date("2024-06-01"),
    createdBy: "platform-admin-1",
  },
];

// ============================================
// TENANT USERS (Owners & Admins)
// ============================================

export const demoTenantUsers: User[] = [
  // Cova B.V. - Owner (Single role)
  {
    id: "user-cova-owner",
    tenantId: "tenant-cova",
    email: "jan@cova.nl",
    password: "$2b$10$3JuG8fX.Huj3N0dRR7e/z.E0LazSCvINqehli.2Nckf0NtVA/Qxni", // CovaPass123
    firstName: "Jan",
    lastName: "de Vries",
    roles: ["owner"],
    status: "active",
    invitedAt: new Date("2024-01-15"),
    invitedBy: "platform-admin-1",
    activatedAt: new Date("2024-01-15"),
    invitationToken: null,
    lastLoginAt: new Date("2024-10-18"),
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-10-18"),
  },
  
  // Cova B.V. - Admin (Single role)
  {
    id: "user-cova-admin",
    tenantId: "tenant-cova",
    email: "lisa@cova.nl",
    password: "$2b$10$jKQJEgKDrPwGD3yx/pdv1e0mOiYRQy1TStBv54gJg/TZd62L4Oeei", // LisaPass123
    firstName: "Lisa",
    lastName: "Janssen",
    roles: ["admin"],
    status: "active",
    invitedAt: new Date("2024-02-01"),
    invitedBy: "user-cova-owner",
    activatedAt: new Date("2024-02-01"),
    invitationToken: null,
    lastLoginAt: new Date("2024-10-17"),
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-10-17"),
  },
  
  // Cova B.V. - Multi-role (Planner + Finance)
  {
    id: "user-cova-fatma",
    tenantId: "tenant-cova",
    email: "fatma.yilmaz@gmail.com", // Same email across tenants for multi-tenant login
    password: "$2b$10$M8AKjnGHXV9u6d/gtoUgbOxtQnzbqDXSKlkvyRbcCD.SNCFajKoAy", // FatmaPass123
    firstName: "Fatma",
    lastName: "Yılmaz",
    roles: ["planner", "finance"],
    status: "active",
    invitedAt: new Date("2024-03-01"),
    invitedBy: "user-cova-owner",
    activatedAt: new Date("2024-03-01"),
    invitationToken: null,
    lastLoginAt: new Date("2024-10-18"),
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-10-18"),
  },
  
  // Apple Netherlands - Owner (Single role)
  {
    id: "user-apple-owner",
    tenantId: "tenant-apple",
    email: "tim@apple.nl",
    password: "$2b$10$4vd9MwrRn9AWgM7sWyDWKOEjmopbqizhluYTIJb1HeZBJ3FYJc.xe", // ApplePass123
    firstName: "Tim",
    lastName: "Cook",
    roles: ["owner"],
    status: "active",
    invitedAt: new Date("2024-10-01"),
    invitedBy: "platform-admin-1",
    activatedAt: new Date("2024-10-01"),
    invitationToken: null,
    lastLoginAt: new Date("2024-10-18"),
    createdAt: new Date("2024-10-01"),
    updatedAt: new Date("2024-10-18"),
  },
  
  // Apple Netherlands - HR Manager (Fatma works here too!)
  {
    id: "user-apple-fatma",
    tenantId: "tenant-apple",
    email: "fatma.yilmaz@gmail.com", // Same email across tenants for multi-tenant login
    password: "$2b$10$M8AKjnGHXV9u6d/gtoUgbOxtQnzbqDXSKlkvyRbcCD.SNCFajKoAy", // FatmaPass123
    firstName: "Fatma",
    lastName: "Yılmaz",
    roles: ["hr_manager"],
    status: "active",
    invitedAt: new Date("2024-10-05"),
    invitedBy: "user-apple-owner",
    activatedAt: new Date("2024-10-05"),
    invitationToken: null,
    lastLoginAt: new Date("2024-10-17"),
    createdAt: new Date("2024-10-05"),
    updatedAt: new Date("2024-10-17"),
  },
  
  // OneFlex - Owner (Single role)
  {
    id: "user-oneflex-owner",
    tenantId: "tenant-oneflex",
    email: "sophie@oneflex.nl",
    password: "$2b$10$SX49cSlGk/7lsJmdraD4c.NvCcTPUEkPPoJaX0vfW62gO.wIWIBAu", // OneFlexPass123
    firstName: "Sophie",
    lastName: "van der Berg",
    roles: ["owner"],
    status: "active",
    invitedAt: new Date("2024-06-01"),
    invitedBy: "platform-admin-1",
    activatedAt: new Date("2024-06-01"),
    invitationToken: null,
    lastLoginAt: new Date("2024-10-16"),
    createdAt: new Date("2024-06-01"),
    updatedAt: new Date("2024-10-16"),
  },
  
  // OneFlex - Invited Viewer (Pending)
  {
    id: "user-oneflex-pending",
    tenantId: "tenant-oneflex",
    email: "mark@oneflex.nl",
    password: null,
    firstName: "Mark",
    lastName: "Peters",
    roles: ["viewer"],
    status: "invited",
    invitedAt: new Date("2024-10-10"),
    invitedBy: "user-oneflex-owner",
    activatedAt: null,
    invitationToken: "invite_token_abc123",
    lastLoginAt: null,
    createdAt: new Date("2024-10-10"),
    updatedAt: new Date("2024-10-10"),
  },
];

// ============================================
// DEMO DATA SUMMARY
// ============================================
// Login Scenarios:
// 1. Jan (jan@cova.nl) - Single tenant + Single role → Direct dashboard
// 2. Lisa (lisa@cova.nl) - Single tenant + Single role → Direct dashboard
// 3. Fatma (fatma.yilmaz@gmail.com) - Multi tenant + Multi role → Tenant select → Role select
// 4. Tim (tim@apple.nl) - Single tenant + Single role → Direct dashboard
// 5. Sophie (sophie@oneflex.nl) - Single tenant + Single role → Direct dashboard

export const demoDataSummary = {
  platformAdmins: demoPlatformAdmins.length,
  tenants: demoTenants.length,
  tenantUsers: demoTenantUsers.length,
  uniqueUsers: new Set(demoTenantUsers.map(u => u.email)).size, // 6 unique emails (Fatma has 2 records)
  multiRoleUsers: demoTenantUsers.filter(u => u.roles.length > 1).length, // 1 (Fatma @ Cova)
  multiTenantUsers: 1, // 1 (Fatma works at both Cova and Apple)
  tenantsActive: demoTenants.filter(t => t.status === "active").length,
  tenantsTrial: demoTenants.filter(t => t.status === "trial").length,
};

console.log("📦 Demo Data Summary:", demoDataSummary);

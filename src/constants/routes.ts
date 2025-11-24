import type { Href } from "expo-router";

// Auth routes
export const ROUTE_AUTH_LOGIN = "/(auth)/login" as Href;

// Protected routes
export const ROUTE_PROTECTED_HOME = "/(protected)/home" as Href;
export const ROUTE_PROTECTED_NEW_TRANSACTION = "/(protected)/new-transaction" as Href;
export const ROUTE_PROTECTED_CARD = "/(protected)/card" as Href;

// Root route
export const ROUTE_ROOT = "/" as Href;

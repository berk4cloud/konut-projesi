/**
 * Feature Flags Configuration
 * 
 * This file controls the visibility of features across the application.
 * Set to false to hide features, true to show them.
 */

/**
 * Controls visibility of all price and payment related fields throughout the application.
 * When set to false:
 * - Check-in wizard step 3 (Price & Deposit) will be hidden
 * - Lease contract monthly rent and payment day fields will be hidden
 * - Payment dialogs and forms will be hidden
 * - All price/payment related UI elements will be hidden
 * 
 * Default: false (hidden)
 */
export const SHOW_PRICE_AND_PAYMENT_FIELDS = false;



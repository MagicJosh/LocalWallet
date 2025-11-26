/**
 * storage.ts - LocalStorage Data Service
 *
 * All card data CRUD operations. Data is stored in localStorage
 * under the key 'LOCAL_WALLET_CARDS' as a JSON array.
 *
 * IMPORTANT: All data is stored locally on the device only.
 * No server, no cloud, complete privacy.
 *
 * FUNCTIONS:
 * - getAllCards()     - Get all cards (sorted: favorites first)
 * - createCard()      - Add a new card (auto-fetches logo/color)
 * - getCardById()     - Get single card by ID
 * - updateCard()      - Update card properties
 * - deleteCard()      - Delete a card
 * - toggleFavorite()  - Toggle favorite status
 * - markAsUsed()      - Update "last used" timestamp
 * - exportCards()     - Export all cards as JSON
 * - importCards()     - Import cards from JSON
 */

import type { Card, CardInput } from '../types/card';
import { fetchBrandAssets } from './brandService';
import { detectBarcodeFormat } from './barcodeService';

/** LocalStorage key where all cards are stored */
const STORAGE_KEY = 'LOCAL_WALLET_CARDS';

/** Generate unique ID: timestamp + random string */
function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Get all cards from storage
 * @returns Array of cards sorted by: favorites > last used > created date
 */
export function getAllCards(): Card[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];

    const cards: Card[] = JSON.parse(data);

    // Sort: favorites first, then by last used, then by created
    return cards.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      if (a.lastUsedAt && b.lastUsedAt) return b.lastUsedAt - a.lastUsedAt;
      if (a.lastUsedAt) return -1;
      if (b.lastUsedAt) return 1;
      return b.createdAt - a.createdAt;
    });
  } catch {
    return [];
  }
}

/** Save cards array to localStorage */
function saveAllCards(cards: Card[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

/**
 * Create a new card
 * Automatically fetches brand logo and color from Clearbit
 * @param input - Store name, card number, optional barcode format
 * @returns The created card object
 */
export async function createCard(input: CardInput): Promise<Card> {
  const id = generateId();
  const assets = await fetchBrandAssets(input.storeName);
  const barcodeFormat = input.barcodeFormat || detectBarcodeFormat(input.cardNumber);

  const newCard: Card = {
    id,
    storeName: input.storeName,
    cardNumber: input.cardNumber,
    logoUrl: assets.logoUrl,
    brandColor: assets.brandColor,
    barcodeFormat,
    isFavorite: false,
    createdAt: Date.now(),
    lastUsedAt: null,
  };

  const cards = getAllCards();
  saveAllCards([newCard, ...cards]);
  return newCard;
}

/** Get a single card by ID */
export function getCardById(id: string): Card | undefined {
  const cards = getAllCards();
  return cards.find(c => c.id === id);
}

/** Update a card's properties (partial update) */
export function updateCard(id: string, updates: Partial<Card>): Card | null {
  const cards = getAllCards();
  const index = cards.findIndex(c => c.id === id);
  if (index === -1) return null;

  cards[index] = { ...cards[index], ...updates };
  saveAllCards(cards);
  return cards[index];
}

/** Delete a card by ID. Returns true if deleted, false if not found. */
export function deleteCard(id: string): boolean {
  const cards = getAllCards();
  const filtered = cards.filter(c => c.id !== id);
  if (filtered.length === cards.length) return false;
  saveAllCards(filtered);
  return true;
}

/** Toggle favorite status. Favorites appear at top of list. */
export function toggleFavorite(id: string): boolean {
  const cards = getAllCards();
  const card = cards.find(c => c.id === id);
  if (!card) return false;

  card.isFavorite = !card.isFavorite;
  saveAllCards(cards);
  return card.isFavorite;
}

/** Update lastUsedAt timestamp when card is viewed */
export function markAsUsed(id: string): void {
  const cards = getAllCards();
  const card = cards.find(c => c.id === id);
  if (card) {
    card.lastUsedAt = Date.now();
    saveAllCards(cards);
  }
}

/**
 * Export all cards as JSON string
 * Used for backup - can be saved to file
 */
export function exportCards(): string {
  const cards = getAllCards();
  const exportData = cards.map(card => ({
    storeName: card.storeName,
    cardNumber: card.cardNumber,
    barcodeFormat: card.barcodeFormat,
    isFavorite: card.isFavorite,
  }));
  return JSON.stringify(exportData, null, 2);
}

/**
 * Import cards from JSON string
 * @param jsonString - JSON array of card objects
 * @returns Number of cards successfully imported
 */
export async function importCards(jsonString: string): Promise<number> {
  const importData = JSON.parse(jsonString);
  if (!Array.isArray(importData)) throw new Error('Invalid format');

  let imported = 0;
  for (const item of importData) {
    if (item.storeName && item.cardNumber) {
      await createCard({
        storeName: item.storeName,
        cardNumber: item.cardNumber,
        barcodeFormat: item.barcodeFormat,
      });
      imported++;
    }
  }
  return imported;
}

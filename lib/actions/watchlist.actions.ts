'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist, type WatchlistItem } from '@/database/models/watchlist.model';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
  if (!email) return [];

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    // Better Auth stores users in the "user" collection
    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

    if (!user) return [];

    const userId = (user.id as string) || String(user._id || '');
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error('getWatchlistSymbolsByEmail error:', err);
    return [];
  }
}

// Get the current user's watchlist items
// Get the current user's watchlist items
export async function getUserWatchlist(): Promise<StockWithData[]> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return [];

    const userId = session.user.id;
    await connectToDatabase();

    // Get all watchlist items for this user
    const watchlistItems = await Watchlist.find({ userId }).sort({ addedAt: -1 }).lean();

    // Format the data for display
    const stocks: StockWithData[] = watchlistItems.map((item) => ({
      userId: item.userId,
      symbol: item.symbol,
      company: item.company,
      addedAt: item.addedAt,
    }));

    return stocks;
  } catch (error) {
    console.error('Error getting user watchlist:', error);
    return [];
  }
}

// Get watchlist by user ID (for the current user)
export async function getWatchlistByUserId() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return [];

    const userId = session.user.id;
    await connectToDatabase();

    // Get all watchlist items for this user
    const watchlistItems = await Watchlist.find({ userId }).sort({ addedAt: -1 }).lean();
    
    // Return the watchlist items (they will be serialized in the component)
    return watchlistItems;
  } catch (error) {
    console.error('Error getting user watchlist by ID:', error);
    return [];
  }
}

// Add a stock to the user's watchlist
export async function addToWatchlist(symbol: string, company: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) throw new Error('User not authenticated');

    const userId = session.user.id;
    await connectToDatabase();

    // Check if already in watchlist
    const existing = await Watchlist.findOne({ userId, symbol });
    if (existing) return { success: true, message: 'Stock already in watchlist' };

    // Create new watchlist item
    await Watchlist.create({
      userId,
      symbol,
      company,
      addedAt: new Date(),
    });

    // Revalidate the watchlist page
    revalidatePath('/dashboard/watchlist');
    
    return { success: true, message: 'Added to watchlist' };
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    return { success: false, message: 'Failed to add to watchlist' };
  }
}

// Remove a stock from the user's watchlist
export async function removeFromWatchlist(symbol: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) throw new Error('User not authenticated');

    const userId = session.user.id;
    await connectToDatabase();

    // Delete the watchlist item
    await Watchlist.findOneAndDelete({ userId, symbol });

    // Revalidate the watchlist page
    revalidatePath('/dashboard/watchlist');
    
    return { success: true, message: 'Removed from watchlist' };
  } catch (error) {
    console.error('Error removing from watchlist:', error);
    return { success: false, message: 'Failed to remove from watchlist' };
  }
}

// Check if a stock is in the user's watchlist
export async function isInWatchlist(symbol: string): Promise<boolean> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) return false;

    const userId = session.user.id;
    await connectToDatabase();

    const item = await Watchlist.findOne({ userId, symbol });
    return !!item;
  } catch (error) {
    console.error('Error checking watchlist:', error);
    return false;
  }
}

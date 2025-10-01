"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getWatchlistByUserId } from "@/lib/actions/watchlist.actions";
import { getStockProfile } from "@/lib/actions/finnhub.actions";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface WatchlistItem {
  _id: string;
  symbol: string;
  company: string;
  addedAt: Date;
}

interface StockProfile {
  name: string;
  logo: string;
  currency: string;
  exchange: string;
  ipo: string;
  marketCapitalization: number;
  shareOutstanding: number;
  weburl: string;
  finnhubIndustry: string;
}

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [stockProfiles, setStockProfiles] = useState<Record<string, StockProfile>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWatchlist() {
      try {
        const userWatchlist = await getWatchlistByUserId();
        // Convert MongoDB documents to plain objects to avoid serialization errors
        const serializedWatchlist = userWatchlist.map(item => ({
          _id: item._id.toString(),
          userId: item.userId,
          symbol: item.symbol,
          company: item.company,
          addedAt: item.addedAt
        }));
        
        setWatchlist(serializedWatchlist);
        
        // Fetch stock profiles for each watchlist item
        const profiles: Record<string, StockProfile> = {};
        for (const item of serializedWatchlist) {
          try {
            const profile = await getStockProfile(item.symbol);
            profiles[item.symbol] = profile;
          } catch (error) {
            console.error(`Error fetching profile for ${item.symbol}:`, error);
          }
        }
        setStockProfiles(profiles);
      } catch (error) {
        console.error("Failed to fetch watchlist:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchWatchlist();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">My Watchlist</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <Skeleton className="h-12 w-12 rounded-full mb-4" />
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48 mb-4" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (watchlist.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">My Watchlist</h1>
        <div className="bg-muted/30 rounded-lg p-8 text-center">
          <h2 className="text-xl font-medium mb-2">Your watchlist is empty</h2>
          <p className="text-muted-foreground mb-6">Start adding stocks to track them in your watchlist</p>
          <Link href="/">
            <Button>Browse Stocks</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">My Watchlist</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {watchlist.map((item) => (
          <Link 
            href={`/dashboard/stocks/${item.symbol}`} 
            key={item._id}
            className="watchlist-grid-item"
          >
            <div className="flex items-center gap-4">
              {stockProfiles[item.symbol]?.logo ? (
                <Image 
                  src={stockProfiles[item.symbol].logo} 
                  alt={item.company} 
                  width={48} 
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-lg font-bold">{item.symbol.slice(0, 2)}</span>
                </div>
              )}
              <div>
                <h3 className="font-medium">{item.symbol}</h3>
                <p className="text-sm text-muted-foreground">{item.company}</p>
              </div>
            </div>
            
            {stockProfiles[item.symbol] && (
              <div className="mt-4 text-sm">
                <p><span className="text-muted-foreground">Industry:</span> {stockProfiles[item.symbol].finnhubIndustry}</p>
                <p><span className="text-muted-foreground">Exchange:</span> {stockProfiles[item.symbol].exchange}</p>
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
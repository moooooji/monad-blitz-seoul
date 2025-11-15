import { NextRequest, NextResponse } from "next/server";
import { assetCatalog, AssetSymbol, AssetConfig } from "@/config/assets";

const FEED_BASE_URL = "https://cl-marketplace-api.chain.link/api/price_feeds";

interface PricePayload {
  readonly symbol: AssetSymbol;
  readonly price: number;
  readonly updatedAt: string;
  readonly source: string;
  readonly isFallback: boolean;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const symbolsParam = url.searchParams.get("symbols") ?? assetCatalog.map((asset) => asset.symbol).join(",");
  const requestedSymbols = symbolsParam.split(",").map((symbol) => symbol.trim().toUpperCase()).filter(Boolean);
  const validSymbols = Array.from(new Set(requestedSymbols)).filter((symbol): symbol is AssetSymbol => assetCatalog.some((asset) => asset.symbol === symbol));
  if (validSymbols.length === 0) {
    return NextResponse.json({ message: "No supported assets requested" }, { status: 400 });
  }
  const payloads = await Promise.all(validSymbols.map(async (symbol) => resolvePrice(symbol)));
  return NextResponse.json({ prices: payloads, timestamp: new Date().toISOString() });
}

async function resolvePrice(symbol: AssetSymbol): Promise<PricePayload> {
  const asset = assetCatalog.find((entry) => entry.symbol === symbol) as AssetConfig;
  const requestUrl = `${FEED_BASE_URL}/${asset.feedSlug}/latest_round_data`;
  try {
    const response = await fetch(requestUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Feed responded with status ${response.status}`);
    }
    const json = await response.json();
    const price = normalizePrice(json, asset);
    const updatedAt = selectUpdatedAt(json);
    return { symbol, price, updatedAt, source: "chainlink-marketplace", isFallback: false };
  } catch (error) {
    return {
      symbol,
      price: asset.fallbackPrice,
      updatedAt: new Date().toISOString(),
      source: "fallback",
      isFallback: true,
    };
  }
}

function normalizePrice(payload: unknown, asset: AssetConfig): number {
  const raw = readAnswer(payload);
  if (raw === null) {
    return asset.fallbackPrice;
  }
  return raw / 10 ** asset.feedDecimals;
}

function readAnswer(payload: unknown): number | null {
  if (payload && typeof payload === "object") {
    if ("answer" in payload) {
      const value = Number((payload as { answer: unknown }).answer);
      if (Number.isFinite(value)) {
        return value;
      }
    }
    if ("data" in payload && payload.data && typeof payload.data === "object") {
      const nested = (payload as { data: { answer?: unknown } }).data.answer;
      const nestedValue = Number(nested);
      if (Number.isFinite(nestedValue)) {
        return nestedValue;
      }
    }
  }
  return null;
}

function selectUpdatedAt(payload: unknown): string {
  if (payload && typeof payload === "object") {
    if ("updatedAt" in payload) {
      const raw = (payload as { updatedAt?: number | string }).updatedAt;
      if (typeof raw === "string") {
        return raw;
      }
      if (typeof raw === "number") {
        return new Date(raw * 1000).toISOString();
      }
    }
    if ("data" in payload && payload.data && typeof payload.data === "object") {
      const nested = (payload as { data: { updatedAt?: number | string } }).data.updatedAt;
      if (typeof nested === "string") {
        return nested;
      }
      if (typeof nested === "number") {
        return new Date(nested * 1000).toISOString();
      }
    }
  }
  return new Date().toISOString();
}

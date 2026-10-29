import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface FeedItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
  content?: string;
  imageUrl?: string | null;
}

interface FeedSource {
  topic: string;
  url: string;
  sourceName: string;
  region: "india" | "international";
  priority: number;
}

const FEEDS: FeedSource[] = [
  // ===== INDIA (first priority) =====
  // India general / top news
  { region: "india", priority: 1, topic: "india", sourceName: "Times of India", url: "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms" },
  { region: "india", priority: 1, topic: "india", sourceName: "The Hindu", url: "https://www.thehindu.com/news/national/feeder/default.rss" },
  { region: "india", priority: 2, topic: "india", sourceName: "NDTV", url: "https://www.ndtv.com/rss" },
  { region: "india", priority: 2, topic: "india", sourceName: "India Today", url: "https://www.indiatoday.in/rss/1206578" },
  // India business
  { region: "india", priority: 1, topic: "business", sourceName: "Economic Times", url: "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms" },
  { region: "india", priority: 2, topic: "business", sourceName: "Moneycontrol", url: "https://www.moneycontrol.com/rss/latestnews.xml" },
  // India sports
  { region: "india", priority: 1, topic: "sports", sourceName: "ESPNcricinfo", url: "https://www.espncricinfo.com/rss/content/story/feeds/0.xml" },
  // India technology
  { region: "india", priority: 2, topic: "technology", sourceName: "Gadgets 360", url: "https://gadgets360.com/rss/feeds" },

  // ===== INTERNATIONAL (world news from major apps) =====
  // World / general
  { region: "international", priority: 1, topic: "world", sourceName: "BBC World", url: "https://feeds.bbci.co.uk/news/world/rss.xml" },
  { region: "international", priority: 1, topic: "world", sourceName: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
  { region: "international", priority: 2, topic: "world", sourceName: "The Guardian World", url: "https://www.theguardian.com/world/rss" },
  // AI
  { region: "international", priority: 2, topic: "ai", sourceName: "TechCrunch AI", url: "https://techcrunch.com/category/artificial-intelligence/feed/" },
  // Technology
  { region: "international", priority: 2, topic: "technology", sourceName: "The Verge", url: "https://www.theverge.com/rss/index.xml" },
  // Sports
  { region: "international", priority: 2, topic: "sports", sourceName: "BBC Sport", url: "https://feeds.bbci.co.uk/sport/rss.xml" },
  // Business
  { region: "international", priority: 2, topic: "business", sourceName: "CNBC", url: "https://www.cnbc.com/id/10001147/device/rss/rss.html" },
  // Science
  { region: "international", priority: 2, topic: "science", sourceName: "Science Daily", url: "https://www.sciencedaily.com/rss/all.xml" },
];

function stripHtml(input: string): string {
  return input
    .replace(/<!\[CDATA\[|\]\]>/g, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function extractImage(raw: string): string | null {
  const mediaMatch = raw.match(/<media:content[^>]*url="([^"]+)"[^>]*>/i);
  if (mediaMatch) return mediaMatch[1];
  const imgMatch = raw.match(/<img[^>]+src="([^"]+)"/i);
  if (imgMatch) return imgMatch[1];
  return null;
}

function parseFeed(xml: string): FeedItem[] {
  const items: FeedItem[] = [];
  const itemRegex = /<item[\s\S]*?<\/item>/gi;
  const matches = xml.match(itemRegex) ?? [];

  for (const block of matches.slice(0, 12)) {
    const title = stripHtml(block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "");
    const link = stripHtml(block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] ?? "") ||
      (block.match(/<link[^>]*href="([^"]+)"/i)?.[1] ?? "");
    const pubDate = block.match(/<pubDate[^>]*>([\s\S]*?)<\/pubDate>/i)?.[1]?.trim() ?? new Date().toUTCString();
    const description = block.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1] ?? "";
    const content = block.match(/<content:encoded[^>]*>([\s\S]*?)<\/content:encoded>/i)?.[1] ?? "";
    const imageUrl = extractImage(content || description);

    if (title && link) {
      items.push({ title, link, pubDate, description, content, imageUrl });
    }
  }
  return items;
}

function splitIntoSentences(text: string): string[] {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];
  return cleaned
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 30 && s.length < 280);
}

function summarize(text: string, maxPoints = 4): string[] {
  const sentences = splitIntoSentences(text);
  if (sentences.length === 0) return [];

  // Score sentences: earlier + longer = higher (simple extractive summarization)
  const scored = sentences.map((s, i) => ({
    text: s,
    score: (1 / (i + 1)) * 0.6 + Math.min(s.length / 200, 1) * 0.4,
    index: i,
  }));

  const top = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxPoints)
    .sort((a, b) => a.index - b.index)
    .map((s) => s.text);

  return top;
}

function truncate(text: string, n: number): string {
  if (text.length <= n) return text;
  return text.slice(0, n - 1).trimEnd() + "…";
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    const collected: { topic: string; title: string; summary: string[]; source_name: string; source_url: string; image_url: string | null; published_at: string; region: "india" | "international" }[] = [];
    const seenTitles = new Set<string>();
    const errors: string[] = [];

    // Fetch all feeds in parallel
    const feedResults = await Promise.allSettled(
      FEEDS.map(async (feed) => {
        const res = await fetch(feed.url, {
          headers: { "User-Agent": "DailyDigestBot/1.0 (+news digest aggregator)" },
          signal: AbortSignal.timeout(12000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status} for ${feed.url}`);
        const xml = await res.text();
        return { feed, items: parseFeed(xml) };
      })
    );

    for (const result of feedResults) {
      if (result.status !== "fulfilled") {
        errors.push(String(result.reason));
        continue;
      }
      const { feed, items } = result.value;
      for (const item of items.slice(0, 4)) {
        const title = truncate(item.title, 220);
        if (!title || seenTitles.has(title.toLowerCase())) continue;

        const bodyText = stripHtml(item.content || item.description || "");
        let summary = summarize(bodyText, 4);
        if (summary.length === 0) {
          const desc = stripHtml(item.description);
          if (desc) summary = [truncate(desc, 180)];
        }
        if (summary.length === 0) continue;

        let publishedAt: string;
        try {
          publishedAt = new Date(item.pubDate).toISOString();
          if (isNaN(new Date(publishedAt).getTime())) publishedAt = new Date().toISOString();
        } catch {
          publishedAt = new Date().toISOString();
        }

        seenTitles.add(title.toLowerCase());
        collected.push({
          topic: feed.topic,
          title,
          summary,
          source_name: feed.sourceName,
          source_url: item.link,
          image_url: item.imageUrl,
          published_at: publishedAt,
          region: feed.region,
        });
      }
    }

    // Deduplicate against existing articles by source_url, then insert
    let inserted = 0;
    if (collected.length > 0) {
      const sourceUrls = collected.map((c) => c.source_url);
      const { data: existing } = await supabase
        .from("articles")
        .select("source_url")
        .in("source_url", sourceUrls);
      const existingUrls = new Set((existing ?? []).map((r: { source_url: string }) => r.source_url));
      const fresh = collected.filter((c) => !existingUrls.has(c.source_url));

      if (fresh.length > 0) {
        const { error: insertError } = await supabase.from("articles").insert(fresh);
        if (insertError) throw insertError;
        inserted = fresh.length;
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        feedsChecked: FEEDS.length,
        collected: collected.length,
        inserted,
        deduped: collected.length - inserted,
        errors: errors.slice(0, 5),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

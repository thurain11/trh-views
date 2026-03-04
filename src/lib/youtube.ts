import Parser from "rss-parser";
import type { ChannelVideo } from "./types";

const parser = new Parser();

type YoutubeFeedItem = Parser.Item & {
  "yt:videoId"?: string;
};

type YoutubeFeed = Parser.Output<YoutubeFeedItem>;

export async function getLatestChannelVideos(channelUrls: string[]): Promise<ChannelVideo[]> {
  const results = await Promise.allSettled(channelUrls.map((channelUrl) => getLatestFromChannel(channelUrl)));
  const success = results
    .filter((item): item is PromiseFulfilledResult<ChannelVideo> => item.status === "fulfilled")
    .map((item) => item.value);

  if (success.length === 0) {
    const reasons = results
      .filter((item): item is PromiseRejectedResult => item.status === "rejected")
      .map((item) => (item.reason instanceof Error ? item.reason.message : String(item.reason)))
      .slice(0, 2)
      .join(" | ");
    throw new Error(`No channel videos resolved (${reasons || "unknown"})`);
  }

  return success;
}

async function getLatestFromChannel(channelUrl: string): Promise<ChannelVideo> {
  const normalizedUrl = normalizeChannelUrl(channelUrl);
  const channelId = await resolveChannelId(normalizedUrl);
  if (!channelId) {
    throw new Error(`Cannot resolve channel id for ${normalizedUrl}`);
  }

  const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const response = await fetch(feedUrl, {
    next: { revalidate: 900 },
  });

  if (!response.ok) {
    throw new Error(`YouTube RSS ${response.status}`);
  }

  const xml = await response.text();
  const feed = (await parser.parseString(xml)) as YoutubeFeed;
  const latest = feed.items?.[0];
  if (!latest) {
    throw new Error(`No uploads for ${normalizedUrl}`);
  }

  const videoId = latest["yt:videoId"] ?? extractVideoIdFromLink(latest.link);
  if (!videoId) {
    throw new Error(`No video id in feed for ${normalizedUrl}`);
  }

  return {
    id: `${channelId}-${videoId}`,
    channelTitle: feed.title ?? normalizedUrl,
    channelUrl: normalizedUrl,
    title: latest.title ?? "Untitled",
    link: latest.link ?? `https://www.youtube.com/watch?v=${videoId}`,
    videoId,
    publishedAt: latest.pubDate ?? latest.isoDate,
  };
}

async function resolveChannelId(channelUrl: string): Promise<string | undefined> {
  const direct = extractChannelIdFromUrl(channelUrl);
  if (direct) return direct;

  const fromOEmbed = await resolveFromOEmbed(channelUrl);
  if (fromOEmbed) return fromOEmbed;

  const response = await fetch(channelUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
      "Accept-Language": "en-US,en;q=0.9",
    },
    next: { revalidate: 86400 },
  });

  if (!response.ok) return undefined;
  const html = await response.text();
  const patterns = [
    /"channelId":"(UC[\w-]+)"/,
    /"externalId":"(UC[\w-]+)"/,
    /youtube\.com\/channel\/(UC[\w-]+)/,
    /rel="canonical"\s+href="https:\/\/www\.youtube\.com\/channel\/(UC[\w-]+)"/,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1];
  }

  return undefined;
}

async function resolveFromOEmbed(channelUrl: string): Promise<string | undefined> {
  const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(channelUrl)}&format=json`;
  try {
    const response = await fetch(endpoint, {
      next: { revalidate: 86400 },
    });
    if (!response.ok) return undefined;
    const payload = (await response.json()) as { author_url?: string };
    return extractChannelIdFromUrl(payload.author_url ?? "");
  } catch {
    return undefined;
  }
}

function extractChannelIdFromUrl(channelUrl: string): string | undefined {
  const match = channelUrl.match(/youtube\.com\/channel\/(UC[\w-]+)/i);
  return match?.[1];
}

function extractVideoIdFromLink(link?: string): string | undefined {
  if (!link) return undefined;
  const watchMatch = link.match(/[?&]v=([\w-]{11})/);
  if (watchMatch?.[1]) return watchMatch[1];
  const shortMatch = link.match(/youtu\.be\/([\w-]{11})/);
  return shortMatch?.[1];
}

function normalizeChannelUrl(channelUrl: string): string {
  const trimmed = channelUrl.trim();
  return trimmed.replace(/\/(videos|featured|playlists|streams|shorts)\/?$/i, "");
}

import Parser from "rss-parser";
import { formatISO } from "date-fns";
import type {
  ChannelVideo,
  CryptoQuote,
  DashboardData,
  EarthquakeEvent,
  HeadlineItem,
  TechStory,
  WeatherSnapshot,
} from "./types";
import { buildHighlights } from "./rules";
import { YOUTUBE_CHANNEL_URLS } from "./youtube-channels";
import { getLatestChannelVideos } from "./youtube";

const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=16.8409&longitude=96.1735&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum&forecast_days=7&timezone=Asia%2FYangon";

const CRYPTO_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd&include_24hr_change=true";

const USGS_EARTHQUAKE_URL =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson";
const YANGON_COORDS = { latitude: 16.8409, longitude: 96.1735 };
const NEAR_YANGON_KM = 1500;

const RSS_FEEDS = [
  "https://www.coindesk.com/arc/outboundfeeds/rss/",
  "https://cointelegraph.com/rss",
  "https://decrypt.co/feed",
  "https://blockworks.co/feed",
  "https://www.theblock.co/rss",
];

const HN_TOP_STORIES_URL = "https://hacker-news.firebaseio.com/v0/topstories.json";
const HN_ITEM_BASE_URL = "https://hacker-news.firebaseio.com/v0/item";
const DEV_TOP_ARTICLES_URL = "https://dev.to/api/articles?top=7&per_page=7";
const STACKOVERFLOW_HOT_URL =
  "https://api.stackexchange.com/2.3/questions?order=desc&sort=hot&site=stackoverflow&pagesize=7&filter=!nNPvSNV5qN";

const parser = new Parser();

type UsgsFeature = {
  id?: string;
  properties?: {
    mag?: number | null;
    place?: string;
    time?: number;
    url?: string;
  };
  geometry?: {
    coordinates?: [number, number, number] | number[];
  };
};

type UsgsResponse = {
  features?: UsgsFeature[];
};

type HnItemResponse = {
  id?: number;
  title?: string;
  url?: string;
  score?: number;
  descendants?: number;
  time?: number;
};

type DevArticle = {
  id?: number;
  title?: string;
  url?: string;
  positive_reactions_count?: number;
  comments_count?: number;
  tag_list?: string[] | string;
  published_at?: string;
  cover_image?: string;
  social_image?: string;
};

type StackExchangeResponse = {
  items?: Array<{
    question_id?: number;
    title?: string;
    link?: string;
    score?: number;
    answer_count?: number;
    creation_date?: number;
    tags?: string[];
  }>;
};

export async function getDashboardData(): Promise<DashboardData> {
  const errors: string[] = [];
  const [weather, crypto, headlines, earthquakes, techStories, channelVideos] = await Promise.all([
    getWeather().catch((err) => {
      errors.push(`Weather: ${readableError(err)}`);
      return undefined;
    }),
    getCrypto().catch((err) => {
      errors.push(`Crypto: ${readableError(err)}`);
      return undefined;
    }),
    getHeadlines().catch((err) => {
      errors.push(`Headlines: ${readableError(err)}`);
      return undefined;
    }),
    getEarthquakes().catch((err) => {
      errors.push(`Earthquakes: ${readableError(err)}`);
      return undefined;
    }),
    getTechStories().catch((err) => {
      errors.push(`Tech: ${readableError(err)}`);
      return undefined;
    }),
    getChannelVideos().catch((err) => {
      errors.push(`YouTube: ${readableError(err)}`);
      return undefined;
    }),
  ]);

  const highlights = buildHighlights(crypto, weather, earthquakes);

  return {
    weather,
    crypto,
    headlines,
    techStories,
    channelVideos,
    earthquakes,
    highlights,
    errors,
    updatedAt: formatISO(new Date()),
  };
}

async function getWeather(): Promise<WeatherSnapshot> {
  const response = await fetch(WEATHER_URL, {
    next: { revalidate: 600 },
  });
  if (!response.ok) {
    throw new Error(`Open-Meteo ${response.status}`);
  }
  const data = await response.json();
  const current = data.current;
  const daily = data.daily;
  const dates: string[] = Array.isArray(daily.time) ? daily.time : [];
  const maxes: number[] = Array.isArray(daily.temperature_2m_max)
    ? daily.temperature_2m_max
    : [];
  const mins: number[] = Array.isArray(daily.temperature_2m_min)
    ? daily.temperature_2m_min
    : [];
  const precip: number[] = Array.isArray(daily.precipitation_sum)
    ? daily.precipitation_sum
    : [];
  const codes: number[] = Array.isArray(daily.weather_code) ? daily.weather_code : [];
  const forecast7 = dates.slice(0, 7).map((date, idx) => ({
    date,
    max: Number(maxes[idx] ?? current.temperature_2m),
    min: Number(mins[idx] ?? current.temperature_2m),
    precip: Number(precip[idx] ?? 0),
    code: Number(codes[idx] ?? current.weather_code),
  }));

  return {
    temp: current.temperature_2m,
    feelsLike: current.apparent_temperature,
    wind: current.wind_speed_10m,
    code: current.weather_code,
    max: daily.temperature_2m_max?.[0] ?? current.temperature_2m,
    min: daily.temperature_2m_min?.[0] ?? current.temperature_2m,
    precip: daily.precipitation_sum?.[0] ?? 0,
    updatedAt: data.current.time,
    forecast7,
  };
}

async function getCrypto(): Promise<CryptoQuote[]> {
  const response = await fetch(CRYPTO_URL, {
    next: { revalidate: 300 },
  });
  if (!response.ok) {
    throw new Error(`CoinGecko ${response.status}`);
  }
  const data = await response.json();

  const coins: CryptoQuote[] = [
    {
      symbol: "BTC",
      name: "Bitcoin",
      price: data.bitcoin.usd,
      change24h: data.bitcoin.usd_24h_change,
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      price: data.ethereum.usd,
      change24h: data.ethereum.usd_24h_change,
    },
    {
      symbol: "SOL",
      name: "Solana",
      price: data.solana.usd,
      change24h: data.solana.usd_24h_change,
    },
  ];

  return coins;
}

async function getHeadlines(): Promise<HeadlineItem[]> {
  const results = await Promise.all(
    RSS_FEEDS.map(async (feed) => {
      const response = await fetch(feed, {
        next: { revalidate: 900 },
      });
      if (!response.ok) {
        throw new Error(`RSS ${response.status}`);
      }
      const xml = await response.text();
      const parsed = await parser.parseString(xml);
      const source = parsed.title ?? new URL(feed).hostname.replace("www.", "");
      return (parsed.items ?? []).map((item) => ({
        title: item.title ?? "Untitled",
        link: item.link ?? feed,
        source,
        publishedAt: item.pubDate ?? item.isoDate,
        imageUrl: extractRssImage(item),
      }));
    })
  );

  return results
    .flat()
    .filter((item) => item.title && item.link)
    .sort((a, b) => {
      const dateA = Date.parse(a.publishedAt ?? "") || 0;
      const dateB = Date.parse(b.publishedAt ?? "") || 0;
      return dateB - dateA;
    })
    .slice(0, 18);
}

async function getTechStories(): Promise<TechStory[]> {
  const results = await Promise.allSettled([
    getHackerNewsStories(),
    getDevStories(),
    getStackOverflowStories(),
  ]);
  const stories = results
    .filter((result): result is PromiseFulfilledResult<TechStory[]> => result.status === "fulfilled")
    .flatMap((result) => result.value);

  return stories
    .sort((a, b) => {
      const timeA = Date.parse(a.publishedAt ?? "") || 0;
      const timeB = Date.parse(b.publishedAt ?? "") || 0;
      if (timeA !== timeB) return timeB - timeA;
      return b.score - a.score;
    })
    .slice(0, 18);
}

async function getChannelVideos(): Promise<ChannelVideo[]> {
  return getLatestChannelVideos(YOUTUBE_CHANNEL_URLS);
}

async function getHackerNewsStories(): Promise<TechStory[]> {
  const topRes = await fetch(HN_TOP_STORIES_URL, {
    next: { revalidate: 600 },
  });
  if (!topRes.ok) {
    throw new Error(`Hacker News ${topRes.status}`);
  }

  const ids: number[] = await topRes.json();
  const topIds = ids.slice(0, 8);
  const itemResults = await Promise.all(
    topIds.map(async (id) => {
      const itemRes = await fetch(`${HN_ITEM_BASE_URL}/${id}.json`, {
        next: { revalidate: 600 },
      });
      if (!itemRes.ok) return undefined;
      const item: HnItemResponse = await itemRes.json();
      if (!item.id || !item.title) return undefined;
      const link = item.url ?? `https://news.ycombinator.com/item?id=${item.id}`;
      return {
        id: `hn-${item.id}`,
        title: item.title,
        link,
        source: "Hacker News",
        score: Number(item.score ?? 0),
        comments: Number(item.descendants ?? 0),
        publishedAt: item.time ? new Date(item.time * 1000).toISOString() : undefined,
      } as TechStory;
    })
  );

  return itemResults.filter((story): story is TechStory => Boolean(story));
}

async function getDevStories(): Promise<TechStory[]> {
  const response = await fetch(DEV_TOP_ARTICLES_URL, {
    headers: {
      "User-Agent": "YangonPulseDashboard/1.0",
    },
    next: { revalidate: 900 },
  });
  if (!response.ok) {
    throw new Error(`DEV ${response.status}`);
  }

  const articles: DevArticle[] = await response.json();
  return articles
    .map((article) => {
      if (!article.id || !article.title || !article.url) return undefined;
      const tags = Array.isArray(article.tag_list)
        ? article.tag_list
        : typeof article.tag_list === "string"
          ? article.tag_list.split(",").map((tag) => tag.trim())
          : [];
      return {
        id: `dev-${article.id}`,
        title: article.title,
        link: article.url,
        source: "DEV",
        score: Number(article.positive_reactions_count ?? 0),
        comments: Number(article.comments_count ?? 0),
        tags: tags.filter(Boolean).slice(0, 3),
        publishedAt: article.published_at,
        imageUrl: article.cover_image ?? article.social_image,
      } as TechStory;
    })
    .filter((story): story is TechStory => Boolean(story));
}

async function getStackOverflowStories(): Promise<TechStory[]> {
  const response = await fetch(STACKOVERFLOW_HOT_URL, {
    next: { revalidate: 600 },
  });
  if (!response.ok) {
    throw new Error(`StackOverflow ${response.status}`);
  }

  const payload: StackExchangeResponse = await response.json();
  const items = Array.isArray(payload.items) ? payload.items : [];
  return items
    .map((item) => {
      if (!item.question_id || !item.title || !item.link) return undefined;
      return {
        id: `so-${item.question_id}`,
        title: item.title,
        link: item.link,
        source: "Stack Overflow",
        score: Number(item.score ?? 0),
        comments: Number(item.answer_count ?? 0),
        tags: Array.isArray(item.tags) ? item.tags.slice(0, 3) : [],
        publishedAt: item.creation_date
          ? new Date(item.creation_date * 1000).toISOString()
          : undefined,
      } as TechStory;
    })
    .filter((story): story is TechStory => Boolean(story));
}

async function getEarthquakes(): Promise<EarthquakeEvent[]> {
  const response = await fetch(USGS_EARTHQUAKE_URL, {
    next: { revalidate: 300 },
  });
  if (!response.ok) {
    throw new Error(`USGS ${response.status}`);
  }

  const data: UsgsResponse = await response.json();
  const features = Array.isArray(data.features) ? data.features : [];

  return features
    .map((feature) => {
      const props = feature?.properties ?? {};
      const coords = feature?.geometry?.coordinates ?? [];
      return {
        id: String(feature?.id ?? ""),
        magnitude: Number(props.mag ?? NaN),
        place: String(props.place ?? "Unknown location"),
        time: Number(props.time ?? 0),
        depthKm: Number(coords[2] ?? NaN),
        longitude: Number(coords[0] ?? NaN),
        latitude: Number(coords[1] ?? NaN),
        distanceKm: calcDistanceKm(
          YANGON_COORDS.latitude,
          YANGON_COORDS.longitude,
          Number(coords[1] ?? NaN),
          Number(coords[0] ?? NaN)
        ),
        isNearYangon: false,
        url: String(props.url ?? "https://earthquake.usgs.gov/"),
      } as EarthquakeEvent;
    })
    .filter(
      (quake) =>
        quake.id &&
        Number.isFinite(quake.magnitude) &&
        Number.isFinite(quake.depthKm) &&
        Number.isFinite(quake.time) &&
        Number.isFinite(quake.distanceKm)
    )
    .map((quake) => ({
      ...quake,
      isNearYangon: quake.distanceKm <= NEAR_YANGON_KM,
    }))
    .sort((a, b) => b.time - a.time)
    .slice(0, 12);
}

function readableError(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Unknown error";
}

function calcDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function extractRssImage(item: Parser.Item): string | undefined {
  const maybeEnclosure = item.enclosure as { url?: unknown } | undefined;
  if (typeof maybeEnclosure?.url === "string" && maybeEnclosure.url.startsWith("http")) {
    return maybeEnclosure.url;
  }

  const itemWithMedia = item as Parser.Item & {
    "media:content"?: Array<{ $?: { url?: string } }>;
    "media:thumbnail"?: Array<{ $?: { url?: string } }>;
    content?: string;
    contentSnippet?: string;
  };

  const mediaContentUrl = itemWithMedia["media:content"]?.[0]?.$?.url;
  if (typeof mediaContentUrl === "string" && mediaContentUrl.startsWith("http")) {
    return mediaContentUrl;
  }

  const mediaThumbUrl = itemWithMedia["media:thumbnail"]?.[0]?.$?.url;
  if (typeof mediaThumbUrl === "string" && mediaThumbUrl.startsWith("http")) {
    return mediaThumbUrl;
  }

  const html = itemWithMedia.content ?? itemWithMedia.contentSnippet ?? "";
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (match?.[1]?.startsWith("http")) {
    return match[1];
  }

  return undefined;
}

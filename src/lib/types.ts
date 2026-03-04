export type DailyForecast = {
  date: string;
  max: number;
  min: number;
  precip: number;
  code: number;
};

export type WeatherSnapshot = {
  temp: number;
  feelsLike: number;
  wind: number;
  code: number;
  max: number;
  min: number;
  precip: number;
  updatedAt: string;
  forecast7: DailyForecast[];
};

export type CryptoQuote = {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
};

export type HeadlineItem = {
  title: string;
  link: string;
  source: string;
  publishedAt?: string;
  imageUrl?: string;
};

export type TechSource = "Hacker News" | "DEV" | "Stack Overflow";

export type TechStory = {
  id: string;
  title: string;
  link: string;
  source: TechSource;
  score: number;
  comments?: number;
  tags?: string[];
  publishedAt?: string;
  imageUrl?: string;
};

export type ChannelVideo = {
  id: string;
  channelTitle: string;
  channelUrl: string;
  title: string;
  link: string;
  videoId: string;
  publishedAt?: string;
};

export type EarthquakeEvent = {
  id: string;
  magnitude: number;
  place: string;
  time: number;
  depthKm: number;
  longitude: number;
  latitude: number;
  distanceKm: number;
  isNearYangon: boolean;
  url: string;
};

export type DashboardData = {
  weather?: WeatherSnapshot;
  crypto?: CryptoQuote[];
  headlines?: HeadlineItem[];
  techStories?: TechStory[];
  channelVideos?: ChannelVideo[];
  earthquakes?: EarthquakeEvent[];
  highlights: string[];
  errors: string[];
  updatedAt: string;
};

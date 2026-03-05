import { format } from "date-fns";
import Link from "next/link";
import AutoRefresh from "../components/AutoRefresh";
import CryptoChart from "../components/CryptoChart";
import ThemeToggle from "../components/ThemeToggle";
import YouTubeEmbed from "../components/YouTubeEmbed";
import WeatherVisual from "../components/WeatherVisual";
import { getDashboardData } from "../lib/data";
import { getWeatherLabel } from "../lib/weather";

function formatMoney(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: value >= 1000 ? 0 : 2,
  });
}

function formatPct(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatDateSafe(value?: string): string {
  if (!value) return "";
  const time = Date.parse(value);
  if (Number.isNaN(time)) return "";
  return format(new Date(time), "MMM d, HH:mm");
}

function formatEpochSafe(value?: number): string {
  if (!value || value <= 0) return "";
  return format(new Date(value), "MMM d, HH:mm");
}

function formatDaySafe(value: string): string {
  const time = Date.parse(value);
  if (Number.isNaN(time)) return value;
  return format(new Date(time), "EEE, MMM d");
}

function sourceClassName(source: string): string {
  if (source === "Hacker News") return "bg-orange-400/20 text-orange-100";
  if (source === "DEV") return "bg-cyan-400/20 text-cyan-100";
  return "bg-emerald-400/20 text-emerald-100";
}

function isValidImageUrl(value?: string): boolean {
  return Boolean(value && /^https?:\/\//i.test(value));
}

function compactPlace(value: string): string {
  return value.length > 52 ? `${value.slice(0, 49)}...` : value;
}

export default async function HomePage() {
  const data = await getDashboardData();
  const weather = data.weather;
  const label = weather ? getWeatherLabel(weather.code) : null;
  const earthquakes =
    data.earthquakes?.slice().sort((a, b) => {
      return a.distanceKm - b.distanceKm || b.magnitude - a.magnitude || b.time - a.time;
    }) ?? [];
  const closestEarthquakes = earthquakes.slice(0, 5);
  const nearYangonCount = closestEarthquakes.filter((quake) => quake.isNearYangon).length;
  const latestChannelVideos =
    data.channelVideos
      ?.slice()
      .sort((a, b) => (Date.parse(b.publishedAt ?? "") || 0) - (Date.parse(a.publishedAt ?? "") || 0))
      .slice(0, 6) ?? [];

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-10">
      <AutoRefresh />
      <header className="flex flex-col gap-4">
        <span className="metric-pill w-fit">Free Public Data</span>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Yangon Pulse Dashboard
            </h1>
            <p className="subtle mt-2 max-w-xl">
              Weather, crypto market snapshot, merged RSS headlines, and rule-based
              unusual highlights from crypto, weather, and USGS earthquake feeds.
            </p>
          </div>
          <div className="glass flex items-center gap-3 rounded-2xl px-4 py-3 text-xs text-white/70">
            <span>Last updated</span>
            <span className="font-mono text-white">
              {format(new Date(data.updatedAt), "MMM d, yyyy HH:mm")}
            </span>
            <ThemeToggle />
          </div>
        </div>
        {data.errors.length > 0 && (
          <div className="rounded-2xl border border-solar-500/40 bg-solar-500/10 px-4 py-3 text-sm text-solar-50">
            <strong className="mr-2">Partial data:</strong>
            {data.errors.join(" • ")}
          </div>
        )}
      </header>

      <section className="card p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="section-title">Yangon Weather</p>
            <p className="subtle">Default location • Open-Meteo</p>
          </div>
          <div className="rounded-full bg-tide-400/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-tide-200">
            {label?.mood ?? "Loading"}
          </div>
        </div>
        {weather ? (
          <div className="mt-4 flex flex-col gap-3">
            <WeatherVisual mood={label?.mood} />
            <div className="flex items-end gap-3">
              <div className="text-4xl font-semibold">
                {Math.round(weather.temp)}°
              </div>
              <div className="text-sm text-white/70">
                <p>{label?.label}</p>
                <p>Feels like {Math.round(weather.feelsLike)}°</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm text-white/70">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/40">
                  High / Low
                </p>
                <p className="text-base text-white">
                  {Math.round(weather.max)}° / {Math.round(weather.min)}°
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-white/40">
                  Wind
                </p>
                <p className="text-base text-white">{weather.wind} km/h</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-white/40">
                  Rain
                </p>
                <p className="text-base text-white">{weather.precip} mm</p>
              </div>
            </div>
            <div className="mt-2">
              <p className="mb-3 text-xs uppercase tracking-[0.2em] text-white/40">
                Next 7 Days
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {weather.forecast7.map((day) => (
                  <div
                    key={day.date}
                    className="min-w-32 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-white/90">{formatDaySafe(day.date)}</p>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 uppercase tracking-wide">
                        {getWeatherLabel(day.code).mood}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-white">
                      {Math.round(day.max)}° / {Math.round(day.min)}°
                    </p>
                    <p className="mt-1 text-white/50">Rain: {day.precip.toFixed(1)} mm</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-6 text-sm text-white/60">Weather data unavailable.</p>
        )}
      </section>

      <section className="card p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="section-title">Earthquake Watch</p>
            <p className="subtle">USGS GeoJSON • Closest to Yangon (Top 5)</p>
          </div>
          <div className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-200">
            Near Yangon: {nearYangonCount}/5
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {closestEarthquakes.length > 0 ? closestEarthquakes.map((quake) => (
            <a
              key={quake.id}
              href={quake.url}
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-white/10 bg-white/5 px-3 py-3 transition hover:border-white/30"
            >
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs text-white/70">
                  {formatEpochSafe(quake.time)}
                </p>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    quake.magnitude >= 5
                      ? "bg-solar-500/20 text-solar-50"
                      : "bg-tide-400/20 text-tide-200"
                  }`}
                >
                  M{quake.magnitude.toFixed(1)}
                </span>
              </div>
              <p className="mt-2 text-sm text-white/90 group-hover:text-white">
                {compactPlace(quake.place)}
              </p>
              <p className="mt-2 text-xs text-white/50">
                Yangon distance: {quake.distanceKm.toFixed(0)} km
              </p>
              {quake.isNearYangon && (
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                  Near Yangon
                </p>
              )}
            </a>
          )) : <p className="text-sm text-white/60">Earthquake data unavailable.</p>}
        </div>
      </section>

      <section className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="section-title">Trending Tech Now</p>
            <p className="subtle">Hacker News • DEV • Stack Overflow</p>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.techStories && data.techStories.length > 0 ? data.techStories.map((story) => (
            <a
              key={story.id}
              href={story.link}
              target="_blank"
              rel="noreferrer"
              className="group rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/30"
            >
              {isValidImageUrl(story.imageUrl) && (
                <div
                  className="mb-3 h-28 w-full rounded-xl border border-white/10 bg-cover bg-center"
                  style={{ backgroundImage: `url(${story.imageUrl})` }}
                />
              )}
              <div className="flex items-center justify-between gap-2">
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${sourceClassName(story.source)}`}>
                  {story.source}
                </span>
                <span className="text-xs font-mono text-white/60">{formatDateSafe(story.publishedAt)}</span>
              </div>
              <p className="mt-2 text-sm text-white/90 group-hover:text-white">{story.title}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-white/60">
                <span>Score: {story.score}</span>
                <span>Comments: {story.comments ?? 0}</span>
              </div>
              {story.tags && story.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {story.tags.slice(0, 3).map((tag) => (
                    <span
                      key={`${story.id}-${tag}`}
                      className="rounded-full bg-white/10 px-2 py-1 text-[11px] uppercase tracking-wide text-white/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </a>
          )) : <p className="text-sm text-white/60">Tech stories unavailable.</p>}
        </div>
      </section>

      <section className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="section-title">Latest From Your Channels</p>
            <p className="subtle">Latest public uploads (showing 6)</p>
          </div>
          <Link href="/channels" className="link text-sm">
            See more
          </Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {latestChannelVideos.length > 0 ? latestChannelVideos.map((video) => (
            <div key={video.id} className="flex flex-col gap-2">
              <YouTubeEmbed title={video.title} videoId={video.videoId} />
              <p className="text-sm text-white/90">{video.title}</p>
              <a
                href={video.channelUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs uppercase tracking-[0.2em] text-white/50 hover:text-white/80"
              >
                {video.channelTitle}
              </a>
              <p className="text-xs text-white/50">{formatDateSafe(video.publishedAt)}</p>
            </div>
          )) : <p className="text-sm text-white/60">Channel videos unavailable.</p>}
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="section-title">Crypto Snapshot</p>
              <p className="subtle">BTC, ETH, SOL • CoinGecko</p>
            </div>
            <div className="rounded-full bg-solar-500/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-solar-50">
              24h
            </div>
          </div>
          <div className="mt-6 flex flex-col gap-4">
            {data.crypto?.map((coin) => (
              <div
                key={coin.symbol}
                className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <div>
                  <p className="text-sm text-white/70">{coin.name}</p>
                  <p className="text-lg font-semibold">{coin.symbol}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-base text-white">
                    {formatMoney(coin.price)}
                  </p>
                  <p
                    className={`text-sm ${
                      coin.change24h >= 0 ? "text-tide-200" : "text-solar-400"
                    }`}
                  >
                    {formatPct(coin.change24h)}
                  </p>
                </div>
              </div>
            )) ?? (
              <p className="text-sm text-white/60">Crypto data unavailable.</p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="section-title">Market Momentum</p>
              <p className="subtle">24h change vs USD • Recharts</p>
            </div>
          </div>
          {data.crypto ? (
            <CryptoChart
              data={data.crypto.map((coin) => ({
                name: coin.symbol,
                change: Number(coin.change24h.toFixed(2)),
                price: coin.price,
              }))}
            />
          ) : (
            <p className="mt-6 text-sm text-white/60">Chart unavailable.</p>
          )}
        </div>
      </section>

      <section className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="section-title">Crypto Headlines</p>
            <p className="subtle">Merged RSS feeds</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-4">
          {data.headlines?.map((item) => (
            <a
              key={`${item.link}-${item.title}`}
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col gap-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition hover:border-white/30"
            >
              {isValidImageUrl(item.imageUrl) && (
                <div
                  className="mb-2 h-32 w-full rounded-xl border border-white/10 bg-cover bg-center"
                  style={{ backgroundImage: `url(${item.imageUrl})` }}
                />
              )}
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white/40">
                <span>{item.source}</span>
                <span>
                  {formatDateSafe(item.publishedAt)}
                </span>
              </div>
              <p className="text-sm text-white/90 group-hover:text-white">
                {item.title}
              </p>
            </a>
          )) ?? (
            <p className="text-sm text-white/60">Headlines unavailable.</p>
          )}
        </div>
      </section>

      <section className="card p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="section-title">Unusual Today</p>
            <p className="subtle">Auto-generated signals from latest feeds</p>
          </div>
        </div>
        <div className="mt-6 flex flex-col gap-4 text-sm text-white/80">
          {data.highlights.length > 0 ? data.highlights.map((item, idx) => (
            <div
              key={`${item}-${idx}`}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            >
              {item}
            </div>
          )) : (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
              No notable anomalies right now.
            </div>
          )}
        </div>
        <div className="mt-6 text-xs text-white/50">
          Caching: weather 10m • crypto 5m • RSS 15m • USGS 5m • Tech feeds 10-15m
        </div>
      </section>
    </main>
  );
}

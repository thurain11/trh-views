import { format } from "date-fns";
import Link from "next/link";
import YouTubeEmbed from "../../components/YouTubeEmbed";
import { YOUTUBE_CHANNEL_URLS } from "../../lib/youtube-channels";
import { getLatestChannelVideos } from "../../lib/youtube";

function formatDateSafe(value?: string): string {
  if (!value) return "";
  const time = Date.parse(value);
  if (Number.isNaN(time)) return "";
  return format(new Date(time), "MMM d, yyyy HH:mm");
}

export default async function ChannelsPage() {
  const videos = await getLatestChannelVideos(YOUTUBE_CHANNEL_URLS).catch(() => []);
  const sortedVideos = videos
    .slice()
    .sort((a, b) => (Date.parse(b.publishedAt ?? "") || 0) - (Date.parse(a.publishedAt ?? "") || 0));

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">All Channel Latest Videos</h1>
          <p className="subtle mt-2">Latest public upload from each configured channel</p>
        </div>
        <Link href="/" className="link text-sm">
          Back to Home
        </Link>
      </header>

      <section className="card p-6">
        <div className="mb-4 text-sm text-white/70">Channels configured: {YOUTUBE_CHANNEL_URLS.length}</div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sortedVideos.length > 0 ? (
            sortedVideos.map((video) => (
              <div key={video.id} className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-white/5 p-3">
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
            ))
          ) : (
            <p className="text-sm text-white/60">Channel videos unavailable.</p>
          )}
        </div>
      </section>
    </main>
  );
}

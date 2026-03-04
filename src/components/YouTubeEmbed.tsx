type YouTubeEmbedProps = {
  title: string;
  videoId: string;
};

export default function YouTubeEmbed({ title, videoId }: YouTubeEmbedProps) {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const thumbUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <a
      href={watchUrl}
      target="_blank"
      rel="noreferrer"
      className="group block overflow-hidden rounded-2xl border border-white/10 bg-white/5"
    >
      <div className="relative w-full pt-[56.25%]">
        <img
          className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-[1.02]"
          src={thumbUrl}
          alt={title}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent" />
        <div className="absolute bottom-2 right-2 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white">
          Watch
        </div>
      </div>
    </a>
  );
}

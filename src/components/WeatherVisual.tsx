type WeatherVisualMood = "clear" | "cloudy" | "rain" | "snow";

function normalizeMood(mood?: string): WeatherVisualMood {
  if (!mood) return "clear";
  const value = mood.toLowerCase();
  if (value.includes("snow")) return "snow";
  if (value.includes("rain") || value.includes("storm")) return "rain";
  if (value.includes("cloud") || value.includes("fog")) return "cloudy";
  return "clear";
}

export default function WeatherVisual({ mood }: { mood?: string }) {
  const scene = normalizeMood(mood);

  return (
    <div className={`weather-scene weather-scene-compact weather-${scene}`} aria-hidden="true">
      <div className="weather-sun" />
      <div className="weather-cloud weather-cloud-a" />
      <div className="weather-cloud weather-cloud-b" />
      <div className="weather-rain" />
      <div className="weather-snow" />
    </div>
  );
}

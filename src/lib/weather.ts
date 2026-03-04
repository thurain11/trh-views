const WEATHER_CODES: Record<number, { label: string; mood: string }> = {
  0: { label: "Clear sky", mood: "Clear" },
  1: { label: "Mainly clear", mood: "Clear" },
  2: { label: "Partly cloudy", mood: "Clouds" },
  3: { label: "Overcast", mood: "Clouds" },
  45: { label: "Fog", mood: "Fog" },
  48: { label: "Rime fog", mood: "Fog" },
  51: { label: "Light drizzle", mood: "Rain" },
  53: { label: "Drizzle", mood: "Rain" },
  55: { label: "Dense drizzle", mood: "Rain" },
  61: { label: "Rain", mood: "Rain" },
  63: { label: "Rain showers", mood: "Rain" },
  65: { label: "Heavy rain", mood: "Rain" },
  71: { label: "Snow", mood: "Snow" },
  73: { label: "Snow showers", mood: "Snow" },
  75: { label: "Heavy snow", mood: "Snow" },
  80: { label: "Rain showers", mood: "Rain" },
  81: { label: "Heavy showers", mood: "Rain" },
  82: { label: "Violent showers", mood: "Rain" },
  95: { label: "Thunderstorm", mood: "Storm" },
  96: { label: "Thunderstorm w/ hail", mood: "Storm" },
  99: { label: "Severe thunderstorm", mood: "Storm" },
};

export function getWeatherLabel(code: number): { label: string; mood: string } {
  return WEATHER_CODES[code] ?? { label: "Unknown", mood: "Clear" };
}

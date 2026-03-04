import type { CryptoQuote, EarthquakeEvent, WeatherSnapshot } from "./types";

export function buildHighlights(
  crypto: CryptoQuote[] | undefined,
  weather: WeatherSnapshot | undefined,
  earthquakes: EarthquakeEvent[] | undefined
): string[] {
  const highlights: string[] = [];

  if (crypto && crypto.length > 0) {
    const moves = crypto.map((coin) => coin.change24h);
    const bigMoves = crypto.filter((coin) => Math.abs(coin.change24h) >= 7);
    if (bigMoves.length > 0) {
      highlights.push(
        `High volatility: ${bigMoves
          .map((coin) => `${coin.symbol} ${formatPct(coin.change24h)}`)
          .join(", ")}.`
      );
    }

    const allUp = moves.every((value) => value > 1);
    const allDown = moves.every((value) => value < -1);
    if (allUp || allDown) {
      highlights.push(
        `Market in sync: all tracked coins are ${allUp ? "up" : "down"} over 1% in 24h.`
      );
    }

    const lowVol = moves.every((value) => Math.abs(value) < 1);
    if (lowVol) {
      highlights.push("Low volatility: all tracked coins moved less than 1% in 24h.");
    }

    const btc = crypto.find((coin) => coin.symbol === "BTC");
    const eth = crypto.find((coin) => coin.symbol === "ETH");
    const sol = crypto.find((coin) => coin.symbol === "SOL");
    if (btc && eth && sol) {
      const divergence = [eth, sol].filter(
        (coin) => Math.sign(coin.change24h) !== Math.sign(btc.change24h)
      );
      if (Math.abs(btc.change24h) >= 3 && divergence.length > 0) {
        highlights.push(
          `Rotation watch: BTC moved ${formatPct(btc.change24h)} while ${divergence
            .map((coin) => coin.symbol)
            .join(" & ")} diverged.`
        );
      }
    }
  }

  if (weather) {
    if (weather.precip >= 20) {
      highlights.push("Weather alert: heavy rain expected today in Yangon.");
    } else if (weather.wind >= 25) {
      highlights.push("Weather alert: strong winds expected today in Yangon.");
    }
  }

  if (earthquakes && earthquakes.length > 0) {
    const strongest = earthquakes.reduce((max, quake) =>
      quake.magnitude > max.magnitude ? quake : max
    );
    if (strongest.magnitude >= 5) {
      highlights.push(
        `Seismic alert: M${strongest.magnitude.toFixed(1)} earthquake reported (${strongest.place}).`
      );
    }

    const majorCount = earthquakes.filter((quake) => quake.magnitude >= 4.5).length;
    if (majorCount >= 3) {
      highlights.push(`Seismic cluster: ${majorCount} earthquakes above M4.5 in the last 24h.`);
    }

    const nearYangon = earthquakes
      .filter((quake) => quake.isNearYangon)
      .sort((a, b) => b.magnitude - a.magnitude)[0];
    if (nearYangon) {
      highlights.push(
        `Near Yangon: M${nearYangon.magnitude.toFixed(1)} quake about ${nearYangon.distanceKm.toFixed(
          0
        )} km away (${nearYangon.place}).`
      );
    }
  }

  if (highlights.length === 0) {
    highlights.push("No unusual signals detected. Baseline conditions across feeds.");
  }

  return highlights;
}

function formatPct(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

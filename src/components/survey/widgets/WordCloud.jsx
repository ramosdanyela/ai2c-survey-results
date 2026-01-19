import { useEffect, useRef } from "react";
// @ts-ignore - wordcloud doesn't have TypeScript definitions
import WordCloudLib from "wordcloud";

/**
 * WordCloud Component - Using wordcloud2.js library for better collision detection
 *
 * @param {Object} props
 * @param {Array} props.words - Array of {text: string, value: number}
 * @param {number} props.maxWords - Maximum number of words to display (default: 15)
 * @param {Object} props.config - Configuration object
 * @param {number} props.config.minFontSize - Minimum font size in px (default: 14)
 * @param {number} props.config.maxFontSize - Maximum font size in px (default: 56)
 * @param {number} props.config.minRotation - Minimum rotation in degrees (default: -20)
 * @param {number} props.config.maxRotation - Maximum rotation in degrees (default: 20)
 * @param {boolean} props.config.enableRotation - Enable word rotation (default: true)
 * @param {string} props.config.colorScheme - Color scheme: 'chart' | 'gradient' | 'vibrant' | 'monochrome' | 'classic' | 'image-style' (default: 'image-style')
 * @param {number} props.config.spacing - Grid size for collision detection (default: 8, lower = more precise but slower)
 */

// Color palettes for different schemes
const COLOR_PALETTES = {
  "image-style": [
    "#d4a574",
    "#1982d8",
    "#ff9e2b",
    "#c19a6b",
    "#1e88e5",
    "#ffb74d",
  ],
  classic: ["#d4a574", "#1982d8", "#ff9e2b", "#c19a6b", "#1e88e5", "#ffb74d"],
  chart: [
    "hsl(33, 100%, 58%)",
    "hsl(20, 90%, 55%)",
    "hsl(30, 85%, 55%)",
    "hsl(15, 95%, 52%)",
    "hsl(25, 90%, 53%)",
  ],
  vibrant: [
    "hsl(33,100%,58%)",
    "hsl(200,90%,55%)",
    "hsl(142,70%,50%)",
    "hsl(280,80%,60%)",
    "hsl(15,95%,55%)",
    "hsl(45,95%,55%)",
  ],
  gradient: [
    "hsl(33, 100%, 58%)",
    "hsl(20, 90%, 55%)",
    "hsl(30, 85%, 55%)",
    "hsl(15, 95%, 52%)",
    "hsl(25, 90%, 53%)",
  ],
  monochrome: ["hsl(var(--foreground))"],
};

export function WordCloud({ words, maxWords = 15, config = {} }) {
  const {
    minFontSize = 14,
    maxFontSize = 56,
    minRotation = -20,
    maxRotation = 20,
    enableRotation = true,
    colorScheme = "image-style",
    spacing = 8, // gridSize - lower = more precise collision detection
  } = config;

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!words || words.length === 0 || !canvasRef.current) return;

    // Prepare data for wordcloud library
    const sorted = [...words]
      .sort((a, b) => b.value - a.value)
      .slice(0, maxWords);

    if (sorted.length === 0) return;

    const max = Math.max(...sorted.map((w) => w.value));
    const min = Math.min(...sorted.map((w) => w.value));
    const range = max - min || 1;

    // Convert to format expected by wordcloud library: [['word', size], ...]
    const wordList = sorted.map((word) => {
      const normalizedValue = (word.value - min) / range;
      const size = minFontSize + normalizedValue * (maxFontSize - minFontSize);
      return [word.text, size];
    });

    // Get container dimensions
    const container = containerRef.current;
    if (!container) return;

    const width = container.offsetWidth || 800;
    const height = container.offsetHeight || 400;

    // Set canvas size
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    // Get color palette
    const colors = COLOR_PALETTES[colorScheme] || COLOR_PALETTES["image-style"];

    // Configure wordcloud
    const options = {
      list: wordList,
      gridSize: spacing, // Lower = more precise collision detection (8 is good balance)
      weightFactor: 1, // Size multiplier (already calculated above)
      fontFamily: "system-ui, -apple-system, sans-serif",
      color: function (word, weight, fontSize, distance, theta) {
        // Distribute colors based on word index and value
        const index = sorted.findIndex((w) => w.text === word);
        return colors[index % colors.length];
      },
      rotateRatio: 0, // No rotation - all words horizontal
      rotationSteps: 0, // No rotation steps
      minRotation: 0,
      maxRotation: 0,
      shuffle: true, // Shuffle words for better distribution
      backgroundColor: "transparent",
      drawOutOfBound: false, // Don't draw words outside canvas
      shrinkToFit: true, // Shrink words if needed to fit
    };

    // Clear previous wordcloud
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
    }

    // Generate wordcloud
    try {
      if (typeof WordCloudLib === "function") {
        WordCloudLib(canvas, options);
      } else if (WordCloudLib && typeof WordCloudLib.default === "function") {
        WordCloudLib.default(canvas, options);
      } else {
        console.error("WordCloud library not loaded correctly");
      }
    } catch (error) {
      console.error("Error generating wordcloud:", error);
    }
  }, [
    words,
    maxWords,
    minFontSize,
    maxFontSize,
    minRotation,
    maxRotation,
    enableRotation,
    colorScheme,
    spacing,
  ]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (
        !words ||
        words.length === 0 ||
        !canvasRef.current ||
        !containerRef.current
      )
        return;

      // Trigger re-render by updating a state or calling the effect again
      // We'll use a small delay to debounce
      const timeoutId = setTimeout(() => {
        const container = containerRef.current;
        const canvas = canvasRef.current;
        if (!container || !canvas) return;

        const width = container.offsetWidth || 800;
        const height = container.offsetHeight || 400;

        canvas.width = width;
        canvas.height = height;

        // Re-generate wordcloud with new dimensions
        const sorted = [...words]
          .sort((a, b) => b.value - a.value)
          .slice(0, maxWords);

        if (sorted.length === 0) return;

        const max = Math.max(...sorted.map((w) => w.value));
        const min = Math.min(...sorted.map((w) => w.value));
        const range = max - min || 1;

        const wordList = sorted.map((word) => {
          const normalizedValue = (word.value - min) / range;
          const size =
            minFontSize + normalizedValue * (maxFontSize - minFontSize);
          return [word.text, size];
        });

        const colors =
          COLOR_PALETTES[colorScheme] || COLOR_PALETTES["image-style"];

        const options = {
          list: wordList,
          gridSize: spacing,
          weightFactor: 1,
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: function (word, weight, fontSize, distance, theta) {
            const index = sorted.findIndex((w) => w.text === word);
            return colors[index % colors.length];
          },
          rotateRatio: 0, // No rotation - all words horizontal
          rotationSteps: 0, // No rotation steps
          minRotation: 0,
          maxRotation: 0,
          shuffle: true,
          backgroundColor: "transparent",
          drawOutOfBound: false,
          shrinkToFit: true,
        };

        try {
          if (typeof WordCloudLib === "function") {
            WordCloudLib(canvas, options);
          } else if (
            WordCloudLib &&
            typeof WordCloudLib.default === "function"
          ) {
            WordCloudLib.default(canvas, options);
          }
        } catch (error) {
          console.error("Error regenerating wordcloud on resize:", error);
        }
      }, 150);

      return () => clearTimeout(timeoutId);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [
    words,
    maxWords,
    minFontSize,
    maxFontSize,
    minRotation,
    maxRotation,
    enableRotation,
    colorScheme,
    spacing,
  ]);

  if (!words || words.length === 0) {
    return (
      <div
        ref={containerRef}
        className="relative p-6 bg-muted/30 rounded-lg min-h-[200px] w-full flex items-center justify-center"
      >
        <p className="text-muted-foreground">Nenhuma palavra para exibir</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative p-6 bg-muted/30 rounded-lg min-h-[200px] w-full"
      style={{ position: "relative" }}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{
          width: "100%",
          height: "100%",
          minHeight: "200px",
        }}
      />
    </div>
  );
}

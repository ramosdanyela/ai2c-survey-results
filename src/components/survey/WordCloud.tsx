import { useMemo } from "react";

interface WordCloudWord {
  text: string;
  value: number;
}

interface WordCloudProps {
  words: WordCloudWord[];
  maxWords?: number;
}

export function WordCloud({ words, maxWords = 15 }: WordCloudProps) {
  const processedWords = useMemo(() => {
    const sorted = [...words].sort((a, b) => b.value - a.value).slice(0, maxWords);
    const max = Math.max(...sorted.map((w) => w.value));
    const min = Math.min(...sorted.map((w) => w.value));
    const range = max - min || 1;

    return sorted.map((word) => ({
      ...word,
      // Normalize to font size between 12 and 36
      size: 12 + ((word.value - min) / range) * 24,
      // Random rotation between -15 and 15 degrees
      rotation: Math.floor(Math.random() * 31) - 15,
      // Random color from chart palette
      colorIndex: Math.floor(Math.random() * 5) + 1,
    }));
  }, [words, maxWords]);

  // Shuffle for visual variety
  const shuffledWords = useMemo(() => {
    return [...processedWords].sort(() => Math.random() - 0.5);
  }, [processedWords]);

  const colorClasses = [
    "text-chart-1",
    "text-chart-2",
    "text-chart-3",
    "text-chart-4",
    "text-chart-5",
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 p-6 bg-muted/30 rounded-lg min-h-[200px]">
      {shuffledWords.map((word, index) => (
        <span
          key={word.text}
          className={`font-medium transition-all duration-200 hover:scale-110 cursor-default ${
            colorClasses[(word.colorIndex - 1) % colorClasses.length]
          }`}
          style={{
            fontSize: `${word.size}px`,
            transform: `rotate(${word.rotation}deg)`,
            opacity: 0.7 + (word.value / processedWords[0].value) * 0.3,
          }}
          title={`${word.text}: ${word.value} menções`}
        >
          {word.text}
        </span>
      ))}
    </div>
  );
}
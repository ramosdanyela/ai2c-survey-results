import { useMemo, useRef, useEffect, useState } from "react";

function getBoundingBox(text, fontSize, rotation, x, y) {
  // Aproximação: largura baseada no comprimento do texto
  const width = text.length * fontSize * 0.6;
  const height = fontSize * 1.2;

  // Aplicar rotação para calcular dimensões reais
  const rad = (rotation * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));

  const rotatedWidth = width * cos + height * sin;
  const rotatedHeight = width * sin + height * cos;

  return {
    x: x - rotatedWidth / 2,
    y: y - rotatedHeight / 2,
    width: rotatedWidth,
    height: rotatedHeight,
  };
}

/**
 * Verifica se dois bounding boxes se sobrepõem
 */
function boxesOverlap(box1, box2, padding = 5) {
  return (
    box1.x < box2.x + box2.width + padding &&
    box1.x + box1.width + padding > box2.x &&
    box1.y < box2.y + box2.height + padding &&
    box1.y + box1.height + padding > box2.y
  );
}

/**
 * Encontra uma posição livre para a palavra
 */
function findFreePosition(word, placedWords, containerWidth, containerHeight) {
  const maxAttempts = 100;
  const padding = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Tentar posição aleatória
    const x = Math.random() * (containerWidth - 200) + 100;
    const y = Math.random() * (containerHeight - 100) + 50;

    const box = getBoundingBox(word.text, word.size, word.rotation, x, y);

    // Verificar colisão com palavras já posicionadas
    const hasCollision = placedWords.some((placed) => {
      const placedBox = getBoundingBox(
        placed.text,
        placed.size,
        placed.rotation,
        placed.x,
        placed.y
      );
      return boxesOverlap(box, placedBox, padding);
    });

    if (!hasCollision) {
      return { x, y };
    }
  }

  // Se não encontrou posição livre, usar posição sequencial
  const row = Math.floor(placedWords.length / 5);
  const col = placedWords.length % 5;
  return {
    x: 100 + col * 150,
    y: 80 + row * 60,
  };
}

export function WordCloud({ words, maxWords = 15 }) {
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({
    width: 800,
    height: 300,
  });

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth || 800,
          height: containerRef.current.offsetHeight || 300,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const processedWords = useMemo(() => {
    const sorted = [...words]
      .sort((a, b) => b.value - a.value)
      .slice(0, maxWords);
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

  // Posicionar palavras sem sobreposição
  const positionedWords = useMemo(() => {
    const placed = [];

    // Ordenar por tamanho (maiores primeiro) para melhor distribuição
    const sortedBySize = [...processedWords].sort((a, b) => b.size - a.size);

    sortedBySize.forEach((word) => {
      const position = findFreePosition(
        word,
        placed,
        containerSize.width,
        containerSize.height
      );

      placed.push({
        ...word,
        x: position.x,
        y: position.y,
      });
    });

    return placed;
  }, [processedWords, containerSize]);

  const colorClasses = [
    "text-chart-1",
    "text-chart-2",
    "text-chart-3",
    "text-chart-4",
    "text-chart-5",
  ];

  return (
    <div
      ref={containerRef}
      className="relative p-6 bg-muted/30 rounded-lg min-h-[200px] w-full"
      style={{ height: "auto", minHeight: "200px" }}
    >
      {positionedWords.map((word) => (
        <span
          key={word.text}
          className={`absolute font-medium transition-all duration-200 hover:scale-110 cursor-default ${
            colorClasses[(word.colorIndex - 1) % colorClasses.length]
          }`}
          style={{
            fontSize: `${word.size}px`,
            transform: `translate(${word.x}px, ${word.y}px) rotate(${word.rotation}deg)`,
            transformOrigin: "center center",
            opacity: 0.7 + (word.value / processedWords[0].value) * 0.3,
            whiteSpace: "nowrap",
          }}
          title={`${word.text}: ${word.value} menções`}
        >
          {word.text}
        </span>
      ))}
    </div>
  );
}

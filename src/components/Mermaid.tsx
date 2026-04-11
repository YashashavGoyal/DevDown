import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid with default config
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'inherit',
});

interface MermaidProps {
  chart: string;
}

const Mermaid: React.FC<MermaidProps> = ({ chart }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderChart = async () => {
      if (!containerRef.current || !chart) return;

      try {
        setError(null);
        // Generate a unique ID for each chart
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        
        // Check if dark mode is active
        const isDarkMode = document.documentElement.classList.contains('dark');
        
        // Re-initialize for theme if needed
        mermaid.initialize({
          theme: isDarkMode ? 'dark' : 'default',
        });

        const { svg } = await mermaid.render(id, chart);
        setSvg(svg);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError('Failed to render Mermaid diagram. Check your syntax.');
      }
    };

    renderChart();
  }, [chart]);

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-lg text-sm font-mono overflow-auto">
        {error}
        <pre className="mt-2 text-xs opacity-70">{chart}</pre>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="mermaid-container flex justify-center my-6 p-4 rounded-xl glass-card overflow-hidden"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default Mermaid;

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import Chart from 'chart.js/auto';

function App() {
  const [histogramData, setHistogramData] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (histogramData && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      new Chart(ctx, {
        type: 'bar',
        data: histogramData,
        options: {
          scales: {
            y: {
              beginAtZero: true,
              precision: 0,
            },
          },
        },
      });
    }
  }, [histogramData]);

  const fetchData = async () => {
    try {
      const response = await axios.get('https://www.terriblytinytales.com/test.txt');
      const textContent = response.data;
      const words = textContent.split(/\s+/);

      const wordFrequencyMap = {};
      words.forEach((word) => {
        if (wordFrequencyMap[word]) {
          wordFrequencyMap[word] += 1;
        } else {
          wordFrequencyMap[word] = 1;
        }
      });

      const sortedWords = Object.keys(wordFrequencyMap).sort(
        (a, b) => wordFrequencyMap[b] - wordFrequencyMap[a]
      );

      const topWords = sortedWords.slice(0, 20);
      const frequencyData = topWords.map((word) => wordFrequencyMap[word]);

      const chartData = {
        labels: topWords,
        datasets: [
          {
            label: 'Word Frequency',
            data: frequencyData,
            backgroundColor: 'pink',
          },
        ],
      };

      setHistogramData(chartData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const exportData = () => {
    if (!histogramData) {
      console.error('No histogram data available');
      return;
    }

    const csvContent = [
      ['Word', 'Frequency'],
      ...histogramData.labels.map((word, index) => [word, histogramData.datasets[0].data[index]]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'word_frequency.csv');
  };

  return (
    <div>
      <h1>Word Frequency Histogram</h1>
      <button onClick={fetchData}>Submit</button>
      {histogramData && (
        <div>
          <canvas ref={canvasRef} />
          <button onClick={exportData}>Export</button>
        </div>
      )}
    </div>
  );
}

export default App;

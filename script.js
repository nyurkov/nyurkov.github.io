(() => {
  const KONAMI_SEQUENCE = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a"
  ];

  const lookbackYears = 7;
  const easterEggSection = document.getElementById("easter-egg-section");
  const chartStatus = document.getElementById("chart-status");
  const chartCanvas = document.getElementById("sp500-chart");
  let keyBuffer = [];
  let chartLoaded = false;

  function epochSecondsFromDate(date) {
    return Math.floor(date.getTime() / 1000);
  }

  function buildYahooUrl() {
    const now = new Date();
    const start = new Date(now);
    start.setFullYear(now.getFullYear() - lookbackYears);

    const period1 = epochSecondsFromDate(start);
    const period2 = epochSecondsFromDate(now);

    return `https://query1.finance.yahoo.com/v8/finance/chart/%5EGSPC?period1=${period1}&period2=${period2}&interval=1d&events=history`;
  }

  async function fetchSP500Data() {
    const response = await fetch(buildYahooUrl(), {
      method: "GET",
      mode: "cors",
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`API request failed with ${response.status}`);
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];
    const timestamps = result?.timestamp || [];
    const closes = result?.indicators?.quote?.[0]?.close || [];

    if (!timestamps.length || !closes.length) {
      throw new Error("No data returned from API.");
    }

    const rows = timestamps
      .map((ts, idx) => {
        const close = closes[idx];
        if (close == null) return null;

        return {
          date: new Date(ts * 1000),
          close: Number(close)
        };
      })
      .filter(Boolean);

    if (!rows.length) {
      throw new Error("Data series empty after parsing.");
    }

    const sampled = rows.filter((_, idx) => idx % 5 === 0 || idx === rows.length - 1);
    const labels = sampled.map((row) =>
      row.date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short"
      })
    );
    const values = sampled.map((row) => row.close);

    return { labels, values };
  }

  function renderChart(chartData) {
    const gradient = chartCanvas
      .getContext("2d")
      .createLinearGradient(0, 0, 0, chartCanvas.height || 300);

    gradient.addColorStop(0, "rgba(0, 94, 74, 0.22)");
    gradient.addColorStop(1, "rgba(0, 94, 74, 0.01)");

    new Chart(chartCanvas, {
      type: "line",
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: "S&P 500",
            data: chartData.values,
            borderColor: "#005e4a",
            borderWidth: 2,
            pointRadius: 0,
            fill: true,
            backgroundColor: gradient,
            tension: 0.15
          }
        ]
      },
      options: {
        parsing: false,
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 700,
          easing: "easeOutCubic"
        },
        interaction: {
          intersect: false,
          mode: "index"
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label(context) {
                const value = context.parsed.y || 0;
                return `S&P 500: ${value.toLocaleString(undefined, {
                  maximumFractionDigits: 2
                })}`;
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              color: "rgba(23, 24, 24, 0.07)"
            },
            ticks: {
              color: "#545c61",
              maxTicksLimit: 8
            }
          },
          y: {
            grid: {
              color: "rgba(23, 24, 24, 0.07)"
            },
            ticks: {
              color: "#545c61",
              callback(value) {
                return Number(value).toLocaleString();
              }
            }
          }
        }
      }
    });
  }

  async function ensureChart() {
    if (chartLoaded) return;

    chartStatus.textContent = "Loading market data...";

    try {
      const chartData = await fetchSP500Data();
      renderChart(chartData);
      chartLoaded = true;
      chartStatus.textContent = "Data source: Yahoo Finance historical chart API.";
    } catch (error) {
      chartStatus.textContent =
        "Unable to load live chart data right now. Try reloading later from a less restricted network.";
      // Keep the hidden section useful even when API calls fail.
      console.error("Chart load failed", error);
    }
  }

  function revealEasterEgg() {
    easterEggSection.hidden = false;

    // Retrigger reveal animation if already visible.
    easterEggSection.classList.remove("revealed");
    void easterEggSection.offsetWidth;
    easterEggSection.classList.add("revealed");

    easterEggSection.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    ensureChart();
  }

  window.addEventListener("keydown", (event) => {
    const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
    keyBuffer.push(key);

    if (keyBuffer.length > KONAMI_SEQUENCE.length) {
      keyBuffer = keyBuffer.slice(-KONAMI_SEQUENCE.length);
    }

    const matches = KONAMI_SEQUENCE.every((expected, idx) => keyBuffer[idx] === expected);

    if (matches) {
      revealEasterEgg();
      keyBuffer = [];
    }
  });
})();

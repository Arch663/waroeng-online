import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
} from "chart.js";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
);

let chart: Chart | null = null;
let observer: MutationObserver | null = null;

function getChartColors() {
  const css = getComputedStyle(document.documentElement);

  return {
    text: css.getPropertyValue("--foreground").trim(),
    grid: css.getPropertyValue("--border").trim(),
    line: css.getPropertyValue("--accent").trim(),
    bg: css.getPropertyValue("--background").trim(),
  };
}

interface ChartData {
  labels: string[];
  values: number[];
}

function render(canvas: HTMLCanvasElement, input: ChartData) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const c = getChartColors();

  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, "hsl(217, 91%, 60%, 0.6)");
  gradient.addColorStop(1, "hsl(219, 100%, 61%, 0.3)");
  gradient.addColorStop(1, "hsl(213, 94%, 68%, 0.1)");

  chart?.destroy();

  chart = new Chart(ctx, {
    type: "line",

    data: {
      labels: input.labels,

      datasets: [
        {
          data: input.values,
          borderColor: c.line,
          backgroundColor: gradient,
          tension: 0.5,
          fill: true,
          pointBackgroundColor: c.line,
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,

      plugins: {
        legend: { display: false },
        tooltip: {
          bodyColor: c.text,
          titleColor: c.text,
          backgroundColor: c.bg,
        },
      },

      scales: {
        x: {
          ticks: { color: c.text, padding: 5 },
          grid: { display: false },
        },

        y: {
          min: 0,
          ticks: {
            padding: 5,
            color: c.text,
            callback(value) {
              return "Rp " + Number(value).toLocaleString();
            },
            // maxTicksLimit: 5,
          },
          grid: { color: c.grid },
        },
      },
    },
  });
}

function observeTheme(canvas: HTMLCanvasElement, input: ChartData) {
  observer?.disconnect();
  observer = new MutationObserver(() => {
    render(canvas, input);
  });

  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
}

function destroy() {
  chart?.destroy();
  observer?.disconnect();
}

export function useLineSalesChart() {
  return {
    render,
    observeTheme,
    destroy,
  };
}

import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
  BarController,
  BarElement,
  Legend,
} from "chart.js";

Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Filler,
  BarController,
  BarElement,
  Legend,
);

export function useLineSalesChart() {
  let chart: Chart | null = null;
  let observer: MutationObserver | null = null;

  function getChartColors() {
    const css = getComputedStyle(document.documentElement);
    return {
      text: css.getPropertyValue("--foreground").trim() || "#000",
      grid: css.getPropertyValue("--border").trim() || "#ccc",
      line: css.getPropertyValue("--accent").trim() || "#6366f1",
      bg: css.getPropertyValue("--background").trim() || "#fff",
    };
  }

  function render(
    canvas: HTMLCanvasElement,
    input: { labels: string[]; values: number[] },
  ) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const c = getChartColors();
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, "rgba(99, 102, 241, 0.4)");
    gradient.addColorStop(1, "rgba(99, 102, 241, 0)");

    if (chart) chart.destroy();

    chart = new Chart(ctx, {
      type: "line",
      data: {
        labels: input.labels,
        datasets: [
          {
            data: input.values,
            borderColor: c.line,
            backgroundColor: gradient,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: c.line,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: c.bg,
            titleColor: c.text,
            bodyColor: c.text,
            borderColor: c.grid,
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label(context: any) {
                return `Rp ${context.parsed.y.toLocaleString("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
              },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: c.text },
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: c.text,
              callback: (val: any) => "Rp" + val / 1000 + "k",
            },
            grid: { color: c.grid },
          },
        },
      },
    });
  }

  function observeTheme(
    canvas: HTMLCanvasElement,
    input: { labels: string[]; values: number[] },
  ) {
    if (observer) observer.disconnect();
    observer = new MutationObserver(() => {
      render(canvas, input);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
  }

  function destroy() {
    if (chart) chart.destroy();
    if (observer) observer.disconnect();
  }

  return { render, observeTheme, destroy };
}

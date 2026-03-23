import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

const NAV_LINKS = ["Home", "App", "Features", "Pricing", "Support"] as const;
const FOOTER_LINKS = ["Terms", "Privacy", "About"] as const;
const BOXES = Array.from({ length: 100 }, (_, i) => i);

export default function App() {
  const [values, setValues] = useState<string[]>(Array(100).fill(""));

  const grandTotal = values.reduce((sum, v) => {
    const num = Number.parseFloat(v);
    return sum + (Number.isNaN(num) ? 0 : num);
  }, 0);

  const handleChange = (index: number, value: string) => {
    setValues((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleClear = () => {
    setValues(Array(100).fill(""));
  };

  const currentYear = new Date().getFullYear();
  const hostname = encodeURIComponent(window.location.hostname);
  const filledCount = values.filter((v) => v !== "").length;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm"
              aria-label="NumberGrid Calc logo"
            >
              N
            </div>
            <span className="font-semibold text-foreground text-[15px] tracking-tight">
              NumberGrid Calc
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-7">
            {NAV_LINKS.map((link) => (
              <button
                type="button"
                key={link}
                data-ocid={`nav.${link.toLowerCase()}.link`}
                className={`text-sm font-medium transition-colors relative pb-0.5 cursor-pointer bg-transparent border-0 ${
                  link === "App"
                    ? "text-foreground after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-5 after:h-0.5 after:bg-primary after:rounded-full"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link}
              </button>
            ))}
          </nav>

          {/* CTA */}
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-5"
            data-ocid="nav.signin.button"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10">
        {/* Header row */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight leading-tight">
              Input Your Data
            </h1>
            <p className="mt-2 text-muted-foreground text-[15px]">
              Enter numbers in any of the 100 boxes &mdash; the grand total
              updates instantly.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Grand Total
            </p>
            <p
              className="text-3xl font-extrabold text-foreground tabular-nums"
              data-ocid="total.success_state"
            >
              {formatNumber(grandTotal)}
            </p>
          </div>
        </div>

        {/* Card grid */}
        <div
          className="bg-card rounded-xl shadow-card border border-border p-6 md:p-8"
          data-ocid="grid.panel"
        >
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm font-medium text-muted-foreground">
              100 input fields &mdash; 10 &times; 10 grid
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              data-ocid="grid.clear_button"
              className="text-xs border-border text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          </div>

          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(10, minmax(0, 1fr))" }}
          >
            {BOXES.map((i) => (
              <div
                key={`box-${i}`}
                className="flex flex-col items-center gap-1"
              >
                <span className="text-[11px] font-medium text-muted-foreground select-none">
                  [{i + 1}]
                </span>
                <Input
                  type="number"
                  value={values[i]}
                  onChange={(e) => handleChange(i, e.target.value)}
                  data-ocid={`grid.item.${i + 1}`}
                  className="h-9 text-center text-sm px-1 font-medium border-input focus-visible:ring-ring tabular-nums [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="&mdash;"
                  aria-label={`Box ${i + 1}`}
                />
              </div>
            ))}
          </div>

          {/* Bottom total bar */}
          <div className="mt-6 pt-5 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filledCount} of 100 boxes filled
            </p>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Total:
              </span>
              <span
                className="text-xl font-extrabold text-foreground tabular-nums"
                data-ocid="grid.total.success_state"
              >
                {formatNumber(grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border mt-10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs">
              N
            </div>
            <span className="text-sm font-semibold text-foreground">
              NumberGrid Calc
            </span>
          </div>

          <div className="flex items-center gap-5">
            {FOOTER_LINKS.map((link) => (
              <button
                type="button"
                key={link}
                data-ocid={`footer.${link.toLowerCase()}.link`}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-0"
              >
                {link}
              </button>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            &copy; {currentYear}{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
              className="hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              Built with love using caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

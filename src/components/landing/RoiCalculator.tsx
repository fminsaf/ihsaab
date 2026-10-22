import { useState } from "react";
import { Clock, Sparkles, TrendingUp } from "lucide-react";

export function RoiCalculator() {
  const [hoursPerWeek, setHoursPerWeek] = useState(5);
  const [hourlyRate, setHourlyRate] = useState(65);

  const hoursSavedPerYear = Math.round(hoursPerWeek * 50 * 0.85);
  const moneySavedPerYear = Math.round(hoursSavedPerYear * hourlyRate);
  const weeksOfWorkReclaimed = (hoursSavedPerYear / 40).toFixed(1);

  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            ROI Calculator
          </span>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            How much time & money will Ihsaab save you?
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Calculate your return on investment in seconds.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-4xl rounded-3xl border border-border/80 bg-card p-6 sm:p-10 shadow-lg">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            {/* Sliders Input Column */}
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-sm font-semibold text-foreground">
                  <span>Hours spent on books each week:</span>
                  <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary">
                    {hoursPerWeek} hrs / week
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={hoursPerWeek}
                  onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                  className="mt-3 w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                  <span>1 hr (Minimal)</span>
                  <span>10 hrs (Average SMB)</span>
                  <span>20 hrs (Heavy Admin)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm font-semibold text-foreground">
                  <span>Your estimated hourly rate / value:</span>
                  <span className="rounded-full bg-primary/10 px-3 py-0.5 text-xs font-bold text-primary">
                    ${hourlyRate} / hr
                  </span>
                </div>
                <input
                  type="range"
                  min="25"
                  max="200"
                  step="5"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                  className="mt-3 w-full accent-primary cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
                  <span>$25/hr</span>
                  <span>$100/hr</span>
                  <span>$200/hr</span>
                </div>
              </div>

              <div className="rounded-2xl bg-muted/40 p-4 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">💡 Founder Insight:</span> Every hour you spend trying to categorize debits and calculate taxes is an hour not spent closing sales or delighting customers.
              </div>
            </div>

            {/* Results Column */}
            <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                  Estimated Annual Savings
                </span>
                <div className="mt-2 text-4xl font-black text-foreground sm:text-5xl">
                  ${moneySavedPerYear.toLocaleString()}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  in reclaimed founder productive capacity each year
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-primary/15 pt-4">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="size-3.5 text-primary" />
                    <span>Time Saved</span>
                  </div>
                  <div className="mt-1 text-xl font-bold text-foreground">
                    {hoursSavedPerYear} hrs
                  </div>
                  <div className="text-[11px] text-muted-foreground">Every year</div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <TrendingUp className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Growth Reclaimed</span>
                  </div>
                  <div className="mt-1 text-xl font-bold text-foreground">
                    ~{weeksOfWorkReclaimed} weeks
                  </div>
                  <div className="text-[11px] text-muted-foreground">of 40hr work weeks</div>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-full bg-background px-4 py-2.5 text-xs font-medium text-foreground border border-border">
                <Sparkles className="size-4 text-primary shrink-0" />
                <span>Ihsaab pays for itself within the first 48 hours of use.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

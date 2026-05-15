import { cn } from "@/lib/cn";

const toneClass: Record<string, string> = {
  purple: "text-[#D1C1FF]",
  pink: "text-[#D551C9]",
  amber: "text-[#F7B334]",
  green: "text-[#4ADE80]",
};

type Props = {
  value: string;
  label: string;
  tone: "purple" | "pink" | "amber" | "green";
};

export function MetricCard({ value, label, tone }: Props) {
  return (
    <div>
      <p
        className={cn(
          "font-sans text-[clamp(2.5rem,5vw,4rem)] font-extrabold leading-none",
          toneClass[tone],
        )}
      >
        {value}
      </p>
      <p className="mt-2 max-w-[14rem] font-body text-[0.75rem] font-semibold uppercase tracking-[0.14em] text-[rgba(209,193,255,0.55)]">
        {label}
      </p>
    </div>
  );
}

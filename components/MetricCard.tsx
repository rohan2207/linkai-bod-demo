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
          "font-serif text-2xl font-light sm:text-3xl",
          toneClass[tone],
        )}
      >
        {value}
      </p>
      <p className="mt-1 max-w-[14rem] text-[0.58rem] font-medium uppercase tracking-[0.14em] text-[rgba(209,193,255,0.35)]">
        {label}
      </p>
    </div>
  );
}

import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HELP_DICTIONARY } from "@/lib/transition-lexicon";
import { cn } from "@/lib/utils";

interface Props {
  term: keyof typeof HELP_DICTIONARY | string;
  /** Optional label shown next to the icon as a small helper tag. */
  label?: string;
  className?: string;
  iconClassName?: string;
}

export function TransitionHelpAnchor({ term, label, className, iconClassName }: Props) {
  const entry = HELP_DICTIONARY[term as keyof typeof HELP_DICTIONARY];
  if (!entry) return null;
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`شرح: ${term}`}
          className={cn(
            "inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2 py-0.5 text-[11px] text-primary hover:bg-primary/10 transition-colors align-middle",
            className,
          )}
        >
          <Info className={cn("h-3 w-3", iconClassName)} />
          {label && <span>{label}</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80 text-right leading-relaxed"
        dir="rtl"
      >
        <div className="space-y-3">
          <header className="border-b pb-2">
            <p className="text-[11px] text-muted-foreground">المصطلح</p>
            <p className="font-semibold text-sm">{term}</p>
          </header>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-primary">المعنى / التفسير المختصر</p>
            <p className="text-xs text-foreground/90">{entry.meaning}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-semibold text-primary">في المنصة</p>
            <p className="text-xs text-muted-foreground">{entry.inPlatform}</p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

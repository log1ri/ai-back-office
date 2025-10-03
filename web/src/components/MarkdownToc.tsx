import { useState } from "react";

// Table of contents item
export type TocItem = { id: string; text: string; level: number };
// Props for the table of contents component
type Props = {
  toc: TocItem[];
  className?: string;
  topOffset?: number;
};

// Linear interpolation between two HSL colors
function lerpHsl(startHue: number, endHue: number, t: number) {
  const h = startHue + (endHue - startHue) * t;
  return `hsl(${h}, 100%, 50%)`;  // Saturation=100%, Lightness=50% -> สีสด
}

export function MarkdownToc({ toc, className = "", topOffset = 80 }: Props) {
    const [activeId, setActiveId] = useState<string | null>(null);

    // Handle click event on TOC item
    const onClick = (id: string) => (event: React.MouseEvent) => {
        event.preventDefault();
        const element = document.getElementById(id);

        if (!element) return;

        const y = element.getBoundingClientRect().top + window.scrollY - topOffset;
        window.scrollTo({ top: y, behavior: "smooth" });
        history.replaceState(null, "", `#${id}`);
        setActiveId(id);
    };

    const n = Math.max(toc.length - 1, 1);

  return (
    <aside
      className={[
        "fixed top-16 right-12",
        "bg-white p-4 text-xs  border-solid border-gray-100  border-l-2 ",
        className,
      ].join(" ")}
      aria-label="Table of contents"
    >
      <ul className="space-y-2">
        {toc.map((item, idx) => {
          const isActive = item.id === activeId;
          const t = idx / n; // 0 → Top, 1 → Bottom
          const activeColor = lerpHsl(90, 260, t); 
          // 90° = green,yellow, 260° = purple,blue

          return (
            <li key={item.id} className={item.level >= 3 ? "ml-4" : "ml-0"}>
              <a
                href={`#${item.id}`}
                onClick={onClick(item.id)}
                style={isActive ? { color: activeColor } : {}}
                className={[
                  "block truncate",
                  isActive
                    ? "font-semibold"
                    : "text-gray-400 hover:text-gray-700"
                ].join(" ")}
                title={item.text}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}

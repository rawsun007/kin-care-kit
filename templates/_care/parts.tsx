/**
 * Drawn parts the papers share: each time of day's colour and icon, and a medicine drawn as it looks in the hand.
 * The times of day never rely on colour alone: each has its own icon and its name, for colour-blind readers.
 */
import { Circle, Line, Path, Rect, Svg } from "@hyper-elements/react";
import { PILL_COLORS, type PillColor } from "./fields";
import type { Slot } from "./languages";

/** Fixed, like traffic lights: the same in every brand. Each `ink` passes WCAG AA on its `tint` and on white. */
export const SLOT_COLORS: Record<Slot, { tint: string; ink: string; icon: string }> = {
  morning: { tint: "#fdf0d2", ink: "#7a4f00", icon: "#e0951a" },
  midday: { tint: "#e1eff7", ink: "#1b5677", icon: "#2f86b8" },
  evening: { tint: "#f8e3d8", ink: "#86381a", icon: "#d0663a" },
  bedtime: { tint: "#e7e5f5", ink: "#3b3675", icon: "#5a52a8" },
};

const rays = (cx: number, cy: number, r1: number, r2: number, angles: number[], color: string, w: number) =>
  angles.map((a) => {
    const rad = (a * Math.PI) / 180;
    return (
      <Line
        key={a}
        x1={cx + r1 * Math.cos(rad)}
        y1={cy - r1 * Math.sin(rad)}
        x2={cx + r2 * Math.cos(rad)}
        y2={cy - r2 * Math.sin(rad)}
        style={{ stroke: color, strokeWidth: w }}
      />
    );
  });

/** A time of day's icon: a rising sun, the sun overhead, a setting sun, the moon. */
export function SlotIcon({ slot, size = 32, color }: { slot: Slot; size?: number; color?: string }) {
  const c = color ?? SLOT_COLORS[slot].icon;
  const title = { morning: "Morning: a rising sun", midday: "Midday: the sun overhead", evening: "Evening: a setting sun", bedtime: "Bedtime: the moon" }[slot];
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" title={title}>
      {slot === "morning" ? (
        <>
          <Path d="M7 23 A9 9 0 0 1 25 23 Z" style={{ fill: c }} />
          {rays(16, 23, 12, 15, [90, 135, 45, 170, 10], c, 2.2)}
          <Line x1={3} y1={26.5} x2={29} y2={26.5} style={{ stroke: c, strokeWidth: 2.2 }} />
        </>
      ) : slot === "midday" ? (
        <>
          <Circle cx={16} cy={16} r={6.5} style={{ fill: c }} />
          {rays(16, 16, 9.5, 13.5, [0, 45, 90, 135, 180, 225, 270, 315], c, 2.2)}
        </>
      ) : slot === "evening" ? (
        <>
          <Path d="M9 21 A7 7 0 0 1 23 21 Z" style={{ fill: c }} />
          <Line x1={3} y1={21} x2={29} y2={21} style={{ stroke: c, strokeWidth: 2.2 }} />
          <Line x1={8} y1={25.5} x2={24} y2={25.5} style={{ stroke: c, strokeWidth: 2.2, opacity: 0.6 }} />
          <Path d="M13 6 L16 10 L19 6" style={{ fill: "transparent", stroke: c, strokeWidth: 2.2 }} />
        </>
      ) : (
        <>
          <Path d="M19 4.5 A12 12 0 1 0 27.5 22 A9.5 9.5 0 0 1 19 4.5 Z" style={{ fill: c }} />
          <Path d="M24 5 L25 7.6 L27.6 8.6 L25 9.6 L24 12.2 L23 9.6 L20.4 8.6 L23 7.6 Z" style={{ fill: c }} />
        </>
      )}
    </Svg>
  );
}

/** A medicine as it looks: a round tablet, a capsule in two halves, a bottle, a dropper, an inhaler, a pen, a patch. */
export function Pill({ form, color, size = 40 }: { form: string; color: string; size?: number }) {
  const { fill, stroke } = PILL_COLORS[(color as PillColor) in PILL_COLORS ? (color as PillColor) : "white"];
  const s = { fill, stroke, strokeWidth: 1.6 };
  const title = `${color} ${form}`;
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" title={title}>
      {form === "tablet" ? (
        <>
          <Circle cx={20} cy={20} r={14} style={s} />
          <Line x1={9} y1={20} x2={31} y2={20} style={{ stroke, strokeWidth: 1.4, opacity: 0.7 }} />
        </>
      ) : form === "capsule" ? (
        <>
          <Path d="M20 9 L12 9 A11 11 0 0 0 12 31 L20 31 Z" style={s} />
          <Path d="M20 9 L28 9 A11 11 0 0 1 28 31 L20 31 Z" style={{ ...s, fill: "#ffffff" }} />
        </>
      ) : form === "liquid" ? (
        <>
          <Rect x={16} y={4} width={8} height={6} rx={1.5} style={{ fill: stroke }} />
          <Rect x={10} y={10} width={20} height={26} rx={5} style={s} />
          <Rect x={13} y={19} width={14} height={9} rx={1.5} style={{ fill: "#ffffff", opacity: 0.85 }} />
        </>
      ) : form === "drops" ? (
        <Path d="M20 5 C26 15 31 20 31 26 A11 11 0 0 1 9 26 C9 20 14 15 20 5 Z" style={s} />
      ) : form === "inhaler" ? (
        <>
          <Rect x={14} y={4} width={12} height={22} rx={4} style={s} />
          <Path d="M12 24 L30 24 L30 34 L18 34 A6 6 0 0 1 12 28 Z" style={{ ...s, fill: "#ffffff" }} />
        </>
      ) : form === "injection" ? (
        <>
          <Rect x={8} y={15} width={22} height={10} rx={3} style={s} />
          <Rect x={30} y={18} width={4} height={4} style={{ fill: stroke }} />
          <Line x1={34} y1={20} x2={39} y2={20} style={{ stroke, strokeWidth: 1.4 }} />
          <Rect x={3} y={17} width={5} height={6} rx={1} style={{ fill: stroke }} />
        </>
      ) : (
        <>
          <Rect x={6} y={6} width={28} height={28} rx={7} style={s} />
          <Rect x={13} y={13} width={14} height={14} rx={3} style={{ fill: "#ffffff", opacity: 0.8 }} />
        </>
      )}
    </Svg>
  );
}

/** A box to tick on paper. */
export function TickBox({ size = 22, color = "#56605c" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 22 22" title="A box to tick">
      <Rect x={1.5} y={1.5} width={19} height={19} rx={4} style={{ fill: "#ffffff", stroke: color, strokeWidth: 1.6 }} />
    </Svg>
  );
}

/** A phone handset, for the emergency line. */
export function Phone({ size = 22, color = "#ffffff" }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" title="Phone">
      <Path
        d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1z"
        style={{ fill: color }}
      />
    </Svg>
  );
}

/** A small heart-and-house mark: the kit's own. */
export function Mark({ size = 40, color, accent }: { size?: number; color: string; accent: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40" title="Kin">
      <Path d="M20 4 L36 17 L36 36 L4 36 L4 17 Z" style={{ fill: color }} />
      <Path d="M20 31 C13 26 11 22.5 11 20 A4.5 4.5 0 0 1 20 18 A4.5 4.5 0 0 1 29 20 C29 22.5 27 26 20 31 Z" style={{ fill: accent }} />
    </Svg>
  );
}

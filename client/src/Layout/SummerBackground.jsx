/**
 * רקע קיצי קבוע בהשראת הפרוספקט: גבעות צבעוניות, שמש ועננים בתחתית המסך.
 * הוא fixed ו-pointer-events-none, ולכן אינו משפיע על הפריסה או על לחיצות,
 * ואינו מוצג למקראי מסך (aria-hidden).
 */
function Palm({ x, height = 250, flip = false }) {
  // גזע מעוגל וקצת נוטה, ומעליו עלים מתעקלים כלפי מטה.
  const frond = "M0 0C28-34 78-30 108 16C74-6 32-8 0 0Z"
  const angles = [-165, -130, -90, -50, -15]
  return (
    <g transform={`translate(${x} 0) scale(${flip ? -1 : 1} 1)`}>
      <path
        d={`M0 0C10 -${height * 0.4} -6 -${height * 0.75} 6 -${height}`}
        stroke="var(--color-sea-300)"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <g transform={`translate(6 -${height})`}>
        {angles.map((angle, i) => (
          <path
            key={angle}
            d={frond}
            transform={`rotate(${angle})`}
            fill={i % 2 ? "var(--color-sun-300)" : "var(--color-blush-300)"}
          />
        ))}
      </g>
    </g>
  )
}

function SummerBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* שמש ועננים */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMin slice"
      >
        <circle cx="1250" cy="170" r="84" fill="var(--color-sun-200)" opacity="0.7" />
        <circle cx="1250" cy="170" r="56" fill="var(--color-sun-300)" opacity="0.8" />
        <g fill="var(--color-sea-100)">
          <ellipse cx="220" cy="190" rx="90" ry="26" />
          <ellipse cx="280" cy="170" rx="60" ry="26" />
          <ellipse cx="760" cy="130" rx="80" ry="22" />
          <ellipse cx="815" cy="112" rx="52" ry="22" />
        </g>
      </svg>

      {/* גבעות ודקלים בתחתית המסך */}
      <svg
        className="absolute inset-x-0 bottom-0 h-[38vh] min-h-[220px] w-full overflow-visible"
        viewBox="0 0 1440 400"
        preserveAspectRatio="xMidYMax slice"
      >
        <g transform="translate(0 400)">
          <Palm x={150} height={250} />
          <Palm x={1300} height={290} flip />
        </g>
        <path
          d="M0 250C180 170 360 190 520 240C700 296 820 190 1000 200C1160 210 1300 270 1440 230V400H0Z"
          fill="var(--color-sea-200)"
        />
        <path
          d="M0 310C150 250 330 270 480 310C640 352 760 250 940 262C1120 275 1290 340 1440 300V400H0Z"
          fill="var(--color-sun-200)"
        />
        <path
          d="M0 350C200 310 360 340 560 360C760 380 960 320 1160 336C1290 346 1380 370 1440 360V400H0Z"
          fill="var(--color-blush-200)"
        />
      </svg>
    </div>
  )
}

export default SummerBackground

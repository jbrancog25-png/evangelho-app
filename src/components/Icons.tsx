import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function Glyph({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

/* ---------- Marca ---------- */

export function EvangelhoLogo(props: IconProps) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" {...props}>
      <g stroke="#c9d6e4" strokeWidth="2.4" strokeLinecap="round">
        <path d="M24 24 13 15M24 24l11-9M24 24 13 33M24 24l11 9M24 24v12" />
      </g>
      <circle cx="24" cy="22" r="6" fill="#f4a01c" />
      <circle cx="12" cy="14" r="4.6" fill="#2fa84f" />
      <circle cx="36" cy="14" r="4.6" fill="#e2542c" />
      <circle cx="11" cy="33" r="4.6" fill="#7c3aed" />
      <circle cx="37" cy="33" r="4.6" fill="#1d6fe8" />
      <circle cx="24" cy="38" r="4.2" fill="#12b3a6" />
    </svg>
  )
}

/* ---------- Interface ---------- */

export function InfoIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.2" />
      <circle cx="12" cy="7.9" r="1.1" fill="currentColor" stroke="none" />
    </Glyph>
  )
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Glyph strokeWidth={2} {...props}>
      <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
    </Glyph>
  )
}

export function PhotoIcon(props: IconProps) {
  return (
    <Glyph strokeWidth={1.5} {...props}>
      <rect x="3.2" y="5" width="17.6" height="14" rx="2.4" />
      <circle cx="8.4" cy="10" r="1.5" />
      <path d="m4.2 16.6 4.3-4a1.7 1.7 0 0 1 2.3 0l3 2.8 1.9-1.7a1.7 1.7 0 0 1 2.3 0l2.6 2.4" />
    </Glyph>
  )
}

/* ---------- Explorar ---------- */

export function EventosIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <rect x="3" y="5" width="18" height="16" rx="3.2" />
      <path d="M3 10h18M8 3.2v3.6M16 3.2v3.6" />
      <path
        d="m12 12.4 1.15 2.3 2.55.37-1.85 1.8.44 2.53L12 18.2l-2.29 1.2.44-2.53-1.85-1.8 2.55-.37z"
        fill="currentColor"
        stroke="none"
      />
    </Glyph>
  )
}

export function ShowsIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <rect x="9.3" y="2.6" width="5.4" height="10.2" rx="2.7" />
      <path d="M6.2 11.2a5.8 5.8 0 0 0 11.6 0" />
      <path d="M12 17v3.6M9 20.6h6" />
      <path d="M3.6 6.4 2.2 5M3.6 10.4H1.8M20.4 6.4 21.8 5M20.4 10.4h1.8" />
    </Glyph>
  )
}

export function EsportesIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <circle cx="15.2" cy="4.4" r="2.1" fill="currentColor" stroke="none" />
      <path d="M15.8 8 11.8 10.2l1.5 3.3-2.9 5" />
      <path d="m13.3 13.5 3.7 1.3 1.1 4.3" />
      <path d="M11.8 10.2 7.9 11.5" />
      <path d="M4.4 8.2h2.8M2.8 11.8h2.6M4.2 15.4h2.4" />
    </Glyph>
  )
}

export function VagasIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <rect x="3" y="7" width="18" height="12.6" rx="2.2" />
      <path d="M9 7V5.4A1.6 1.6 0 0 1 10.6 3.8h2.8A1.6 1.6 0 0 1 15 5.4V7" />
      <path d="M3 12.6h18" />
      <path d="M10.5 12v1.6h3V12" />
    </Glyph>
  )
}

export function InglesIcon(props: IconProps) {
  return (
    <Glyph strokeWidth={1.6} {...props}>
      <path d="M3.2 5h17.6v10.6a2 2 0 0 1-2 2H8l-3.4 2.8v-2.8H5.2a2 2 0 0 1-2-2Z" />
      <g fill="currentColor" stroke="none" fontSize="7" fontWeight="800" textAnchor="middle">
        <text x="9.2" y="13.2">A</text>
        <text x="15" y="13.2">文</text>
      </g>
    </Glyph>
  )
}

export function CulturaIcon(props: IconProps) {
  return (
    <Glyph strokeWidth={1.6} {...props}>
      <path d="M2.6 5.1c3.2-.8 5.9-.8 9.1 0 .3 4.7-.4 7.3-2.1 9-1.5 1.5-3.4 1.5-4.9 0-1.7-1.7-2.4-4.3-2.1-9Z" />
      <circle cx="5.3" cy="8.4" r=".85" fill="currentColor" stroke="none" />
      <circle cx="8.9" cy="8.4" r=".85" fill="currentColor" stroke="none" />
      <path d="M5.7 11.3c1 .9 2.4.9 3.4 0" />
      <path d="M12.3 8.1c3.2-.8 5.9-.8 9.1 0 .3 4.7-.4 7.3-2.1 9-1.5 1.5-3.4 1.5-4.9 0-1.7-1.7-2.4-4.3-2.1-9Z" />
      <circle cx="15" cy="11.4" r=".85" fill="currentColor" stroke="none" />
      <circle cx="18.6" cy="11.4" r=".85" fill="currentColor" stroke="none" />
      <path d="M15.4 15.2c1-.9 2.4-.9 3.4 0" />
    </Glyph>
  )
}

export function EducacaoIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M12 6.6C10.3 5.3 8 4.7 4 4.8v12.6c4-.1 6.3.5 8 1.8 1.7-1.3 4-1.9 8-1.8V4.8c-4-.1-6.3.5-8 1.8Z" />
      <path d="M12 6.6v12.6" />
    </Glyph>
  )
}

export function CursosIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M2.6 9.1 12 4.6l9.4 4.5-9.4 4.5-9.4-4.5Z" />
      <path d="M6.7 11.1v4.6c0 1.6 2.4 2.9 5.3 2.9s5.3-1.3 5.3-2.9v-4.6" />
      <path d="M20.4 9.6v5.1" />
    </Glyph>
  )
}

export function SaudeIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M12 20.2s-7.6-4.5-7.6-9.6a4.2 4.2 0 0 1 7.6-2.5 4.2 4.2 0 0 1 7.6 2.5c0 5.1-7.6 9.6-7.6 9.6Z" />
      <path d="M5.5 12.6h2.9l1.4-2.5 2 4.4 1.5-2.9.9 1h3.4" />
    </Glyph>
  )
}

export function SangueIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path
        d="M12 3s6.3 6.7 6.3 10.7A6.3 6.3 0 0 1 5.7 13.7C5.7 9.7 12 3 12 3Z"
        fill="currentColor"
        stroke="none"
      />
      <path
        d="M12 17.9s-3-1.8-3-3.7a1.65 1.65 0 0 1 3-.95 1.65 1.65 0 0 1 3 .95c0 1.9-3 3.7-3 3.7Z"
        fill="#ffffff"
        stroke="none"
      />
    </Glyph>
  )
}

export function CestasIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M3.2 9.4h17.6l-1.7 8.4a2.1 2.1 0 0 1-2.1 1.7H7a2.1 2.1 0 0 1-2.1-1.7L3.2 9.4Z" />
      <path d="M8.1 9.4 10.7 4M15.9 9.4 13.3 4" />
      <path d="M9.6 12.7v3.2M14.4 12.7v3.2" />
    </Glyph>
  )
}

export function MissoesIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <circle cx="11.4" cy="12.6" r="8" />
      <circle cx="11.4" cy="12.6" r="4.3" />
      <circle cx="11.4" cy="12.6" r="1.3" fill="currentColor" stroke="none" />
      <path d="m11.4 12.6 8.4-8.4" />
      <path d="M16.6 4.3h3.5v3.5" />
    </Glyph>
  )
}

export function BeneficiosIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path
        d="M11.4 3.1H19a1.9 1.9 0 0 1 1.9 1.9v7.6a2 2 0 0 1-.6 1.4l-6.4 6.4a2 2 0 0 1-2.8 0l-6.4-6.4a2 2 0 0 1 0-2.8L10 3.7a2 2 0 0 1 1.4-.6Z"
        fill="currentColor"
        stroke="none"
      />
      <circle cx="16.5" cy="7.5" r="1.4" fill="#ffffff" stroke="none" />
      <path d="m9.2 14.8 4.8-4.8" stroke="#ffffff" strokeWidth={1.6} />
      <circle cx="9.5" cy="10.4" r="1.15" stroke="#ffffff" strokeWidth={1.3} />
      <circle cx="13.8" cy="14.7" r="1.15" stroke="#ffffff" strokeWidth={1.3} />
    </Glyph>
  )
}

export function ParceirosIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M2.6 9.4 6 7.2a2.2 2.2 0 0 1 2.4 0l2.4 1.6h2.4l2.4-1.6a2.2 2.2 0 0 1 2.4 0l3.4 2.2" />
      <path d="M2.6 9.4v4.9a1.7 1.7 0 0 0 1.7 1.7h1.5" />
      <path d="M21.4 9.4v4.9a1.7 1.7 0 0 1-1.7 1.7h-1.5" />
      <path d="M9.6 12.2 7.4 14.4a1.55 1.55 0 0 0 2.2 2.2l1.1-1.1 1.4 1.4a1.55 1.55 0 0 0 2.2-2.2l-.5-.5.6.6a1.55 1.55 0 0 0 2.2-2.2l-2.8-2.8" />
    </Glyph>
  )
}

export function CarteiraIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <rect x="2.2" y="6" width="14" height="11.4" rx="2.4" />
      <path d="M2.2 10h14" />
      <path d="M5.4 14.2h3.2" />
      <path d="M17.9 9.4a4 4 0 0 1 0 4.8M20.4 7.6a7.4 7.4 0 0 1 0 8.4" />
    </Glyph>
  )
}

export function RankingIcon(props: IconProps) {
  return (
    <Glyph strokeWidth={1.6} {...props}>
      <path
        d="m12 2.2 1.2 2.45 2.7.4-1.95 1.9.46 2.7L12 8.37 9.59 9.65l.46-2.7L8.1 5.05l2.7-.4z"
        fill="currentColor"
        stroke="none"
      />
      <rect x="9.1" y="10.6" width="5.8" height="9.4" rx="1" />
      <rect x="2.6" y="13.4" width="6.5" height="6.6" rx="1" />
      <rect x="14.9" y="15.4" width="6.5" height="4.6" rx="1" />
      <g fill="currentColor" stroke="none" fontSize="5.2" fontWeight="700" textAnchor="middle">
        <text x="12" y="17.2">
          1
        </text>
        <text x="5.85" y="18.2">
          2
        </text>
        <text x="18.15" y="18.9">
          3
        </text>
      </g>
    </Glyph>
  )
}

export function PerfilIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="12" r="9.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="9.7" r="3.5" fill="#000000" stroke="none" />
      <path
        d="M5.3 19.1a6.9 6.9 0 0 1 13.4 0 9.35 9.35 0 0 1-13.4 0Z"
        fill="#000000"
        stroke="none"
      />
    </Glyph>
  )
}

/* ---------- Igreja ---------- */

export function CultosIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M12 3v3M10.4 6h3.2" />
      <path d="M4 20V11l8-4 8 4v9" />
      <path d="M9 20v-4a3 3 0 0 1 6 0v4" />
      <path d="M4 20h16" />
    </Glyph>
  )
}

export function BibliaIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M5 4h11a2 2 0 0 1 2 2v13a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
      <path d="M3 18a2 2 0 0 1 2-2h13" />
      <path d="M10.5 8.4h3M12 7v3" />
    </Glyph>
  )
}

export function LouvoresIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M9 18V7l10-2v11" />
      <circle cx="7" cy="18" r="2.4" fill="currentColor" stroke="none" />
      <circle cx="17" cy="16" r="2.4" fill="currentColor" stroke="none" />
    </Glyph>
  )
}

export function DizimoIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path
        d="M12 20.2s-7.6-4.5-7.6-9.6a4.2 4.2 0 0 1 7.6-2.5 4.2 4.2 0 0 1 7.6 2.5c0 5.1-7.6 9.6-7.6 9.6Z"
        fill="currentColor"
        stroke="none"
      />
      <path d="M12 11v4" stroke="#000000" strokeWidth={1.8} />
      <path d="M10.5 14h3" stroke="#000000" strokeWidth={1.8} />
      <path d="M10.6 12h2.8" stroke="#000000" strokeWidth={1.8} />
    </Glyph>
  )
}

export function DesapegoIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <rect x="3.5" y="8" width="17" height="12" rx="1.5" />
      <path d="M3.5 12h17" />
      <path d="M12 8v12" />
      <path d="M8 8c0-2 1.6-3.4 2.8-3.4 1.2 0 1.2 1.6 1.2 3.4" />
      <path d="M16 8c0-2-1.6-3.4-2.8-3.4-1.2 0-1.2 1.6-1.2 3.4" />
    </Glyph>
  )
}

export function CompartilharIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <circle cx="6" cy="12" r="2.4" />
      <circle cx="17.5" cy="6" r="2.4" />
      <circle cx="17.5" cy="18" r="2.4" />
      <path d="m8.1 11 7.3-3.9M8.1 13l7.3 3.9" />
    </Glyph>
  )
}

'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

/* ────────────────────────────────────────────────────────────────── */
/*  Types                                                            */
/* ────────────────────────────────────────────────────────────────── */

interface HealthConcernsProps {
  value: string[];
  onChange: (value: string[]) => void;
}

interface SubZone {
  id: string;
  concerns: string[];
  cx: number;
  cy: number;
}

interface BodyZone {
  id: string;
  subZones: SubZone[];
  cx: number;
  cy: number;
}

/* ────────────────────────────────────────────────────────────────── */
/*  Data                                                             */
/* ────────────────────────────────────────────────────────────────── */

const ZONES: BodyZone[] = [
  {
    id: 'head',
    cx: 50,
    cy: 10,
    subZones: [
      { id: 'hair', concerns: ['hairLoss', 'thinHair'], cx: 50, cy: 12 },
      { id: 'mind', concerns: ['headaches', 'brainFog', 'poorConcentration'], cx: 50, cy: 30 },
      { id: 'face', concerns: ['acne', 'dryness', 'darkCircles'], cx: 35, cy: 48 },
      { id: 'eyes', concerns: ['eyeStrain'], cx: 65, cy: 45 },
      { id: 'mouth', concerns: ['badBreath', 'dryLips'], cx: 50, cy: 65 },
    ],
  },
  {
    id: 'torso',
    cx: 50,
    cy: 33,
    subZones: [
      { id: 'neck', concerns: ['neckTension'], cx: 50, cy: 10 },
      { id: 'skin', concerns: ['acne', 'dryness', 'rashes'], cx: 50, cy: 35 },
      { id: 'energy', concerns: ['fatigue', 'lowStamina'], cx: 50, cy: 55 },
      { id: 'back', concerns: ['backPain'], cx: 80, cy: 45 },
    ],
  },
  {
    id: 'stomach',
    cx: 50,
    cy: 52,
    subZones: [
      { id: 'upper', concerns: ['bloating', 'acidReflux'], cx: 50, cy: 30 },
      { id: 'lower', concerns: ['irregularity', 'cramps'], cx: 50, cy: 70 },
    ],
  },
  {
    id: 'arms',
    cx: 82,
    cy: 42,
    subZones: [
      { id: 'upperArm', concerns: ['armPain', 'numbness'], cx: 50, cy: 30 },
      { id: 'hands', concerns: ['coldHands', 'brittleNails'], cx: 50, cy: 70 },
    ],
  },
  {
    id: 'legs',
    cx: 50,
    cy: 75,
    subZones: [
      { id: 'joints', concerns: ['jointPain', 'stiffness'], cx: 50, cy: 25 },
      { id: 'muscles', concerns: ['muscleAches', 'legCramps'], cx: 50, cy: 55 },
      { id: 'feet', concerns: ['swollenFeet', 'other'], cx: 50, cy: 80 },
    ],
  },
];

const ALL_CONCERNS = [...new Set(ZONES.flatMap((z) => z.subZones.flatMap((sz) => sz.concerns)))];

const ZONE_HIGHLIGHT: Record<string, { y: number; h: number }> = {
  head: { y: 0, h: 70 },
  torso: { y: 55, h: 95 },
  stomach: { y: 120, h: 60 },
  arms: { y: 60, h: 100 },
  legs: { y: 155, h: 125 },
};

/* Shared spring for synchronized animations */
const SYNC_SPRING = { type: 'spring' as const, stiffness: 140, damping: 20 };

/* ────────────────────────────────────────────────────────────────── */
/*  Zoomed SVGs                                                      */
/* ────────────────────────────────────────────────────────────────── */

function HeadSVG() {
  return (
    <svg viewBox="0 0 200 220" className="h-full w-full" fill="none">
      <ellipse cx="100" cy="90" rx="60" ry="75" stroke="#4b6b64" strokeWidth="1.5" strokeOpacity="0.3" />
      {/* Hair — voluminous filled shape with flowing strands */}
      <path
        d="M42 72 Q38 45 50 28 Q62 12 80 6 Q100 -2 120 6 Q138 12 150 28 Q162 45 158 72
           Q155 60 148 50 Q138 38 125 48 Q112 56 100 52 Q88 56 75 48 Q62 38 52 50 Q45 60 42 72Z"
        fill="#4b6b64"
        fillOpacity="0.08"
        stroke="#4b6b64"
        strokeWidth="1.2"
        strokeOpacity="0.3"
      />
      {/* Hair top volume */}
      <path
        d="M50 30 Q65 8 100 2 Q135 8 150 30"
        stroke="#4b6b64"
        strokeWidth="1.8"
        strokeOpacity="0.35"
        strokeLinecap="round"
      />
      {/* Side volume left */}
      <path
        d="M42 72 Q36 55 42 38 Q48 22 65 14"
        stroke="#4b6b64"
        strokeWidth="1.5"
        strokeOpacity="0.28"
        strokeLinecap="round"
      />
      {/* Side volume right */}
      <path
        d="M158 72 Q164 55 158 38 Q152 22 135 14"
        stroke="#4b6b64"
        strokeWidth="1.5"
        strokeOpacity="0.28"
        strokeLinecap="round"
      />
      {/* Flowing strands */}
      <path d="M55 28 Q70 10 100 5 Q130 10 145 28" stroke="#4b6b64" strokeWidth="1" strokeOpacity="0.2" strokeLinecap="round" />
      <path d="M48 45 Q52 32 65 22" stroke="#4b6b64" strokeWidth="1" strokeOpacity="0.18" strokeLinecap="round" />
      <path d="M152 45 Q148 32 135 22" stroke="#4b6b64" strokeWidth="1" strokeOpacity="0.18" strokeLinecap="round" />
      {/* Part line */}
      <path d="M100 2 Q98 18 100 35" stroke="#4b6b64" strokeWidth="0.8" strokeOpacity="0.12" />
      {/* Subtle wave texture */}
      <path d="M60 40 Q72 34 85 42 Q100 50 115 42 Q128 34 140 40" stroke="#4b6b64" strokeWidth="0.8" strokeOpacity="0.12" />
      {/* Original hairline */}
      <path d="M45 70 Q60 20 100 15 Q140 20 155 70" stroke="#4b6b64" strokeWidth="1.2" strokeOpacity="0.15" />
      <ellipse cx="75" cy="85" rx="12" ry="7" stroke="#4b6b64" strokeWidth="1.2" strokeOpacity="0.25" />
      <ellipse cx="125" cy="85" rx="12" ry="7" stroke="#4b6b64" strokeWidth="1.2" strokeOpacity="0.25" />
      <path d="M100 95 L96 115 L104 115" stroke="#4b6b64" strokeWidth="1" strokeOpacity="0.2" />
      <path d="M82 135 Q100 148 118 135" stroke="#4b6b64" strokeWidth="1.2" strokeOpacity="0.25" />
      <path d="M80 162 L80 210 M120 162 L120 210" stroke="#4b6b64" strokeWidth="1.2" strokeOpacity="0.2" />
    </svg>
  );
}

function TorsoSVG() {
  return (
    <svg viewBox="0 0 200 240" className="h-full w-full" fill="none">
      <path d="M85 0 L85 20 M115 0 L115 20" stroke="#4b6b64" strokeWidth="1.5" strokeOpacity="0.25" />
      <path d="M85 20 Q60 25 30 40" stroke="#4b6b64" strokeWidth="1.5" strokeOpacity="0.3" />
      <path d="M115 20 Q140 25 170 40" stroke="#4b6b64" strokeWidth="1.5" strokeOpacity="0.3" />
      <path d="M30 40 L35 120 L45 180 Q100 200 155 180 L165 120 L170 40" stroke="#4b6b64" strokeWidth="1.5" strokeOpacity="0.3" />
      <path d="M55 60 Q100 75 145 60" stroke="#4b6b64" strokeWidth="1" strokeOpacity="0.15" />
      <line x1="100" y1="20" x2="100" y2="190" stroke="#4b6b64" strokeWidth="0.8" strokeOpacity="0.1" />
      <circle cx="170" cy="80" r="2" fill="#4b6b64" fillOpacity="0.15" />
      <circle cx="168" cy="100" r="2" fill="#4b6b64" fillOpacity="0.15" />
      <circle cx="166" cy="120" r="2" fill="#4b6b64" fillOpacity="0.15" />
    </svg>
  );
}

function StomachSVG() {
  return (
    <svg viewBox="0 0 200 220" className="h-full w-full" fill="none">
      <path d="M40 10 L40 100 Q40 140 70 160 Q100 175 130 160 Q160 140 160 100 L160 10" stroke="#4b6b64" strokeWidth="1.5" strokeOpacity="0.3" />
      <ellipse cx="100" cy="55" rx="40" ry="30" stroke="#4b6b64" strokeWidth="1" strokeOpacity="0.2" />
      <path d="M65 110 Q80 95 100 100 Q120 105 135 95" stroke="#4b6b64" strokeWidth="1" strokeOpacity="0.15" />
      <path d="M70 130 Q85 120 100 125 Q115 130 130 120" stroke="#4b6b64" strokeWidth="1" strokeOpacity="0.15" />
      <circle cx="100" cy="80" r="3" stroke="#4b6b64" strokeWidth="1" strokeOpacity="0.2" />
      <line x1="100" y1="10" x2="100" y2="170" stroke="#4b6b64" strokeWidth="0.8" strokeOpacity="0.1" />
    </svg>
  );
}

function ArmsSVG() {
  return (
    <svg viewBox="0 0 200 240" className="h-full w-full" fill="none">
      {/* Shoulder line */}
      <path d="M60 10 Q100 5 140 10" stroke="#4b6b64" strokeWidth="1.5" strokeOpacity="0.3" />

      {/* Left arm outer */}
      <path d="M60 10 Q45 20 38 50 L30 90 L25 130" stroke="#4b6b64" strokeWidth="1.5" strokeOpacity="0.3" />
      {/* Left arm inner */}
      <path d="M75 14 Q62 22 56 48 L48 88 L44 125" stroke="#4b6b64" strokeWidth="1.2" strokeOpacity="0.22" />
      {/* Left elbow */}
      <circle cx="40" cy="88" r="6" stroke="#4b6b64" strokeWidth="1" strokeOpacity="0.2" />
      {/* Left wrist */}
      <path d="M25 130 Q24 135 26 140 M44 125 Q43 132 42 137" stroke="#4b6b64" strokeWidth="0.8" strokeOpacity="0.18" />
      {/* Left hand */}
      <ellipse cx="33" cy="150" rx="12" ry="16" stroke="#4b6b64" strokeWidth="1.2" strokeOpacity="0.25" />
      {/* Left fingers */}
      <path d="M24 158 L20 172" stroke="#4b6b64" strokeWidth="0.8" strokeOpacity="0.15" />
      <path d="M28 162 L25 178" stroke="#4b6b64" strokeWidth="0.8" strokeOpacity="0.15" />
      <path d="M33 163 L33 180" stroke="#4b6b64" strokeWidth="0.8" strokeOpacity="0.15" />
      <path d="M38 162 L40 177" stroke="#4b6b64" strokeWidth="0.8" strokeOpacity="0.15" />
      {/* Left thumb */}
      <path d="M44 144 Q50 148 48 158" stroke="#4b6b64" strokeWidth="0.8" strokeOpacity="0.15" />

      {/* Right arm outer */}
      <path d="M140 10 Q155 20 162 50 L170 90 L175 130" stroke="#4b6b64" strokeWidth="1.5" strokeOpacity="0.3" />
      {/* Right arm inner */}
      <path d="M125 14 Q138 22 144 48 L152 88 L156 125" stroke="#4b6b64" strokeWidth="1.2" strokeOpacity="0.22" />
      {/* Right elbow */}
      <circle cx="160" cy="88" r="6" stroke="#4b6b64" strokeWidth="1" strokeOpacity="0.2" />
      {/* Right wrist */}
      <path d="M175 130 Q176 135 174 140 M156 125 Q157 132 158 137" stroke="#4b6b64" strokeWidth="0.8" strokeOpacity="0.18" />
      {/* Right hand */}
      <ellipse cx="167" cy="150" rx="12" ry="16" stroke="#4b6b64" strokeWidth="1.2" strokeOpacity="0.25" />
      {/* Right fingers */}
      <path d="M176 158 L180 172" stroke="#4b6b64" strokeWidth="0.8" strokeOpacity="0.15" />
      <path d="M172 162 L175 178" stroke="#4b6b64" strokeWidth="0.8" strokeOpacity="0.15" />
      <path d="M167 163 L167 180" stroke="#4b6b64" strokeWidth="0.8" strokeOpacity="0.15" />
      <path d="M162 162 L160 177" stroke="#4b6b64" strokeWidth="0.8" strokeOpacity="0.15" />
      {/* Right thumb */}
      <path d="M156 144 Q150 148 152 158" stroke="#4b6b64" strokeWidth="0.8" strokeOpacity="0.15" />

      {/* Nail hints */}
      <ellipse cx="33" cy="178" rx="2" ry="1.5" stroke="#4b6b64" strokeWidth="0.6" strokeOpacity="0.12" />
      <ellipse cx="167" cy="178" rx="2" ry="1.5" stroke="#4b6b64" strokeWidth="0.6" strokeOpacity="0.12" />
    </svg>
  );
}

function LegsSVG() {
  return (
    <svg viewBox="0 0 200 260" className="h-full w-full" fill="none">
      {/* Hip line */}
      <path d="M50 10 Q100 25 150 10" stroke="#4b6b64" strokeWidth="1.5" strokeOpacity="0.3" />
      {/* Left leg */}
      <path d="M65 15 L60 80 L55 140 L52 200 L48 240" stroke="#4b6b64" strokeWidth="1.5" strokeOpacity="0.3" />
      <path d="M85 15 L80 80 L78 140 L76 200 L73 240" stroke="#4b6b64" strokeWidth="1.5" strokeOpacity="0.3" />
      <circle cx="70" cy="120" r="8" stroke="#4b6b64" strokeWidth="1" strokeOpacity="0.2" />
      <circle cx="62" cy="220" r="5" stroke="#4b6b64" strokeWidth="1" strokeOpacity="0.15" />
      <path d="M48 240 Q40 248 38 250" stroke="#4b6b64" strokeWidth="1.2" strokeOpacity="0.2" />
      {/* Right leg */}
      <path d="M115 15 L120 80 L122 140 L124 200 L127 240" stroke="#4b6b64" strokeWidth="1.5" strokeOpacity="0.3" />
      <path d="M135 15 L140 80 L145 140 L148 200 L152 240" stroke="#4b6b64" strokeWidth="1.5" strokeOpacity="0.3" />
      <circle cx="130" cy="120" r="8" stroke="#4b6b64" strokeWidth="1" strokeOpacity="0.2" />
      <circle cx="140" cy="220" r="5" stroke="#4b6b64" strokeWidth="1" strokeOpacity="0.15" />
      <path d="M152 240 Q160 248 162 250" stroke="#4b6b64" strokeWidth="1.2" strokeOpacity="0.2" />
    </svg>
  );
}

const ZONE_SVG: Record<string, React.FC> = {
  head: HeadSVG,
  torso: TorsoSVG,
  stomach: StomachSVG,
  arms: ArmsSVG,
  legs: LegsSVG,
};

/* ────────────────────────────────────────────────────────────────── */
/*  Component                                                        */
/* ────────────────────────────────────────────────────────────────── */

export default function HealthConcerns({ value, onChange }: HealthConcernsProps) {
  const t = useTranslations('diagnosis.q13b');

  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [activeSubZone, setActiveSubZone] = useState<string | null>(null);

  const [otherText, setOtherText] = useState(() => {
    const otherEntry = value.find((v) => v.startsWith('other:'));
    return otherEntry ? otherEntry.slice(6) : '';
  });

  const isSelected = useCallback(
    (key: string) => {
      if (key === 'other') return value.some((v) => v === 'other' || v.startsWith('other:'));
      return value.includes(key);
    },
    [value],
  );

  const toggleConcern = useCallback(
    (key: string) => {
      try { navigator.vibrate?.(10); } catch {}
      if (key === 'other') {
        const hasOther = value.some((v) => v === 'other' || v.startsWith('other:'));
        if (hasOther) {
          onChange(value.filter((v) => v !== 'other' && !v.startsWith('other:')));
          setOtherText('');
        } else {
          onChange([...value, 'other']);
        }
        return;
      }
      if (value.includes(key)) {
        onChange(value.filter((v) => v !== key));
      } else {
        onChange([...value, key]);
      }
    },
    [value, onChange],
  );

  const handleOtherTextChange = useCallback(
    (text: string) => {
      setOtherText(text);
      const filtered = value.filter((v) => v !== 'other' && !v.startsWith('other:'));
      onChange(text.trim() ? [...filtered, `other:${text}`] : [...filtered, 'other']);
    },
    [value, onChange],
  );

  const getZoneSelectedCount = useCallback(
    (zone: BodyZone) => zone.subZones.flatMap((sz) => sz.concerns).filter((k) => isSelected(k)).length,
    [isSelected],
  );

  const getSubZoneSelectedCount = useCallback(
    (sz: SubZone) => sz.concerns.filter((k) => isSelected(k)).length,
    [isSelected],
  );

  const currentZone = ZONES.find((z) => z.id === activeZone) ?? null;
  const currentSubZone = currentZone?.subZones.find((sz) => sz.id === activeSubZone) ?? null;
  const ZoneSVGComponent = activeZone ? ZONE_SVG[activeZone] : null;
  const totalSelected = ALL_CONCERNS.filter((k) => isSelected(k)).length;
  const otherIsSelected = value.some((v) => v === 'other' || v.startsWith('other:'));
  const isZoomed = activeZone !== null;
  const highlight = activeZone ? ZONE_HIGHLIGHT[activeZone] : null;
  const hasChips = activeSubZone !== null;

  return (
    <div className="mx-auto w-full max-w-2xl overflow-hidden">
      <h2 className="mb-2 text-center text-3xl font-bold tracking-tight sm:text-4xl">
        {t('title')}
      </h2>
      <p className="mb-6 text-center text-ofira-text-secondary">{t('subtitle')}</p>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/*  Stage                                                      */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <div
        className="relative mx-auto flex min-h-[340px] items-center justify-center sm:min-h-[380px]"
        style={{ perspective: 1400 }}
      >

        {/* ───────────────────────────────────────────────── */}
        {/*  BODY SILHOUETTE — always rendered, slides left   */}
        {/* ───────────────────────────────────────────────── */}
        <motion.div
          className="relative flex-shrink-0"
          animate={{
            x: isZoomed ? -60 : 0,
            scale: isZoomed ? 0.48 : 1,
            rotateY: isZoomed ? 22 : 0,
            rotateX: isZoomed ? 3 : 0,
            opacity: isZoomed ? 0.6 : 1,
          }}
          transition={SYNC_SPRING}
          style={{
            transformStyle: 'preserve-3d',
            transformOrigin: 'center center',
            width: 180,
            zIndex: 10,
          }}
        >
          <div className="relative" style={{ width: 180, height: 280 }}>
            <svg viewBox="0 0 180 280" width={180} height={280} fill="none">
              {highlight && (
                <motion.rect
                  x="20"
                  y={highlight.y}
                  width="140"
                  height={highlight.h}
                  rx="12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  fill="url(#zoneGlow)"
                  stroke="#0d9488"
                  strokeWidth="0.8"
                  strokeOpacity="0.3"
                />
              )}
              <defs>
                <radialGradient id="zoneGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#0d9488" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity="0.02" />
                </radialGradient>
              </defs>

              <ellipse cx="90" cy="30" rx="18" ry="22" stroke="#4b6b64" strokeWidth="1.5" strokeOpacity="0.35" />
              <line x1="90" y1="52" x2="90" y2="62" stroke="#4b6b64" strokeWidth="1.5" strokeOpacity="0.35" />
              <path d="M90 62 Q90 68 60 74 L55 74" stroke="#4b6b64" strokeWidth="1.5" strokeOpacity="0.35" />
              <path d="M90 62 Q90 68 120 74 L125 74" stroke="#4b6b64" strokeWidth="1.5" strokeOpacity="0.35" />
              <path d="M55 74 Q48 100 42 130 Q40 140 44 148" stroke="#4b6b64" strokeWidth="1.5" strokeOpacity="0.35" />
              <path d="M125 74 Q132 100 138 130 Q140 140 136 148" stroke="#4b6b64" strokeWidth="1.5" strokeOpacity="0.35" />
              <path d="M60 74 L62 120 L65 145" stroke="#4b6b64" strokeWidth="1.5" strokeOpacity="0.35" />
              <path d="M120 74 L118 120 L115 145" stroke="#4b6b64" strokeWidth="1.5" strokeOpacity="0.35" />
              <path d="M65 145 Q90 155 115 145" stroke="#4b6b64" strokeWidth="1.5" strokeOpacity="0.35" />
              <path d="M72 150 L68 200 L66 240 L62 265" stroke="#4b6b64" strokeWidth="1.5" strokeOpacity="0.35" />
              <path d="M108 150 L112 200 L114 240 L118 265" stroke="#4b6b64" strokeWidth="1.5" strokeOpacity="0.35" />
              <path d="M62 265 Q56 270 54 272" stroke="#4b6b64" strokeWidth="1.5" strokeOpacity="0.35" />
              <path d="M118 265 Q124 270 126 272" stroke="#4b6b64" strokeWidth="1.5" strokeOpacity="0.35" />
            </svg>

            {/* Hotspots */}
            {ZONES.map((zone) => {
              const count = getZoneSelectedCount(zone);
              const hasSelections = count > 0;
              const isActive = activeZone === zone.id;
              const dotColor = isActive ? '#0d9488' : hasSelections ? '#ff9e7a' : '#0d9488';

              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => {
                    try { navigator.vibrate?.(10); } catch {}
                    if (activeZone === zone.id) {
                      setActiveZone(null);
                      setActiveSubZone(null);
                    } else {
                      setActiveZone(zone.id);
                      setActiveSubZone(null);
                    }
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${zone.cx}%`, top: `${zone.cy}%`, width: 48, height: 48 }}
                >
                  <motion.div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{ width: 28, height: 28, background: `radial-gradient(circle, ${dotColor}40 0%, transparent 70%)` }}
                    animate={
                      isActive
                        ? { scale: [1, 2, 1], opacity: [0.6, 1, 0.6] }
                        : { scale: [1, 1.6, 1], opacity: [0.5, 0.8, 0.5] }
                    }
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                    style={{
                      width: 12,
                      height: 12,
                      backgroundColor: dotColor,
                      boxShadow: `0 0 ${isActive ? 20 : 12}px ${dotColor}80`,
                    }}
                    animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  {hasSelections && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ofira-peach px-1 text-[10px] font-bold text-[#0c0a14]"
                    >
                      {count}
                    </motion.div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Total badge */}
          {!isZoomed && totalSelected > 0 && (
            <motion.div className="mt-3 flex justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <span className="rounded-full bg-ofira-violet/15 px-3 py-1 text-xs font-semibold text-ofira-violet">
                {totalSelected}
              </span>
            </motion.div>
          )}
        </motion.div>

        {/* ───────────────────────────────────────────────── */}
        {/*  BACKDROP — click to dismiss (back to body)       */}
        {/* ───────────────────────────────────────────────── */}
        <AnimatePresence>
          {isZoomed && (
            <motion.button
              key="backdrop"
              type="button"
              aria-label={t('backToBody')}
              onClick={() => {
                setActiveZone(null);
                setActiveSubZone(null);
              }}
              className="absolute inset-0 z-[5] cursor-default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>

        {/* ───────────────────────────────────────────────── */}
        {/*  3D ZOOMED ZONE — appears simultaneously          */}
        {/* ───────────────────────────────────────────────── */}
        <AnimatePresence>
          {isZoomed && currentZone && ZoneSVGComponent && (
            <motion.div
              key={`zoom-${currentZone.id}`}
              className="absolute"
              style={{
                transformStyle: 'preserve-3d',
                transformOrigin: 'center center',
                zIndex: 20,
                /* Position: center when no chips, shift left when chips visible */
                left: '50%',
              }}
              initial={{ opacity: 0, scale: 0.5, rotateY: -60, x: '-20%' }}
              animate={{
                opacity: 1,
                scale: 1,
                rotateY: -14,
                rotateX: 4,
                x: hasChips ? '-55%' : '-20%',
              }}
              exit={{ opacity: 0, scale: 0.5, rotateY: -60, x: '-20%' }}
              transition={SYNC_SPRING}
            >
              {/* Depth shadow */}
              <div
                className="pointer-events-none absolute -inset-4 rounded-3xl"
                style={{
                  transform: 'translateZ(-40px)',
                  background: 'radial-gradient(ellipse at 40% 30%, rgba(13,148,136,0.1), rgba(255,158,122,0.04) 60%, transparent 80%)',
                  filter: 'blur(24px)',
                }}
              />

              {/* Floor shadow */}
              <div
                className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2"
                style={{
                  width: '80%',
                  height: 20,
                  background: 'radial-gradient(ellipse, rgba(13,148,136,0.15) 0%, transparent 70%)',
                  filter: 'blur(10px)',
                  transform: 'translateZ(-50px) rotateX(80deg)',
                }}
              />

              {/* Glass card */}
              <motion.div
                className="relative overflow-hidden rounded-2xl"
                style={{
                  width: 210,
                  height: 260,
                  background: 'rgba(255, 255, 255, 0.98)',
                  boxShadow:
                    '0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(13,148,136,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
                  border: '1px solid rgba(13,148,136,0.15)',
                  transform: 'translateZ(30px)',
                }}
                animate={{
                  boxShadow: hasChips
                    ? '0 12px 40px rgba(0,0,0,0.35), 0 0 30px rgba(13,148,136,0.06), inset 0 1px 0 rgba(255,255,255,0.05)'
                    : '0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(13,148,136,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
                transition={SYNC_SPRING}
              >
                {/* Inner glow */}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: 'radial-gradient(ellipse at 30% 15%, rgba(13,148,136,0.1) 0%, transparent 55%)',
                  }}
                />

                {/* Left edge highlight */}
                <div
                  className="pointer-events-none absolute left-0 top-0 h-full w-[2px]"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(13,148,136,0.4), transparent 40%, rgba(255,158,122,0.25) 80%, transparent)',
                  }}
                />

                {/* SVG zone */}
                <div className="relative h-full w-full p-5">
                  <ZoneSVGComponent />

                  {/* Sub-zone hotspots */}
                  {currentZone.subZones.map((sz) => {
                    const count = getSubZoneSelectedCount(sz);
                    const hasSelections = count > 0;
                    const isActiveSub = activeSubZone === sz.id;
                    const dotColor = isActiveSub ? '#059669' : hasSelections ? '#ff9e7a' : '#0d9488';

                    return (
                      <button
                        key={sz.id}
                        type="button"
                        onClick={() => {
                          try { navigator.vibrate?.(10); } catch {}
                          setActiveSubZone(activeSubZone === sz.id ? null : sz.id);
                        }}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${sz.cx}%`, top: `${sz.cy}%`, width: 48, height: 48 }}
                      >
                        <motion.div
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                          style={{
                            width: 28,
                            height: 28,
                            background: `radial-gradient(circle, ${dotColor}40 0%, transparent 70%)`,
                          }}
                          animate={
                            isActiveSub
                              ? { scale: [1, 2.5, 1], opacity: [0.5, 1, 0.5] }
                              : { scale: [1, 1.5, 1], opacity: [0.4, 0.7, 0.4] }
                          }
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        <motion.div
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                          style={{
                            width: isActiveSub ? 15 : 12,
                            height: isActiveSub ? 15 : 12,
                            backgroundColor: dotColor,
                            boxShadow: `0 0 ${isActiveSub ? 28 : 14}px ${dotColor}90`,
                          }}
                          animate={{ scale: [1, 1.12, 1] }}
                          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        />
                        {hasSelections && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -right-1 -top-1 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-ofira-peach px-1 text-[9px] font-bold text-[#0c0a14]"
                          >
                            {count}
                          </motion.div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Zone label */}
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/90 to-transparent px-3 pb-2.5 pt-8">
                  <p className="text-center text-xs font-medium text-ofira-text-secondary">
                    {t(`zones.${currentZone.id}`)}
                  </p>
                </div>
              </motion.div>

              {/* Back to body link */}
              <motion.button
                type="button"
                onClick={() => {
                  setActiveZone(null);
                  setActiveSubZone(null);
                }}
                className="mt-3 flex items-center gap-1.5 self-center text-xs text-ofira-text-secondary transition-colors hover:text-ofira-text"
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                whileHover={{ opacity: 1 }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 11L5 7L9 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t('backToBody')}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ───────────────────────────────────────────────── */}
        {/*  CHIPS — appear on the right                      */}
        {/* ───────────────────────────────────────────────── */}
        <AnimatePresence>
          {hasChips && currentSubZone && currentZone && (
            <motion.div
              key={`chips-${currentZone.id}-${currentSubZone.id}`}
              className="absolute right-1 top-1/2 w-[140px] sm:w-[180px]"
              initial={{ opacity: 0, x: 30, y: '-50%' }}
              animate={{ opacity: 1, x: 0, y: '-50%' }}
              exit={{ opacity: 0, x: 30, y: '-50%' }}
              transition={{ ...SYNC_SPRING, delay: 0.05 }}
              style={{ zIndex: 30 }}
            >
              <div className="flex flex-col gap-2">
                {currentSubZone.concerns.map((key, index) => {
                  const selected = isSelected(key);

                  return (
                    <motion.button
                      key={key}
                      type="button"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + index * 0.05, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      whileTap={{ scale: 0.93 }}
                      onClick={() => toggleConcern(key)}
                      className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-2 text-left text-xs font-medium transition-colors sm:px-3 sm:py-2.5 sm:text-sm ${
                        selected
                          ? 'border-ofira-violet bg-ofira-violet/10 text-ofira-violet shadow-[0_0_20px_rgba(13,148,136,0.12)]'
                          : 'border-ofira-card-border bg-ofira-surface2/90 text-ofira-text-secondary hover:border-ofira-violet/30 hover:text-ofira-text'
                      }`}
                      style={{ backdropFilter: 'blur(8px)' }}
                    >
                      <AnimatePresence mode="popLayout">
                        {selected && (
                          <motion.span
                            initial={{ scale: 0, width: 0 }}
                            animate={{ scale: 1, width: 'auto' }}
                            exit={{ scale: 0, width: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex-shrink-0"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                      <span>{t(`concerns.${key}`)}</span>
                    </motion.button>
                  );
                })}

                {/* "Other" textarea */}
                {currentSubZone.id === 'other' && otherIsSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.25 }}
                  >
                    <textarea
                      value={otherText}
                      onChange={(e) => handleOtherTextChange(e.target.value)}
                      maxLength={100}
                      placeholder={t('otherPlaceholder')}
                      rows={2}
                      className="w-full resize-none rounded-xl border border-ofira-card-border bg-ofira-surface1 px-3 py-2 text-sm text-ofira-text placeholder:text-ofira-text-secondary focus:border-ofira-violet focus:outline-none"
                    />
                    <p className="mt-0.5 text-right text-[10px] text-ofira-text-secondary">
                      {otherText.length}/100
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint when no zone selected */}
        {!isZoomed && (
          <motion.p
            className="pointer-events-none absolute bottom-0 left-0 right-0 text-center text-xs text-ofira-text-secondary"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            {t('subtitle')}
          </motion.p>
        )}
      </div>
    </div>
  );
}

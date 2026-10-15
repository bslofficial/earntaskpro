import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Disc3, Sparkles, X, Trophy, AlertCircle, ArrowDown } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// 8 wheel sectors with amounts, colors, and probabilities
const WHEEL_SECTORS = [
  { label: "৳১০", value: 10, bg: "#7c3aed", text: "#ffffff", weight: 25 },
  { label: "৳৫",  value: 5,  bg: "#d97706", text: "#000000", weight: 30 },
  { label: "৳২৫", value: 25, bg: "#9333ea", text: "#ffffff", weight: 12 },
  { label: "০৳",  value: 0,  bg: "#27272a", text: "#a1a1aa", weight: 15 },
  { label: "৳১৫", value: 15, bg: "#6d28d9", text: "#ffffff", weight: 20 },
  { label: "৳৫০", value: 50, bg: "#f59e0b", text: "#000000", weight: 8 }, // Jackpot
  { label: "৳২",  value: 2,  bg: "#8b5cf6", text: "#ffffff", weight: 30 },
  { label: "৳৮",  value: 8,  bg: "#b45309", text: "#ffffff", weight: 25 },
];

export const LuckySpinModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { currentUser, settings, completeLuckySpin, language } = useApp();
  
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<{ value: number; label: string } | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const spinsUsed = currentUser?.dailyTasks?.spinsToday || 0;
  const maxSpins = settings.maxDailySpins || 8;
  const spinsLeft = Math.max(0, maxSpins - spinsUsed);

  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (isSpinning || spinsLeft <= 0) return;

    setIsSpinning(true);
    setResult(null);
    setFeedback(null);

    // Pick a sector based on weights
    const totalWeight = WHEEL_SECTORS.reduce((acc, s) => acc + s.weight, 0);
    let randomNum = Math.random() * totalWeight;
    let selectedIndex = 0;

    for (let i = 0; i < WHEEL_SECTORS.length; i++) {
      if (randomNum < WHEEL_SECTORS[i].weight) {
        selectedIndex = i;
        break;
      }
      randomNum -= WHEEL_SECTORS[i].weight;
    }

    const winningSector = WHEEL_SECTORS[selectedIndex];
    const sectorAngle = 360 / WHEEL_SECTORS.length; // 45 deg

    // Pointer is at the top (270 deg or 90 deg depending on coordinate system).
    // Let's align sector index 0 to top needle.
    // Full extra rotations (5-7 full spins)
    const extraRotations = 360 * 6;
    // Calculate final rotation so that winning sector stops under top pointer
    const targetOffset = 360 - (selectedIndex * sectorAngle + sectorAngle / 2);
    const newRotation = rotation + extraRotations + (targetOffset - (rotation % 360) + 360) % 360;

    setRotation(newRotation);

    // Play tick sounds while spinning
    let tickCount = 0;
    const maxTicks = 28;
    if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
    
    tickIntervalRef.current = setInterval(() => {
      sound.playTick();
      tickCount++;
      if (tickCount >= maxTicks) {
        if (tickIntervalRef.current) clearInterval(tickIntervalRef.current);
      }
    }, 120);

    // After animation finishes (approx 4.5s)
    setTimeout(() => {
      setIsSpinning(false);
      setResult({ value: winningSector.value, label: winningSector.label });

      // Apply to context & balance
      const res = completeLuckySpin(winningSector.value);
      setFeedback(res.message);

      if (winningSector.value > 0) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#8B5CF6', '#10B981', '#EC4899'],
        });
      }
    }, 4500);
  };

  const sectorAngle = 360 / WHEEL_SECTORS.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black p-6 shadow-2xl shadow-amber-500/10 flex flex-col items-center">
        {/* Ambient Glows */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSpinning}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer disabled:opacity-40"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-black shadow-lg shadow-amber-500/30 mb-2">
            <Disc3 className={`w-7 h-7 ${isSpinning ? 'animate-spin' : ''}`} />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>{language === 'bn' ? 'লাকি স্পিন হুইল' : 'Lucky Spin Wheel'}</span>
            <span className="text-amber-400 text-xs px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 font-mono">
              জ্যাকপট ৳৫০
            </span>
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            {language === 'bn' ? `আজকের অবশিষ্ট স্পিন: ${spinsLeft}/${maxSpins}` : `Spins remaining today: ${spinsLeft}/${maxSpins}`}
          </p>
        </div>

        {/* Wheel Container */}
        <div className="relative my-4 flex items-center justify-center">
          {/* Top Indicator Arrow */}
          <div className="absolute -top-3 z-30 flex flex-col items-center drop-shadow-[0_4px_10px_rgba(245,158,11,0.8)]">
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-400" />
            <div className="w-3 h-3 rounded-full bg-amber-200 -mt-5" />
          </div>

          {/* Outer Golden Rim */}
          <div className="relative w-68 h-68 sm:w-76 sm:h-76 rounded-full p-2.5 bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-700 shadow-[0_0_35px_rgba(245,158,11,0.35)] border-4 border-amber-300/40">
            {/* Spinning SVG Wheel */}
            <div
              className="w-full h-full rounded-full overflow-hidden transition-transform duration-[4500ms] ease-[cubic-bezier(0.15,0.95,0.35,1.0)]"
              style={{ transform: `rotate(${rotation}deg)` }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {WHEEL_SECTORS.map((sector, index) => {
                  const startAngle = (index * sectorAngle - 90) * (Math.PI / 180);
                  const endAngle = ((index + 1) * sectorAngle - 90) * (Math.PI / 180);
                  const x1 = 50 + 50 * Math.cos(startAngle);
                  const y1 = 50 + 50 * Math.sin(startAngle);
                  const x2 = 50 + 50 * Math.cos(endAngle);
                  const y2 = 50 + 50 * Math.sin(endAngle);
                  const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                  // Text position
                  const midAngle = ((index + 0.5) * sectorAngle - 90) * (Math.PI / 180);
                  const tx = 50 + 33 * Math.cos(midAngle);
                  const ty = 50 + 33 * Math.sin(midAngle);
                  const textRotation = (index + 0.5) * sectorAngle;

                  return (
                    <g key={index}>
                      <path d={pathData} fill={sector.bg} stroke="#18181b" strokeWidth="0.8" />
                      <text
                        x={tx}
                        y={ty}
                        fill={sector.text}
                        fontSize="6.5"
                        fontWeight="bold"
                        textAnchor="middle"
                        dominantBaseline="central"
                        transform={`rotate(${textRotation}, ${tx}, ${ty})`}
                        style={{ userSelect: 'none' }}
                      >
                        {sector.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Center Golden Knob / Spin Button */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-zinc-950 via-zinc-800 to-zinc-900 border-3 border-amber-400 shadow-2xl flex flex-col items-center justify-center text-amber-400">
                <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />
                <span className="text-[9px] font-black tracking-widest uppercase">WIN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback / Result notification */}
        {feedback && (
          <div
            className={`w-full p-3 rounded-2xl mb-3 text-center text-xs font-bold border animate-in zoom-in-95 ${
              result && result.value > 0
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-zinc-800 text-zinc-300 border-zinc-700'
            }`}
          >
            {feedback}
          </div>
        )}

        {/* Spin Action Button */}
        <button
          onClick={handleSpin}
          disabled={isSpinning || spinsLeft <= 0}
          className={`w-full py-3.5 px-6 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
            isSpinning || spinsLeft <= 0
              ? 'bg-zinc-800 text-zinc-500 border border-zinc-700/60 cursor-not-allowed'
              : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black hover:opacity-95 active:scale-98 shadow-amber-500/30'
          }`}
        >
          {isSpinning ? (
            <>
              <Disc3 className="w-5 h-5 animate-spin text-black" />
              <span>{language === 'bn' ? 'স্পিন ঘুরছে...' : 'Spinning...'}</span>
            </>
          ) : spinsLeft <= 0 ? (
            <>
              <AlertCircle className="w-5 h-5 text-zinc-500" />
              <span>{language === 'bn' ? 'আজকের সব স্পিন শেষ' : 'No Spins Left Today'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-black" />
              <span>{language === 'bn' ? `স্পিন করুন (বাকি: ${spinsLeft})` : `SPIN NOW (${spinsLeft} left)`}</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-zinc-500 mt-3 text-center">
          {language === 'bn' ? 'প্রতিদিন ৮ বার স্পিন করে সর্বোচ্চ ৪০০ টাকা পর্যন্ত পাওয়ার সুযোগ!' : 'Spin up to 8 times daily to win cash directly!'}
        </p>
      </div>
    </div>
  );
};

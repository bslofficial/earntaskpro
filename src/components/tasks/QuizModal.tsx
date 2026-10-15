import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { HelpCircle, CheckCircle2, XCircle, Timer, Sparkles, X, ChevronRight, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../../utils/audio';
import { SAMPLE_QUIZ_QUESTIONS } from '../../data/mockData';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const QuizModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { currentUser, settings, completeQuiz, language } = useApp();
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(15);
  const [feedback, setFeedback] = useState<string | null>(null);

  const quizzesCompleted = currentUser?.dailyTasks?.quizzesToday || 0;
  const maxQuizzes = settings.maxDailyQuizzes || 5;
  const canPlay = quizzesCompleted < maxQuizzes;

  const currentQ = SAMPLE_QUIZ_QUESTIONS[currentIdx % SAMPLE_QUIZ_QUESTIONS.length];

  // Timer countdown
  useEffect(() => {
    if (!isOpen || isAnswered || !canPlay) return;

    if (timeLeft <= 0) {
      // Auto fail when time runs out
      handleAnswer(-1);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timeLeft, isAnswered, canPlay]);

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setSelectedOption(null);
      setIsAnswered(false);
      setTimeLeft(15);
      setFeedback(null);
      setCurrentIdx(Math.floor(Math.random() * SAMPLE_QUIZ_QUESTIONS.length));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAnswer = (optionIdx: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
    setIsAnswered(true);

    const isCorrect = optionIdx === currentQ.correctIndex;

    if (isCorrect) {
      sound.playFanfare();
      const res = completeQuiz(settings.quizReward);
      setFeedback(res.message);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10B981', '#F59E0B', '#8B5CF6'],
      });
    } else {
      sound.playClick();
      setFeedback(
        language === 'bn'
          ? `ভুল উত্তর! সঠিক উত্তর ছিল: ${currentQ.options[currentQ.correctIndex]}`
          : `Wrong answer! Correct was: ${currentQ.options[currentQ.correctIndex]}`
      );
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    setTimeLeft(15);
    setFeedback(null);
    setCurrentIdx((prev) => (prev + 1) % SAMPLE_QUIZ_QUESTIONS.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-violet-500/30 bg-gradient-to-b from-zinc-900 via-zinc-950 to-black p-6 shadow-2xl shadow-violet-500/10">
        {/* Glow ambient background */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800/80 hover:bg-zinc-700 text-zinc-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center justify-between mb-4 pr-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>{language === 'bn' ? 'কুইজ খেলে আয়' : 'Play & Earn Quiz'}</span>
                <span className="text-amber-400 text-xs px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 font-mono">
                  +৳{settings.quizReward}
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                {language === 'bn'
                  ? `আজকের বাকি: ${Math.max(0, maxQuizzes - quizzesCompleted)}/${maxQuizzes}`
                  : `Remaining today: ${Math.max(0, maxQuizzes - quizzesCompleted)}/${maxQuizzes}`}
              </p>
            </div>
          </div>
        </div>

        {!canPlay ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-zinc-800 text-zinc-500 flex items-center justify-center mx-auto mb-3">
              <Award className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-zinc-200">
              {language === 'bn' ? 'আজকের সব কুইজ খেলা শেষ!' : 'All quizzes completed for today!'}
            </h4>
            <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
              {language === 'bn' ? 'আগামীকাল নতুন কুইজ খেলে আরও টাকা জিতুন।' : 'Come back tomorrow to earn more through quizzes.'}
            </p>
          </div>
        ) : (
          <>
            {/* Timer Bar */}
            <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 mb-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300">
                <Timer className={`w-4 h-4 ${timeLeft <= 5 ? 'text-rose-500 animate-ping' : 'text-amber-400'}`} />
                <span>{language === 'bn' ? 'সময় বাকি:' : 'Time Left:'}</span>
              </div>
              <span className={`font-mono text-sm font-bold ${timeLeft <= 5 ? 'text-rose-400' : 'text-amber-300'}`}>
                {timeLeft}s
              </span>
            </div>

            {/* Question Text */}
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 mb-4">
              <span className="text-[11px] font-bold text-violet-400 uppercase tracking-wider block mb-1">
                {language === 'bn' ? 'সাধারণ জ্ঞান প্রশ্ন' : 'General Knowledge'}
              </span>
              <h4 className="text-base font-bold text-zinc-100 leading-snug">
                {language === 'bn' ? currentQ.questionBn : currentQ.questionEn}
              </h4>
            </div>

            {/* Options */}
            <div className="space-y-2 mb-4">
              {currentQ.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correctIndex;

                let btnStyle = 'border-zinc-800 bg-zinc-900/70 text-zinc-200 hover:border-violet-500/50 hover:bg-zinc-850';
                if (isAnswered) {
                  if (isCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-950/40 text-emerald-300 font-bold';
                  } else if (isSelected) {
                    btnStyle = 'border-rose-500 bg-rose-950/40 text-rose-300 line-through';
                  } else {
                    btnStyle = 'border-zinc-800/40 bg-zinc-900/30 text-zinc-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleAnswer(idx)}
                    className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between text-sm transition cursor-pointer ${btnStyle}`}
                  >
                    <span>{opt}</span>
                    {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Feedback & Explanation */}
            {feedback && (
              <div
                className={`p-3 rounded-2xl text-xs mb-3 font-medium border ${
                  selectedOption === currentQ.correctIndex
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}
              >
                <div className="font-bold">{feedback}</div>
                <div className="mt-1 opacity-90">{currentQ.explanationBn}</div>
              </div>
            )}

            {/* Next Button */}
            {isAnswered && canPlay && (
              <button
                onClick={handleNextQuestion}
                className="w-full py-3 px-6 rounded-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 hover:opacity-95 cursor-pointer"
              >
                <span>{language === 'bn' ? 'পরবর্তী প্রশ্ন' : 'Next Question'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

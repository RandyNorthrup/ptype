/**
 * TriviaOverlay - Full-screen trivia question interface
 * Displays when player levels up to milestone
 */
import { useState, useEffect, memo } from 'react';
import { TriviaQuestion, BonusItem } from '../types';
import { triviaDatabase } from '../utils/triviaDatabase';
import { TEST_IDS } from '../utils/testIds';
import { error as logError } from '../utils/logger';

interface TriviaOverlayProps {
  question: TriviaQuestion;
  onAnswer: (selectedAnswer: number, correct: boolean, bonusItem: BonusItem | null) => void;
  onTimeout: () => void;
}

const TriviaOverlayComponent = ({ question, onAnswer, onTimeout }: TriviaOverlayProps) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [bonusItem, setBonusItem] = useState<BonusItem | null>(null);
  const [timeLeft, setTimeLeft] = useState(15); // 15 seconds to answer
  const [showResult, setShowResult] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (isAnswered) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up!
          clearInterval(timer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAnswered]);

  const handleTimeout = () => {
    setIsAnswered(true);
    setShowResult(true);
    setTimeout(() => {
      onTimeout();
    }, 2000);
  };

  const handleAnswer = (answerIndex: number) => {
    if (isAnswered) return;

    try {
      setSelectedAnswer(answerIndex);
      setIsAnswered(true);

      const correct = answerIndex === question.correctAnswer;
      setIsCorrect(correct);

      // Award bonus item if correct
      let reward: BonusItem | null = null;
      if (correct) {
        reward = triviaDatabase.getBonusItem();
        setBonusItem(reward);
      }

      setShowResult(true);

      // Show result for 3 seconds, then call parent callback
      setTimeout(() => {
        onAnswer(answerIndex, correct, reward);
      }, 3000);
    } catch (err) {
      logError('Failed to handle trivia answer', err, 'TriviaOverlay');
    }
  };

  const getTimerColor = () => {
    if (timeLeft > 10) return '#09ff00';
    if (timeLeft > 5) return '#fbbf24';
    return '#ef4444';
  };

  return (
    <div
      data-testid={TEST_IDS.TRIVIA_OVERLAY}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(135deg, rgba(10, 14, 39, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)',
        backdropFilter: 'blur(10px)',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      {/* Header */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1
          style={{
            color: '#09ff00',
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '0.5rem',
            textShadow: '0 0 20px rgba(9, 255, 0, 0.5)',
          }}
        >
          🧠 TRIVIA BREAK!
        </h1>
        <p
          style={{
            color: '#94a3b8',
            fontSize: '1.1rem',
          }}
        >
          Answer correctly to earn a bonus item
        </p>
      </div>

      {/* Timer */}
      <div
        data-testid={TEST_IDS.TRIVIA_TIMER}
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          border: `6px solid ${getTimerColor()}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '2rem',
          boxShadow: `0 0 30px ${getTimerColor()}40`,
          position: 'relative',
        }}
      >
        <span
          style={{
            color: getTimerColor(),
            fontSize: '3rem',
            fontWeight: '700',
            fontFamily: 'monospace',
          }}
        >
          {timeLeft}
        </span>
        <div
          style={{
            position: 'absolute',
            top: -40,
            fontSize: '0.9rem',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '2px',
          }}
        >
          Seconds
        </div>
      </div>

      {/* Question */}
      <div
        data-testid={TEST_IDS.TRIVIA_QUESTION}
        style={{
          background: 'rgba(30, 41, 59, 0.6)',
          border: '2px solid rgba(100, 116, 139, 0.4)',
          borderRadius: '12px',
          padding: '2rem',
          maxWidth: '800px',
          width: '100%',
          marginBottom: '2rem',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          <span
            style={{
              background: 'rgba(59, 130, 246, 0.2)',
              color: '#60a5fa',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '600',
              textTransform: 'uppercase',
            }}
          >
            {question.category}
          </span>
          <span
            style={{
              background: 'rgba(168, 85, 247, 0.2)',
              color: '#c084fc',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '600',
              textTransform: 'uppercase',
            }}
          >
            {question.difficulty}
          </span>
        </div>

        <p
          style={{
            color: '#e2e8f0',
            fontSize: '1.5rem',
            lineHeight: '1.6',
            margin: 0,
          }}
        >
          {question.question}
        </p>
      </div>

      {/* Answer Options */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          maxWidth: '800px',
          width: '100%',
          marginBottom: '2rem',
        }}
      >
        {question.options.map((option, index) => {
          let bgColor = 'rgba(30, 41, 59, 0.8)';
          let borderColor = 'rgba(100, 116, 139, 0.5)';
          let textColor = '#e2e8f0';

          if (isAnswered) {
            if (index === question.correctAnswer) {
              bgColor = 'rgba(34, 197, 94, 0.2)';
              borderColor = '#22c55e';
              textColor = '#22c55e';
            } else if (index === selectedAnswer && !isCorrect) {
              bgColor = 'rgba(239, 68, 68, 0.2)';
              borderColor = '#ef4444';
              textColor = '#ef4444';
            }
          }

          return (
            <button
              key={index}
              data-testid={`${TEST_IDS.TRIVIA_ANSWER_PREFIX}${index}`}
              onClick={() => handleAnswer(index)}
              disabled={isAnswered}
              style={{
                background: bgColor,
                border: `3px solid ${borderColor}`,
                borderRadius: '12px',
                padding: '1.5rem 2rem',
                color: textColor,
                fontSize: '1.2rem',
                fontWeight: '600',
                cursor: isAnswered ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                opacity: isAnswered ? 0.8 : 1,
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
              }}
              onMouseEnter={(e) => {
                if (!isAnswered) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.borderColor = '#09ff00';
                  e.currentTarget.style.boxShadow = '0 0 30px rgba(9, 255, 0, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isAnswered) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = borderColor;
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <span
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  background: 'rgba(100, 116, 139, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                }}
              >
                {['A', 'B', 'C'][index]}
              </span>
              {option}
            </button>
          );
        })}
      </div>

      {/* Result Message */}
      {showResult && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: isCorrect
              ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.95) 0%, rgba(22, 163, 74, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(239, 68, 68, 0.95) 0%, rgba(220, 38, 38, 0.95) 100%)',
            border: `4px solid ${isCorrect ? '#22c55e' : '#ef4444'}`,
            borderRadius: '20px',
            padding: '3rem 4rem',
            boxShadow: `0 0 50px ${isCorrect ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'}`,
            textAlign: 'center',
            animation: 'slideIn 0.3s ease-out',
          }}
        >
          <div
            style={{
              fontSize: '5rem',
              marginBottom: '1rem',
            }}
          >
            {isCorrect ? '✅' : '❌'}
          </div>
          <h2
            style={{
              color: '#ffffff',
              fontSize: '2.5rem',
              fontWeight: '700',
              marginBottom: '1rem',
            }}
          >
            {isCorrect ? 'CORRECT!' : 'INCORRECT!'}
          </h2>
          {isCorrect && bonusItem && (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                padding: '1.5rem',
                marginTop: '1.5rem',
              }}
            >
              <div
                style={{
                  fontSize: '3rem',
                  marginBottom: '0.5rem',
                }}
              >
                {bonusItem.iconName}
              </div>
              <p
                style={{
                  color: '#ffffff',
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  margin: 0,
                  marginBottom: '0.5rem',
                }}
              >
                {bonusItem.name}
              </p>
              <p
                style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '1rem',
                  margin: 0,
                }}
              >
                {bonusItem.description}
              </p>
            </div>
          )}
        </div>
      )}

      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translate(-50%, -50%) scale(0.8);
              opacity: 0;
            }
            to {
              transform: translate(-50%, -50%) scale(1);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
};

export const TriviaOverlay = memo(TriviaOverlayComponent);

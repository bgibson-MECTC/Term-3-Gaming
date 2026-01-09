import React, { useState, useEffect } from 'react';
import questionLoader from '../utils/questionLoader';
import ChapterSelector from './ChapterSelector';

export default function FlashcardMode({ onBackToHub }) {
  const [screen, setScreen] = useState('chapter-select'); // 'chapter-select', 'flashcard-session', 'summary'
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [allCards, setAllCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState([]);
  const [reviewCards, setReviewCards] = useState([]);
  const [learningCards, setLearningCards] = useState([]);
  const [shuffle, setShuffle] = useState(false);

  const startFlashcards = async (chapter) => {
    setSelectedChapter(chapter);
    
    // Ensure loader is initialized
    if (!questionLoader._initialized) {
      await questionLoader.initialize();
    }
    
    const questions = questionLoader.getQuestionsForChapter(chapter.id, false);
    
    // Convert questions to flashcard format
    const cards = questions.map((q, idx) => ({
      id: q.id || idx,
      front: q.question,
      back: {
        answer: q.options?.find(opt => opt.correct)?.text || q.correctAnswer || 'Answer not available',
        rationale: q.rationale || q.explanation || 'No explanation available',
        skill: q.skill || [],
        concept: q.concept || ''
      }
    }));

    setAllCards(shuffle ? shuffleArray(cards) : cards);
    setCurrentIndex(0);
    setFlipped(false);
    setKnownCards([]);
    setReviewCards([]);
    setLearningCards([]);
    setScreen('flashcard-session');
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  const handleKnown = () => {
    const card = allCards[currentIndex];
    if (!knownCards.includes(card.id)) {
      setKnownCards([...knownCards, card.id]);
    }
    nextCard();
  };

  const handleReview = () => {
    const card = allCards[currentIndex];
    if (!reviewCards.includes(card.id)) {
      setReviewCards([...reviewCards, card.id]);
    }
    nextCard();
  };

  const handleLearning = () => {
    const card = allCards[currentIndex];
    if (!learningCards.includes(card.id)) {
      setLearningCards([...learningCards, card.id]);
    }
    nextCard();
  };

  const nextCard = () => {
    setFlipped(false);
    if (currentIndex < allCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setScreen('summary');
    }
  };

  const previousCard = () => {
    if (currentIndex > 0) {
      setFlipped(false);
      setCurrentIndex(currentIndex - 1);
    }
  };

  const resetSession = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setKnownCards([]);
    setReviewCards([]);
    setLearningCards([]);
    setScreen('flashcard-session');
  };

  const reviewAgain = () => {
    // Only show cards marked as "Review" or "Learning"
    const cardsToReview = allCards.filter(card => 
      reviewCards.includes(card.id) || learningCards.includes(card.id)
    );
    setAllCards(shuffle ? shuffleArray(cardsToReview) : cardsToReview);
    setCurrentIndex(0);
    setFlipped(false);
    setKnownCards([]);
    setReviewCards([]);
    setLearningCards([]);
    setScreen('flashcard-session');
  };

  if (screen === 'chapter-select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={onBackToHub}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all"
            >
              ← Back to Hub
            </button>
            <h1 className="text-4xl font-bold">📇 Flashcard Study Mode</h1>
            <div className="w-32"></div>
          </div>

          {/* Settings */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={shuffle}
                onChange={(e) => setShuffle(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <span className="text-lg">🔀 Shuffle cards</span>
            </label>
          </div>

          {/* Chapter Selection */}
          <ChapterSelector onSelectChapter={startFlashcards} />
        </div>
      </div>
    );
  }

  if (screen === 'flashcard-session') {
    const currentCard = allCards[currentIndex];
    const progress = ((currentIndex + 1) / allCards.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setScreen('chapter-select')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
            >
              ← Exit
            </button>
            <div className="text-center">
              <div className="text-2xl font-bold">
                Card {currentIndex + 1} of {allCards.length}
              </div>
              <div className="text-sm text-white/70">{selectedChapter?.title}</div>
            </div>
            <div className="w-20"></div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Flashcard */}
          <div 
            className="relative h-96 mb-8 cursor-pointer"
            onClick={handleFlip}
            style={{ perspective: '1000px' }}
          >
            <div 
              className={`absolute w-full h-full transition-transform duration-500 preserve-3d ${flipped ? 'rotate-y-180' : ''}`}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front */}
              <div 
                className="absolute w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl p-8 flex flex-col items-center justify-center backface-hidden"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="text-6xl mb-4">❓</div>
                <div className="text-xl text-center leading-relaxed">
                  {currentCard?.front}
                </div>
                <div className="mt-6 text-sm text-white/70">Click to reveal answer</div>
              </div>

              {/* Back */}
              <div 
                className="absolute w-full h-full bg-gradient-to-br from-green-500 to-teal-600 rounded-3xl shadow-2xl p-8 flex flex-col justify-center rotate-y-180 backface-hidden overflow-y-auto"
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div className="text-4xl mb-4">✅</div>
                <div className="mb-4">
                  <div className="text-sm text-white/70 mb-2">Correct Answer:</div>
                  <div className="text-lg font-semibold">{currentCard?.back.answer}</div>
                </div>
                <div className="mb-4">
                  <div className="text-sm text-white/70 mb-2">Rationale:</div>
                  <div className="text-base leading-relaxed">{currentCard?.back.rationale}</div>
                </div>
                {currentCard?.back.skill?.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {currentCard.back.skill.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-white/20 rounded-full text-xs">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Navigation & Rating */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={previousCard}
              disabled={currentIndex === 0}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl font-semibold transition-all"
            >
              ← Previous
            </button>

            <div className="flex gap-3">
              <button
                onClick={handleLearning}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-semibold transition-all"
                disabled={!flipped}
              >
                🔴 Learning
              </button>
              <button
                onClick={handleReview}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-xl font-semibold transition-all"
                disabled={!flipped}
              >
                🟡 Review
              </button>
              <button
                onClick={handleKnown}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 rounded-xl font-semibold transition-all"
                disabled={!flipped}
              >
                🟢 Know It
              </button>
            </div>

            <button
              onClick={nextCard}
              disabled={currentIndex === allCards.length - 1}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed rounded-xl font-semibold transition-all"
            >
              Next →
            </button>
          </div>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="bg-green-500/20 rounded-xl p-4">
              <div className="text-3xl font-bold">{knownCards.length}</div>
              <div className="text-sm text-white/70">Know It</div>
            </div>
            <div className="bg-yellow-500/20 rounded-xl p-4">
              <div className="text-3xl font-bold">{reviewCards.length}</div>
              <div className="text-sm text-white/70">Review</div>
            </div>
            <div className="bg-red-500/20 rounded-xl p-4">
              <div className="text-3xl font-bold">{learningCards.length}</div>
              <div className="text-sm text-white/70">Learning</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (screen === 'summary') {
    const totalCards = allCards.length;
    const knownPercentage = Math.round((knownCards.length / totalCards) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white p-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-4xl font-bold mb-4">Flashcard Session Complete!</h2>
            <p className="text-xl text-white/80 mb-8">{selectedChapter?.title}</p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-green-500/20 rounded-xl p-6">
                <div className="text-4xl font-bold">{knownCards.length}</div>
                <div className="text-sm text-white/70">Know It</div>
              </div>
              <div className="bg-yellow-500/20 rounded-xl p-6">
                <div className="text-4xl font-bold">{reviewCards.length}</div>
                <div className="text-sm text-white/70">Review</div>
              </div>
              <div className="bg-red-500/20 rounded-xl p-6">
                <div className="text-4xl font-bold">{learningCards.length}</div>
                <div className="text-sm text-white/70">Learning</div>
              </div>
            </div>

            <div className="text-5xl font-bold mb-8">
              {knownPercentage}% Mastery
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-4">
              {(reviewCards.length > 0 || learningCards.length > 0) && (
                <button
                  onClick={reviewAgain}
                  className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 rounded-xl font-bold text-lg transition-all"
                >
                  🔄 Review Difficult Cards ({reviewCards.length + learningCards.length})
                </button>
              )}
              <button
                onClick={resetSession}
                className="px-8 py-4 bg-blue-500 hover:bg-blue-600 rounded-xl font-bold text-lg transition-all"
              >
                🔁 Start Over
              </button>
              <button
                onClick={() => setScreen('chapter-select')}
                className="px-8 py-4 bg-purple-500 hover:bg-purple-600 rounded-xl font-bold text-lg transition-all"
              >
                📚 Choose Different Chapter
              </button>
              <button
                onClick={onBackToHub}
                className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all"
              >
                ← Back to Hub
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

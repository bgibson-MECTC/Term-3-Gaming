import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCUDuHefWAoVrG6Gf4mDVaxnKuZzkdtBAw",
  authDomain: "term3-rn.firebaseapp.com",
  projectId: "term3-rn",
  storageBucket: "term3-rn.firebasestorage.app",
  messagingSenderId: "494666669692",
  appId: "1:494666669692:web:67b5a9b3ad9dd65b7a33f9",
  measurementId: "G-B13V3P1WEH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const RNMasteryGame = () => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [showNameInput, setShowNameInput] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [userId, setUserId] = useState(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerRef = useRef(null);

  // Authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        signInAnonymously(auth).catch((error) => {
          console.error("Authentication error:", error);
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Timer effect
  useEffect(() => {
    if (isTimerActive && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerActive) {
      handleTimeUp();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timeLeft, isTimerActive]);

  const handleTimeUp = () => {
    setIsTimerActive(false);
    setFeedback('Time\'s up! Game over.');
    endGame();
  };

  const startGame = () => {
    if (playerName.trim()) {
      setShowNameInput(false);
      setGameStarted(true);
      setScore(0);
      setQuestionsAnswered(0);
      setStreak(0);
      setTimeLeft(60);
      setIsTimerActive(true);
      generateQuestion();
    }
  };

  const generateQuestion = async () => {
    setIsLoading(true);
    setFeedback('');
    setUserAnswer('');

    const topics = [
      'medication administration',
      'patient assessment',
      'infection control',
      'IV therapy',
      'wound care',
      'pharmacology',
      'vital signs',
      'patient safety',
      'documentation',
      'ethics in nursing'
    ];

    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    
    const difficultyPrompts = {
      easy: 'Generate a basic nursing question about',
      medium: 'Generate an intermediate nursing question about',
      hard: 'Generate an advanced NCLEX-style nursing question about'
    };

    const prompt = `${difficultyPrompts[difficulty]} ${randomTopic}. 
    Format your response as:
    Question: [the question]
    Options:
    A) [option]
    B) [option]
    C) [option]
    D) [option]
    Correct Answer: [letter]
    Explanation: [brief explanation]`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyBHH5P9kgWtRJ8KLmfD6qRoY1pvPUKOzOo`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      
      const questionMatch = generatedText.match(/Question:(.*?)(?=Options:|$)/s);
      const optionsMatch = generatedText.match(/Options:(.*?)(?=Correct Answer:|$)/s);
      const answerMatch = generatedText.match(/Correct Answer:\s*([A-D])/i);
      const explanationMatch = generatedText.match(/Explanation:(.*?)$/s);

      if (questionMatch && optionsMatch && answerMatch) {
        setCurrentQuestion({
          question: questionMatch[1].trim(),
          options: optionsMatch[1].trim(),
          correctAnswer: answerMatch[1].toUpperCase(),
          explanation: explanationMatch ? explanationMatch[1].trim() : 'No explanation provided.'
        });
      } else {
        throw new Error('Failed to parse question format');
      }
    } catch (error) {
      console.error('Error generating question:', error);
      setFeedback('Error generating question. Please try again.');
    }

    setIsLoading(false);
  };

  const handleSubmit = () => {
    if (!userAnswer) {
      setFeedback('Please select an answer!');
      return;
    }

    const isCorrect = userAnswer.toUpperCase() === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      const points = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
      const bonusPoints = streak >= 3 ? 10 : 0;
      setScore(score + points + bonusPoints);
      setStreak(streak + 1);
      setFeedback(`✅ Correct! +${points + bonusPoints} points${bonusPoints > 0 ? ' (Streak bonus!)' : ''}\n\n${currentQuestion.explanation}`);
    } else {
      setStreak(0);
      setFeedback(`❌ Incorrect. The correct answer was ${currentQuestion.correctAnswer}.\n\n${currentQuestion.explanation}`);
    }

    setQuestionsAnswered(questionsAnswered + 1);
    setTimeLeft(timeLeft + 10); // Bonus time for answering
  };

  const nextQuestion = () => {
    if (questionsAnswered < 10) {
      generateQuestion();
    } else {
      endGame();
    }
  };

  const endGame = async () => {
    setIsTimerActive(false);
    setGameStarted(false);
    
    if (userId && playerName && score > 0) {
      try {
        await addDoc(collection(db, 'leaderboard'), {
          playerName: playerName,
          score: score,
          questionsAnswered: questionsAnswered,
          difficulty: difficulty,
          timestamp: serverTimestamp(),
          userId: userId
        });
        
        await loadLeaderboard();
        setShowLeaderboard(true);
      } catch (error) {
        console.error('Error saving score:', error);
      }
    }
  };

  const loadLeaderboard = async () => {
    try {
      const q = query(
        collection(db, 'leaderboard'),
        orderBy('score', 'desc'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      const scores = [];
      querySnapshot.forEach((doc) => {
        scores.push({ id: doc.id, ...doc.data() });
      });
      
      setLeaderboard(scores);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const resetGame = () => {
    setShowNameInput(true);
    setShowLeaderboard(false);
    setScore(0);
    setQuestionsAnswered(0);
    setStreak(0);
    setCurrentQuestion(null);
    setFeedback('');
    setUserAnswer('');
    setTimeLeft(60);
    setIsTimerActive(false);
  };

  if (showNameInput) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-3xl text-center">🏥 RN Mastery Challenge</CardTitle>
            <CardDescription className="text-center">
              Test your nursing knowledge with AI-generated questions!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name"
                onKeyPress={(e) => e.key === 'Enter' && startGame()}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="easy">Easy (10 pts)</option>
                <option value="medium">Medium (20 pts)</option>
                <option value="hard">Hard (30 pts)</option>
              </select>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button 
              onClick={startGame} 
              className="w-full"
              disabled={!playerName.trim()}
            >
              Start Game
            </Button>
            <Button 
              onClick={() => {
                loadLeaderboard();
                setShowLeaderboard(true);
              }} 
              variant="outline"
              className="w-full"
            >
              View Leaderboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (showLeaderboard) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-3xl text-center">🏆 Leaderboard</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg shadow"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-gray-400">
                      #{index + 1}
                    </span>
                    <div>
                      <p className="font-semibold">{entry.playerName}</p>
                      <p className="text-sm text-gray-500">
                        {entry.questionsAnswered} questions · {entry.difficulty}
                      </p>
                    </div>
                  </div>
                  <Badge className="text-lg px-4 py-2">
                    {entry.score} pts
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={resetGame} className="w-full">
              Back to Menu
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!gameStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Game Over!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div>
              <p className="text-5xl font-bold text-blue-600">{score}</p>
              <p className="text-gray-600">Final Score</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{questionsAnswered}</p>
                <p className="text-sm text-gray-600">Questions</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{difficulty}</p>
                <p className="text-sm text-gray-600">Difficulty</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button onClick={resetGame} className="w-full">
              Play Again
            </Button>
            <Button 
              onClick={() => {
                loadLeaderboard();
                setShowLeaderboard(true);
              }}
              variant="outline"
              className="w-full"
            >
              View Leaderboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Game Header */}
        <div className="mb-4 flex justify-between items-center bg-white p-4 rounded-lg shadow">
          <div className="flex gap-4">
            <div>
              <p className="text-sm text-gray-600">Score</p>
              <p className="text-2xl font-bold text-blue-600">{score}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Question</p>
              <p className="text-2xl font-bold">{questionsAnswered}/10</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Streak</p>
              <p className="text-2xl font-bold text-orange-600">{streak}🔥</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Time</p>
            <p className={`text-2xl font-bold ${timeLeft < 20 ? 'text-red-600' : 'text-green-600'}`}>
              {timeLeft}s
            </p>
          </div>
        </div>

        {/* Main Game Card */}
        <Card>
          <CardHeader>
            <CardTitle>Question {questionsAnswered + 1}</CardTitle>
            <CardDescription>
              Difficulty: <Badge>{difficulty}</Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Generating question...</p>
              </div>
            ) : currentQuestion ? (
              <>
                <div className="prose max-w-none">
                  <p className="text-lg font-medium">{currentQuestion.question}</p>
                </div>
                
                <div className="space-y-2">
                  {currentQuestion.options.split('\n').filter(opt => opt.trim()).map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setUserAnswer(option.trim()[0])}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        userAnswer === option.trim()[0]
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      disabled={!!feedback}
                    >
                      {option}
                    </button>
                  ))}
                </div>

                {feedback && (
                  <Alert>
                    <AlertDescription className="whitespace-pre-line">
                      {feedback}
                    </AlertDescription>
                  </Alert>
                )}
              </>
            ) : null}
          </CardContent>
          <CardFooter className="flex gap-2">
            {!feedback ? (
              <Button 
                onClick={handleSubmit} 
                className="w-full"
                disabled={!userAnswer || isLoading}
              >
                Submit Answer
              </Button>
            ) : (
              <Button 
                onClick={nextQuestion} 
                className="w-full"
              >
                {questionsAnswered < 10 ? 'Next Question' : 'Finish Game'}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default RNMasteryGame;
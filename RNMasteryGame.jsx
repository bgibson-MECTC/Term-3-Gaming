import React, { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Custom Button Component
const Button = ({ children, onClick, disabled, variant = 'default', className = '', ...props }) => {
  const baseStyles = 'px-4 py-2 rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    outline: 'border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Custom Card Components
const Card = ({ children, className = '', ...props }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`} {...props}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '', ...props }) => (
  <div className={`p-6 border-b border-gray-200 ${className}`} {...props}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={`text-2xl font-bold text-gray-900 ${className}`} {...props}>
    {children}
  </h3>
);

const CardContent = ({ children, className = '', ...props }) => (
  <div className={`p-6 ${className}`} {...props}>
    {children}
  </div>
);

// Custom Input Component
const Input = ({ className = '', ...props }) => (
  <input
    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed ${className}`}
    {...props}
  />
);

// Custom Alert Components
const Alert = ({ children, variant = 'default', className = '', ...props }) => {
  const variants = {
    default: 'bg-blue-50 border-blue-200 text-blue-800',
    destructive: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-green-50 border-green-200 text-green-800',
  };
  
  return (
    <div className={`p-4 border rounded-md ${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
};

const AlertDescription = ({ children, className = '', ...props }) => (
  <div className={`text-sm ${className}`} {...props}>
    {children}
  </div>
);

// Custom Progress Component
const Progress = ({ value = 0, className = '', ...props }) => (
  <div className={`w-full bg-gray-200 rounded-full h-2.5 overflow-hidden ${className}`} {...props}>
    <div 
      className="bg-blue-600 h-full transition-all duration-300 ease-out"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
);

// Custom Badge Component
const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    secondary: 'bg-gray-200 text-gray-900',
    outline: 'border border-gray-300 text-gray-700',
    destructive: 'bg-red-100 text-red-800',
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  );
};

// Custom Tabs Components
const Tabs = ({ children, defaultValue, value, onValueChange, className = '' }) => {
  const [activeTab, setActiveTab] = useState(value || defaultValue);
  
  useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);
  
  const handleTabChange = (newValue) => {
    setActiveTab(newValue);
    onValueChange?.(newValue);
  };
  
  return (
    <div className={className}>
      {React.Children.map(children, child =>
        React.cloneElement(child, { activeTab, onTabChange: handleTabChange })
      )}
    </div>
  );
};

const TabsList = ({ children, activeTab, onTabChange, className = '' }) => (
  <div className={`inline-flex bg-gray-100 rounded-lg p-1 ${className}`}>
    {React.Children.map(children, child =>
      React.cloneElement(child, { activeTab, onTabChange })
    )}
  </div>
);

const TabsTrigger = ({ children, value, activeTab, onTabChange, className = '' }) => {
  const isActive = activeTab === value;
  return (
    <button
      onClick={() => onTabChange?.(value)}
      className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
        isActive
          ? 'bg-white text-gray-900 shadow-sm'
          : 'text-gray-600 hover:text-gray-900'
      } ${className}`}
    >
      {children}
    </button>
  );
};

const TabsContent = ({ children, value, activeTab, className = '' }) => {
  if (activeTab !== value) return null;
  return <div className={className}>{children}</div>;
};

const RNMasteryGame = () => {
  const [gameState, setGameState] = useState('setup');
  const [playerName, setPlayerName] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [difficulty, setDifficulty] = useState('medium');

  const questions = {
    easy: [
      {
        question: "What does RN stand for in React Native?",
        options: ["React Native", "Real Number", "Random Node", "Recursive Navigation"],
        correct: 0,
        explanation: "RN is the standard abbreviation for React Native, a popular framework for building mobile apps."
      },
      {
        question: "Which company developed React Native?",
        options: ["Google", "Facebook", "Apple", "Microsoft"],
        correct: 1,
        explanation: "Facebook (now Meta) developed React Native and released it as open source in 2015."
      },
      {
        question: "What language is primarily used to write React Native apps?",
        options: ["Python", "Java", "JavaScript", "Swift"],
        correct: 2,
        explanation: "React Native uses JavaScript (and TypeScript) as its primary programming language."
      },
      {
        question: "Which platforms can React Native target?",
        options: ["iOS only", "Android only", "iOS and Android", "Web only"],
        correct: 2,
        explanation: "React Native can build applications for both iOS and Android platforms from a single codebase."
      },
      {
        question: "What is JSX?",
        options: ["A styling language", "JavaScript XML syntax", "A database", "A testing framework"],
        correct: 1,
        explanation: "JSX is a syntax extension for JavaScript that looks similar to XML/HTML and is used in React."
      }
    ],
    medium: [
      {
        question: "What is the purpose of useState hook?",
        options: ["To fetch data", "To manage component state", "To style components", "To navigate screens"],
        correct: 1,
        explanation: "useState is a React Hook that allows you to add state management to functional components."
      },
      {
        question: "Which component is used for scrollable content?",
        options: ["View", "Text", "ScrollView", "Container"],
        correct: 2,
        explanation: "ScrollView is the React Native component designed to handle scrollable content."
      },
      {
        question: "What is the bridge in React Native?",
        options: ["A navigation tool", "Communication layer between JS and native code", "A styling method", "A testing utility"],
        correct: 1,
        explanation: "The bridge is the communication layer that allows JavaScript code to interact with native platform code."
      },
      {
        question: "How do you style components in React Native?",
        options: ["CSS files", "StyleSheet API", "HTML attributes", "Bootstrap"],
        correct: 1,
        explanation: "React Native uses the StyleSheet API to create and manage component styles."
      },
      {
        question: "What is React Navigation used for?",
        options: ["State management", "API calls", "Screen routing", "Animation"],
        correct: 2,
        explanation: "React Navigation is the standard library for handling navigation and routing between screens."
      }
    ],
    hard: [
      {
        question: "What is the new architecture in React Native called?",
        options: ["Turbo Modules", "Fabric", "Both A and B", "Metro"],
        correct: 2,
        explanation: "The new architecture includes both Fabric (new rendering system) and Turbo Modules (new native modules system)."
      },
      {
        question: "What is Hermes?",
        options: ["A UI library", "A JavaScript engine", "A state manager", "A testing tool"],
        correct: 1,
        explanation: "Hermes is an optimized JavaScript engine specifically designed for React Native applications."
      },
      {
        question: "What does useCallback optimize?",
        options: ["Component rendering", "Function reference stability", "Memory usage", "Network requests"],
        correct: 1,
        explanation: "useCallback memoizes function references, preventing unnecessary re-creations and re-renders."
      },
      {
        question: "What is the purpose of FlatList over ScrollView?",
        options: ["Better styling", "Performance with large lists", "Easier syntax", "More animations"],
        correct: 1,
        explanation: "FlatList uses virtualization to efficiently render large lists by only rendering visible items."
      },
      {
        question: "What is Codegen in React Native?",
        options: ["A bundler", "Auto-generates native code from JS specs", "A debugger", "A linting tool"],
        correct: 1,
        explanation: "Codegen automatically generates native code interfaces from JavaScript specifications in the new architecture."
      }
    ]
  };

  const fetchLeaderboard = useCallback(async () => {
    try {
      const q = query(
        collection(db, 'leaderboard'),
        orderBy('score', 'desc'),
        limit(10)
      );
      const querySnapshot = await getDocs(q);
      const scores = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeaderboard(scores);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameState === 'playing') {
      endGame();
    }
  }, [timeLeft, gameState]);

  const startGame = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }
    setGameState('playing');
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(60);
    setSelectedAnswer(null);
    setFeedback(null);
  };

  const handleAnswer = (answerIndex) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === questions[difficulty][currentQuestion].correct;
    
    if (isCorrect) {
      const points = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30;
      setScore(score + points);
      setFeedback({ type: 'success', message: 'Correct! ' + questions[difficulty][currentQuestion].explanation });
    } else {
      setFeedback({ type: 'error', message: 'Wrong! ' + questions[difficulty][currentQuestion].explanation });
    }

    setTimeout(() => {
      if (currentQuestion < questions[difficulty].length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setFeedback(null);
      } else {
        endGame();
      }
    }, 2000);
  };

  const endGame = async () => {
    setGameState('ended');
    try {
      await addDoc(collection(db, 'leaderboard'), {
        playerName,
        score,
        difficulty,
        timestamp: new Date()
      });
      await fetchLeaderboard();
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const resetGame = () => {
    setGameState('setup');
    setPlayerName('');
    setCurrentQuestion(0);
    setScore(0);
    setTimeLeft(60);
    setSelectedAnswer(null);
    setFeedback(null);
  };

  const renderSetup = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>React Native Mastery Quiz</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Name
          </label>
          <Input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty Level
          </label>
          <div className="flex gap-2">
            <Button
              variant={difficulty === 'easy' ? 'default' : 'outline'}
              onClick={() => setDifficulty('easy')}
              className="flex-1"
            >
              Easy (10 pts)
            </Button>
            <Button
              variant={difficulty === 'medium' ? 'default' : 'outline'}
              onClick={() => setDifficulty('medium')}
              className="flex-1"
            >
              Medium (20 pts)
            </Button>
            <Button
              variant={difficulty === 'hard' ? 'default' : 'outline'}
              onClick={() => setDifficulty('hard')}
              className="flex-1"
            >
              Hard (30 pts)
            </Button>
          </div>
        </div>

        <Alert>
          <AlertDescription>
            You'll have 60 seconds to answer {questions[difficulty].length} questions. Each correct answer gives you points based on difficulty level.
          </AlertDescription>
        </Alert>

        <Button onClick={startGame} className="w-full">
          Start Game
        </Button>
      </CardContent>
    </Card>
  );

  const renderGame = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Question {currentQuestion + 1}/{questions[difficulty].length}</CardTitle>
          <div className="flex gap-4 items-center">
            <Badge variant="secondary">Score: {score}</Badge>
            <Badge variant={timeLeft < 10 ? 'destructive' : 'default'}>
              Time: {timeLeft}s
            </Badge>
          </div>
        </div>
        <div className="mt-4">
          <Progress value={(currentQuestion / questions[difficulty].length) * 100} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {questions[difficulty][currentQuestion].question}
        </h3>
        
        <div className="space-y-2">
          {questions[difficulty][currentQuestion].options.map((option, index) => (
            <Button
              key={index}
              onClick={() => handleAnswer(index)}
              disabled={selectedAnswer !== null}
              variant="outline"
              className={`w-full text-left justify-start h-auto py-3 ${
                selectedAnswer === index
                  ? index === questions[difficulty][currentQuestion].correct
                    ? 'bg-green-100 border-green-500 hover:bg-green-100'
                    : 'bg-red-100 border-red-500 hover:bg-red-100'
                  : ''
              }`}
            >
              {option}
            </Button>
          ))}
        </div>

        {feedback && (
          <Alert variant={feedback.type === 'success' ? 'success' : 'destructive'}>
            <AlertDescription>{feedback.message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );

  const renderEnd = () => (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Game Over!</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center py-6">
          <h3 className="text-4xl font-bold text-gray-900 mb-2">{score} Points</h3>
          <p className="text-lg text-gray-600">
            Great job, {playerName}! You answered {Math.round((score / (questions[difficulty].length * (difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30))) * 100)}% correctly.
          </p>
        </div>

        <div className="flex gap-2">
          <Button onClick={resetGame} className="flex-1">
            Play Again
          </Button>
          <Button onClick={fetchLeaderboard} variant="outline" className="flex-1">
            Refresh Leaderboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderLeaderboard = () => (
    <Card className="w-full max-w-2xl mx-auto mt-6">
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        {leaderboard.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No scores yet. Be the first to play!</p>
        ) : (
          <div className="space-y-2">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-gray-600 w-8">#{index + 1}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{entry.playerName}</p>
                    <p className="text-sm text-gray-500 capitalize">{entry.difficulty}</p>
                  </div>
                </div>
                <Badge className="text-lg">{entry.score} pts</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {gameState === 'setup' && renderSetup()}
        {gameState === 'playing' && renderGame()}
        {gameState === 'ended' && renderEnd()}
        {renderLeaderboard()}
      </div>
    </div>
  );
};

export default RNMasteryGame;
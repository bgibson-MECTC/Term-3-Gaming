import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Heart, Brain, Stethoscope, Award, Clock, Target } from 'lucide-react';

const RNMasteryGame = () => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState('intermediate');

  const categories = [
    { name: 'Pharmacology', icon: '💊', color: 'bg-blue-100' },
    { name: 'Patient Care', icon: '🏥', color: 'bg-green-100' },
    { name: 'Medical-Surgical', icon: '⚕️', color: 'bg-purple-100' },
    { name: 'Critical Care', icon: '🚨', color: 'bg-red-100' },
    { name: 'Pediatrics', icon: '👶', color: 'bg-yellow-100' },
    { name: 'Maternal Health', icon: '🤰', color: 'bg-pink-100' }
  ];

  // Timer effect
  useEffect(() => {
    if (gameStarted && !showFeedback && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showFeedback) {
      handleTimeout();
    }
  }, [timeLeft, gameStarted, showFeedback]);

  const callGemini = async (prompt) => {
    const apiKey = 'AIzaSyBfeueY-eQstjStuIgk3FZvIDYOf46LlJ4';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  };

  const generateQuestion = async (category) => {
    setIsLoading(true);
    const prompt = `Generate a ${difficulty} level nursing education multiple choice question about ${category}. 
    Format the response as JSON with the following structure:
    {
      "question": "the question text",
      "options": ["option A", "option B", "option C", "option D"],
      "correctAnswer": 0-3 (index of correct option),
      "explanation": "detailed explanation of the correct answer"
    }
    Make sure the question is clinically relevant and appropriate for RN students.`;

    try {
      const response = await callGemini(prompt);
      // Parse the JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const questionData = JSON.parse(jsonMatch[0]);
        setCurrentQuestion({ ...questionData, category });
        setTimeLeft(30);
      }
    } catch (error) {
      console.error('Error generating question:', error);
      // Fallback question
      setCurrentQuestion({
        question: "What is the normal range for adult respiratory rate?",
        options: ["8-12 breaths/min", "12-20 breaths/min", "20-30 breaths/min", "30-40 breaths/min"],
        correctAnswer: 1,
        explanation: "The normal respiratory rate for adults is 12-20 breaths per minute.",
        category: category
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = async (index) => {
    if (showFeedback) return;
    
    setSelectedAnswer(index);
    setShowFeedback(true);
    
    const isCorrect = index === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(score + 1);
      setFeedback('Correct! ' + currentQuestion.explanation);
    } else {
      setFeedback('Incorrect. ' + currentQuestion.explanation);
    }
    
    setQuestionsAnswered(questionsAnswered + 1);
  };

  const handleTimeout = () => {
    setShowFeedback(true);
    setFeedback('Time\'s up! ' + currentQuestion.explanation);
    setQuestionsAnswered(questionsAnswered + 1);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    setFeedback('');
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    generateQuestion(randomCategory.name);
  };

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setQuestionsAnswered(0);
    handleNextQuestion();
  };

  const getCategoryStyle = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category ? category.color : 'bg-gray-100';
  };

  if (!gameStarted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold flex items-center justify-center gap-2">
              <Stethoscope className="w-8 h-8 text-blue-600" />
              RN Mastery Challenge
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-lg text-gray-700 mb-4">
                Test your nursing knowledge across multiple specialties!
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {categories.map((cat, idx) => (
                  <div key={idx} className={`${cat.color} p-4 rounded-lg text-center`}>
                    <div className="text-3xl mb-2">{cat.icon}</div>
                    <div className="font-semibold">{cat.name}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select Difficulty:</label>
                <div className="flex gap-2">
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <Button
                      key={level}
                      variant={difficulty === level ? 'default' : 'outline'}
                      onClick={() => setDifficulty(level)}
                      className="flex-1 capitalize"
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={startGame} 
                className="w-full py-6 text-lg"
                size="lg"
              >
                Start Game
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600" />
              RN Mastery Challenge
            </CardTitle>
            <div className="flex gap-4 items-center">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className={`font-bold ${timeLeft <= 10 ? 'text-red-600' : ''}`}>
                  {timeLeft}s
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-600" />
                <span className="font-bold">{score}/{questionsAnswered}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Generating question...</p>
            </div>
          ) : currentQuestion ? (
            <>
              <div className={`${getCategoryStyle(currentQuestion.category)} p-4 rounded-lg`}>
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Category: {currentQuestion.category}</span>
                  <span className="text-xs bg-white px-2 py-1 rounded capitalize">{difficulty}</span>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">{currentQuestion.question}</h3>
              </div>

              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={showFeedback}
                    variant="outline"
                    className={`w-full p-6 text-left justify-start h-auto ${
                      showFeedback && index === currentQuestion.correctAnswer
                        ? 'bg-green-100 border-green-500'
                        : showFeedback && index === selectedAnswer
                        ? 'bg-red-100 border-red-500'
                        : ''
                    }`}
                  >
                    <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </Button>
                ))}
              </div>

              {showFeedback && (
                <Alert className={selectedAnswer === currentQuestion.correctAnswer ? 'bg-green-50' : 'bg-blue-50'}>
                  <AlertDescription className="text-base">
                    {feedback}
                  </AlertDescription>
                </Alert>
              )}

              {showFeedback && (
                <Button onClick={handleNextQuestion} className="w-full py-6 text-lg">
                  Next Question
                </Button>
              )}
            </>
          ) : null}

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Questions Completed: {questionsAnswered}</span>
              <span>Accuracy: {questionsAnswered > 0 ? Math.round((score/questionsAnswered) * 100) : 0}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RNMasteryGame;
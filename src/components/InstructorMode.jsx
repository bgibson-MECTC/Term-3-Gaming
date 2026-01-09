import React, { useState, useEffect } from 'react';
import { Lock, Plus, Edit2, Trash2, Save, X, Upload, Download, Unlock, Users, TrendingUp } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

// LocalStorage keys
const STORAGE_KEYS = {
  CHAPTERS: 'instructor_customChapters',
  LOCKS: 'instructor_chapterLocks',
  SCORES: 'instructor_studentScores',
  ANALYTICS: 'instructor_analytics'
};

const InstructorMode = ({ onExit }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [chapters, setChapters] = useState([]);
  const [editingChapter, setEditingChapter] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('chapters'); // 'chapters', 'locks', 'analytics', or 'itemAnalysis'
  const [unlockedChapters, setUnlockedChapters] = useState([]);
  const [studentScores, setStudentScores] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [useLocalStorage, setUseLocalStorage] = useState(true);

  // Simple password (in production, use proper authentication)
  const INSTRUCTOR_PASSWORD = 'nursing2024';

  useEffect(() => {
    if (isAuthenticated) {
      loadChapters();
      loadChapterLocks();
      loadStudentScores();
      loadAnalyticsData();
    }
  }, [isAuthenticated]);

  // LocalStorage helpers
  const getFromStorage = (key) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return null;
    }
  };

  const saveToStorage = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      if (useLocalStorage) {
        const data = getFromStorage(STORAGE_KEYS.ANALYTICS) || [];
        setAnalyticsData(data);
        return;
      }
      
      if (!db) {
        setUseLocalStorage(true);
        const data = getFromStorage(STORAGE_KEYS.ANALYTICS) || [];
        setAnalyticsData(data);
        return;
      }
      
      const q = query(
        collection(db, 'artifacts', 'rn-mastery-game', 'public', 'data', 'analytics'),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      const analytics = [];
      snapshot.forEach((doc) => {
        analytics.push({ id: doc.id, ...doc.data() });
      });
      setAnalyticsData(analytics);
    } catch (error) {
      console.error('Error loading analytics, using localStorage:', error);
      setUseLocalStorage(true);
      const data = getFromStorage(STORAGE_KEYS.ANALYTICS) || [];
      setAnalyticsData(data);
    }
  };

  const loadStudentScores = async () => {
    try {
      if (useLocalStorage) {
        const data = getFromStorage(STORAGE_KEYS.SCORES) || [];
        setStudentScores(data);
        return;
      }
      
      if (!db) {
        setUseLocalStorage(true);
        const data = getFromStorage(STORAGE_KEYS.SCORES) || [];
        setStudentScores(data);
        return;
      }
      
      const q = query(
        collection(db, 'artifacts', 'rn-mastery-game', 'public', 'data', 'scores'),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      const scores = [];
      snapshot.forEach((doc) => {
        scores.push({ id: doc.id, ...doc.data() });
      });
      setStudentScores(scores);
    } catch (error) {
      console.error('Error loading scores, using localStorage:', error);
      setUseLocalStorage(true);
      const data = getFromStorage(STORAGE_KEYS.SCORES) || [];
      setStudentScores(data);
    }
  };

  const loadChapterLocks = async () => {
    try {
      if (useLocalStorage) {
        const data = getFromStorage(STORAGE_KEYS.LOCKS) || [];
        setUnlockedChapters(data);
        return;
      }
      
      if (!db) {
        setUseLocalStorage(true);
        const data = getFromStorage(STORAGE_KEYS.LOCKS) || [];
        setUnlockedChapters(data);
        return;
      }
      
      const docSnap = await getDocs(collection(db, 'settings'));
      const settingsDoc = docSnap.docs.find(d => d.id === 'chapterAccess');
      if (settingsDoc) {
        setUnlockedChapters(settingsDoc.data().unlocked || []);
      }
    } catch (error) {
      console.error('Error loading locks, using localStorage:', error);
      setUseLocalStorage(true);
      const data = getFromStorage(STORAGE_KEYS.LOCKS) || [];
      setUnlockedChapters(data);
    }
  };

  const loadChapters = async () => {
    try {
      setLoading(true);
      
      if (useLocalStorage) {
        const data = getFromStorage(STORAGE_KEYS.CHAPTERS) || [];
        setChapters(data);
        setLoading(false);
        return;
      }
      
      if (!db) {
        setUseLocalStorage(true);
        const data = getFromStorage(STORAGE_KEYS.CHAPTERS) || [];
        setChapters(data);
        setLoading(false);
        return;
      }
      
      const querySnapshot = await getDocs(collection(db, 'customChapters'));
      const chaptersData = [];
      querySnapshot.forEach((doc) => {
        chaptersData.push({ id: doc.id, ...doc.data() });
      });
      setChapters(chaptersData);
    } catch (error) {
      console.error('Error loading chapters, using localStorage:', error);
      setUseLocalStorage(true);
      const data = getFromStorage(STORAGE_KEYS.CHAPTERS) || [];
      setChapters(data);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === INSTRUCTOR_PASSWORD) {
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const handleSaveChapter = async (chapterData) => {
    try {
      setLoading(true);
      
      if (useLocalStorage) {
        const currentChapters = getFromStorage(STORAGE_KEYS.CHAPTERS) || [];
        let updatedChapters;
        
        if (chapterData.id) {
          // Update existing
          updatedChapters = currentChapters.map(ch => 
            ch.id === chapterData.id ? chapterData : ch
          );
          alert('Chapter updated!');
        } else {
          // Add new with generated ID
          const newChapter = { ...chapterData, id: Date.now().toString() };
          updatedChapters = [...currentChapters, newChapter];
          alert('Chapter added!');
        }
        
        saveToStorage(STORAGE_KEYS.CHAPTERS, updatedChapters);
        setChapters(updatedChapters);
        setEditingChapter(null);
        setLoading(false);
        return;
      }
      
      if (chapterData.id) {
        // Update existing
        const chapterRef = doc(db, 'customChapters', chapterData.id);
        await updateDoc(chapterRef, chapterData);
        alert('Chapter updated!');
      } else {
        // Add new
        await addDoc(collection(db, 'customChapters'), chapterData);
        alert('Chapter added!');
      }
      await loadChapters();
      setEditingChapter(null);
    } catch (error) {
      console.error('Error saving chapter:', error);
      alert('Error saving chapter: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChapter = async (chapterId) => {
    if (!window.confirm('Delete this chapter? This cannot be undone.')) return;
    
    try {
      setLoading(true);
      
      if (useLocalStorage) {
        const currentChapters = getFromStorage(STORAGE_KEYS.CHAPTERS) || [];
        const updatedChapters = currentChapters.filter(ch => ch.id !== chapterId);
        saveToStorage(STORAGE_KEYS.CHAPTERS, updatedChapters);
        setChapters(updatedChapters);
        alert('Chapter deleted!');
        setLoading(false);
        return;
      }
      
      await deleteDoc(doc(db, 'customChapters', chapterId));
      alert('Chapter deleted!');
      await loadChapters();
    } catch (error) {
      console.error('Error deleting chapter:', error);
      alert('Error deleting chapter: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportChapters = () => {
    const dataStr = JSON.stringify(chapters, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chapters-backup-${Date.now()}.json`;
    link.click();
  };

  const toggleChapterLock = async (chapterId) => {
    try {
      setLoading(true);
      const newUnlocked = unlockedChapters.includes(chapterId)
        ? unlockedChapters.filter(id => id !== chapterId)
        : [...unlockedChapters, chapterId];
      
      if (useLocalStorage) {
        saveToStorage(STORAGE_KEYS.LOCKS, newUnlocked);
        setUnlockedChapters(newUnlocked);
        setLoading(false);
        return;
      }
      
      await setDoc(doc(db, 'settings', 'chapterAccess'), {
        unlocked: newUnlocked
      });
      setUnlockedChapters(newUnlocked);
    } catch (error) {
      console.error('Error toggling lock:', error);
      alert('Error updating chapter lock: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const importChapters = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (!Array.isArray(imported)) {
          alert('Invalid format. Expected an array of chapters.');
          return;
        }
        
        setLoading(true);
        
        if (useLocalStorage) {
          const currentChapters = getFromStorage(STORAGE_KEYS.CHAPTERS) || [];
          const newChapters = imported.map(ch => ({
            ...ch,
            id: Date.now().toString() + Math.random()
          }));
          const updatedChapters = [...currentChapters, ...newChapters];
          saveToStorage(STORAGE_KEYS.CHAPTERS, updatedChapters);
          setChapters(updatedChapters);
          alert(`Imported ${imported.length} chapters!`);
          setLoading(false);
          return;
        }
        
        for (const chapter of imported) {
          const { id, ...chapterData } = chapter; // Remove old ID
          await addDoc(collection(db, 'customChapters'), chapterData);
        }
        alert(`Imported ${imported.length} chapters!`);
        await loadChapters();
      } catch (error) {
        console.error('Error importing:', error);
        alert('Error importing chapters: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
  };

  const generateSampleData = () => {
    if (!window.confirm('Generate sample student data for testing analytics? This will add fake student scores and analytics.')) return;
    
    const sampleStudents = [
      { name: 'Alice Johnson', uid: 'alice_001' },
      { name: 'Bob Smith', uid: 'bob_002' },
      { name: 'Carol Davis', uid: 'carol_003' },
      { name: 'David Wilson', uid: 'david_004' },
      { name: 'Emma Brown', uid: 'emma_005' }
    ];
    
    const chapters = [
      { id: 'ch18', title: 'Chapter 18' },
      { id: 'ch19', title: 'Chapter 19' },
      { id: 'ch20', title: 'Chapter 20' },
      { id: 'ch21', title: 'Chapter 21' },
      { id: 'ch22', title: 'Chapter 22' }
    ];
    
    const scores = [];
    const analytics = [];
    
    sampleStudents.forEach(student => {
      chapters.forEach((chapter, idx) => {
        if (Math.random() > 0.3) { // 70% chance student attempted this chapter
          const score = 50 + Math.floor(Math.random() * 50); // 50-100 points
          scores.push({
            id: `score_${student.uid}_${chapter.id}_${Date.now()}`,
            playerName: student.name,
            uid: student.uid,
            chapterTitle: chapter.title,
            chapterId: chapter.id,
            score: score,
            timestamp: { toDate: () => new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) }
          });
          
          // Generate question analytics
          for (let q = 1; q <= 10; q++) {
            const questionId = `${chapter.id}_q${String(q).padStart(2, '0')}`;
            const isCorrect = Math.random() > 0.4; // 60% correct rate
            analytics.push({
              id: `analytics_${student.uid}_${questionId}_${Date.now()}`,
              questionId,
              chapterTitle: chapter.title,
              isCorrect,
              timeSpent: 15 + Math.floor(Math.random() * 45), // 15-60 seconds
              rationaleTier: isCorrect ? 'correct' : (Math.random() > 0.5 ? 'incorrect' : 'weak'),
              timestamp: { toDate: () => new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) }
            });
          }
        }
      });
    });
    
    saveToStorage(STORAGE_KEYS.SCORES, scores);
    saveToStorage(STORAGE_KEYS.ANALYTICS, analytics);
    setStudentScores(scores);
    setAnalyticsData(analytics);
    alert('Sample data generated! Check Student Analytics and Item Analysis tabs.');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="flex items-center justify-center mb-6">
            <Lock className="w-12 h-12 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-6">Instructor Mode</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter instructor password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              Login
            </button>
            <button
              type="button"
              onClick={onExit}
              className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
            >
              Back to Game
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (editingChapter !== null) {
    return (
      <ChapterEditor
        chapter={editingChapter}
        onSave={handleSaveChapter}
        onCancel={() => setEditingChapter(null)}
        loading={loading}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold">Instructor Mode</h2>
              <p className="text-sm text-gray-500 mt-1">
                Storage: {useLocalStorage ? '💾 Local Storage (Browser)' : '☁️ Firebase Cloud'}
              </p>
            </div>
            <button
              onClick={onExit}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
              Exit
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 border-b">
            <button
              onClick={() => setActiveTab('chapters')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'chapters'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Chapter Management
            </button>
            <button
              onClick={() => setActiveTab('itemAnalysis')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'itemAnalysis'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Item Analysis
            </button>
            <button
              onClick={() => setActiveTab('locks')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'locks'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Lock className="w-4 h-4 inline mr-2" />
              Chapter Locks
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'analytics'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Student Analytics
            </button>
          </div>

          {activeTab === 'chapters' && (
            <>
              <div className="flex gap-4 mb-6 flex-wrap">
                <button
                  onClick={() => setEditingChapter({})}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Plus className="w-5 h-5" />
                  Add New Chapter
                </button>
                <button
                  onClick={exportChapters}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Download className="w-5 h-5" />
                  Export All
                </button>
                <label className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer">
                  <Upload className="w-5 h-5" />
                  Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={importChapters}
                    className="hidden"
                  />
                </label>
                {useLocalStorage && (
                  <button
                    onClick={generateSampleData}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    <TrendingUp className="w-5 h-5" />
                    Generate Sample Data
                  </button>
                )}
              </div>

              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading...</p>
                </div>
              )}

              {!loading && chapters.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">No custom chapters yet.</p>
                  <p className="text-sm">Click "Add New Chapter" to get started.</p>
                </div>
              )}

              {!loading && chapters.length > 0 && (
                <div className="grid gap-4">
                  {chapters.map((chapter) => (
                    <div key={chapter.id} className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold mb-2">{chapter.title}</h3>
                          <p className="text-gray-600 mb-2">{chapter.description}</p>
                          <div className="flex gap-4 text-sm text-gray-500">
                            <span>ID: {chapter.chapterId}</span>
                            <span>{chapter.questions?.length || 0} questions</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingChapter(chapter)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteChapter(chapter.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'locks' && (
            <ChapterLockManager 
              unlockedChapters={unlockedChapters}
              onToggleLock={toggleChapterLock}
              loading={loading}
            />
          )}

          {activeTab === 'itemAnalysis' && (
            <ItemAnalysis 
              analyticsData={analyticsData}
              loading={loading}
              onRefresh={loadAnalyticsData}
            />
          )}

          {activeTab === 'analytics' && (
            <StudentAnalytics 
              scores={studentScores}
              loading={loading}
              onRefresh={loadStudentScores}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const ChapterLockManager = ({ unlockedChapters, onToggleLock, loading }) => {
  // Import INITIAL_DATA from the main file
  const builtInChapters = [
    { id: 'ch18', title: 'Chapter 18: Immune Assessment', icon: '🛡️' },
    { id: 'ch19', title: 'Chapter 19: Immune Disorders', icon: '🦠' },
    { id: 'ch20', title: 'Chapter 20: Connective Tissue', icon: '🦴' },
    { id: 'ch21', title: 'Chapter 21: MDROs', icon: '🔬' },
    { id: 'ch22', title: 'Chapter 22: HIV/AIDS', icon: '🧬' },
    { id: 'quiz1', title: 'Quiz 1 Review', icon: '📋' },
  ];

  const toggleAll = () => {
    if (unlockedChapters.length === builtInChapters.length) {
      // Lock all
      builtInChapters.forEach(ch => {
        if (unlockedChapters.includes(ch.id)) {
          onToggleLock(ch.id);
        }
      });
    } else {
      // Unlock all
      builtInChapters.forEach(ch => {
        if (!unlockedChapters.includes(ch.id)) {
          onToggleLock(ch.id);
        }
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-600">
          Control which chapters students can access. Locked chapters will show a 🔒 badge and cannot be clicked.
        </p>
        <button
          onClick={toggleAll}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {unlockedChapters.length === builtInChapters.length ? 'Lock All' : 'Unlock All'}
        </button>
      </div>

      <div className="grid gap-3">
        {builtInChapters.map((chapter) => {
          const isUnlocked = unlockedChapters.includes(chapter.id);
          
          return (
            <div 
              key={chapter.id} 
              className="flex items-center justify-between p-4 border-2 rounded-lg hover:border-purple-300 transition-colors"
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{chapter.icon}</span>
                <div>
                  <h3 className="font-bold text-lg">{chapter.title}</h3>
                  <p className="text-sm text-gray-500">ID: {chapter.id}</p>
                </div>
              </div>
              
              <button
                onClick={() => onToggleLock(chapter.id)}
                disabled={loading}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 ${
                  isUnlocked
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {isUnlocked ? (
                  <>
                    <Unlock className="w-5 h-5" />
                    Unlocked
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Locked
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ChapterEditor = ({ chapter, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    chapterId: chapter.chapterId || '',
    title: chapter.title || '',
    description: chapter.description || '',
    icon: chapter.icon || '📚',
    questions: chapter.questions || []
  });

  const [currentQuestion, setCurrentQuestion] = useState({
    id: '',
    question: '',
    options: ['', '', '', ''],
    correct: 0,
    rationale: ''
  });

  const handleAddQuestion = () => {
    if (!currentQuestion.question || currentQuestion.options.some(o => !o)) {
      alert('Please fill in question and all options');
      return;
    }

    const newQuestion = {
      ...currentQuestion,
      id: currentQuestion.id || `${formData.chapterId}_q${formData.questions.length + 1}`.padStart(2, '0')
    };

    setFormData({
      ...formData,
      questions: [...formData.questions, newQuestion]
    });

    setCurrentQuestion({
      id: '',
      question: '',
      options: ['', '', '', ''],
      correct: 0,
      rationale: ''
    });
  };

  const handleRemoveQuestion = (index) => {
    setFormData({
      ...formData,
      questions: formData.questions.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.chapterId || !formData.title || formData.questions.length === 0) {
      alert('Please fill in chapter ID, title, and add at least one question');
      return;
    }
    onSave({ ...chapter, ...formData });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 overflow-y-auto">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-8">
        <h2 className="text-3xl font-bold mb-6">
          {chapter.id ? 'Edit Chapter' : 'New Chapter'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Chapter ID</label>
              <input
                type="text"
                value={formData.chapterId}
                onChange={(e) => setFormData({ ...formData, chapterId: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="ch23"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Icon</label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg"
                placeholder="📚"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Chapter 23: Advanced Topics"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg"
              rows="2"
              placeholder="What this chapter covers..."
            />
          </div>

          <div className="border-t pt-6">
            <h3 className="text-xl font-bold mb-4">Questions ({formData.questions.length})</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Question</label>
                <textarea
                  value={currentQuestion.question}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, question: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="3"
                  placeholder="Enter question text..."
                />
              </div>

              {currentQuestion.options.map((option, i) => (
                <div key={i}>
                  <label className="block text-sm font-medium mb-2">
                    Option {i + 1} {i === currentQuestion.correct && '(Correct)'}
                  </label>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...currentQuestion.options];
                      newOptions[i] = e.target.value;
                      setCurrentQuestion({ ...currentQuestion, options: newOptions });
                    }}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder={`Option ${i + 1}`}
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-medium mb-2">Correct Answer</label>
                <select
                  value={currentQuestion.correct}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, correct: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value={0}>Option 1</option>
                  <option value={1}>Option 2</option>
                  <option value={2}>Option 3</option>
                  <option value={3}>Option 4</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Rationale</label>
                <textarea
                  value={currentQuestion.rationale}
                  onChange={(e) => setCurrentQuestion({ ...currentQuestion, rationale: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="2"
                  placeholder="Explain why this is the correct answer..."
                />
              </div>

              <button
                type="button"
                onClick={handleAddQuestion}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                Add Question
              </button>
            </div>

            {formData.questions.length > 0 && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {formData.questions.map((q, i) => (
                  <div key={i} className="border p-3 rounded-lg flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">Q{i + 1}: {q.question.substring(0, 80)}...</p>
                      <p className="text-sm text-green-600">✓ {q.options[q.correct]}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(i)}
                      className="text-red-600 hover:bg-red-50 p-2 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Saving...' : 'Save Chapter'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 border-2 border-gray-300 py-3 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StudentAnalytics = ({ scores, loading, onRefresh }) => {
  // Group scores by student
  const studentData = {};
  scores.forEach(score => {
    if (!studentData[score.playerName]) {
      studentData[score.playerName] = {
        name: score.playerName,
        uid: score.uid,
        attempts: [],
        totalScore: 0,
        chaptersCompleted: new Set()
      };
    }
    studentData[score.playerName].attempts.push(score);
    studentData[score.playerName].totalScore += score.score;
    studentData[score.playerName].chaptersCompleted.add(score.chapterTitle);
  });

  const students = Object.values(studentData).map(student => ({
    ...student,
    chaptersCompleted: student.chaptersCompleted.size,
    avgScore: Math.round(student.totalScore / student.attempts.length),
    totalAttempts: student.attempts.length
  })).sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-600">
            Total Students: <span className="font-bold">{students.length}</span> | 
            Total Submissions: <span className="font-bold">{scores.length}</span>
          </p>
        </div>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {students.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No student data yet.</p>
          <p className="text-sm">Scores will appear here once students submit ranked attempts.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {students.map((student, idx) => (
            <div key={student.uid} className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-600' : 'bg-purple-600'
                  }`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{student.name}</h3>
                    <p className="text-xs text-gray-500">UID: {student.uid.substring(0, 8)}...</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">{student.totalScore}</div>
                  <div className="text-xs text-gray-500">Total Points</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-600">{student.chaptersCompleted}</div>
                  <div className="text-xs text-gray-600">Chapters</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">{student.avgScore}</div>
                  <div className="text-xs text-gray-600">Avg Score</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-purple-600">{student.totalAttempts}</div>
                  <div className="text-xs text-gray-600">Attempts</div>
                </div>
              </div>

              {/* Show individual attempts */}
              <details className="mt-3">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800 font-semibold">
                  View Attempts ({student.attempts.length})
                </summary>
                <div className="mt-2 space-y-2">
                  {student.attempts.map((attempt, i) => (
                    <div key={i} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                      <span className="font-medium">{attempt.chapterTitle}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-purple-600 font-bold">{attempt.score} pts</span>
                        <span className="text-gray-500 text-xs">
                          {attempt.timestamp?.toDate ? attempt.timestamp.toDate().toLocaleString() : 'N/A'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ItemAnalysis = ({ analyticsData, loading, onRefresh }) => {
  // Calculate question-level statistics
  const questionStats = {};
  
  analyticsData.forEach(entry => {
    const qid = entry.questionId;
    if (!qid) return;
    
    if (!questionStats[qid]) {
      questionStats[qid] = {
        questionId: qid,
        chapter: entry.chapterTitle || 'Unknown',
        totalAttempts: 0,
        correctAttempts: 0,
        incorrectAttempts: 0,
        avgTimeSpent: 0,
        timeData: [],
        rationaleCorrect: 0,
        rationaleIncorrect: 0,
        incorrectOptions: {},
      };
    }
    
    const stats = questionStats[qid];
    stats.totalAttempts++;
    
    if (entry.isCorrect) {
      stats.correctAttempts++;
    } else {
      stats.incorrectAttempts++;
    }
    
    if (entry.timeSpent) {
      stats.timeData.push(entry.timeSpent);
    }
    
    if (entry.rationaleTier === 'correct') {
      stats.rationaleCorrect++;
    } else if (entry.rationaleTier === 'incorrect' || entry.rationaleTier === 'weak') {
      stats.rationaleIncorrect++;
    }
  });
  
  // Calculate derived metrics
  Object.values(questionStats).forEach(stats => {
    stats.percentCorrect = Math.round((stats.correctAttempts / stats.totalAttempts) * 100);
    stats.avgTimeSpent = stats.timeData.length > 0 
      ? Math.round(stats.timeData.reduce((a, b) => a + b, 0) / stats.timeData.length)
      : 0;
    
    // Flag questions
    if (stats.percentCorrect > 90) stats.flag = 'Too Easy';
    else if (stats.percentCorrect < 40) stats.flag = 'Too Hard';
    else stats.flag = 'Good';
  });
  
  const sortedQuestions = Object.values(questionStats).sort((a, b) => a.percentCorrect - b.percentCorrect);
  
  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading analytics...</div>;
  }
  
  if (analyticsData.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No question analytics available yet.</p>
        <p className="text-sm text-gray-500">Analytics are collected when students answer questions in ranked mode.</p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold">Item Analysis Dashboard</h3>
          <p className="text-sm text-gray-600">Question performance metrics across all students</p>
        </div>
        <button
          onClick={onRefresh}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
        >
          Refresh Data
        </button>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="text-3xl font-bold text-blue-600">{sortedQuestions.length}</div>
          <div className="text-sm text-gray-600">Questions Analyzed</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4">
          <div className="text-3xl font-bold text-green-600">
            {sortedQuestions.filter(q => q.flag === 'Good').length}
          </div>
          <div className="text-sm text-gray-600">Good Difficulty</div>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <div className="text-3xl font-bold text-red-600">
            {sortedQuestions.filter(q => q.flag === 'Too Easy' || q.flag === 'Too Hard').length}
          </div>
          <div className="text-sm text-gray-600">Need Review</div>
        </div>
      </div>
      
      {/* Questions Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left text-sm font-bold">Question ID</th>
              <th className="p-3 text-left text-sm font-bold">Chapter</th>
              <th className="p-3 text-center text-sm font-bold">Attempts</th>
              <th className="p-3 text-center text-sm font-bold">% Correct</th>
              <th className="p-3 text-center text-sm font-bold">Avg Time</th>
              <th className="p-3 text-center text-sm font-bold">Rationale Acc</th>
              <th className="p-3 text-center text-sm font-bold">Flag</th>
            </tr>
          </thead>
          <tbody>
            {sortedQuestions.map(q => {
              const rationaleAcc = q.rationaleCorrect + q.rationaleIncorrect > 0
                ? Math.round((q.rationaleCorrect / (q.rationaleCorrect + q.rationaleIncorrect)) * 100)
                : null;
              
              return (
                <tr key={q.questionId} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm font-mono">{q.questionId}</td>
                  <td className="p-3 text-sm">{q.chapter}</td>
                  <td className="p-3 text-center text-sm">{q.totalAttempts}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded font-bold text-sm ${
                      q.percentCorrect >= 70 ? 'bg-green-100 text-green-700' :
                      q.percentCorrect >= 50 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {q.percentCorrect}%
                    </span>
                  </td>
                  <td className="p-3 text-center text-sm">{q.avgTimeSpent}s</td>
                  <td className="p-3 text-center text-sm">
                    {rationaleAcc !== null ? `${rationaleAcc}%` : 'N/A'}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      q.flag === 'Good' ? 'bg-blue-100 text-blue-700' :
                      q.flag === 'Too Easy' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {q.flag}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-xl">
        <h4 className="font-bold text-blue-900 mb-2">Recommendations:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Too Easy ({'>'}90%):</strong> Consider adding distractors or increasing complexity</li>
          <li>• <strong>Too Hard ({'<'}40%):</strong> Review question clarity and review concept with students</li>
          <li>• <strong>Good (40-90%):</strong> These questions effectively assess understanding</li>
          <li>• <strong>Low Rationale Accuracy:</strong> Question may have confusing reasoning options</li>
        </ul>
      </div>
    </div>
  );
};

export default InstructorMode;

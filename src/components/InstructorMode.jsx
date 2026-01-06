import React, { useState, useEffect } from 'react';
import { Lock, Plus, Edit2, Trash2, Save, X, Upload, Download } from 'lucide-react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const InstructorMode = ({ onExit }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [chapters, setChapters] = useState([]);
  const [editingChapter, setEditingChapter] = useState(null);
  const [loading, setLoading] = useState(false);

  // Simple password (in production, use proper authentication)
  const INSTRUCTOR_PASSWORD = 'nursing2024';

  useEffect(() => {
    if (isAuthenticated) {
      loadChapters();
    }
  }, [isAuthenticated]);

  const loadChapters = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'customChapters'));
      const chaptersData = [];
      querySnapshot.forEach((doc) => {
        chaptersData.push({ id: doc.id, ...doc.data() });
      });
      setChapters(chaptersData);
    } catch (error) {
      console.error('Error loading chapters:', error);
      alert('Error loading chapters. Check Firebase configuration.');
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
            <h2 className="text-3xl font-bold">Chapter Management</h2>
            <button
              onClick={onExit}
              className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <X className="w-4 h-4" />
              Exit
            </button>
          </div>

          <div className="flex gap-4 mb-6">
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
        </div>
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

export default InstructorMode;

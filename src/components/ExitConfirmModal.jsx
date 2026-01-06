import React from 'react';
import { AlertTriangle } from 'lucide-react';

const ExitConfirmModal = ({ onCancel, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-white/10 rounded-2xl p-8 max-w-md mx-4">
        <div className="flex items-center mb-4 text-orange-400">
          <AlertTriangle className="w-8 h-8 mr-3" />
          <h3 className="text-2xl font-bold">Exit Game?</h3>
        </div>
        <p className="text-slate-300 mb-6">Your progress will be lost. Are you sure?</p>
        <div className="flex gap-3">
          <button 
            onClick={onCancel} 
            className="flex-1 px-4 py-3 bg-white/10 rounded-xl font-bold hover:bg-white/20 transition"
          >
            Keep Playing
          </button>
          <button 
            onClick={onConfirm} 
            className="flex-1 px-4 py-3 bg-red-600 rounded-xl font-bold hover:bg-red-700 transition"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExitConfirmModal;

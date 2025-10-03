import React, { useState, useEffect } from 'react';
import { KeyIcon, CheckCircleIcon, EditIcon } from './icons';

interface ApiKeyInputProps {
  apiKey: string;
  onSave: (key: string) => void;
}

const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ apiKey, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (apiKey && !isEditing) {
      setIsEditing(false);
    }
  }, [apiKey, isEditing]);

  const handleSave = () => {
    onSave(inputValue);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setInputValue(apiKey);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setInputValue('');
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-lg animate-fade-in-fast w-full max-w-md mx-auto">
        <label htmlFor="api-key-input" className="flex items-center text-lg font-semibold text-white mb-2">
          <KeyIcon />
          <span className="ml-2">Enter your Gemini API Key</span>
        </label>
        <div className="flex gap-2">
          <input
            id="api-key-input"
            type="password"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Your API key"
            className="flex-grow bg-gray-700 border-gray-600 rounded-md p-2 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <button
            onClick={handleSave}
            disabled={!inputValue.trim()}
            className="py-2 px-4 bg-purple-600 hover:bg-purple-700 rounded-md text-white font-semibold disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Save
          </button>
          <button
            onClick={handleCancel}
            className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-md text-white font-semibold"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (apiKey) {
    return (
      <div className="flex items-center justify-center gap-4 bg-green-900/50 text-green-300 p-3 rounded-lg border border-green-700 w-full max-w-md mx-auto">
        <CheckCircleIcon />
        <span className="font-medium">API Key is set</span>
        <button onClick={handleEdit} className="ml-auto flex items-center gap-1 text-sm text-green-300 hover:text-white">
            <EditIcon />
            Edit
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="inline-flex items-center gap-2 py-2 px-4 border border-yellow-500 rounded-md shadow-sm text-sm font-medium text-yellow-300 bg-yellow-900/50 hover:bg-yellow-900/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-yellow-500 transition duration-200"
    >
      <KeyIcon />
      Set Gemini API Key
    </button>
  );
};

export default ApiKeyInput;

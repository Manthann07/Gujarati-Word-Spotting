import React, { useState } from 'react';
import { searchPDF } from '../api';

const SearchBox = ({ selectedPDF, onSearchResults, onSearchError }) => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      onSearchError('Please enter a search query');
      return;
    }
    if (!selectedPDF) {
      onSearchError('Please upload a PDF first');
      return;
    }
    setIsSearching(true);
    try {
      const trimmed = query.trim();
      const results = await searchPDF(trimmed, selectedPDF);
      setSearchHistory(prev => {
        const newHistory = [trimmed, ...prev.filter(item => item !== trimmed)].slice(0, 5);
        return newHistory;
      });
      onSearchResults(results);
    } catch (error) {
      onSearchError(error.response?.data?.detail || 'Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleHistoryClick = (historyQuery) => {
    setQuery(historyQuery);
  };

  const handleClearHistory = () => {
    setSearchHistory([]);
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-3">Search Your Document</h2>
        <p className="text-slate-300 text-lg">Find specific words, phrases, or content in your Gujarati PDF</p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="relative group">
          {/* Glow effect behind search bar */}
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          
          <div className="relative flex gap-3 items-center bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-600/30 p-2 shadow-2xl">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter your search query in Gujarati or English..."
                className="w-full pl-12 pr-4 py-4 bg-transparent border-none text-white placeholder-slate-400 text-lg focus:outline-none focus:ring-0"
                disabled={isSearching}
              />
            </div>
            
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 hover:from-purple-600 hover:to-blue-600"
              disabled={isSearching || !query.trim() || !selectedPDF}
            >
              {isSearching ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Searching...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  Search
                </div>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Recent Searches */}
      {searchHistory.length > 0 && (
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-600/30 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h4 className="text-white font-semibold text-lg">Recent Searches</h4>
            </div>
            <button 
              onClick={handleClearHistory} 
              className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors duration-300 border border-red-500/30"
            >
              Clear All
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {searchHistory.map((item, index) => (
              <button
                key={index}
                onClick={() => handleHistoryClick(item)}
                className="group px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-slate-300 hover:bg-purple-500/20 hover:border-purple-500/50 hover:text-white transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-400 group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  {item}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Current PDF Info */}
      {selectedPDF && (
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div>
              <p className="text-blue-300 text-sm font-medium">Currently searching in:</p>
              <p className="text-white font-semibold text-lg">{selectedPDF}</p>
            </div>
          </div>
        </div>
      )}

      {/* Search Tips */}
      <div className="mt-8 bg-slate-800/20 backdrop-blur-xl rounded-2xl border border-slate-600/20 p-6">
        <h4 className="text-white font-semibold text-lg mb-3 flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Search Tips
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-300">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
            <p>Search in Gujarati, English, or mixed languages</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
            <p>Use exact phrases for better results</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
            <p>AI-powered semantic search included</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-pink-400 rounded-full mt-2 flex-shrink-0"></div>
            <p>Results show page numbers and relevance scores</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBox; 
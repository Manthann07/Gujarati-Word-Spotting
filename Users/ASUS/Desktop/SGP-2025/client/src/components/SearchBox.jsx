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
      const results = await searchPDF(query, selectedPDF);
      setSearchHistory(prev => {
        const newHistory = [query, ...prev.filter(item => item !== query)].slice(0, 5);
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
    <div className="w-full max-w-2xl mx-auto p-4">
      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your search query..."
            className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 text-base"
            disabled={isSearching}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-2 rounded-lg font-semibold shadow hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            disabled={isSearching || !query.trim() || !selectedPDF}
          >
            {isSearching ? (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>
            )}
          </button>
        </div>
      </form>
      {searchHistory.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-gray-700 font-semibold text-sm">Recent Searches</h4>
            <button onClick={handleClearHistory} className="text-red-500 text-xs hover:underline">Clear</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {searchHistory.map((item, index) => (
              <button
                key={index}
                onClick={() => handleHistoryClick(item)}
                className="bg-white border border-gray-300 rounded-full px-3 py-1 text-sm text-gray-700 hover:bg-blue-100 transition-colors"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
      {selectedPDF && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-blue-700 text-sm">
          <span>Searching in: </span>
          <strong>{selectedPDF}</strong>
        </div>
      )}
    </div>
  );
};

export default SearchBox; 
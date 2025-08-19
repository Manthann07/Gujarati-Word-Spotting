import React, { useState, useEffect, useRef } from 'react';

const PDFViewer = ({ pdfData, searchResults, currentQuery }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [showSearchHighlights, setShowSearchHighlights] = useState(true);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  const [highlightMethod, setHighlightMethod] = useState('auto'); // 'auto', 'simple', 'regex'

  useEffect(() => {
    if (searchResults?.results?.length > 0) {
      setCurrentPage(searchResults.results[0].page);
      resetMatchNavigation();
    }
  }, [searchResults]);

  useEffect(() => {
    resetMatchNavigation();
  }, [currentPage, currentQuery]);

  const pageTextRef = useRef(null);

  useEffect(() => {
    // Scroll to the current match when it changes (scoped to page text area)
    if (currentQuery && showSearchHighlights && getMatchCountForCurrentPage() > 0 && pageTextRef.current) {
      const marks = pageTextRef.current.querySelectorAll('mark');
      if (marks.length > currentMatchIndex) {
        marks[currentMatchIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentMatchIndex, currentQuery, showSearchHighlights]);

  useEffect(() => {
    // Add keyboard shortcuts for match navigation
    const handleKeyDown = (e) => {
      if (currentQuery && showSearchHighlights && getMatchCountForCurrentPage() > 1) {
        if (e.key === 'ArrowRight' || e.key === 'n') {
          e.preventDefault();
          navigateToNextMatch();
        } else if (e.key === 'ArrowLeft' || e.key === 'p') {
          e.preventDefault();
          navigateToPreviousMatch();
        }
      }
      
      // Global navigation shortcuts
      if (currentQuery && showSearchHighlights && getTotalMatchCount() > 1) {
        if (e.shiftKey && e.key === 'ArrowRight') {
          e.preventDefault();
          navigateToNextGlobalMatch();
        } else if (e.shiftKey && e.key === 'ArrowLeft') {
          e.preventDefault();
          navigateToPreviousGlobalMatch();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentQuery, showSearchHighlights]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (pdfData?.total_pages || 1)) {
      setCurrentPage(newPage);
    }
  };

  const handleZoomChange = (newZoom) => {
    const clampedZoom = Math.max(0.5, Math.min(3, newZoom));
    setZoom(clampedZoom);
  };

  const highlightText = (text, query) => {
    if (!query || !showSearchHighlights) return text;
    
    // Handle Gujarati and other Unicode text properly
    // Escape special regex characters in the query
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Create a more robust regex that handles Unicode properly
    // Use Unicode property escapes for better language support
    const regex = new RegExp(`(${escapedQuery})`, 'giu');
    
    // Replace with highlighted version
    const highlightedText = text.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 rounded px-1 font-semibold">$1</mark>');
    
    return highlightedText;
  };

  const highlightSearchResult = (text, query) => {
    if (!query) return text;
    
    // Handle Gujarati and other Unicode text properly
    // Escape special regex characters in the query
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    
    // Create a more robust regex that handles Unicode properly
    const regex = new RegExp(`(${escapedQuery})`, 'giu');
    
    // Replace with highlighted version
    const highlightedText = text.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 rounded px-1 font-semibold">$1</mark>');
    
    return highlightedText;
  };

  const highlightAllMatches = (text, query) => {
    if (!query || !showSearchHighlights) return text;
    
    console.log('🔍 Regex highlighting:', { query, textLength: text.length });
    
    // Normalize to NFC and build regex tolerant to zero-width and whitespace
    const textNorm = text.normalize('NFC');
    const queryNorm = query.normalize('NFC');
    const spacer = "[\\s\\u200B\\u200C\\u200D\\uFEFF]*";
    const parts = Array.from(queryNorm).map(ch => ch.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'));
    const regex = new RegExp(parts.join(spacer), 'giu');
    
    console.log('🔍 Regex pattern:', regex);
    
    // Replace with highlighted version - use different colors for multiple matches
    let matchCount = 0;
    const highlightedText = textNorm.replace(regex, (match) => {
      matchCount++;
      console.log('🎯 Found match:', match, 'at position', matchCount);
      const baseStyle = 'padding:0 2px;border-radius:2px;';
      let style;
      if (matchCount === currentMatchIndex + 1) {
        style = `${baseStyle}background-color:#fca5a5;color:#7f1d1d;border:2px solid #ef4444;`;
      } else if (matchCount % 2 === 0) {
        style = `${baseStyle}background-color:#fed7aa;color:#7c2d12;`;
      } else {
        style = `${baseStyle}background-color:#fde68a;color:#78350f;`;
      }
      return `<mark style="${style}">${match}</mark>`;
    });
    
    console.log('🎯 Total matches found:', matchCount);
    return highlightedText;
  };

  const simpleHighlight = (text, query) => {
    if (!query || !showSearchHighlights) return text;
    
    console.log('🔍 Simple highlighting for:', query);
    
    // Zero-width + whitespace tolerant simple regex with NFC normalization
    const textNorm = text.normalize('NFC');
    const queryNorm = query.normalize('NFC');
    const spacer = "[\\s\\u200B\\u200C\\u200D\\uFEFF]*";
    const parts = Array.from(queryNorm).map(ch => ch.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'));
    const regex = new RegExp(parts.join(spacer), 'giu');
    const highlightedText = textNorm.replace(regex, 
      '<mark style="background-color:#fde68a;color:#78350f;padding:0 2px;border-radius:2px;">$&</mark>'
    );
    
    console.log('🎯 Simple highlighting result length:', highlightedText.length);
    return highlightedText;
  };

  const highlightWithExactMatches = (text, query, exactMatches = []) => {
    if (!query || !showSearchHighlights) return text;

    // Escape HTML helper to render raw PDF text safely
    const escapeHtml = (s) =>
      s
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    // If we have exact match data, build the HTML from raw text using positions
    if (exactMatches && exactMatches.length > 0) {
      const sorted = [...exactMatches].sort((a, b) => a.position - b.position);
      let html = '';
      let cursor = 0;
      let count = 0;

      for (const m of sorted) {
        if (m.position == null || m.length == null || m.position < cursor) continue;
        // Append safe text before match
        html += escapeHtml(text.slice(cursor, m.position));
        count += 1;
        const isCurrent = count === (currentMatchIndex + 1);
        const colorClass = isCurrent
          ? 'bg-red-300 text-red-900 border-2 border-red-500'
          : (count % 2 === 0 ? 'bg-orange-200 text-orange-900' : 'bg-yellow-200 text-yellow-900');
        const matchText = text.slice(m.position, m.position + m.length);
        html += `<mark class="${colorClass} rounded px-1 font-semibold">${escapeHtml(matchText)}</mark>`;
        cursor = m.position + m.length;
      }
      // Append the tail
      html += escapeHtml(text.slice(cursor));
      return html;
    }

    // Fallback: zero-width tolerant regex highlighting on escaped text
    const textNorm = text.normalize('NFC');
    const queryNorm = query.normalize('NFC');
    const base = escapeHtml(textNorm);
    const spacer = "[\\s\\u200B\\u200C\\u200D\\uFEFF]*";
    const parts = Array.from(queryNorm).map(ch => ch.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&'));
    const regex = new RegExp(parts.join(spacer), 'giu');
    return base.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 rounded px-1 font-semibold">$&</mark>');
  };

  const getCurrentPageData = () => {
    if (!pdfData?.pages) return null;
    return pdfData.pages.find(page => page.page === currentPage);
  };

  const getSearchResultsForCurrentPage = () => {
    if (!searchResults?.results) return [];
    return searchResults.results.filter(result => result.page === currentPage);
  };

  const getMatchCountForCurrentPage = () => {
    if (!currentQuery || !currentPageData) return 0;
    // Prefer exact match counts when available
    const exact = getSearchResultsForCurrentPage().flatMap(r => (r.exact_matches || []));
    if (exact.length > 0) return exact.length;
    const escapedQuery = currentQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escapedQuery, 'giu');
    const matches = currentPageData.text.match(regex);
    return matches ? matches.length : 0;
  };

  const getTotalMatchCount = () => {
    if (!currentQuery || !searchResults?.results) return 0;
    // Prefer exact match counts when available
    const exactTotal = searchResults.results.reduce((acc, r) => acc + (r.exact_matches ? r.exact_matches.length : 0), 0);
    if (exactTotal > 0) return exactTotal;
    let totalMatches = 0;
    searchResults.results.forEach(result => {
      if (result.full_text) {
        const escapedQuery = currentQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedQuery, 'giu');
        const matches = result.full_text.match(regex);
        if (matches) totalMatches += matches.length;
      }
    });
    return totalMatches;
  };

  const getCurrentMatchGlobalPosition = () => {
    if (!currentQuery || !searchResults?.results) return { current: 0, total: 0 };
    
    let currentPosition = 0;
    let totalMatches = 0;
    
    for (let i = 0; i < searchResults.results.length; i++) {
      const result = searchResults.results[i];
      const pageMatchCount = result.exact_matches ? result.exact_matches.length : (() => {
        if (!result.full_text) return 0;
        const escapedQuery = currentQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedQuery, 'giu');
        const m = result.full_text.match(regex);
        return m ? m.length : 0;
      })();
      if (pageMatchCount > 0) {
        totalMatches += pageMatchCount;
        if (result.page === currentPage) {
          currentPosition += currentMatchIndex + 1;
          break;
        } else {
          currentPosition += pageMatchCount;
        }
      }
    }
    
    return { current: currentPosition, total: totalMatches };
  };

  const navigateToPreviousMatch = () => {
    const matchCount = getMatchCountForCurrentPage();
    if (matchCount > 0) {
      setCurrentMatchIndex((prev) => (prev - 1 + matchCount) % matchCount);
    }
  };

  const navigateToNextMatch = () => {
    const matchCount = getMatchCountForCurrentPage();
    if (matchCount > 0) {
      setCurrentMatchIndex((prev) => (prev + 1) % matchCount);
    }
  };

  const navigateToNextGlobalMatch = () => {
    const globalPos = getCurrentMatchGlobalPosition();
    if (globalPos.total > 0) {
      const nextGlobalPos = globalPos.current % globalPos.total;
      
      // Find the page and match index for the next global position
      let currentCount = 0;
      for (let i = 0; i < searchResults.results.length; i++) {
        const result = searchResults.results[i];
        const pageMatchCount = result.exact_matches ? result.exact_matches.length : (() => {
          if (!result.full_text) return 0;
          const escapedQuery = currentQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(escapedQuery, 'giu');
          const m = result.full_text.match(regex);
          return m ? m.length : 0;
        })();
        if (pageMatchCount > 0) {
          if (currentCount + pageMatchCount > nextGlobalPos) {
            setCurrentPage(result.page);
            setCurrentMatchIndex(nextGlobalPos - currentCount);
            break;
          }
          currentCount += pageMatchCount;
        }
      }
    }
  };

  const navigateToPreviousGlobalMatch = () => {
    const globalPos = getCurrentMatchGlobalPosition();
    if (globalPos.total > 0) {
      let prevGlobalPos = globalPos.current - 2; // -2 because current is 1-indexed
      if (prevGlobalPos < 0) {
        prevGlobalPos = globalPos.total - 1;
      }
      
      // Find the page and match index for the previous global position
      let currentCount = 0;
      for (let i = 0; i < searchResults.results.length; i++) {
        const result = searchResults.results[i];
        const pageMatchCount = result.exact_matches ? result.exact_matches.length : (() => {
          if (!result.full_text) return 0;
          const escapedQuery = currentQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const regex = new RegExp(escapedQuery, 'giu');
          const m = result.full_text.match(regex);
          return m ? m.length : 0;
        })();
        if (pageMatchCount > 0) {
          if (currentCount + pageMatchCount > prevGlobalPos) {
            setCurrentPage(result.page);
            setCurrentMatchIndex(prevGlobalPos - currentCount);
            break;
          }
          currentCount += pageMatchCount;
        }
      }
    }
  };

  const resetMatchNavigation = () => {
    setCurrentMatchIndex(0);
  };

  const currentPageData = getCurrentPageData();
  const pageSearchResults = getSearchResultsForCurrentPage();

  if (!pdfData) {
    return (
      <div className="flex items-center justify-center min-h-[300px] bg-gray-50 rounded-xl">
        <div className="text-center text-gray-400">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-auto mb-2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14,2 14,8 20,8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10,9 9,9 8,9"></polyline>
          </svg>
          <h3 className="text-lg font-semibold">No PDF Loaded</h3>
          <p className="text-gray-500">Upload a PDF document to start viewing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-4 py-2 bg-gray-200 rounded-lg font-semibold text-gray-600 hover:bg-blue-100 disabled:opacity-50"
          >
            ← Previous
          </button>
          <span className="font-medium text-gray-700">
            Page {currentPage} of {pdfData.total_pages}
            {currentQuery && (
              <span className="ml-2 text-blue-600 text-sm">
                • Searching for "{currentQuery}"
              </span>
            )}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= pdfData.total_pages}
            className="px-4 py-2 bg-gray-200 rounded-lg font-semibold text-gray-600 hover:bg-blue-100 disabled:opacity-50"
          >
            Next →
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleZoomChange(zoom - 0.1)}
            disabled={zoom <= 0.5}
            className="w-9 h-9 bg-gray-200 rounded-lg font-bold text-lg text-gray-700 hover:bg-blue-100 disabled:opacity-50"
          >
            -
          </button>
          <span className="font-medium text-gray-700">{Math.round(zoom * 100)}%</span>
          {currentQuery && (
            <span className="ml-2 text-blue-600 text-xs">
              🔍 "{currentQuery}"
            </span>
          )}
          <button
            onClick={() => handleZoomChange(zoom + 0.1)}
            disabled={zoom >= 3}
            className="w-9 h-9 bg-gray-200 rounded-lg font-bold text-lg text-gray-700 hover:bg-blue-100 disabled:opacity-50"
          >
            +
          </button>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showSearchHighlights}
              onChange={(e) => setShowSearchHighlights(e.target.checked)}
              className="accent-blue-500"
            />
            Show Highlights
            {currentQuery && (
              <span className="ml-1 text-blue-600 text-xs">
                for "{currentQuery}"
              </span>
            )}
          </label>
          {currentQuery && (
            <button
              onClick={() => {
                console.log('🧪 Testing highlighting for:', currentQuery);
                console.log('🧪 Current page text length:', currentPageData?.text?.length);
                console.log('🧪 Search results:', searchResults);
                
                // Test if the query exists in the text
                if (currentPageData?.text) {
                  const containsQuery = currentPageData.text.includes(currentQuery);
                  console.log('🧪 Query found in text:', containsQuery);
                  
                  // Test regex matching
                  const escapedQuery = currentQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                  const regex = new RegExp(escapedQuery, 'giu');
                  const matches = currentPageData.text.match(regex);
                  console.log('🧪 Regex matches:', matches);
                  
                  // Test case-insensitive search
                  const lowerText = currentPageData.text.toLowerCase();
                  const lowerQuery = currentQuery.toLowerCase();
                  const lowerMatch = lowerText.includes(lowerQuery);
                  console.log('🧪 Lowercase match:', lowerMatch);
                }
              }}
              className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs hover:bg-purple-200"
              title="Test highlighting"
            >
              🧪 Test
            </button>
          )}
          {currentQuery && (
            <button
              onClick={async () => {
                try {
                  const response = await fetch('http://localhost:8000/test-search');
                  const data = await response.json();
                  console.log('🧪 Backend test result:', data);
                } catch (error) {
                  console.error('🧪 Backend test failed:', error);
                }
              }}
              className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
              title="Test backend"
            >
              🔧 Backend
            </button>
          )}
          {currentQuery && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-600">Highlight:</span>
              <select
                value={highlightMethod}
                onChange={(e) => setHighlightMethod(e.target.value)}
                className="px-2 py-1 bg-white border border-gray-300 rounded text-xs"
              >
                <option value="auto">Auto</option>
                <option value="simple">Simple</option>
                <option value="regex">Regex</option>
              </select>
            </div>
          )}
          {currentQuery && showSearchHighlights && (
            <span className="text-sm text-blue-600 font-medium">
              {getMatchCountForCurrentPage()} matches found
              {getTotalMatchCount() > 0 && (
                <span className="ml-1 text-gray-500">
                  (Match {getCurrentMatchGlobalPosition().current} of {getCurrentMatchGlobalPosition().total})
                </span>
              )}
            </span>
          )}
          {currentQuery && showSearchHighlights && getMatchCountForCurrentPage() > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={navigateToPreviousMatch}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                title="Previous match on this page (← or P)"
              >
                ←
              </button>
              <span className="text-xs text-gray-600">
                {currentMatchIndex + 1} of {getMatchCountForCurrentPage()}
              </span>
              <button
                onClick={navigateToNextMatch}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                title="Next match on this page (→ or N)"
              >
                →
              </button>
            </div>
          )}
          {currentQuery && showSearchHighlights && getTotalMatchCount() > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={navigateToPreviousGlobalMatch}
                className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                title="Previous match across all pages (Shift + ←)"
              >
                ⟵
              </button>
              <button
                onClick={navigateToNextGlobalMatch}
                className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs hover:bg-green-200"
                title="Next match across all pages (Shift + →)"
              >
                ⟶
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="min-h-[300px] bg-gray-50 rounded-lg p-6 mb-4 overflow-x-auto" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
        {currentPageData ? (
          <div className="whitespace-pre-wrap break-words text-gray-800 text-base">
            {currentQuery && pageSearchResults.length === 0 && (
              <div className="mb-4 p-3 bg-gray-100 rounded-lg text-gray-600 text-sm">
                💡 No search results found for "{currentQuery}" on this page. 
                Try navigating to other pages or refining your search.
              </div>
            )}
            <div ref={pageTextRef}
              dangerouslySetInnerHTML={{
                __html: (() => {
                  if (highlightMethod === 'simple') {
                    return simpleHighlight(currentPageData.text, currentQuery);
                  } else if (highlightMethod === 'regex') {
                    return highlightAllMatches(currentPageData.text, currentQuery);
                  } else {
                    // Use exact match positions from the server when available
                    const exactMatches = pageSearchResults.flatMap(r => (r.exact_matches || []));
                    const sourceText = (pageSearchResults.find(r => r.full_text)?.full_text || currentPageData.text).normalize('NFC');
                    return highlightWithExactMatches(sourceText, currentQuery, exactMatches);
                  }
                })()
              }}
            />
            {pageSearchResults.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h4 className="font-semibold text-gray-700 mb-2">
                  Search Results for "{currentQuery}" on this Page ({pageSearchResults.length} results):
                </h4>
                {pageSearchResults.map((result, index) => (
                  <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                    <div className="text-yellow-700 text-xs mb-1">
                      Similarity: {Math.round(result.score * 100)}% | 
                      Score: {result.score.toFixed(3)}
                      {result.exact_matches && (
                        <span className="ml-2 text-green-600">
                          • {result.exact_matches.length} exact matches
                        </span>
                      )}
                      {result.match_count && (
                        <span className="ml-2 text-blue-600">
                          • {result.match_count} matches found
                        </span>
                      )}
                    </div>
                    <div 
                      className="text-gray-700 text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: highlightSearchResult(result.text, currentQuery)
                      }}
                    />
                  </div>
                ))}
                {getMatchCountForCurrentPage() > 1 && (
                  <div className="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded">
                    💡 <strong>Navigation:</strong> Use ← → arrow keys or P/N keys to navigate between matches on this page.
                    {getTotalMatchCount() > 1 && (
                      <span className="ml-2">
                        Use Shift + ← → to navigate across all pages.
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center text-gray-400">Page {currentPage} not found</div>
        )}
      </div>
      {searchResults?.results?.length > 0 && (
        <div className="bg-blue-50 border-t border-blue-200 rounded-lg p-4 mt-4">
          <h4 className="font-semibold text-blue-700 mb-2">Search Summary</h4>
          <p className="text-blue-700 mb-2">
            Found {searchResults.results.length} results for "{currentQuery}" across {searchResults.total_pages} pages
            {getTotalMatchCount() > 0 && (
              <span className="ml-2 text-blue-600">
                ({getTotalMatchCount()} total matches)
              </span>
            )}
          </p>
          <div className="flex flex-wrap gap-2">
            {searchResults.results.map((result, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(result.page)}
                className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors ${currentPage === result.page ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-100'}`}
              >
                Page {result.page} ({Math.round(result.score * 100)}%)
              </button>
            ))}
          </div>
          <div className="text-xs text-blue-600 mt-2">
            💡 Click on a page number to jump to that page and see the matches highlighted.
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewer; 
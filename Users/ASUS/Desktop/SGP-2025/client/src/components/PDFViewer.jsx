import React, { useState, useEffect } from 'react';

const PDFViewer = ({ pdfData, searchResults, currentQuery }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [showSearchHighlights, setShowSearchHighlights] = useState(true);

  useEffect(() => {
    if (searchResults?.results?.length > 0) {
      setCurrentPage(searchResults.results[0].page);
    }
  }, [searchResults]);

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
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 rounded px-1">$1</mark>');
  };

  const getCurrentPageData = () => {
    if (!pdfData?.pages) return null;
    return pdfData.pages.find(page => page.page === currentPage);
  };

  const getSearchResultsForCurrentPage = () => {
    if (!searchResults?.results) return [];
    return searchResults.results.filter(result => result.page === currentPage);
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
          </label>
        </div>
      </div>
      <div className="min-h-[300px] bg-gray-50 rounded-lg p-6 mb-4 overflow-x-auto" style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}>
        {currentPageData ? (
          <div className="whitespace-pre-wrap break-words text-gray-800 text-base">
            <div
              dangerouslySetInnerHTML={{
                __html: highlightText(currentPageData.text, currentQuery)
              }}
            />
            {pageSearchResults.length > 0 && (
              <div className="mt-6 border-t pt-4">
                <h4 className="font-semibold text-gray-700 mb-2">Search Results on this Page:</h4>
                {pageSearchResults.map((result, index) => (
                  <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-2">
                    <div className="text-yellow-700 text-xs mb-1">Similarity: {Math.round(result.similarity * 100)}%</div>
                    <div className="text-gray-700 text-sm">{result.text}</div>
                  </div>
                ))}
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
          <p className="text-blue-700 mb-2">Found {searchResults.results.length} results for "{currentQuery}"</p>
          <div className="flex flex-wrap gap-2">
            {searchResults.results.map((result, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(result.page)}
                className={`px-3 py-1 rounded-full border text-sm font-medium transition-colors ${currentPage === result.page ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-700 border-blue-300 hover:bg-blue-100'}`}
              >
                Page {result.page} ({Math.round(result.similarity * 100)}%)
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewer; 
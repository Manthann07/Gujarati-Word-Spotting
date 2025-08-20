import React, { useState } from "react";
import Upload from "./components/Upload";
import SearchBox from "./components/SearchBox";
import PDFViewer from "./components/PDFViewer";

function App() {
  const [pdfData, setPdfData] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [currentQuery, setCurrentQuery] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUploadSuccess = (result) => {
    setPdfData(result);
    setSearchResults(null);
    setCurrentQuery("");
    setError("");
    setSuccess(`PDF "${result.filename}" uploaded successfully!`);
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleUploadError = (errorMessage) => {
    setError(errorMessage);
    setSuccess("");
    setTimeout(() => setError(""), 5000);
  };

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setCurrentQuery(results.query);
    setError("");
    setSuccess(`Found ${results.results.length} results for "${results.query}"`);
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleSearchError = (errorMessage) => {
    setError(errorMessage);
    setSuccess("");
    setTimeout(() => setError(""), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 py-12 bg-gradient-to-r from-slate-800/80 to-purple-800/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-6 shadow-2xl">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Gujarati Word Spotting
            </span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Advanced PDF search and analysis powered by AI for Gujarati documents
          </p>
        </div>
      </header>

      {/* Notifications */}
      <div className="relative z-10 flex flex-col items-center mt-8 px-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-3 rounded-xl mb-4 shadow-2xl backdrop-blur-xl animate-fade-in">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {error}
            </div>
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-6 py-3 rounded-xl mb-4 shadow-2xl backdrop-blur-xl animate-fade-in">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              {success}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-6 py-8">
        <div className="w-full max-w-6xl space-y-8">
          {/* Upload Section */}
          <section className="transform hover:scale-[1.02] transition-all duration-300">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
              <Upload onUploadSuccess={handleUploadSuccess} onUploadError={handleUploadError} />
            </div>
          </section>

          {/* Search Section */}
          {pdfData && (
            <section className="transform hover:scale-[1.02] transition-all duration-300">
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
                <SearchBox
                  selectedPDF={pdfData.filename}
                  onSearchResults={handleSearchResults}
                  onSearchError={handleSearchError}
                />
              </div>
            </section>
          )}

          {/* PDF Viewer Section */}
          <section className="transform hover:scale-[1.02] transition-all duration-300">
            <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
              <PDFViewer pdfData={pdfData} searchResults={searchResults} currentQuery={currentQuery} />
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 bg-slate-800/50 backdrop-blur-xl border-t border-white/10 py-8 mt-16">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg"></div>
            <span className="text-slate-400 font-medium">Gujarati Word Spotting</span>
          </div>
          <p className="text-slate-500 text-sm">
            Built with React, Tailwind CSS, and FastAPI • Advanced PDF search for Gujarati documents
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
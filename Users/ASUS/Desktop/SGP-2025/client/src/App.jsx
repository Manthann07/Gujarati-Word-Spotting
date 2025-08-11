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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex flex-col">
      {/* Header */}
      <header className="py-8 bg-gradient-to-r from-blue-700 to-purple-700 shadow">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-white mb-2 drop-shadow">PDF Search App</h1>
          <p className="text-blue-100 text-lg">Upload, search, and view PDFs with AI-powered semantic search</p>
        </div>
      </header>

      {/* Notifications */}
      <div className="flex flex-col items-center mt-4">
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-2 rounded mb-2 shadow">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-300 text-green-700 px-4 py-2 rounded mb-2 shadow">
            {success}
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-2">
        <section className="w-full max-w-xl mt-8 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <Upload onUploadSuccess={handleUploadSuccess} onUploadError={handleUploadError} />
          </div>
        </section>
        {pdfData && (
          <section className="w-full max-w-xl mb-6">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <SearchBox
                selectedPDF={pdfData.filename}
                onSearchResults={handleSearchResults}
                onSearchError={handleSearchError}
              />
            </div>
          </section>
        )}
        <section className="w-full max-w-3xl mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <PDFViewer pdfData={pdfData} searchResults={searchResults} currentQuery={currentQuery} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t py-4 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} PDF Search App. Built with React, Tailwind, and FastAPI.
      </footer>
    </div>
  );
}

export default App;
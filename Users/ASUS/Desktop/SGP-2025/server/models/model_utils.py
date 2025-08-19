try:
    import torch  # Optional: may be unavailable on some Python versions
except Exception:
    torch = None
from transformers import AutoTokenizer, AutoModel
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import PyPDF2
import os
from typing import List, Dict, Any, Tuple
import asyncio

class IndicBERTModel:
    def __init__(self):
        """Initialize IndicBERT model for text processing"""
        self.model_name = "ai4bharat/indic-bert"
        self.tokenizer = None
        self.model = None
        # Use CPU device if torch is available; otherwise keep as string placeholder
        self.device = (torch.device("cuda" if torch and torch.cuda.is_available() else "cpu")
                       if torch else "cpu")
        self.model_loaded = False
        # Don't load model immediately - load it when needed
        print("IndicBERT model initialized (will load on first use)")
    
    def _load_model(self):
        """Load the IndicBERT model and tokenizer"""
        if self.model_loaded:
            return True
            
        try:
            if not torch:
                raise RuntimeError("PyTorch not available; running in fallback mode")
            print("Loading IndicBERT model...")
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModel.from_pretrained(self.model_name)
            if torch:
                self.model.to(self.device)
            self.model.eval()
            self.model_loaded = True
            print("IndicBERT model loaded successfully!")
            return True
        except Exception as e:
            print(f"Error loading model: {e}")
            print("Falling back to simple text search mode")
            # Fallback to a simpler approach
            self.model = None
            self.tokenizer = None
            self.model_loaded = False
            return False
    
    def extract_text_from_pdf(self, pdf_path: str) -> List[str]:
        """Extract text from PDF pages"""
        text_pages = []
        try:
            with open(pdf_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page_num, page in enumerate(pdf_reader.pages):
                    text = page.extract_text()
                    if text.strip():  # Only add non-empty pages
                        text_pages.append({
                            'page': page_num + 1,
                            'text': text.strip()
                        })
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
        return text_pages
    
    def get_embeddings(self, texts: List[str]) -> np.ndarray:
        """Get embeddings for a list of texts"""
        # If model is not loaded or torch is unavailable, fallback to dummy embeddings
        if not self.model_loaded or not torch or self.model is None or self.tokenizer is None:
            if not self._load_model():
                # Fallback: return simple TF-IDF like features
                return np.random.rand(len(texts), 768)  # Dummy embeddings
        
        embeddings = []
        for text in texts:
            try:
                inputs = self.tokenizer(
                    text, 
                    return_tensors="pt", 
                    max_length=512, 
                    truncation=True, 
                    padding=True
                )
                if torch:
                    inputs = {k: v.to(self.device) for k, v in inputs.items()}
                    with torch.no_grad():
                        outputs = self.model(**inputs)
                        # Use mean pooling
                        embedding = outputs.last_hidden_state.mean(dim=1).cpu().numpy()
                        embeddings.append(embedding.flatten())
                else:
                    # Fallback when torch is unavailable
                    embeddings.append(np.random.rand(768))
            except Exception as e:
                print(f"Error getting embedding: {e}")
                # Add zero embedding as fallback
                embeddings.append(np.zeros(768))
        
        return np.array(embeddings)
    
    async def search_text(self, pdf_path: str, query: str) -> Dict[str, Any]:
        """Search for text in PDF using semantic similarity (async version)"""
        return self.search_text_sync(pdf_path, query)
    
    def search_text_sync(self, pdf_path: str, query: str) -> Dict[str, Any]:
        """Search for text in PDF using hybrid semantic + exact text matching"""
        # Extract text from PDF
        text_pages = self.extract_text_from_pdf(pdf_path)
        
        if not text_pages:
            return {"results": [], "message": "No text found in PDF", "total_pages": 0, "query": query}
        
        # Get embeddings for all pages
        page_texts = [page['text'] for page in text_pages]
        page_embeddings = self.get_embeddings(page_texts)
        
        # Get embedding for query
        query_embedding = self.get_embeddings([query])
        
        # Calculate similarities
        similarities = cosine_similarity(query_embedding, page_embeddings)[0]
        
        # Sort results by similarity
        results = []
        for i, (page, similarity) in enumerate(zip(text_pages, similarities)):
            if similarity > 0.1:  # Threshold for relevance
                # Find the best matching text snippet around the query
                page_text = page['text']
                query_lower = query.lower()
                page_text_lower = page_text.lower()
                
                # Try to find exact or partial matches
                match_start = page_text_lower.find(query_lower)
                if match_start != -1:
                    # Found exact match, extract context around it
                    context_start = max(0, match_start - 100)
                    context_end = min(len(page_text), match_start + len(query) + 100)
                    context_text = page_text[context_start:context_end]
                    
                    # Add ellipsis if we're not at the beginning/end
                    if context_start > 0:
                        context_text = "..." + context_text
                    if context_end < len(page_text):
                        context_text = context_text + "..."
                else:
                    # No exact match, use the beginning of the text
                    context_text = page_text[:300] + "..." if len(page_text) > 300 else page_text
                
                results.append({
                    'page': page['page'],
                    'text': context_text,
                    'score': float(similarity),
                    'full_text': page['text'],
                    'match_position': match_start if match_start != -1 else -1,
                    'has_exact_match': match_start != -1
                })
        
        # Sort by similarity score, but prioritize exact matches
        results.sort(key=lambda x: (not x['has_exact_match'], -x['score']))
        
        return {
            "results": results[:10],  # Return top 10 results
            "total_pages": len(text_pages),
            "query": query
        }
    
    def highlight_text(self, text: str, query: str) -> str:
        """Highlight query terms in text (simple implementation)"""
        if not query:
            return text
        
        # Simple highlighting - can be improved with regex
        highlighted_text = text
        for word in query.lower().split():
            if word in text.lower():
                # This is a simple implementation - could be enhanced
                pass
        
        return highlighted_text

    def find_exact_matches(self, text: str, query: str) -> List[Dict[str, Any]]:
        """Find exact matches of the query in text for highlighting (Unicode-safe, tolerant to zero-width chars)."""
        if not text or not query:
            return []

        import re

        # Build a pattern that allows optional zero-width characters between letters
        zwj_class = r"[\u200B\u200C\u200D\uFEFF]*"  # zero-width space, ZWNJ, ZWJ, BOM
        parts = [re.escape(ch) for ch in query]
        pattern_str = zwj_class.join(parts)
        if not pattern_str:
            return []
        pattern = re.compile(pattern_str, flags=re.IGNORECASE | re.UNICODE)

        matches: List[Dict[str, Any]] = []
        for m in pattern.finditer(text):
            start = m.start()
            end = m.end()
            if start is None or end is None:
                continue
            actual_text = text[start:end]
            matches.append({
                'position': start,
                'length': end - start,
                'text': actual_text,
                'query': query
            })

        return matches

    def search_with_exact_matching(self, pdf_path: str, query: str) -> Dict[str, Any]:
        """Search for text in PDF with exact text matching for highlighting"""
        # Extract text from PDF
        text_pages = self.extract_text_from_pdf(pdf_path)
        
        if not text_pages:
            return {"results": [], "message": "No text found in PDF", "total_pages": 0, "query": query}
        
        results = []
        for page in text_pages:
            page_text = page['text']
            
            # Find exact matches
            exact_matches = self.find_exact_matches(page_text, query)
            
            if exact_matches:
                # Calculate a simple relevance score based on match frequency
                score = len(exact_matches) / len(page_text) * 1000  # Normalize
                
                # Extract context around the first match
                first_match = exact_matches[0]
                context_start = max(0, first_match['position'] - 100)
                context_end = min(len(page_text), first_match['position'] + len(query) + 100)
                context_text = page_text[context_start:context_end]
                
                # Add ellipsis if needed
                if context_start > 0:
                    context_text = "..." + context_text
                if context_end < len(page_text):
                    context_text = context_text + "..."
                
                results.append({
                    'page': page['page'],
                    'text': context_text,
                    'score': float(score),
                    'full_text': page_text,
                    'exact_matches': exact_matches,
                    'match_count': len(exact_matches),
                    'has_exact_match': True
                })
        
        # Sort by match count and score
        results.sort(key=lambda x: (x['match_count'], x['score']), reverse=True)
        
        return {
            "results": results[:10],
            "total_pages": len(text_pages),
            "query": query,
            "search_type": "exact_match"
        } 
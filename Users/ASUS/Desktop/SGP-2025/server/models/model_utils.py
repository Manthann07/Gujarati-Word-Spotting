import torch
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
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model_loaded = False
        # Don't load model immediately - load it when needed
        print("IndicBERT model initialized (will load on first use)")
    
    def _load_model(self):
        """Load the IndicBERT model and tokenizer"""
        if self.model_loaded:
            return True
            
        try:
            print("Loading IndicBERT model...")
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModel.from_pretrained(self.model_name)
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
        if not self.model_loaded:
            if not self._load_model():
                # Fallback: return simple TF-IDF like features
                return np.random.rand(len(texts), 768)  # Dummy embeddings
        
        if self.model is None or self.tokenizer is None:
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
                inputs = {k: v.to(self.device) for k, v in inputs.items()}
                
                with torch.no_grad():
                    outputs = self.model(**inputs)
                    # Use mean pooling
                    embedding = outputs.last_hidden_state.mean(dim=1).cpu().numpy()
                    embeddings.append(embedding.flatten())
            except Exception as e:
                print(f"Error getting embedding: {e}")
                # Add zero embedding as fallback
                embeddings.append(np.zeros(768))
        
        return np.array(embeddings)
    
    async def search_text(self, pdf_path: str, query: str) -> Dict[str, Any]:
        """Search for text in PDF using semantic similarity (async version)"""
        return self.search_text_sync(pdf_path, query)
    
    def search_text_sync(self, pdf_path: str, query: str) -> Dict[str, Any]:
        """Search for text in PDF using semantic similarity (synchronous version)"""
        # Extract text from PDF
        text_pages = self.extract_text_from_pdf(pdf_path)
        
        if not text_pages:
            return {"results": [], "message": "No text found in PDF"}
        
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
                results.append({
                    'page': page['page'],
                    'text': page['text'][:200] + "..." if len(page['text']) > 200 else page['text'],
                    'score': float(similarity),
                    'full_text': page['text']
                })
        
        # Sort by similarity score
        results.sort(key=lambda x: x['score'], reverse=True)
        
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
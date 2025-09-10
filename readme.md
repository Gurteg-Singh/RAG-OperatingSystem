**RAG AI Assistant**

**Retrieval-Augmented Generation (RAG) AI Assistant**

**RAG AI Assistant** is a proof-of-concept application that allows users to ask AI questions about a specific PDF (Operating System notes). The system retrieves relevant information using a **hybrid retrieval pipeline** combining **semantic search** (vector embeddings) and **keyword search**, then generates answers with AI (Google Gemini).

**Live Application:** <http://52.60.212.93>

**Features**

- PDF-based knowledge retrieval for specific content.
- Hybrid search combining semantic (Pinecone) and keyword (Weaviate) retrieval.
- Context-aware AI answers using chat history.
- Prompt enhancement using **LangChain** for better standalone questions.
- Single-page interaction via React frontend.
- Demonstrates end-to-end RAG pipeline: embedding, storage, retrieval, and generation.

**Tech Stack**

**Frontend**

- React (Vite)
- Tailwind CSS
- React Hook Form

**Backend**

- Node.js + Express
- LangChain (PDF loader, text splitter, prompt enhancement)
- Google Gemini / GenAI API (embeddings & answer generation)
- Pinecone (vector embeddings & semantic search)
- Weaviate (keyword search)

**Deployment**

- AWS EC2
- Nginx
- PM2
- UFW Firewall
- Accessible via IP: [52.60.212.93](http://52.60.212.93)

**Storage Pipeline (One-Time PDF Processing)**

PDF File
│
▼
Text Split into Chunks (LangChain RecursiveCharacterTextSplitter)
│
├────────────► Store Chunks Directly in Weaviate (Keyword Search)
│
└────────────► Embedding Model (GoogleGenerativeAIEmbeddings)
                                │
                                ▼
                          Store Embeddings in Pinecone (Semantic Search)


**Retrieval & Answer Pipeline (User Query)**

User Prompt + Chat History
         │
         ▼
Prompt Enhancement (Google Gemini LLM)
         │
  ┌──────┴────────────┐
  │                   │
  ▼                   ▼
Weaviate BM25       Embedding Model (GoogleGenerativeAIEmbeddings)
  │                              │
  ▼                              ▼
Retrieve Top Chunks         Query Pinecone
      │                          │
      ▼                          ▼
      └───────────────────────────────── Merge Best Chunks ────────────► Pass as Context to Google Gemini LLM ─► Generate Answer

**Installation & Setup**

**Prerequisites**

- Node.js installed
- API keys for Google Gemini / GenAI
- Pinecone account & index
- Weaviate account & collection

**Steps**

1. Clone the repository.
2. Install dependencies in both frontend and backend.
3. Create a .env file in the backend with required API keys and configuration.
4. Select a PDF to query (can use the sample PDF provided in the repo).
5. Run src/embedding.js **once** to store data in Pinecone and Weaviate.
6. Start the backend server (src/main.js).
7. Start the frontend client.
8. Open the application in your browser via server IP.

**Deployment**

Deployed on **AWS EC2** with:

- Nginx as reverse proxy
- PM2 for process management
- UFW Firewall for security
- Accessible via IP: [52.60.212.93](http://52.60.212.93)
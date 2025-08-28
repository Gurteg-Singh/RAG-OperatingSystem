import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";

export default function Chat() {
  const [history, sethistory] = useState([]);
  const [thinking, setthinking] = useState(false);
  const [error, seterror] = useState(null);
  const messagesEndRef = useRef(null);

  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  async function askAI(d) {
    const newHistory = [...history, { role: "user", parts: [{ text: d.prompt }] }];
    reset();
    sethistory(newHistory);
    setthinking(true);

    async function getAnswer(data) {
      try {
        const response = await axiosClient.post("/chat/doc", data);
        setthinking(false);
        sethistory((prev) => [...prev, { role: "model", parts: [{ text: response?.data }] }]);
      } catch (err) {
        setthinking(false);
        seterror(err.message);
      }
    }

    const data = {
      prompt: d.prompt,
      chatHistory: newHistory
    };
    getAnswer(data);
  }

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: #1a1a1a;
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #4a4a4a;
        border-radius: 3px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #5a5a5a;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [history, thinking]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (history.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800 flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white">Document Assistant</h1>
          </div>
          <p className="text-lg text-neutral-400">Ask questions about your documents</p>
        </div>
        
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSubmit(askAI)} className="flex flex-col items-center">
            <div className="relative w-full">
              <input 
                {...register('prompt', { required: "Please enter a question" })}
                placeholder="Ask a question about your document..."
                className="w-full px-6 py-4 bg-neutral-800 border border-neutral-700 rounded-2xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl flex items-center justify-center transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            {errors?.prompt && (
              <p className="text-red-400 text-sm mt-2 self-start ml-2">{errors?.prompt?.message}</p>
            )}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 to-neutral-800 flex flex-col">
      {/* Header */}
      <div className="py-4 px-6 border-b border-neutral-800 flex items-center">
        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-white">Document Assistant</h1>
      </div>
      
      {/* Chat Container */}
      <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-4 overflow-hidden">
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 py-4">
            {history.map((val, index) => {
              if (val?.role === "user") {
                return (
                  <div key={index} className="flex justify-end">
                    <div className="bg-blue-600 text-white rounded-2xl rounded-br-md px-4 py-3 max-w-[80%]">
                      <p className="text-sm">{val?.parts?.[0]?.text}</p>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={index} className="flex justify-start">
                    <div className="bg-neutral-800 text-white rounded-2xl rounded-bl-md px-4 py-3 max-w-[80%]">
                      <div className="flex items-start mb-1">
                        <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center mr-2 flex-shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-blue-400">Based on your document:</p>
                      </div>
                      <p className="text-sm whitespace-pre-wrap ml-8">{val?.parts?.[0]?.text}</p>
                    </div>
                  </div>
                );
              }
            })}
            
            {thinking && (
              <div className="flex justify-start">
                <div className="bg-neutral-800 text-white rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex items-center">
                    <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex space-x-1">
                      <div className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce"></div>
                      <div className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="h-2 w-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
        
        {/* Input Area */}
        <div className="pt-4">
          <form onSubmit={handleSubmit(askAI)}>
            <div className="flex items-center space-x-2">
              <input
                {...register('prompt', { required: "Please enter a question" })}
                placeholder="Ask a question about your document..."
                className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                disabled={thinking}
              />
              <button
                type="submit"
                disabled={thinking}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white p-3 rounded-xl flex items-center justify-center transition-colors duration-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            {errors?.prompt && (
              <p className="text-red-400 text-sm mt-2 ml-2">{errors?.prompt?.message}</p>
            )}
          </form>
        </div>
      </div>

      {/* Error Modal */}
      {error && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-800 rounded-xl max-w-md w-full p-6 border border-neutral-700">
            <h3 className="text-lg font-medium text-white mb-2">Error</h3>
            <p className="text-neutral-300 mb-6">{error}</p>
            <button 
              onClick={() => seterror(null)} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors duration-200"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
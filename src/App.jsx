import React, { useState, useEffect, useRef } from 'react';
import { Upload, Send, FileText, Search, BarChart3, Heart, Bot, User } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

export default function PDFChatApp() {
  // State management
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');
  
  // Refs
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Effects
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    checkApiHealth();
    loadFiles();
    loadStats();
  }, []);

  // API Functions
  const checkApiHealth = async () => {
    try {
      const response = await fetch(`${API_BASE}/check`);
      if (response.ok) {
        setApiStatus('connected');
      } else {
        setApiStatus('error');
        addSystemMessage('❌ API connection failed');
      }
    } catch (error) {
      setApiStatus('error');
      addSystemMessage('❌ Cannot connect to API. Make sure your backend is running on port 5000.');
    }
  };

  const loadFiles = async () => {
    try {
      const response = await fetch(`${API_BASE}/files`);
      if (response.ok) {
        const data = await response.json();
        setFiles(data.files || []);
      }
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.data || {});
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  // Message Functions
  const addSystemMessage = (content) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'system',
      content,
      timestamp: new Date()
    }]);
  };

  const addUserMessage = (content) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      content,
      timestamp: new Date()
    }]);
  };

  const addBotMessage = (content, aiResponse = null) => {
    const newMessage = {
      id: Date.now() + Math.random(),
      type: 'bot',
      content,
      aiResponse,
      timestamp: new Date()
    };
    
    setMessages(prev => {
      const updatedMessages = [...prev, newMessage];
      return updatedMessages;
    });
    
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Event Handlers
  const handleFileUpload = async (event) => {
    console.log('File upload triggered');
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      addSystemMessage('❌ Please upload a PDF file only.');
      return;
    }

    setIsLoading(true);
    addUserMessage(`📄 Uploading: ${file.name}`);

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok || response.status === 200) {
        addBotMessage(`✅ Successfully uploaded "${file.name}"`);
        loadFiles();
        loadStats();
      } else {
        addBotMessage(`❌ Upload failed: ${result.error || result.message || 'Unknown error'}`);
      }
    } catch (error) {
      addBotMessage(`❌ Upload error: ${error.message}`);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSearch = async () => {
    if (!inputMessage.trim()) return;

    const query = inputMessage.trim();
    setIsLoading(true);
    
    addUserMessage(query);
    setInputMessage('');

    try {
      const response = await fetch(`${API_BASE}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const { originalQuery, enhancedQuery, aiResponse } = result.data || {};

        // Create message with enhanced query
        let combinedMessage = '';
        
        if (enhancedQuery) {
          combinedMessage += `Enhanced Query: ${enhancedQuery}`;
        }

        // Pass aiResponse separately as the second parameter
        addBotMessage(combinedMessage, aiResponse);
      } else {
        addBotMessage(`❌ Search failed: ${result.error || result.message || 'Unknown error'}`);
      }
    } catch (error) {
      addBotMessage(`❌ Search error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  // Utility Functions
  const formatTimestamp = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderAiResponse = (aiResponse) => {
    // Handle object format (both old and new)
    if (typeof aiResponse === 'object' && aiResponse !== null) {
      return (
        <div className="mt-4 space-y-3">
          {Object.entries(aiResponse).map(([filename, data], index) => {
            // Handle new format: filename -> string (answer)
            const answer = typeof data === 'string' ? data : data?.answer || 'No answer available';
            
            return (
              <div key={index} className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-transparent rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center space-x-2 mb-3">
                  <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <h4 className="font-bold text-slate-800 text-base truncate">{filename}</h4>
                </div>
                <div className="pl-7 text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
                  {answer}
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    
    // Fallback for string format (backward compatibility)
    if (typeof aiResponse === 'string') {
      try {
        const parsedResponse = JSON.parse(aiResponse);
        if (typeof parsedResponse === 'object' && parsedResponse !== null) {
          return (
            <div className="mt-4 space-y-3">
              {Object.entries(parsedResponse).map(([filename, data], index) => {
                const answer = typeof data === 'string' ? data : data?.answer || 'No answer available';
                
                return (
                  <div key={index} className="border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-transparent rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-2 mb-3">
                      <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                      <h4 className="font-bold text-slate-800 text-base truncate">{filename}</h4>
                    </div>
                    <div className="pl-7 text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">
                      {answer}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        }
        return <div className="mt-2 text-gray-800">{aiResponse}</div>;
      } catch (error) {
        return <div className="mt-2 text-gray-800">{aiResponse}</div>;
      }
    }
    
    return null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'error': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusText = (status) => {
    return status === 'connected' ? 'Connected' : 'Disconnected';
  };

  const getPlaceholderText = () => {
    if (apiStatus !== 'connected') {
      return 'Connect to API first...';
    }
    if (files.length === 0) {
      return 'Upload some PDF files to start searching...';
    }
    return 'Ask a question about your PDFs...';
  };

  const parseMessage = (content) => {
    if (!content) return { enhancedQuery: null, answer: content };
    
    const parts = content.split('\n\n');
    if (parts.length >= 2 && parts[0].startsWith('Enhanced Query:')) {
      return {
        enhancedQuery: parts[0].replace('Enhanced Query: ', ''),
        answer: parts.slice(1).join('\n\n')
      };
    }
    
    return { enhancedQuery: null, answer: content };
  };

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm shadow-lg border-b border-slate-200/50 p-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
                Graviti Reg Search
              </h1>
              <div className="flex items-center space-x-6 text-sm text-slate-600 mt-1">
                <span className={`flex items-center space-x-2 font-medium ${getStatusColor(apiStatus)}`}>
                  <div className={`w-2 h-2 rounded-full ${apiStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                  <span>{getStatusText(apiStatus)}</span>
                </span>
                {stats && (
                  <span className="flex items-center space-x-2 bg-slate-100 px-3 py-1 rounded-full">
                    <BarChart3 className="w-4 h-4 text-slate-500" />
                    <span className="font-medium">{stats.uniqueFiles || 0} documents</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || apiStatus !== 'connected'}
              className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
            >
              <Upload className="w-5 h-5" />
              <span>Upload PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 shadow-xl border border-slate-200/50">
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-3">
                  Welcome to Graviti Reg Search
                </h3>
                <p className="text-slate-600 text-lg">
                  Start exploring your PDFs — just upload and search!
                </p>
              </div>
            </div>
          )}
          
          {messages.map((message) => {
            const { enhancedQuery, answer } = parseMessage(message.content);
            
            return (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} mb-6`}
              >
                <div className={`flex max-w-4xl ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    message.type === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 ml-3' 
                      : message.type === 'system'
                      ? 'bg-yellow-500 mr-3'
                      : 'bg-gradient-to-r from-slate-600 to-slate-700 mr-3'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="w-5 h-5 text-white" />
                    ) : message.type === 'system' ? (
                      <FileText className="w-5 h-5 text-white" />
                    ) : (
                      <Bot className="w-5 h-5 text-white" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 ${message.type === 'user' ? 'mr-3' : 'ml-3'}`}>
                    <div className={`rounded-2xl p-5 shadow-lg border ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-200'
                        : message.type === 'system'
                        ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
                        : 'bg-white/80 backdrop-blur-sm text-slate-800 border-slate-200'
                    }`}>
                      {/* Enhanced Query Section */}
                      {enhancedQuery && message.type === 'bot' && (
                        <div className="mb-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                          <div className="flex items-center space-x-2 mb-2">
                            <Search className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-semibold text-blue-700">Enhanced Query</span>
                          </div>
                          <p className="text-blue-800 text-sm leading-relaxed">
                            {enhancedQuery}
                          </p>
                        </div>
                      )}

                      {/* Main Content */}
                      {answer && (
                        <div className="whitespace-pre-wrap leading-relaxed">
                          {answer}
                        </div>
                      )}
                      
                      {message.aiResponse && renderAiResponse(message.aiResponse)}

                      {/* Timestamp */}
                      <div className={`text-xs mt-3 pt-2 border-t ${
                        message.type === 'user' 
                          ? 'text-blue-100 border-blue-400/30'
                          : message.type === 'system'
                          ? 'text-yellow-600 border-yellow-200'
                          : 'text-slate-500 border-slate-200'
                      }`}>
                        {formatTimestamp(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {isLoading && (
            <div className="flex justify-start mb-6">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-slate-600 to-slate-700 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg px-6 py-4 rounded-2xl">
                  <div className="flex items-center space-x-3 text-slate-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                    <span className="font-medium">Processing your request...</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-slate-200/50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={getPlaceholderText()}
                disabled={isLoading || apiStatus !== 'connected'}
                className="w-full px-6 py-4 border border-slate-300 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-slate-800 placeholder-slate-500 bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-200"
                rows="1"
                style={{ minHeight: '56px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!inputMessage.trim() || isLoading || apiStatus !== 'connected'}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105 font-medium"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          
          {files.length > 0 && (
            <div className="mt-4 p-4 bg-slate-50/80 backdrop-blur-sm rounded-xl border border-slate-200/50">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-slate-600">Uploaded files:</span>
                {files.slice(0, 5).map((file, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium border border-blue-200"
                  >
                    <FileText className="w-3 h-3 mr-2" />
                    {file.length > 20 ? `${file.substring(0, 20)}...` : file}
                  </span>
                ))}
                {files.length > 5 && (
                  <span className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    +{files.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
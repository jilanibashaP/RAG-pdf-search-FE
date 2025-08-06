// import React, { useState, useEffect, useRef } from 'react';
// import { Upload, Send, FileText, Search, BarChart3, Heart } from 'lucide-react';

// const API_BASE = 'http://localhost:5000';

// export default function PDFChatApp() {
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [files, setFiles] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [apiStatus, setApiStatus] = useState('checking');
//   const messagesEndRef = useRef(null);
//   const fileInputRef = useRef(null);

//   // Scroll to bottom when new messages are added
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // Check API health and load initial data
//   useEffect(() => {
//     checkApiHealth();
//     loadFiles();
//     loadStats();
//   }, []);

//   const checkApiHealth = async () => {
//     try {
//       const response = await fetch(`${API_BASE}/check`);
//       if (response.ok) {
//         setApiStatus('connected');
//         addSystemMessage('✅ Connected to Graviti Reg Search');
//       } else {
//         setApiStatus('error');
//         addSystemMessage('❌ API connection failed');
//       }
//     } catch (error) {
//       setApiStatus('error');
//       addSystemMessage('❌ Cannot connect to API. Make sure your backend is running on port 5000.');
//     }
//   };

//   const loadFiles = async () => {
//     try {
//       const response = await fetch(`${API_BASE}/files`);
//       if (response.ok) {
//         const data = await response.json();
//         setFiles(data.files || []);
//       }
//     } catch (error) {
//       console.error('Failed to load files:', error);
//     }
//   };

//   const loadStats = async () => {
//     try {
//       const response = await fetch(`${API_BASE}/stats`);
//       if (response.ok) {
//         const data = await response.json();
//         setStats(data);
//       }
//     } catch (error) {
//       console.error('Failed to load stats:', error);
//     }
//   };

//   const addSystemMessage = (content) => {
//     setMessages(prev => [...prev, {
//       id: Date.now(),
//       type: 'system',
//       content,
//       timestamp: new Date()
//     }]);
//   };

//   const addUserMessage = (content) => {
//     setMessages(prev => [...prev, {
//       id: Date.now(),
//       type: 'user',
//       content,
//       timestamp: new Date()
//     }]);
//   };

//   const addBotMessage = (content, results = null) => {
//     setMessages(prev => {
//       const updatedMessages = [...prev, {
//         id: Date.now(),
//         type: 'bot',
//         content,
//         results,
//         timestamp: new Date()
//       }];
//       // Scroll to the latest message
//       setTimeout(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//       }, 0);
//       return updatedMessages;
//     });
//   };

//   const handleFileUpload = async (event) => {
//     console.log('File upload triggered');
//     const file = event.target.files[0];
//     if (!file) return;

//     if (file.type !== 'application/pdf') {
//       addSystemMessage('❌ Please upload a PDF file only.');
//       return;
//     }

//     setIsLoading(true);
//     addUserMessage(`📄 Uploading: ${file.name}`);

//     try {
//       const formData = new FormData();
//       formData.append('pdf', file);

//       const response = await fetch(`${API_BASE}/upload`, {
//         method: 'POST',
//         body: formData,
//       });

//       const result = await response.json();

//       if (response.ok) {
//         addBotMessage(`✅ Successfully uploaded "${file.name}"`);
//         setTimeout(() => {
//           messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//         }, 0);
//         loadFiles();
//         loadStats();
//       } else {
//         addBotMessage(`❌ Upload failed: ${result.error || 'Unknown error'}`);
//       }
//     } catch (error) {
//       addBotMessage(`❌ Upload error: ${error.message}`);
//     } finally {
//       setIsLoading(false);
//       if (fileInputRef.current) {
//         fileInputRef.current.value = '';
//       }
//     }
//   };

//   const handleSearch = async () => {
//     if (!inputMessage.trim()) return;

//     const query = inputMessage.trim();
//     setIsLoading(true);
    
//     addUserMessage(`🔍 "${query}"`);
//     setInputMessage(''); // Clear input after adding user message

//     try {
//       const response = await fetch(`${API_BASE}/search`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ query }),
//       });

//       const result = await response.json();

//       if (response.ok && result.success) {
//         // Handle the new API response structure
//         const searchResults = result.data?.results || [];
        
//         if (searchResults.length > 0) {
//           addBotMessage(
//             `Found ${searchResults.length} result(s) for "${query}":`,
//             searchResults
//           );
//         } else {
//           addBotMessage(`No results found for "${query}". Try uploading some PDF files first.`);
//         }
//       } else {
//         addBotMessage(`❌ Search failed: ${result.error || result.message || 'Unknown error'}`);
//       }
//     } catch (error) {
//       addBotMessage(`❌ Search error: ${error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSearch();
//     }
//   };

//   const formatTimestamp = (date) => {
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   // Ensure bot messages are styled correctly
//   const messageTypeStyles = {
//     user: 'bg-blue-500 text-white',
//     system: 'bg-gray-200 text-gray-700 text-sm',
//     bot: 'bg-white border shadow-sm',
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       {/* Header */}
//       <div className="bg-white shadow-sm border-b p-4">
//         <div className="max-w-4xl mx-auto flex justify-between items-center">
//           <div className="flex items-center space-x-3">
//             <div className="bg-blue-500 p-2 rounded-lg">
//               <FileText className="w-6 h-6 text-white" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold text-gray-900"> Graviti Reg Search</h1>
//               <div className="flex items-center space-x-4 text-sm text-gray-500">
//                 <span className={`flex items-center space-x-1 ${
//                   apiStatus === 'connected' ? 'text-green-600' : 
//                   apiStatus === 'error' ? 'text-red-600' : 'text-yellow-600'
//                 }`}>
//                   <Heart className="w-3 h-3" />
//                   <span>{apiStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
//                 </span>
//                 {stats && (
//                   <>
//                     <span className="flex items-center space-x-1">
//                       <FileText className="w-3 h-3" />
//                       <span>{files.length} files</span>
//                     </span>
//                     <span className="flex items-center space-x-1">
//                       <BarChart3 className="w-3 h-3" />
//                       <span>{stats.total_documents || 0} docs</span>
//                     </span>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//           <div className="flex items-center space-x-2">
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept=".pdf"
//               onChange={handleFileUpload}
//               className="hidden"
//             />
//             <button
//               onClick={() => fileInputRef.current?.click()}
//               disabled={isLoading || apiStatus !== 'connected'}
//               className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               <Upload className="w-4 h-4" />
//               <span>Upload PDF</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Chat Messages */}
//       <div className="flex-1 overflow-y-auto p-4">
//         <div className="max-w-4xl mx-auto space-y-4">
//           {messages.length === 0 && (
//             <div className="text-center py-12 text-gray-500">
//               <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
//               <h3 className="text-lg font-medium mb-2">Welcome to  Graviti Reg Search Chat</h3>
//               <p>Start exploring your PDFs — just upload and search! </p>
//             </div>
//           )}
          
//           {messages.map((message) => (
//             <div
//               key={message.id}
//               className={`flex ${
//                 message.type === 'user' ? 'justify-end' : 'justify-start'
//               }`}
//             >
//               <div
//                 className={`max-w-3xl px-4 py-3 rounded-lg ${messageTypeStyles[message.type]}`}
//               >
//                 <div className="whitespace-pre-wrap">{message.content}</div>
                
//                 {message.results && (
//                   <div className="mt-4 space-y-3">
//                     {message.results.map((result, index) => (
//                       <div
//                         key={index}
//                         className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow duration-200"
//                       >
//                         {/* Header with filename and score */}
//                         <div className="flex items-center justify-between mb-3">
//                           <div className="flex items-center space-x-2">
//                             <div className="bg-blue-500 p-1.5 rounded-lg">
//                               <FileText className="w-4 h-4 text-white" />
//                             </div>
//                             <span className="font-semibold text-gray-900 truncate max-w-xs">
//                               {result.filename.replace('.pdf.pdf', '.pdf')}
//                             </span>
//                           </div>
//                           <div className="flex items-center space-x-2">
//                             <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
//                               {(parseFloat(result._additional?.score || 0) * 100).toFixed(1)}% match
//                             </span>
//                           </div>
//                         </div>
                        
//                         {/* Content with better formatting */}
//                         <div className="bg-white p-4 rounded-lg border border-gray-100 mb-3">
//                           <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
//                             {result.content ? 
//                               result.content.length > 500 
//                                 ? `${result.content.substring(0, 500)}...` 
//                                 : result.content
//                               : 'No preview available'
//                             }
//                           </div>
//                         </div>
                        
//                         {/* Footer with metadata */}
//                         <div className="flex items-center justify-between text-xs text-gray-600 bg-white bg-opacity-50 px-3 py-2 rounded-lg">
//                           <div className="flex items-center space-x-4">
//                             <span className="flex items-center space-x-1">
//                               <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
//                               <span>Page {result.pageNumber || 'N/A'}</span>
//                             </span>
//                             <span className="flex items-center space-x-1">
//                               <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
//                               <span>Chunk {result.chunkIndex || 'N/A'}</span>
//                             </span>
//                           </div>
//                           <span className="text-gray-500">
//                             {result.totalPages} pages total
//                           </span>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
                
//                 <div className="text-xs opacity-70 mt-2">
//                   {formatTimestamp(message.timestamp)}
//                 </div>
//               </div>
//             </div>
//           ))}
          
//           {isLoading && (
//             <div className="flex justify-start">
//               <div className="bg-white border shadow-sm px-4 py-3 rounded-lg">
//                 <div className="flex items-center space-x-2 text-gray-500">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
//                   <span>Processing...</span>
//                 </div>
//               </div>
//             </div>
//           )}
          
//           <div ref={messagesEndRef} />
//         </div>
//       </div>

//       {/* Input Area */}
//       <div className="bg-white border-t p-4">
//         <div className="max-w-4xl mx-auto">
//           <div className="flex space-x-3">
//             <div className="flex-1 relative">
//               <textarea
//                 value={inputMessage}
//                 onChange={(e) => setInputMessage(e.target.value)}
//                 onKeyDown={handleKeyPress}
//                 placeholder={
//                   apiStatus !== 'connected' 
//                     ? 'Connect to API first...' 
//                     : files.length === 0 
//                     ? 'Upload some PDF files to start searching...'
//                     : 'Ask a question about your PDFs...'
//                 }
//                 disabled={isLoading || apiStatus !== 'connected'}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 placeholder-gray-500"
//                 rows="1"
//                 style={{ minHeight: '48px', maxHeight: '120px' }}
//               />
//             </div>
//             <button
//               onClick={handleSearch}
//               disabled={!inputMessage.trim() || isLoading || apiStatus !== 'connected'}
//               className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
//             >
//               <Send className="w-4 h-4" />
//             </button>
//           </div>
          
//           {files.length > 0 && (
//             <div className="mt-3 flex flex-wrap gap-2">
//               <span className="text-sm text-gray-500">Uploaded files:</span>
//               {files.slice(0, 5).map((file, index) => (
//                 <span key={index} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
//                   <FileText className="w-3 h-3 mr-1" />
//                   {file.length > 20 ? `${file.substring(0, 20)}...` : file}
//                 </span>
//               ))}
//               {files.length > 5 && (
//                 <span className="text-xs text-gray-500">+{files.length - 5} more</span>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


//2 -------------------------------------------------------------------------

// import React, { useState, useEffect, useRef } from 'react';
// import { Upload, Send, FileText, Search, BarChart3, Heart } from 'lucide-react';

// const API_BASE = 'http://localhost:5000';

// export default function PDFChatApp() {
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [files, setFiles] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [apiStatus, setApiStatus] = useState('checking');
//   const [expandedResults, setExpandedResults] = useState(new Set());
//   const messagesEndRef = useRef(null);
//   const fileInputRef = useRef(null);

//   // Scroll to bottom when new messages are added
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // Check API health and load initial data
//   useEffect(() => {
//     checkApiHealth();
//     loadFiles();
//     loadStats();
//   }, []);

//   const checkApiHealth = async () => {
//     try {
//       const response = await fetch(`${API_BASE}/check`);
//       if (response.ok) {
//         setApiStatus('connected');
//         addSystemMessage('✅ Connected to Graviti Reg Search');
//       } else {
//         setApiStatus('error');
//         addSystemMessage('❌ API connection failed');
//       }
//     } catch (error) {
//       setApiStatus('error');
//       addSystemMessage('❌ Cannot connect to API. Make sure your backend is running on port 5000.');
//     }
//   };

//   const loadFiles = async () => {
//     try {
//       const response = await fetch(`${API_BASE}/files`);
//       if (response.ok) {
//         const data = await response.json();
//         setFiles(data.files || []);
//       }
//     } catch (error) {
//       console.error('Failed to load files:', error);
//     }
//   };

//   const loadStats = async () => {
//     try {
//       const response = await fetch(`${API_BASE}/stats`);
//       if (response.ok) {
//         const data = await response.json();
//         setStats(data);
//       }
//     } catch (error) {
//       console.error('Failed to load stats:', error);
//     }
//   };

//   const addSystemMessage = (content) => {
//     setMessages(prev => [...prev, {
//       id: Date.now(),
//       type: 'system',
//       content,
//       timestamp: new Date()
//     }]);
//   };

//   const addUserMessage = (content) => {
//     setMessages(prev => [...prev, {
//       id: Date.now(),
//       type: 'user',
//       content,
//       timestamp: new Date()
//     }]);
//   };

//   const addBotMessage = (content, results = null) => {
//     setMessages(prev => {
//       const updatedMessages = [...prev, {
//         id: Date.now(),
//         type: 'bot',
//         content,
//         results,
//         timestamp: new Date()
//       }];
//       // Scroll to the latest message
//       setTimeout(() => {
//         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//       }, 0);
//       return updatedMessages;
//     });
//   };

//   const toggleResultExpansion = (messageId, resultIndex) => {
//     const key = `${messageId}-${resultIndex}`;
//     const newExpanded = new Set(expandedResults);
//     if (newExpanded.has(key)) {
//       newExpanded.delete(key);
//     } else {
//       newExpanded.add(key);
//     }
//     setExpandedResults(newExpanded);
//   };

//   const formatContent = (content, maxLength = 300) => {
//     if (!content) return 'No preview available';
    
//     // Clean up the content - remove extra whitespace and newlines
//     const cleanContent = content.replace(/\s+/g, ' ').trim();
    
//     if (cleanContent.length <= maxLength) {
//       return cleanContent;
//     }
    
//     // Find a good breaking point (end of sentence)
//     let truncated = cleanContent.substring(0, maxLength);
//     const lastSentence = truncated.lastIndexOf('. ');
//     const lastComma = truncated.lastIndexOf(', ');
    
//     // Break at sentence end if available, otherwise at comma, otherwise at maxLength
//     if (lastSentence > maxLength * 0.7) {
//       truncated = cleanContent.substring(0, lastSentence + 1);
//     } else if (lastComma > maxLength * 0.8) {
//       truncated = cleanContent.substring(0, lastComma + 1);
//     }
    
//     return truncated;
//   };

//   const handleFileUpload = async (event) => {
//     console.log('File upload triggered');
//     const file = event.target.files[0];
//     if (!file) return;

//     if (file.type !== 'application/pdf') {
//       addSystemMessage('❌ Please upload a PDF file only.');
//       return;
//     }

//     setIsLoading(true);
//     addUserMessage(`📄 Uploading: ${file.name}`);

//     try {
//       const formData = new FormData();
//       formData.append('pdf', file);

//       const response = await fetch(`${API_BASE}/upload`, {
//         method: 'POST',
//         body: formData,
//       });

//       const result = await response.json();

//       if (response.ok) {
//         addBotMessage(`✅ Successfully uploaded "${file.name}"`);
//         setTimeout(() => {
//           messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//         }, 0);
//         loadFiles();
//         loadStats();
//       } else {
//         addBotMessage(`❌ Upload failed: ${result.error || 'Unknown error'}`);
//       }
//     } catch (error) {
//       addBotMessage(`❌ Upload error: ${error.message}`);
//     } finally {
//       setIsLoading(false);
//       if (fileInputRef.current) {
//         fileInputRef.current.value = '';
//       }
//     }
//   };

//   const handleSearch = async () => {
//     if (!inputMessage.trim()) return;

//     const query = inputMessage.trim();
//     setIsLoading(true);
    
//     addUserMessage(`🔍 "${query}"`);
//     setInputMessage(''); // Clear input after adding user message

//     try {
//       const response = await fetch(`${API_BASE}/search`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ query }),
//       });

//       const result = await response.json();

//       if (response.ok && result.success) {
//         // Handle the new API response structure
//         const searchResults = result.data?.results || [];
        
//         if (searchResults.length > 0) {
//           addBotMessage(
//             `Found ${searchResults.length} result(s) for "${query}":`,
//             searchResults
//           );
//         } else {
//           addBotMessage(`No results found for "${query}". Try uploading some PDF files first.`);
//         }
//       } else {
//         addBotMessage(`❌ Search failed: ${result.error || result.message || 'Unknown error'}`);
//       }
//     } catch (error) {
//       addBotMessage(`❌ Search error: ${error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSearch();
//     }
//   };

//   const formatTimestamp = (date) => {
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   // Ensure bot messages are styled correctly
//   const messageTypeStyles = {
//     user: 'bg-blue-500 text-white',
//     system: 'bg-gray-200 text-gray-700 text-sm',
//     bot: 'bg-white border shadow-sm',
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       {/* Header */}
//       <div className="bg-white shadow-sm border-b p-4">
//         <div className="max-w-4xl mx-auto flex justify-between items-center">
//           <div className="flex items-center space-x-3">
//             <div className="bg-blue-500 p-2 rounded-lg">
//               <FileText className="w-6 h-6 text-white" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold text-gray-900"> Graviti Reg Search</h1>
//               <div className="flex items-center space-x-4 text-sm text-gray-500">
//                 <span className={`flex items-center space-x-1 ${
//                   apiStatus === 'connected' ? 'text-green-600' : 
//                   apiStatus === 'error' ? 'text-red-600' : 'text-yellow-600'
//                 }`}>
//                   <Heart className="w-3 h-3" />
//                   <span>{apiStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
//                 </span>
//                 {stats && (
//                   <>
//                     <span className="flex items-center space-x-1">
//                       <FileText className="w-3 h-3" />
//                       <span>{files.length} files</span>
//                     </span>
//                     <span className="flex items-center space-x-1">
//                       <BarChart3 className="w-3 h-3" />
//                       <span>{stats.total_documents || 0} docs</span>
//                     </span>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//           <div className="flex items-center space-x-2">
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept=".pdf"
//               onChange={handleFileUpload}
//               className="hidden"
//             />
//             <button
//               onClick={() => fileInputRef.current?.click()}
//               disabled={isLoading || apiStatus !== 'connected'}
//               className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               <Upload className="w-4 h-4" />
//               <span>Upload PDF</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Chat Messages */}
//       <div className="flex-1 overflow-y-auto p-4">
//         <div className="max-w-4xl mx-auto space-y-4">
//           {messages.length === 0 && (
//             <div className="text-center py-12 text-gray-500">
//               <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
//               <h3 className="text-lg font-medium mb-2">Welcome to  Graviti Reg Search Chat</h3>
//               <p>Start exploring your PDFs — just upload and search! </p>
//             </div>
//           )}
          
//           {messages.map((message) => (
//             <div
//               key={message.id}
//               className={`flex ${
//                 message.type === 'user' ? 'justify-end' : 'justify-start'
//               }`}
//             >
//               <div
//                 className={`max-w-3xl px-4 py-3 rounded-lg ${messageTypeStyles[message.type]}`}
//               >
//                 <div className="whitespace-pre-wrap">{message.content}</div>
                
//                 {message.results && (
//                   <div className="mt-4 space-y-3">
//                     {message.results.map((result, index) => {
//                       const resultKey = `${message.id}-${index}`;
//                       const isExpanded = expandedResults.has(resultKey);
//                       const content = result.content || '';
//                       const shouldShowToggle = content.length > 300;
                      
//                       return (
//                         <div
//                           key={index}
//                           className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow duration-200"
//                         >
//                           {/* Header with filename and score */}
//                           <div className="flex items-center justify-between mb-3">
//                             <div className="flex items-center space-x-2">
//                               <div className="bg-blue-500 p-1.5 rounded-lg">
//                                 <FileText className="w-4 h-4 text-white" />
//                               </div>
//                               <span className="font-semibold text-gray-900 truncate max-w-xs">
//                                 {result.filename.replace('.pdf.pdf', '.pdf')}
//                               </span>
//                             </div>
//                             <div className="flex items-center space-x-2">
//                               <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
//                                 {(parseFloat(result._additional?.score || 0) * 100).toFixed(1)}% match
//                               </span>
//                             </div>
//                           </div>
                          
//                           {/* Content with better formatting and expand/collapse */}
//                           <div className="bg-white p-4 rounded-lg border border-gray-100 mb-3">
//                             <div className="text-sm text-gray-800 leading-relaxed">
//                               {isExpanded ? content : formatContent(content)}
                              
//                               {shouldShowToggle && (
//                                 <button
//                                   onClick={() => toggleResultExpansion(message.id, index)}
//                                   className="ml-2 text-blue-600 hover:text-blue-800 font-medium text-xs underline focus:outline-none"
//                                 >
//                                   {isExpanded ? 'Show less' : 'Show more'}
//                                 </button>
//                               )}
//                             </div>
//                           </div>
                          
//                           {/* Footer with metadata */}
//                           <div className="flex items-center justify-between text-xs text-gray-600 bg-white bg-opacity-50 px-3 py-2 rounded-lg">
//                             <div className="flex items-center space-x-4">
//                               <span className="flex items-center space-x-1">
//                                 <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
//                                 <span>Page {result.pageNumber || 'N/A'}</span>
//                               </span>
//                               <span className="flex items-center space-x-1">
//                                 <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
//                                 <span>Chunk {result.chunkIndex || 'N/A'}</span>
//                               </span>
//                             </div>
//                             <span className="text-gray-500">
//                               {result.totalPages} pages total
//                             </span>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}
                
//                 <div className="text-xs opacity-70 mt-2">
//                   {formatTimestamp(message.timestamp)}
//                 </div>
//               </div>
//             </div>
//           ))}
          
//           {isLoading && (
//             <div className="flex justify-start">
//               <div className="bg-white border shadow-sm px-4 py-3 rounded-lg">
//                 <div className="flex items-center space-x-2 text-gray-500">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
//                   <span>Processing...</span>
//                 </div>
//               </div>
//             </div>
//           )}
          
//           <div ref={messagesEndRef} />
//         </div>
//       </div>

//       {/* Input Area */}
//       <div className="bg-white border-t p-4">
//         <div className="max-w-4xl mx-auto">
//           <div className="flex space-x-3">
//             <div className="flex-1 relative">
//               <textarea
//                 value={inputMessage}
//                 onChange={(e) => setInputMessage(e.target.value)}
//                 onKeyDown={handleKeyPress}
//                 placeholder={
//                   apiStatus !== 'connected' 
//                     ? 'Connect to API first...' 
//                     : files.length === 0 
//                     ? 'Upload some PDF files to start searching...'
//                     : 'Ask a question about your PDFs...'
//                 }
//                 disabled={isLoading || apiStatus !== 'connected'}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 placeholder-gray-500"
//                 rows="1"
//                 style={{ minHeight: '48px', maxHeight: '120px' }}
//               />
//             </div>
//             <button
//               onClick={handleSearch}
//               disabled={!inputMessage.trim() || isLoading || apiStatus !== 'connected'}
//               className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
//             >
//               <Send className="w-4 h-4" />
//             </button>
//           </div>
          
//           {files.length > 0 && (
//             <div className="mt-3 flex flex-wrap gap-2">
//               <span className="text-sm text-gray-500">Uploaded files:</span>
//               {files.slice(0, 5).map((file, index) => (
//                 <span key={index} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
//                   <FileText className="w-3 h-3 mr-1" />
//                   {file.length > 20 ? `${file.substring(0, 20)}...` : file}
//                 </span>
//               ))}
//               {files.length > 5 && (
//                 <span className="text-xs text-gray-500">+{files.length - 5} more</span>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


//3---------------------------------------------------------------------------
// proprly working for array of results with augumented to llm

// import React, { useState, useEffect, useRef } from 'react';
// import { Upload, Send, FileText, Search, BarChart3, Heart } from 'lucide-react';

// const API_BASE = 'http://localhost:5000';

// export default function PDFChatApp() {
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [files, setFiles] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [apiStatus, setApiStatus] = useState('checking');
//   const [expandedResults, setExpandedResults] = useState(new Set());
//   const messagesEndRef = useRef(null);
//   const fileInputRef = useRef(null);

//   // Scroll to bottom when new messages are added
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // Check API health and load initial data
//   useEffect(() => {
//     checkApiHealth();
//     loadFiles();
//     loadStats();
//   }, []);

//   const checkApiHealth = async () => {
//     try {
//       const response = await fetch(`${API_BASE}/check`);
//       if (response.ok) {
//         setApiStatus('connected');
//         // addSystemMessage('✅ Connected to Graviti Regulatory Search API');
//       } else {
//         setApiStatus('error');
//         addSystemMessage('❌ API connection failed');
//       }
//     } catch (error) {
//       setApiStatus('error');
//       addSystemMessage('❌ Cannot connect to API. Make sure your backend is running on port 5000.');
//     }
//   };

//   const loadFiles = async () => {
//     try {
//       const response = await fetch(`${API_BASE}/files`);
//       if (response.ok) {
//         const data = await response.json();
//         setFiles(data.files || []);
//       }
//     } catch (error) {
//       console.error('Failed to load files:', error);
//     }
//   };

//   const loadStats = async () => {
//     try {
//       const response = await fetch(`${API_BASE}/stats`);
//       if (response.ok) {
//         const data = await response.json();
//         setStats(data);
//       }
//     } catch (error) {
//       console.error('Failed to load stats:', error);
//     }
//   };

//   const addSystemMessage = (content) => {
//     setMessages(prev => [...prev, {
//       id: Date.now(),
//       type: 'system',
//       content,
//       timestamp: new Date()
//     }]);
//   };

//   const addUserMessage = (content) => {
//     setMessages(prev => [...prev, {
//       id: Date.now(),
//       type: 'user',
//       content,
//       timestamp: new Date()
//     }]);
//   };

//   const addBotMessage = (content, results = null) => {
//     const newMessage = {
//       id: Date.now() + Math.random(),
//       type: 'bot',
//       content,
//       results,
//       timestamp: new Date()
//     };
    
//     setMessages(prev => {
//       const updatedMessages = [...prev, newMessage];
//       console.log('Adding bot message:', newMessage);
//       return updatedMessages;
//     });
    
//     setTimeout(() => {
//       messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, 100);
//   };

//   const toggleResultExpansion = (messageId, resultIndex) => {
//     const key = `${messageId}-${resultIndex}`;
//     const newExpanded = new Set(expandedResults);
//     if (newExpanded.has(key)) {
//       newExpanded.delete(key);
//     } else {
//       newExpanded.add(key);
//     }
//     setExpandedResults(newExpanded);
//   };

//   const formatContent = (content, maxLength = 300) => {
//     if (!content) return 'No preview available';
    
//     const cleanContent = content.replace(/\s+/g, ' ').trim();
    
//     if (cleanContent.length <= maxLength) {
//       return cleanContent;
//     }
    
//     let truncated = cleanContent.substring(0, maxLength);
//     const lastSentence = truncated.lastIndexOf('. ');
//     const lastComma = truncated.lastIndexOf(', ');
    
//     if (lastSentence > maxLength * 0.7) {
//       truncated = cleanContent.substring(0, lastSentence + 1);
//     } else if (lastComma > maxLength * 0.8) {
//       truncated = cleanContent.substring(0, lastComma + 1);
//     }
    
//     return truncated;
//   };

//   const handleFileUpload = async (event) => {
//     console.log('File upload triggered');
//     const file = event.target.files[0];
//     if (!file) return;

//     if (file.type !== 'application/pdf') {
//       addSystemMessage('❌ Please upload a PDF file only.');
//       return;
//     }

//     setIsLoading(true);
//     addUserMessage(`📄 Uploading: ${file.name}`);

//     try {
//       const formData = new FormData();
//       formData.append('pdf', file);

//       const response = await fetch(`${API_BASE}/upload`, {
//         method: 'POST',
//         body: formData,
//       });

//       const result = await response.json();
//       console.log('Upload response:', result);
//       console.log('Response status:', response.status);

//       if (response.ok || response.status === 200) {
//         addBotMessage(`✅ Successfully uploaded "${file.name}"`);
//         loadFiles();
//         loadStats();
//       } else {
//         addBotMessage(`❌ Upload failed: ${result.error || result.message || 'Unknown error'}`);
//       }
//     } catch (error) {
//       addBotMessage(`❌ Upload error: ${error.message}`);
//     } finally {
//       setIsLoading(false);
//       if (fileInputRef.current) {
//         fileInputRef.current.value = '';
//       }
//     }
//   };

//   const handleSearch = async () => {
//     if (!inputMessage.trim()) return;

//     const query = inputMessage.trim();
//     setIsLoading(true);
    
//     addUserMessage(`🔍 "${query}"`);
//     setInputMessage('');

//     try {
//       const response = await fetch(`${API_BASE}/search`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ query }),
//       });

//       const result = await response.json();

//       if (response.ok && result.success) {
//         const searchResults = result.data?.results || [];
        
//         if (searchResults.length > 0) {
//           addBotMessage(
//             `Found ${searchResults.length} result(s) for "${query}":`,
//             searchResults
//           );
//         } else {
//           addBotMessage(`No results found for "${query}". Try uploading some PDF files first.`);
//         }
//       } else {
//         addBotMessage(`❌ Search failed: ${result.error || result.message || 'Unknown error'}`);
//       }
//     } catch (error) {
//       addBotMessage(`❌ Search error: ${error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSearch();
//     }
//   };

//   const formatTimestamp = (date) => {
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   const messageTypeStyles = {
//     user: 'bg-blue-500 text-white',
//     system: 'bg-gray-200 text-gray-700 text-sm',
//     bot: 'bg-white border shadow-sm',
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       {/* Header */}
//       <div className="bg-white shadow-sm border-b p-4">
//         <div className="max-w-4xl mx-auto flex justify-between items-center">
//           <div className="flex items-center space-x-3">
//             <div className="bg-blue-500 p-2 rounded-lg">
//               <FileText className="w-6 h-6 text-white" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold text-gray-900">Graviti Reg Search</h1>
//               <div className="flex items-center space-x-4 text-sm text-gray-500">
//                 <span className={`flex items-center space-x-1 ${
//                   apiStatus === 'connected' ? 'text-green-600' : 
//                   apiStatus === 'error' ? 'text-red-600' : 'text-yellow-600'
//                 }`}>
//                   <Heart className="w-3 h-3" />
//                   <span>{apiStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
//                 </span>
//                 {stats && (
//                   <>
//                     <span className="flex items-center space-x-1">
//                       <FileText className="w-3 h-3" />
//                       <span>{files.length} files</span>
//                     </span>
//                     <span className="flex items-center space-x-1">
//                       <BarChart3 className="w-3 h-3" />
//                       <span>{stats.total_documents || 0} docs</span>
//                     </span>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//           <div className="flex items-center space-x-2">
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept=".pdf"
//               onChange={handleFileUpload}
//               className="hidden"
//             />
//             <button
//               onClick={() => fileInputRef.current?.click()}
//               disabled={isLoading || apiStatus !== 'connected'}
//               className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               <Upload className="w-4 h-4" />
//               <span>Upload PDF</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Chat Messages */}
//       <div className="flex-1 overflow-y-auto p-4">
//         <div className="max-w-4xl mx-auto space-y-4">
//           {messages.length === 0 && (
//             <div className="text-center py-12 text-gray-500">
//               <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
//               <h3 className="text-lg font-medium mb-2">Welcome to Graviti Reg Search Chat</h3>
//               <p>Start exploring your PDFs — just upload and search! </p>
//             </div>
//           )}
          
//           {messages.map((message) => (
//             <div
//               key={message.id}
//               className={`flex ${
//                 message.type === 'user' ? 'justify-end' : 'justify-start'
//               }`}
//             >
//               <div
//                 className={`max-w-3xl px-4 py-3 rounded-lg ${messageTypeStyles[message.type]}`}
//               >
//                 <div className="whitespace-pre-wrap">{message.content}</div>
                
//                 {message.results && (
//                   <div className="mt-4 space-y-3">
//                     {message.results.map((result, index) => {
//                       const resultKey = `${message.id}-${index}`;
//                       const isExpanded = expandedResults.has(resultKey);
//                       const content = result.content || '';
//                       const shouldShowToggle = content.length > 300;
                      
//                       return (
//                         <div
//                           key={index}
//                           className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow duration-200"
//                         >
//                           <div className="flex items-center justify-between mb-3">
//                             <div className="flex items-center space-x-2">
//                               <div className="bg-blue-500 p-1.5 rounded-lg">
//                                 <FileText className="w-4 h-4 text-white" />
//                               </div>
//                               <span className="font-semibold text-gray-900 truncate max-w-xs">
//                                 {result.filename.replace('.pdf.pdf', '.pdf')}
//                               </span>
//                             </div>
//                             <div className="flex items-center space-x-2">
//                               <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full">
//                                 {(parseFloat(result._additional?.score || 0) * 100).toFixed(1)}% match
//                               </span>
//                             </div>
//                           </div>
                          
//                           <div className="bg-white p-4 rounded-lg border border-gray-100 mb-3">
//                             <div className="text-sm text-gray-800 leading-relaxed">
//                               {isExpanded ? content : formatContent(content)}
                              
//                               {shouldShowToggle && (
//                                 <button
//                                   onClick={() => toggleResultExpansion(message.id, index)}
//                                   className="ml-2 text-blue-600 hover:text-blue-800 font-medium text-xs underline focus:outline-none"
//                                 >
//                                   {isExpanded ? 'Show less' : 'Show more'}
//                                 </button>
//                               )}
//                             </div>
//                           </div>
                          
//                           <div className="flex items-center justify-between text-xs text-gray-600 bg-white bg-opacity-50 px-3 py-2 rounded-lg">
//                             <div className="flex items-center space-x-4">
//                               <span className="flex items-center space-x-1">
//                                 <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
//                                 <span>Page {result.pageNumber || 'N/A'}</span>
//                               </span>
//                               <span className="flex items-center space-x-1">
//                                 <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
//                                 <span>Chunk {result.chunkIndex || 'N/A'}</span>
//                               </span>
//                             </div>
//                             <span className="text-gray-500">
//                               {result.totalPages} pages total
//                             </span>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 )}
                
//                 <div className="text-xs opacity-70 mt-2">
//                   {formatTimestamp(message.timestamp)}
//                 </div>
//               </div>
//             </div>
//           ))}
          
//           {isLoading && (
//             <div className="flex justify-start">
//               <div className="bg-white border shadow-sm px-4 py-3 rounded-lg">
//                 <div className="flex items-center space-x-2 text-gray-500">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
//                   <span>Processing...</span>
//                 </div>
//               </div>
//             </div>
//           )}
          
//           <div ref={messagesEndRef} />
//         </div>
//       </div>

//       {/* Input Area */}
//       <div className="bg-white border-t p-4">
//         <div className="max-w-4xl mx-auto">
//           <div className="flex space-x-3">
//             <div className="flex-1 relative">
//               <textarea
//                 value={inputMessage}
//                 onChange={(e) => setInputMessage(e.target.value)}
//                 onKeyDown={handleKeyPress}
//                 placeholder={
//                   apiStatus !== 'connected' 
//                     ? 'Connect to API first...' 
//                     : files.length === 0 
//                     ? 'Upload some PDF files to start searching...'
//                     : 'Ask a question about your PDFs...'
//                 }
//                 disabled={isLoading || apiStatus !== 'connected'}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 placeholder-gray-500"
//                 rows="1"
//                 style={{ minHeight: '48px', maxHeight: '120px' }}
//               />
//             </div>
//             <button
//               onClick={handleSearch}
//               disabled={!inputMessage.trim() || isLoading || apiStatus !== 'connected'}
//               className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
//             >
//               <Send className="w-4 h-4" />
//             </button>
//           </div>
          
//           {files.length > 0 && (
//             <div className="mt-3 flex flex-wrap gap-2">
//               <span className="text-sm text-gray-500">Uploaded files:</span>
//               {files.slice(0, 5).map((file, index) => (
//                 <span key={index} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
//                   <FileText className="w-3 h-3 mr-1" />
//                   {file.length > 20 ? `${file.substring(0, 20)}...` : file}
//                 </span>
//               ))}
//               {files.length > 5 && (
//                 <span className="text-xs text-gray-500">+{files.length - 5} more</span>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


// 4) with agumenetd to llm-----------------------------------------------

// import React, { useState, useEffect, useRef } from 'react';
// import { Upload, Send, FileText, Search, BarChart3, Heart } from 'lucide-react';

// const API_BASE = 'http://localhost:5000';

// export default function PDFChatApp() {
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [files, setFiles] = useState([]);
//   const [stats, setStats] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [apiStatus, setApiStatus] = useState('checking');
//   const messagesEndRef = useRef(null);
//   const fileInputRef = useRef(null);

//   // Scroll to bottom when new messages are added
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);

//   // Check API health and load initial data
//   useEffect(() => {
//     checkApiHealth();
//     loadFiles();
//     loadStats();
//   }, []);

//   const checkApiHealth = async () => {
//     try {
//       const response = await fetch(`${API_BASE}/check`);
//       if (response.ok) {
//         setApiStatus('connected');
//       } else {
//         setApiStatus('error');
//         addSystemMessage('❌ API connection failed');
//       }
//     } catch (error) {
//       setApiStatus('error');
//       addSystemMessage('❌ Cannot connect to API. Make sure your backend is running on port 5000.');
//     }
//   };

//   const loadFiles = async () => {
//     try {
//       const response = await fetch(`${API_BASE}/files`);
//       if (response.ok) {
//         const data = await response.json();
//         setFiles(data.files || []);
//       }
//     } catch (error) {
//       console.error('Failed to load files:', error);
//     }
//   };

//   const loadStats = async () => {
//     try {
//       const response = await fetch(`${API_BASE}/stats`);
//       if (response.ok) {
//         const data = await response.json();
//         setStats(data);
//       }
//     } catch (error) {
//       console.error('Failed to load stats:', error);
//     }
//   };

//   const addSystemMessage = (content) => {
//     setMessages(prev => [...prev, {
//       id: Date.now(),
//       type: 'system',
//       content,
//       timestamp: new Date()
//     }]);
//   };

//   const addUserMessage = (content) => {
//     setMessages(prev => [...prev, {
//       id: Date.now(),
//       type: 'user',
//       content,
//       timestamp: new Date()
//     }]);
//   };

//   const addBotMessage = (content, aiResponse = null) => {
//     const newMessage = {
//       id: Date.now() + Math.random(),
//       type: 'bot',
//       content,
//       aiResponse,
//       timestamp: new Date()
//     };
    
//     setMessages(prev => {
//       const updatedMessages = [...prev, newMessage];
//       return updatedMessages;
//     });
    
//     setTimeout(() => {
//       messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, 100);
//   };

//   const handleFileUpload = async (event) => {
//     console.log('File upload triggered');
//     const file = event.target.files[0];
//     if (!file) return;

//     if (file.type !== 'application/pdf') {
//       addSystemMessage('❌ Please upload a PDF file only.');
//       return;
//     }

//     setIsLoading(true);
//     addUserMessage(`📄 Uploading: ${file.name}`);

//     try {
//       const formData = new FormData();
//       formData.append('pdf', file);

//       const response = await fetch(`${API_BASE}/upload`, {
//         method: 'POST',
//         body: formData,
//       });

//       const result = await response.json();

//       if (response.ok || response.status === 200) {
//         addBotMessage(`✅ Successfully uploaded "${file.name}"`);
//         loadFiles();
//         loadStats();
//       } else {
//         addBotMessage(`❌ Upload failed: ${result.error || result.message || 'Unknown error'}`);
//       }
//     } catch (error) {
//       addBotMessage(`❌ Upload error: ${error.message}`);
//     } finally {
//       setIsLoading(false);
//       if (fileInputRef.current) {
//         fileInputRef.current.value = '';
//       }
//     }
//   };

//   const handleSearch = async () => {
//     if (!inputMessage.trim()) return;

//     const query = inputMessage.trim();
//     setIsLoading(true);
    
//     addUserMessage(`🔍 "${query}"`);
//     setInputMessage('');

//     try {
//       const response = await fetch(`${API_BASE}/search`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ query }),
//       });

//       const result = await response.json();

//       if (response.ok && result.success) {
//         const aiResponse = result.data?.aiResponse || "";
        
//         if (aiResponse) {
//           addBotMessage("", aiResponse);
//         } else {
//           addBotMessage(`No results found for "${query}". Try uploading some PDF files first.`);
//         }
//       } else {
//         addBotMessage(`❌ Search failed: ${result.error || result.message || 'Unknown error'}`);
//       }
//     } catch (error) {
//       addBotMessage(`❌ Search error: ${error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSearch();
//     }
//   };

//   const formatTimestamp = (date) => {
//     return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//   };

//   const messageTypeStyles = {
//     user: 'bg-blue-500 text-white',
//     system: 'bg-gray-200 text-gray-700 text-sm',
//     bot: 'bg-white border shadow-sm',
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       {/* Header */}
//       <div className="bg-white shadow-sm border-b p-4">
//         <div className="max-w-4xl mx-auto flex justify-between items-center">
//           <div className="flex items-center space-x-3">
//             <div className="bg-blue-500 p-2 rounded-lg">
//               <FileText className="w-6 h-6 text-white" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold text-gray-900">Graviti Reg Search</h1>
//               <div className="flex items-center space-x-4 text-sm text-gray-500">
//                 <span className={`flex items-center space-x-1 ${
//                   apiStatus === 'connected' ? 'text-green-600' : 
//                   apiStatus === 'error' ? 'text-red-600' : 'text-yellow-600'
//                 }`}>
//                   <Heart className="w-3 h-3" />
//                   <span>{apiStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
//                 </span>
//                 {stats && (
//                   <>
//                     <span className="flex items-center space-x-1">
//                       <FileText className="w-3 h-3" />
//                       <span>{files.length} files</span>
//                     </span>
//                     <span className="flex items-center space-x-1">
//                       <BarChart3 className="w-3 h-3" />
//                       <span>{stats.total_documents || 0} docs</span>
//                     </span>
//                   </>
//                 )}
//               </div>
//             </div>
//           </div>
//           <div className="flex items-center space-x-2">
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept=".pdf"
//               onChange={handleFileUpload}
//               className="hidden"
//             />
//             <button
//               onClick={() => fileInputRef.current?.click()}
//               disabled={isLoading || apiStatus !== 'connected'}
//               className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               <Upload className="w-4 h-4" />
//               <span>Upload PDF</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Chat Messages */}
//       <div className="flex-1 overflow-y-auto p-4">
//         <div className="max-w-4xl mx-auto space-y-4">
//           {messages.length === 0 && (
//             <div className="text-center py-12 text-gray-500">
//               <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
//               <h3 className="text-lg font-medium mb-2">Welcome to Graviti Reg Search Chat</h3>
//               <p>Start exploring your PDFs — just upload and search! </p>
//             </div>
//           )}
          
//           {messages.map((message) => (
//             <div
//               key={message.id}
//               className={`flex ${
//                 message.type === 'user' ? 'justify-end' : 'justify-start'
//               }`}
//             >
//               <div
//                 className={`max-w-3xl px-4 py-3 rounded-lg ${messageTypeStyles[message.type]}`}
//               >
//                 {message.content && (
//                   <div className="whitespace-pre-wrap">{message.content}</div>
//                 )}
                
//                 {message.aiResponse && (
//                   <div className="mt-3">
//                     <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 shadow-sm">
//                       <div className="flex items-center mb-3">
//                         <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg">
//                           <Search className="w-4 h-4 text-white" />
//                         </div>
//                         <span className="ml-2 font-semibold text-gray-900">AI Response</span>
//                       </div>
                      
//                       <div className="bg-white p-4 rounded-lg border border-gray-100">
//                         <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
//                           {message.aiResponse}
//                         </div>
//                       </div>
                      
//                       <div className="mt-2 flex items-center text-xs text-gray-500">
//                         <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
//                         <span>Generated from your uploaded documents</span>
//                       </div>
//                     </div>
//                   </div>
//                 )}
                
//                 <div className="text-xs opacity-70 mt-2">
//                   {formatTimestamp(message.timestamp)}
//                 </div>
//               </div>
//             </div>
//           ))}
          
//           {isLoading && (
//             <div className="flex justify-start">
//               <div className="bg-white border shadow-sm px-4 py-3 rounded-lg">
//                 <div className="flex items-center space-x-2 text-gray-500">
//                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
//                   <span>Processing...</span>
//                 </div>
//               </div>
//             </div>
//           )}
          
//           <div ref={messagesEndRef} />
//         </div>
//       </div>

//       {/* Input Area */}
//       <div className="bg-white border-t p-4">
//         <div className="max-w-4xl mx-auto">
//           <div className="flex space-x-3">
//             <div className="flex-1 relative">
//               <textarea
//                 value={inputMessage}
//                 onChange={(e) => setInputMessage(e.target.value)}
//                 onKeyDown={handleKeyPress}
//                 placeholder={
//                   apiStatus !== 'connected' 
//                     ? 'Connect to API first...' 
//                     : files.length === 0 
//                     ? 'Upload some PDF files to start searching...'
//                     : 'Ask a question about your PDFs...'
//                 }
//                 disabled={isLoading || apiStatus !== 'connected'}
//                 className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 placeholder-gray-500"
//                 rows="1"
//                 style={{ minHeight: '48px', maxHeight: '120px' }}
//               />
//             </div>
//             <button
//               onClick={handleSearch}
//               disabled={!inputMessage.trim() || isLoading || apiStatus !== 'connected'}
//               className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
//             >
//               <Send className="w-4 h-4" />
//             </button>
//           </div>
          
//           {files.length > 0 && (
//             <div className="mt-3 flex flex-wrap gap-2">
//               <span className="text-sm text-gray-500">Uploaded files:</span>
//               {files.slice(0, 5).map((file, index) => (
//                 <span key={index} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
//                   <FileText className="w-3 h-3 mr-1" />
//                   {file.length > 20 ? `${file.substring(0, 20)}...` : file}
//                 </span>
//               ))}
//               {files.length > 5 && (
//                 <span className="text-xs text-gray-500">+{files.length - 5} more</span>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


// 5) with file upload message visabe ----------------------------------------------------------

import React, { useState, useEffect, useRef } from 'react';
import { Upload, Send, FileText, Search, BarChart3, Heart } from 'lucide-react';

const API_BASE = 'http://localhost:5000';

export default function PDFChatApp() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Check API health and load initial data
  useEffect(() => {
    checkApiHealth();
    loadFiles();
    loadStats();
  }, []);

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
        // console.log('data.data loaded:===>', data.data);
        setStats(data.data || {} );
        // console.log("stats=====>", stats);
      }

    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };
  console.log("stats=====>after function", stats);

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
    
    addUserMessage(`🔍 "${query}"`);
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
        const aiResponse = result.data?.aiResponse || "";
        
        if (aiResponse) {
          addBotMessage("", aiResponse);
        } else {
          addBotMessage(`No results found for "${query}". Try uploading some PDF files first.`);
        }
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

  const formatTimestamp = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const messageTypeStyles = {
    user: 'bg-blue-500 text-white',
    system: 'bg-gray-200 text-gray-700 text-sm',
    bot: 'bg-white border shadow-sm text-gray-900',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Graviti Reg Search</h1>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className={`flex items-center space-x-1 ${
                  apiStatus === 'connected' ? 'text-green-600' : 
                  apiStatus === 'error' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  <Heart className="w-3 h-3" />
                  <span>{apiStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
                </span>
                {stats && (
                  <>
                    <span className="flex items-center space-x-1">
                      {/* <FileText className="w-3 h-3" /> */}
                      {/* <span>{files.length} files</span> */}
                    </span>
                    <span className="flex items-center space-x-1">
                       <BarChart3 className="w-3 h-3" />
                      <span>{stats.uniqueFiles || 0} docs</span>
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
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
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Upload className="w-4 h-4" />
              <span>Upload PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">Welcome to Graviti Reg Search Chat</h3>
              <p>Start exploring your PDFs — just upload and search! </p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-3xl px-4 py-3 rounded-lg ${messageTypeStyles[message.type]}`}
              >
                {message.content && (
                  <div className="whitespace-pre-wrap text-gray-900">{message.content}</div>
                )}
                
                {message.aiResponse && (
                  <div className="mt-3">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100 shadow-sm">
                      <div className="flex items-center mb-3">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-2 rounded-lg">
                          <Search className="w-4 h-4 text-white" />
                        </div>
                        <span className="ml-2 font-semibold text-gray-900">AI Response</span>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg border border-gray-100">
                        <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                          {message.aiResponse}
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <span>Generated from your uploaded documents</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="text-xs opacity-70 mt-2 text-gray-600">
                  {formatTimestamp(message.timestamp)}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border shadow-sm px-4 py-3 rounded-lg">
                <div className="flex items-center space-x-2 text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                  <span>Processing...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={
                  apiStatus !== 'connected' 
                    ? 'Connect to API first...' 
                    : files.length === 0 
                    ? 'Upload some PDF files to start searching...'
                    : 'Ask a question about your PDFs...'
                }
                disabled={isLoading || apiStatus !== 'connected'}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 placeholder-gray-500"
                rows="1"
                style={{ minHeight: '48px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={!inputMessage.trim() || isLoading || apiStatus !== 'connected'}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          
          {files.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-sm text-gray-500">Uploaded files:</span>
              {files.slice(0, 5).map((file, index) => (
                <span key={index} className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  <FileText className="w-3 h-3 mr-1" />
                  {file.length > 20 ? `${file.substring(0, 20)}...` : file}
                </span>
              ))}
              {files.length > 5 && (
                <span className="text-xs text-gray-500">+{files.length - 5} more</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './index.css';
import './App.css';
import Header from './components/Header';
import { FiSend } from 'react-icons/fi';

function App() {
  useEffect(() => {
    document.title = "상명대학교 챗봇 SAMI";
  }, []);

  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chatContainerRef = useRef(null);

  const handleQuestionChange = (event) => {
    setQuestion(event.target.value);
  };

  const handleSubmit = async () => {
    if (!question.trim()) {
      alert("질문을 입력해주세요.");
      return;
    }

    if (loading) return;

    const newMessage = { role: 'user', text: question };
    setMessages((prevMessages) => [...prevMessages, newMessage]);

    setLoading(true);
    setError('');
    setQuestion('');
    setTimeout(() => setQuestion(''), 0);

    try {
      const response = await axios.post('http://localhost:8000/ask', {
        question: question,
      });
      const answer = response.data.answer;
      const newAnswer = { role: 'system', text: answer };
      setMessages((prevMessages) => [...prevMessages, newAnswer]);
    } catch (err) {
      setError('서버와의 통신에 문제가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey && !loading) {
      event.preventDefault();
      handleSubmit();
    }
  };

  const formatMessage = (text) => {
    const urlRegex = /(https?:\/\/[^\s)]+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (part.match(/^https?:\/\//)) {
        return (
          <a key={index} href={part} target="_blank" rel="noopener noreferrer" style={{ color: "blue", textDecoration: "underline" }}>
            {part}
          </a>
        );
      }
      return part;
    });
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="App">
      <Header />
      
      <div className="chat-container" ref={chatContainerRef}>
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <strong>{message.role === 'user' ? '나' : 'SAMI'}:</strong> {formatMessage(message.text)}
          </div>
        ))}
      </div>

      <div className="input-wrapper">
        <textarea
          value={question}
          onChange={handleQuestionChange}
          onKeyDown={handleKeyDown}
          placeholder="무엇이든 물어보세요"
          rows="3"
        />
        <button className="send-button" onClick={handleSubmit}>
          <FiSend />
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default App;

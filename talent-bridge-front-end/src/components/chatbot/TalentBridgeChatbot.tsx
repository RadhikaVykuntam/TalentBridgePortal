import React, { useState, useRef, useEffect } from "react";
import type { ChangeEvent, KeyboardEvent, DragEvent } from "react";
import type { Message } from "./TalentBridgeChatbot.types";
import { askGrok } from "./grokApi";
import "./TalentBridgeChatbot.css";

const SUGGESTED_QUESTIONS: string[] = [
  "What skills should I add?",
  "What jobs suit me best?",
  "How do I improve my summary?",
  "Any gaps in my resume?",
  "What certifications should I get?",
];

const INITIAL_MESSAGES: Message[] = [
  {
    role: "assistant",
    content:
      "👋 Hi! I'm your **Talent Bridge Career Advisor**, powered by Grok AI. Upload your resume and I'll help you identify skill gaps, suggest improvements, find the best-fit roles, and more!",
  },
];

function renderMarkdown(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
}

const TalentBridgeChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resumeText, setResumeText] = useState<string>("");
  const [resumeName, setResumeName] = useState<string>("");
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const addBotMessage = (content: string): void => {
    setMessages((prev) => [...prev, { role: "assistant", content }]);
  };

  const handleFileUpload = async (file: File | undefined): Promise<void> => {
    if (!file) return;
    setError("");

    if (file.type === "text/plain") {
      const text = await file.text();
      setResumeText(text);
      setResumeName(file.name);
      addBotMessage(
        `✅ Resume **"${file.name}"** uploaded! I've read your profile. Ask me anything about improving it or finding the right jobs.`
      );
    } else if (file.name.endsWith(".pdf") || file.name.endsWith(".docx")) {
      setResumeName(file.name);
      setResumeText("Resume uploaded (PDF/DOCX — limited parsing)");
      addBotMessage(
        `📄 Got **"${file.name}"**! For the deepest analysis, also paste your resume text directly into the chat. Otherwise, go ahead and ask your questions!`
      );
    } else {
      setError("Please upload a .txt, .pdf, or .docx file.");
    }
  };

  const handleSend = async (text?: string): Promise<void> => {
    const userMessage = (text ?? input).trim();
    if (!userMessage || isLoading) return;
    setError("");

    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userMessage },
    ];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await askGrok(newMessages, resumeText);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    handleFileUpload(e.target.files?.[0]);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        className={`tb-fab${isOpen ? " open" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open Career Advisor"
        title="Career Advisor"
      >
        <span className="tb-fab-icon">{isOpen ? "✕" : "💼"}</span>
        {!isOpen && <span className="tb-fab-badge" aria-hidden="true" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="tb-chat-window"
          role="dialog"
          aria-label="Career Advisor Chat"
          onDragOver={handleDragOver}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="tb-drag-overlay" aria-live="polite">
              <span>📄</span>
              <span>Drop your resume here</span>
            </div>
          )}

          {/* Header */}
          <div className="tb-header">
            <div className="tb-header-top">
              <div className="tb-header-info">
                <div className="tb-avatar" aria-hidden="true">🤖</div>
                <div className="tb-header-text">
                  <h3>Career Advisor</h3>
                  <p>
                    <span className="tb-online-dot" aria-hidden="true" />
                    Powered by Grok AI
                  </p>
                </div>
              </div>
            </div>

            {/* Resume Upload */}
            <div
              className="tb-resume-badge"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label={resumeName ? `Resume uploaded: ${resumeName}. Click to change.` : "Upload your resume"}
              onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
            >
              <span>{resumeName ? `📄 ${resumeName}` : "📎 Upload resume for personalized advice"}</span>
              <button className="tb-upload-btn" tabIndex={-1}>
                {resumeName ? "Change" : "Upload"}
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.pdf,.docx"
              style={{ display: "none" }}
              onChange={handleFileChange}
              aria-hidden="true"
            />
          </div>

          {/* Messages */}
          <div className="tb-messages" aria-live="polite" aria-label="Chat messages">
            {messages.map((msg, i) => (
              <div key={i} className={`tb-msg ${msg.role}`}>
                <div className="tb-msg-avatar" aria-hidden="true">
                  {msg.role === "assistant" ? "🤖" : "👤"}
                </div>
                <div
                  className="tb-msg-bubble"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                />
              </div>
            ))}

            {isLoading && (
              <div className="tb-msg assistant" aria-label="Grok is typing">
                <div className="tb-msg-avatar" aria-hidden="true">🤖</div>
                <div className="tb-msg-bubble">
                  <div className="tb-typing" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="tb-error" role="alert">
                ⚠️ {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggestion Chips */}
          <div className="tb-suggestions" role="list" aria-label="Suggested questions">
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                className="tb-suggestion-chip"
                onClick={() => handleSend(q)}
                disabled={isLoading}
                role="listitem"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="tb-input-area">
            <div className="tb-input-row">
              <textarea
                ref={textareaRef}
                className="tb-textarea"
                placeholder="Ask about your resume, skills, or career..."
                value={input}
                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                aria-label="Message input"
              />
              <button
                className="tb-send-btn"
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TalentBridgeChatbot;

import { useState, useEffect, useRef } from "react";
import Auth from "./components/Auth/Auth";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const messagesEndRef = useRef(null);

  const [chats, setChats] = useState([]);

  const [activeChatId, setActiveChatId] = useState(() =>
    localStorage.getItem("myai-active-chat"),
  );

  const activeChat = chats.find((chat) => chat._id === activeChatId);
  useEffect(() => {
    if (activeChatId) {
      localStorage.setItem("myai-active-chat", activeChatId);
    } else {
      localStorage.removeItem("myai-active-chat");
    }
  }, [activeChatId]);

  const messages = activeChat?.messages || [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem("myai-token");

      if (!token) {
        setIsCheckingAuth(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Сесія недійсна");
        }

        const data = await response.json();
        setCurrentUser(data.user);
      } catch (error) {
        localStorage.removeItem("myai-token");
        setCurrentUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    const loadChats = async () => {
      try {
        const token = localStorage.getItem("myai-token");

        const response = await fetch("http://localhost:5000/api/chats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Не вдалося завантажити чати");
        }

        const formattedChats = data.map((chat) => ({
          ...chat,
          messages: chat.messages.map((item) => ({
            id: item._id,
            text: item.content,
            sender: item.role === "assistant" ? "ai" : "user",
          })),
        }));

        setChats(formattedChats);
      } catch (error) {
        console.error("Помилка завантаження чатів:", error);
      }
    };

    loadChats();
  }, [currentUser]);

  const handleSend = async () => {
    if (!message.trim()) return;

    if (isLoading) return;

    setIsLoading(true);

    const userMessage = message.trim();

    let chatId = activeChatId;

    try {
      if (!chatId) {
        const token = localStorage.getItem("myai-token");

        const response = await fetch("http://localhost:5000/api/chats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: userMessage.slice(0, 30),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Не вдалося створити чат");
        }

        chatId = data._id;

        setChats((prev) => [...prev, data]);
        setActiveChatId(chatId);
      }
    } catch (error) {
      console.error("Помилка створення чату:", error);
      setIsLoading(false);
      return;
    }

    setChats((prev) =>
      prev.map((chat) =>
        chat._id === chatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                {
                  id: Date.now(),
                  text: userMessage,
                  sender: "user",
                },
              ],
            }
          : chat,
      ),
    );

    setMessage("");

    try {
      const token = localStorage.getItem("myai-token");

      const response = await fetch("http://localhost:5000/api/ai/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userMessage,
          chatId: chatId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Помилка сервера");
      }

      setChats((prev) =>
        prev.map((chat) =>
          chat._id === chatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  {
                    id: Date.now(),
                    text: data.reply,
                    sender: "ai",
                  },
                ],
              }
            : chat,
        ),
      );
    } catch (error) {
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === chatId
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  {
                    id: Date.now() + 1,
                    text: "Не вдалося отримати відповідь: " + error.message,
                    sender: "ai",
                  },
                ],
              }
            : chat,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return <div>Перевірка авторизації...</div>;
  }

  if (!currentUser) {
    return <Auth onLogin={setCurrentUser} />;
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="sidebar__logo">
          <span className="logo-icon">✦</span>
          <span>MyAI Agent</span>
        </div>

        <button
          className="new-chat"
          onClick={() => {
            setActiveChatId(null);
            setMessage("");
          }}
        >
          + Новий чат
        </button>

        <div className="sidebar__section">
          <p>ТВОЇ РОЗМОВИ</p>

          {chats.length > 0 ? (
            chats.map((chat) => (
              <div className="chat-item-wrapper" key={chat._id}>
                <button
                  className={`chat-item ${
                    chat._id === activeChatId ? "chat-item--active" : ""
                  }`}
                  onClick={() => {
                    setActiveChatId(chat._id);
                    setMessage("");
                  }}
                >
                  {chat.title}
                </button>

                <button
                  className="rename-chat"
                  title="Перейменувати розмову"
                  onClick={() => {
                    const newTitle = prompt(
                      "Введи нову назву розмови:",
                      chat.title,
                    );

                    if (newTitle && newTitle.trim()) {
                      setChats((prev) =>
                        prev.map((item) =>
                          item._id === chat._id
                            ? { ...item, title: newTitle.trim() }
                            : item,
                        ),
                      );
                    }
                  }}
                >
                  ✎
                </button>

                <button
                  className="delete-chat"
                  title="Видалити розмову"
                  onClick={async () => {
                    const confirmed = window.confirm(
                      "Ти справді хочеш видалити цю розмову?",
                    );

                    if (!confirmed) return;

                    try {
                      const token = localStorage.getItem("myai-token");

                      const response = await fetch(
                        `http://localhost:5000/api/chats/${chat._id}`,
                        {
                          method: "DELETE",
                          headers: {
                            Authorization: `Bearer ${token}`,
                          },
                        },
                      );

                      const data = await response.json();

                      if (!response.ok) {
                        throw new Error(
                          data.message || "Не вдалося видалити чат",
                        );
                      }

                      setChats((prev) =>
                        prev.filter((item) => item._id !== chat._id),
                      );

                      if (activeChatId === chat._id) {
                        setActiveChatId(null);
                      }
                    } catch (error) {
                      alert(error.message);
                    }
                  }}
                >
                  ×
                </button>
              </div>
            ))
          ) : (
            <span>Поки немає розмов</span>
          )}
        </div>

        <div className="sidebar__bottom">
          <span>MyAI Agent v1.0</span>
          <span>Твій особистий AI-помічник</span>
        </div>
      </aside>

      <main className="main">
        <header className="header">
          <div>
            <h2>Мій помічник</h2>
            <span className="status">
              <span className="status__dot"></span>
              Система онлайн
            </span>
          </div>
          <div className="header__avatar">AI</div>
        </header>

        <section className="chat">
          {messages.length === 0 ? (
            <div className="welcome">
              <div className="welcome__icon">✦</div>
              <h1>Привіт! Я MyAI Agent</h1>
              <p>
                Твій універсальний AI-помічник. Чим можу допомогти сьогодні?
              </p>
            </div>
          ) : (
            <div className="messages">
              {messages.map((item) => (
                <div
                  className={`message message--${item.sender}`}
                  key={item.id}
                >
                  {item.text}
                </div>
              ))}
              {isLoading && (
                <div className="message message--ai">MyAI Agent друкує...</div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </section>

        <div className="input-area">
          <div className="input-box">
            <textarea
              placeholder="Напиши своє повідомлення..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={1}
            />

            <button
              className="send-button"
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
            >
              ↑
            </button>
          </div>

          <p>MyAI Agent може помилятися. Перевіряй важливу інформацію.</p>
        </div>
      </main>
    </div>
  );
}

export default App;

import { useState,useEffect } from "react";
import api from "./api";
import "./App.css";
import "./dashboard.css";
import Practice from "./practice";

function App() {
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isDashboard, setIsDashboard] = useState(false);
  const [showPractice, setShowPractice] = useState(false);
  const [selectedPracticeCategory, setSelectedPracticeCategory] = useState("Quantitative Aptitude");
  const [dashboardStats, setDashboardStats] = useState({
  practice_sessions: 0,
  questions_solved: 0,
  accuracy: 0
});
useEffect(() => {
  if (isDashboard && currentUser?.id) {
    api.get(`/dashboard-stats/${currentUser.id}`)
      .then((response) => {
        setDashboardStats(response.data);
      })
      .catch((error) => {
        console.error("Failed to load dashboard stats:", error);
      });
  }
}, [isDashboard, currentUser]);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
  });

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/login" : "/register";

      const payload = isLogin
        ? {
            email: form.email,
            password: form.password,
          }
        : form;

      const response = await api.post(endpoint, payload);

      setMessageType("success");
      setMessage(
        isLogin
          ? `Welcome back, ${response.data.user.full_name}!`
          : "Account created successfully! You can now log in."
      );

      if (!isLogin) {
        setIsLogin(true);
        setForm({
          full_name: "",
          email: form.email,
          password: "",
        });
      } else {
        setCurrentUser(response.data.user);
        setIsDashboard(true);
        setForm({ full_name: "", email: "", password: "" });
      }
    } catch (error) {
      setMessageType("error");

      const detail = error.response?.data?.detail;

      setMessage(
        typeof detail === "string"
          ? detail
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: "✳",
      title: "Practice Tests",
      description: "Build confidence with real questions",
      color: "violet",
    },
    {
      icon: "▥",
      title: "Track Progress",
      description: "Discover your growth with detailed reports",
      color: "cyan",
    },
    {
      icon: "◎",
      title: "Smart Learning",
      description: "Focus on your weakest topics",
      color: "green",
    },
    {
      icon: "♜",
      title: "Achieve Goals",
      description: "Prepare for placements and interviews",
      color: "violet",
    },
  ];

  const handleLogout = () => {
    setIsDashboard(false);
    setCurrentUser(null);
    setIsLogin(true);
    setMessage("");
    setMessageType("");
    setForm({ full_name: "", email: "", password: "" });
  };

  if (isDashboard && currentUser) {
    if (showPractice) 
    {
      return (
          <Practice
            category={selectedPracticeCategory}
            user={currentUser}
            onBack={() => setShowPractice(false)}
          />
      );
    }
    return (
      <div className="app-shell dashboard-shell">
        <div className="ambient ambient-one"></div>
        <div className="ambient ambient-two"></div>

        <header className="navbar">
          <a className="brand" href="#dashboard">
            <span className="brand-icon logic-hex-logo">
             <svg viewBox="0 0 48 48" fill="none">
               <path
                d="M24 3L42 13.5V34.5L24 45L6 34.5V13.5L24 3Z"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinejoin="round"
               />
               <path
                d="M15 29V23H20V29M22 29V18H27V29M29 29V14H34V29"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
               />
             </svg>
            </span>
            <span>Apti<span className="brand-gradient">Grow</span></span>
          </a>
          <div className="dashboard-user">
            <span className="dashboard-avatar">
              {currentUser.full_name?.charAt(0)?.toUpperCase() || "S"}
            </span>
            <span className="dashboard-user-name">{currentUser.full_name}</span>
            <button className="dashboard-logout" onClick={handleLogout}>
              Logout ↗
            </button>
          </div>
        </header>

        <main className="dashboard-main" id="dashboard">
          <section className="dashboard-welcome">
            <div>
              <div className="eyebrow">
                <span className="status-dot"></span>
                YOUR LEARNING SPACE
              </div>
              <h1>
                Welcome back, <span className="gradient-text">{currentUser.full_name.split(" ")[0]}!</span>
              </h1>
              <p>Every question you solve brings you closer to your placement goal.</p>
            </div>
            <span className="brand-icon logic-hex-logo">
              <svg viewBox="0 0 48 48" fill="none">
                <path
                  d="M24 3L42 13.5V34.5L24 45L6 34.5V13.5L24 3Z"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 29V23H20V29M22 29V18H27V29M29 29V14H34V29"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
          </section>

          <section className="dashboard-stats">
            <article className="dashboard-stat-card">
              <span className="dashboard-stat-icon violet">✳</span>
              <p>Practice Sessions</p>
              <h2>{dashboardStats.practice_sessions}</h2>
              <small>Completed practice sessions</small>
            </article>

            <article className="dashboard-stat-card">
              <span className="dashboard-stat-icon cyan">↗</span>
              <p>Questions Solved</p>
              <h2>{dashboardStats.questions_solved}</h2>
              <small>Total questions answered</small>
            </article>

            <article className="dashboard-stat-card">
              <span className="dashboard-stat-icon green">◎</span>
              <p>Accuracy</p>
              <h2>{dashboardStats.accuracy}%</h2>
              <small>Overall correct answer rate</small>
            </article>
          </section>

          <section className="dashboard-section">
            <div className="dashboard-section-heading">
              <div>
                <span className="dashboard-kicker">CHOOSE YOUR PATH</span>
                <h2>Practice Topics</h2>
                <p>Build your placement skills one topic at a time.</p>
              </div>
            </div>
            <div className="dashboard-topic-grid">
              <article className="dashboard-topic-card">
                <span className="dashboard-topic-icon violet">％</span>
                <span className="dashboard-topic-label">QUANTITATIVE APTITUDE</span>
                <h3>Numbers & Calculations</h3>
                <p>Percentages, profit and loss, ratios, time and work, and more.</p>
                <button
                  className="dashboard-topic-button"
                  onClick={() => {
                     setSelectedPracticeCategory("Quantitative Aptitude");
                     setShowPractice(true);
                  }}
                >
                  Explore Topics <span>→</span>
              </button>
              </article>
              <article className="dashboard-topic-card">
                <span className="dashboard-topic-icon cyan">◇</span>
                <span className="dashboard-topic-label">LOGICAL REASONING</span>
                <h3>Think Logically</h3>
                <p>Number series, coding-decoding, directions, and puzzles.</p>
                <button 
                    className="dashboard-topic-button" 
                    onClick={() => {
                      setSelectedPracticeCategory("Logical Reasoning");
                      setShowPractice(true);
                    }}>
                  Explore Topics <span>→</span>
                </button>
              </article>
              <article className="dashboard-topic-card">
                <span className="dashboard-topic-icon green">Aa</span>
                <span className="dashboard-topic-label">VERBAL ABILITY</span>
                <h3>Improve Your English</h3>
                <p>Grammar, vocabulary, sentence correction, and comprehension.</p>
                <button 
                  className="dashboard-topic-button" 
                  onClick={() => {
                   setSelectedPracticeCategory("English Improvement");
                   setShowPractice(true);
                  }}>
                  Explore Topics <span>→</span>
                </button>
              </article>
            </div>
          </section>

          <section className="dashboard-bottom-grid">
            <article className="dashboard-test-card">
              <div>
                <span className="dashboard-kicker">TEST YOURSELF</span>
                <h2>Placement Mock Test</h2>
                <p>Practice under test conditions and learn where you can improve.</p>
              </div>
              <span className="dashboard-test-illustration">◷</span>
              <button className="dashboard-topic-button" onClick={() => alert("Mock tests are coming soon!")}>
                Mock Tests Coming Soon <span>→</span>
              </button>
            </article>
            <article className="dashboard-progress-card">
              <span className="dashboard-kicker">YOUR JOURNEY</span>
              <h2>Progress Overview</h2>
              <div className="dashboard-progress-track"><span></span></div>
              <p>Complete your first practice session to start tracking your progress.</p>
            </article>
          </section>

          <footer className="dashboard-footer">
            <span>© 2026 AptiGrow</span>
            <span>Learn better. Practice smarter. Grow stronger.</span>
          </footer>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-one"></div>
      <div className="ambient ambient-two"></div>

      <header className="navbar">
        <a className="brand" href="#home">
          <span className="brand-icon logic-hex-logo">
            <svg viewBox="0 0 48 48" fill="none">
             <path
              d="M24 3L42 13.5V34.5L24 45L6 34.5V13.5L24 3Z"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinejoin="round"
             />
             <path
              d="M15 29V23H20V29M22 29V18H27V29M29 29V14H34V29"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
             />
            </svg>
          </span>
          <span>
            Apti<span className="brand-gradient">Grow</span>
          </span>
        </a>

        <nav className="nav-links">
          <a href="#features">Learn</a>
          <span>•</span>
          <a href="#features">Practice</a>
          <span>•</span>
          <a href="#features">Grow</a>
        </nav>

        <div className="nav-message">
          Better Practice <span>→</span> Brighter Future
          <span className="trend-icon">↗</span>
        </div>
      </header>

      <main className="main-layout" id="home">
        <section className="hero-section">
          <div className="eyebrow">
            <span className="status-dot"></span>
            YOUR PLACEMENT JOURNEY STARTS HERE
          </div>

          <h1>
            Build Your
            <span className="gradient-text"> Aptitude Skills</span>
            <span className="heading-last">for a Brighter Future</span>
          </h1>

          <p className="hero-description">
            Turn practice into progress. Strengthen your aptitude,
            sharpen your problem-solving skills, and prepare for
            your dream placement with AptiGrow.
          </p>

          <div className="feature-grid" id="features">
            {features.map((feature) => (
              <div className="feature-item" key={feature.title}>
                <div className={`feature-icon ${feature.color}`}>
                  {feature.icon}
                </div>

                <div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="quote-card">
            <span className="quote-mark">“</span>
            <p>
              Every question you solve
              <br />
              brings you one step closer.
            </p>
            <span className="quote-author">YOUR FUTURE STARTS TODAY</span>
          </div>

          <div className="orbit orbit-one"></div>
          <div className="orbit orbit-two"></div>
        </section>

        <section className="auth-section">
          <div className="auth-card">
            <div className="auth-brand">
              <div className="auth-logo logic-hex-logo">
               <svg viewBox="0 0 48 48" fill="none">
                <path
                 d="M24 3L42 13.5V34.5L24 45L6 34.5V13.5L24 3Z"
                 stroke="currentColor"
                 strokeWidth="4"
                 strokeLinejoin="round"
                />
                <path
                 d="M15 29V23H20V29M22 29V18H27V29M29 29V14H34V29"
                 stroke="currentColor"
                 strokeWidth="3"
                 strokeLinecap="round"
                 strokeLinejoin="round"
                />
               </svg>
             </div>
              <div>
                <h2>
                  Apti<span className="brand-gradient">Grow</span>
                </h2>
                <p>Your aptitude learning platform</p>
              </div>
            </div>

            <div className="auth-tabs">
              <button
                className={!isLogin ? "" : "active"}
                onClick={() => {
                  setIsLogin(true);
                  setMessage("");
                }}
                type="button"
              >
                Login
              </button>

              <button
                className={isLogin ? "" : "active"}
                onClick={() => {
                  setIsLogin(false);
                  setMessage("");
                }}
                type="button"
              >
                Register
              </button>
            </div>

            <div className="form-heading">
              <h2>
                {isLogin ? "Welcome Back!" : "Create Your Account"}
              </h2>

              <p>
                {isLogin
                  ? "Your next achievement starts here."
                  : "Start your journey towards placement success."}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="input-group">
                  <label htmlFor="full_name">Full Name</label>
                  <div className="input-wrapper">
                    <span className="input-icon">♙</span>
                    <input
                      id="full_name"
                      name="full_name"
                      type="text"
                      placeholder="Enter your full name"
                      value={form.full_name}
                      onChange={handleChange}
                      minLength={2}
                      maxLength={100}
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="input-group">
                <label htmlFor="email">Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon">✉</span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">♙</span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      isLogin ? "Enter your password" : "At least 8 characters"
                    }
                    value={form.password}
                    onChange={handleChange}
                    minLength={isLogin ? 1 : 8}
                    maxLength={128}
                    autoComplete={
                      isLogin ? "current-password" : "new-password"
                    }
                    required
                  />

                  <button
                    className="password-toggle"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              {message && (
                <div className={`form-message ${messageType}`} role="status">
                  {message}
                </div>
              )}

              <button
                className="submit-button"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Please wait..."
                  : isLogin
                    ? "Login to AptiGrow →"
                    : "Create My Account →"}
              </button>
            </form>

            <div className="divider">
              <span></span>
              <p>YOUR JOURNEY</p>
              <span></span>
            </div>

            <p className="switch-auth">
              {isLogin
                ? "New to AptiGrow?"
                : "Already have an account?"}

              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMessage("");
                }}
              >
                {isLogin ? " Register" : " Login"}
              </button>
            </p>

            <div className="security-note">
              <span>◆</span> Your learning journey, your progress.
            </div>
          </div>

          <div className="floating-badge">
            <span>✦</span>
            Small steps. Big dreams.
          </div>
        </section>
      </main>

      <footer className="footer">
        <a className="footer-brand" href="#home">
          <span className="brand-icon logic-hex-logo">
            <svg viewBox="0 0 48 48" fill="none">
              <path
                d="M24 3L42 13.5V34.5L24 45L6 34.5V13.5L24 3Z"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinejoin="round"
              />
              <path
                d="M15 29V23H20V29M22 29V18H27V29M29 29V14H34V29"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
           </svg>
          </span>
          Apti<span className="brand-gradient">Grow</span>
        </a>

        <p>Learn better. Practice smarter. Grow stronger.</p>
        <span>© 2026 AptiGrow</span>
      </footer>
    </div>
  );
}

export default App;

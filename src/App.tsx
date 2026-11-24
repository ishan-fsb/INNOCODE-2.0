import { useEffect, useState } from "react";
import "./App.css";

type Goal = {
  id: number;
  title: string;
  done: boolean;
};

type Distraction = {
  id: number;
  name: string;
  reason: string;
};

const readSaved = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
};

export default function App() {
  const [page, setPage] = useState("Home");
  const [theme, setTheme] = useState(() =>
    readSaved("unplug-theme", "ocean")
  );
  const [goals, setGoals] = useState<Goal[]>(() =>
    readSaved("unplug-goals", [
      { id: 1, title: "Read for 20 minutes", done: false },
      { id: 2, title: "Practise a new skill", done: false },
    ])
  );
  const [distractions, setDistractions] = useState<Distraction[]>(() =>
    readSaved("unplug-distractions", [])
  );
  const [points, setPoints] = useState(() =>
    readSaved("unplug-points", 0)
  );
  const [newGoal, setNewGoal] = useState("");
  const [distractionName, setDistractionName] = useState("");
  const [distractionReason, setDistractionReason] = useState("");
  const [minutes, setMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(() =>
    readSaved("unplug-sessions", 0)
  );
  const [reflection, setReflection] = useState("");

  useEffect(() => {
    localStorage.setItem("unplug-theme", JSON.stringify(theme));
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("unplug-goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem(
      "unplug-distractions",
      JSON.stringify(distractions)
    );
  }, [distractions]);

  useEffect(() => {
    localStorage.setItem("unplug-points", JSON.stringify(points));
  }, [points]);

  useEffect(() => {
    localStorage.setItem(
      "unplug-sessions",
      JSON.stringify(completedSessions)
    );
  }, [completedSessions]);

  useEffect(() => {
    if (!timerRunning) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          setTimerRunning(false);
          setPoints((p) => p + 25);
          setCompletedSessions((s) => s + 1);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [timerRunning]);

  const completedGoals = goals.filter((goal) => goal.done).length;

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = time % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const addGoal = () => {
    if (!newGoal.trim()) return;
    setGoals([...goals, { id: Date.now(), title: newGoal.trim(), done: false }]);
    setNewGoal("");
  };

  const toggleGoal = (id: number) => {
    setGoals((current) =>
      current.map((goal) => {
        if (goal.id !== id) return goal;
        if (!goal.done) setPoints((p) => p + 10);
        return { ...goal, done: !goal.done };
      })
    );
  };

  const addDistraction = () => {
    if (!distractionName.trim()) return;
    setDistractions((current) => [
      {
        id: Date.now(),
        name: distractionName.trim(),
        reason: distractionReason.trim() || "Not recorded",
      },
      ...current,
    ]);
    setDistractionName("");
    setDistractionReason("");
  };

  const startTimer = () => {
    if (secondsLeft === 0) setSecondsLeft(minutes * 60);
    setTimerRunning(true);
  };

  const resetTimer = () => {
    setTimerRunning(false);
    setSecondsLeft(minutes * 60);
  };

  const changeDuration = (value: number) => {
    setMinutes(value);
    setSecondsLeft(value * 60);
    setTimerRunning(false);
  };

  const navigation = [
    { name: "Home", icon: "⌂" },
    { name: "My Goals", icon: "◎" },
    { name: "Focus Space", icon: "◷" },
    { name: "Rewards", icon: "✧" },
    { name: "Distraction Lab", icon: "⌕" },
    { name: "My Progress", icon: "↗" },
    { name: "Mind Reset", icon: "☁" },
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">U</div>
          <div>
            <h1>UNPLUG</h1>
            <span>YOUR TIME. YOUR FUTURE.</span>
          </div>
        </div>

        <div className="side-label">YOUR WORKSPACE</div>

        <nav className="navigation" aria-label="Main navigation">
          {navigation.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${page === item.name ? "active" : ""}`}
              onClick={() => setPage(item.name)}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              {item.name}
              {page === item.name && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-quote">
          <span className="quote-mark">“</span>
          <p>Your attention is your most valuable resource. Spend it wisely.</p>
          <span className="quote-credit">THE UNPLUG MINDSET</span>
        </div>

        <div className="sidebar-bottom">
          <div className="team-mark">H</div>
          <div>
            <strong>HACKERZZ</strong>
            <span>Built for a better tomorrow</span>
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb">UNPLUG <span>/</span> {page.toUpperCase()}</div>
          <div className="top-actions">
            <label className="theme-label" htmlFor="theme-choice">
              Theme
            </label>
            <select
              id="theme-choice"
              className="theme-select"
              value={theme}
              onChange={(event) => setTheme(event.target.value)}
            >
              <option value="ocean">Ocean Focus</option>
              <option value="earth">Warm Earth</option>
              <option value="night">Night Shift</option>
              <option value="contrast">Maximum Clarity</option>
            </select>
            <div className="points-pill">✦ {points} points</div>
          </div>
        </header>

        <div className="content">
          {page === "Home" && (
            <>
              <section className="welcome-section">
                <div>
                  <div className="eyebrow">A LITTLE PROGRESS EVERY DAY</div>
                  <h2>Make today <em>count.</em></h2>
                  <p className="welcome-text">
                    Less distraction. More direction. Your future starts with
                    what you do today.
                  </p>
                  <button className="primary-button" onClick={() => setPage("Focus Space")}>
                    Enter Focus Space <span>→</span>
                  </button>
                </div>
                <div className="hero-art" aria-label="Abstract illustration of a sunrise">
                  <div className="sun" />
                  <div className="hill hill-one" />
                  <div className="hill hill-two" />
                  <div className="hero-word">FOCUS</div>
                </div>
              </section>

              <section className="stats-grid">
                <Stat label="TOTAL POINTS" value={points.toString()} icon="✧" />
                <Stat label="GOALS COMPLETED" value={`${completedGoals}/${goals.length}`} icon="◎" />
                <Stat label="FOCUS SESSIONS" value={completedSessions.toString()} icon="◷" />
                <Stat label="DISTRACTIONS LOGGED" value={distractions.length.toString()} icon="⌕" />
              </section>

              <section className="section-heading">
                <div>
                  <div className="eyebrow">YOUR NEXT MOVE</div>
                  <h3>Build your day</h3>
                </div>
                <button className="text-button" onClick={() => setPage("My Goals")}>
                  View all goals →
                </button>
              </section>

              <div className="dashboard-grid">
                <div className="panel goal-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="panel-icon">◎</span>
                      <h3>Today's goals</h3>
                    </div>
                    <span className="small-count">{completedGoals}/{goals.length}</span>
                  </div>
                  {goals.length === 0 ? (
                    <p className="empty-message">Your next achievement starts with one goal.</p>
                  ) : (
                    goals.slice(0, 4).map((goal) => (
                      <label className="goal-row" key={goal.id}>
                        <input
                          type="checkbox"
                          checked={goal.done}
                          onChange={() => toggleGoal(goal.id)}
                        />
                        <span className={goal.done ? "goal-done" : ""}>{goal.title}</span>
                      </label>
                    ))
                  )}
                  <button className="panel-link" onClick={() => setPage("My Goals")}>
                    Manage goals →
                  </button>
                </div>

                <div className="panel focus-panel">
                  <div className="panel-heading">
                    <div>
                      <span className="panel-icon">◷</span>
                      <h3>Quick focus</h3>
                    </div>
                    <span className="status-dot">READY</span>
                  </div>
                  <div className="mini-timer">{formatTime(secondsLeft)}</div>
                  <p className="muted-text">One task. One session. No distractions.</p>
                  <button className="primary-button full-button" onClick={() => setPage("Focus Space")}>
                    Open focus mode →
                  </button>
                </div>
              </div>

              <section className="bottom-message">
                <span>✦</span>
                <p>You don't need a perfect day. You need a meaningful next step.</p>
              </section>
            </>
          )}

          {page === "My Goals" && (
            <PageIntro eyebrow="DREAM IT. PLAN IT. DO IT." title="Your goals, your direction."
              description="Big ambitions become achievable when you turn them into small actions." />
          )}

          {page === "My Goals" && (
            <section className="panel page-panel">
              <h3>Create a goal</h3>
              <div className="form-row">
                <input
                  value={newGoal}
                  onChange={(event) => setNewGoal(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && addGoal()}
                  placeholder="What do you want to achieve?"
                  aria-label="New goal"
                />
                <button className="primary-button" onClick={addGoal}>Add goal +</button>
              </div>
              <div className="goal-list">
                {goals.map((goal) => (
                  <div className="goal-row goal-row-large" key={goal.id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={goal.done}
                        onChange={() => toggleGoal(goal.id)}
                      />
                      <span className={goal.done ? "goal-done" : ""}>{goal.title}</span>
                    </label>
                    <button
                      className="delete-button"
                      aria-label={`Delete ${goal.title}`}
                      onClick={() => setGoals(goals.filter((item) => item.id !== goal.id))}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {goals.length === 0 && <p className="empty-message">No goals yet. Add your first one above.</p>}
              </div>
            </section>
          )}

          {page === "Focus Space" && (
            <>
              <PageIntro eyebrow="PROTECT YOUR ATTENTION" title="Welcome to your Focus Space."
                description="Give one important task your full attention. The rest can wait." />
              <section className="panel timer-panel">
                <div className="eyebrow">YOUR FOCUS SESSION</div>
                <div className="timer-display">{formatTime(secondsLeft)}</div>
                <p className="muted-text">
                  {timerRunning ? "Stay present. You're doing the work." : "Choose a duration and get started."}
                </p>
                <div className="duration-options">
                  {[15, 25, 45, 60].map((duration) => (
                    <button
                      key={duration}
                      className={minutes === duration ? "duration active-duration" : "duration"}
                      onClick={() => changeDuration(duration)}
                      disabled={timerRunning}
                    >
                      {duration} min
                    </button>
                  ))}
                </div>
                <div className="timer-actions">
                  {!timerRunning ? (
                    <button className="primary-button" onClick={startTimer}>
                      {secondsLeft === 0 ? "Start again" : "Start focusing →"}
                    </button>
                  ) : (
                    <button className="primary-button" onClick={() => setTimerRunning(false)}>
                      Pause session
                    </button>
                  )}
                  <button className="secondary-button" onClick={resetTimer}>Reset</button>
                </div>
                <p className="timer-note">Complete a session to earn 25 UNPLUG points.</p>
              </section>
            </>
          )}

          {page === "Rewards" && (
            <>
              <PageIntro eyebrow="EFFORT DESERVES RECOGNITION" title="Your progress has value."
                description="Earn points by taking meaningful steps. Celebrate consistency, not perfection." />
              <div className="reward-balance">
                <span>YOUR POINT BALANCE</span>
                <strong>✧ {points}</strong>
                <p>Every focused session and completed goal moves you forward.</p>
              </div>
              <div className="reward-grid">
                <Reward icon="🎨" title="Fresh Start" cost={50} description="A new look for your workspace." />
                <Reward icon="🌿" title="Calm Space" cost={100} description="Unlock a peaceful visual theme." />
                <Reward icon="🏆" title="Consistency" cost={200} description="Celebrate your commitment." />
              </div>
              <p className="muted-text reward-note">
                These are example rewards for the prototype. You can customise the reward catalogue later.
              </p>
            </>
          )}

          {page === "Distraction Lab" && (
            <>
              <PageIntro eyebrow="UNDERSTAND YOUR HABITS" title="Meet your distractions."
                description="Notice what pulls your attention away. Understanding a pattern is the first step to changing it." />
              <section className="panel page-panel">
                <h3>Log a distraction</h3>
                <div className="form-stack">
                  <input
                    value={distractionName}
                    onChange={(event) => setDistractionName(event.target.value)}
                    placeholder="What distracted you? (e.g. social media)"
                    aria-label="Distraction"
                  />
                  <input
                    value={distractionReason}
                    onChange={(event) => setDistractionReason(event.target.value)}
                    placeholder="What were you doing or feeling?"
                    aria-label="Reason for distraction"
                  />
                  <button className="primary-button" onClick={addDistraction}>Save reflection +</button>
                </div>
              </section>
              <section className="panel page-panel">
                <h3>Your distraction history</h3>
                {distractions.length === 0 ? (
                  <p className="empty-message">Nothing logged yet. Your first entry can help you spot a pattern.</p>
                ) : distractions.map((item) => (
                  <div className="distraction-row" key={item.id}>
                    <div className="distraction-symbol">⌕</div>
                    <div><strong>{item.name}</strong><p>{item.reason}</p></div>
                  </div>
                ))}
              </section>
            </>
          )}

          {page === "My Progress" && (
            <>
              <PageIntro eyebrow="LOOK HOW FAR YOU'VE COME" title="Progress over perfection."
                description="Your progress is made of small choices repeated over time." />
              <section className="stats-grid progress-stats">
                <Stat label="POINTS EARNED" value={points.toString()} icon="✧" />
                <Stat label="GOALS COMPLETED" value={completedGoals.toString()} icon="◎" />
                <Stat label="FOCUS SESSIONS" value={completedSessions.toString()} icon="◷" />
                <Stat label="DISTRACTIONS NOTICED" value={distractions.length.toString()} icon="⌕" />
              </section>
              <section className="panel page-panel">
                <h3>Your goal completion</h3>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: `${goals.length ? (completedGoals / goals.length) * 100 : 0}%` }}
                  />
                </div>
                <p className="muted-text">{completedGoals} of {goals.length} goals completed.</p>
              </section>
            </>
          )}

          {page === "Mind Reset" && (
            <>
              <PageIntro eyebrow="PAUSE. BREATHE. BEGIN AGAIN." title="Give your mind some space."
                description="A short reset can help you return to your day with more clarity." />
              <section className="panel reset-panel">
                <div className="breathing-circle"><span>BREATHE</span></div>
                <h3>Take a quiet moment</h3>
                <p className="muted-text">Breathe in slowly. Breathe out gently. Let your shoulders relax.</p>
                <div className="reflection-box">
                  <label htmlFor="reflection">What's on your mind right now?</label>
                  <textarea
                    id="reflection"
                    value={reflection}
                    onChange={(event) => setReflection(event.target.value)}
                    placeholder="Write a thought, a worry, or something you're grateful for..."
                  />
                  <p className="muted-text">Your reflection stays in this page while it is open.</p>
                </div>
              </section>
            </>
          )}

          <footer className="footer">
            <span>UNPLUG</span> · Created by HACKERZZ · Disconnect from distractions. Reconnect with your dreams.
          </footer>
        </div>
      </main>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="stat-card">
      <div className="stat-top"><span>{label}</span><span className="stat-icon">{icon}</span></div>
      <strong>{value}</strong>
    </div>
  );
}

function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <section className="page-intro">
      <div className="eyebrow">{eyebrow}</div>
      <h2>{title}</h2>
      <p>{description}</p>
    </section>
  );
}

function Reward({ icon, title, cost, description }: { icon: string; title: string; cost: number; description: string }) {
  return (
    <div className="panel reward-card">
      <span className="reward-icon">{icon}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <strong>✧ {cost} points</strong>
      <span className="coming-soon">COMING SOON</span>
    </div>
  );
}
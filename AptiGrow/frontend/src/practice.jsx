import { useState } from "react";
import api from "./api";
import "./practice.css";

const quantitativeTopics = [
  "Percentages", "Profit and Loss", "Ratio and Proportion",
  "Simple Interest", "Compound Interest", "Time and Work",
  "Time, Speed and Distance",
];

const categoryTopics = {
  "Quantitative Aptitude": quantitativeTopics,
  "Logical Reasoning": [
  "Logical Reasoning - Directions",
  "Logical Reasoning - Blood Relations",
  "Coding and Decoding",
],
  
 "English Improvement": [
  "English Improvement",
  "English Improvement - Error Spotting",
  "English Improvement - Sentence Correction",
],
};

function Practice({ category = "Quantitative Aptitude",user,onBack, }) {
  const topics = categoryTopics[category] || quantitativeTopics;
  const [selectedTopic, setSelectedTopic] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadQuestions(topic) {
    setSelectedTopic(topic);
    setQuestions([]);
    setAnswers({});
    setCurrentIndex(0);
    setScore(null);
    setError("");
    setLoading(true);
    try {
      const response = await api.get("/questions", { params: { topic } });
      setQuestions(response.data);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(
        (typeof detail === "object" && detail?.message) ||
        (typeof detail === "string" && detail) ||
        "Unable to load questions. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function selectAnswer(questionId, option) {
    setAnswers((previous) => ({ ...previous, [questionId]: option }));
  }

  async function submitTest() {
  let correct = 0;

  questions.forEach((question) => {
    if (answers[question.id] === question.correct_answer) {
      correct += 1;
    }
  });

  setScore(correct);

  const accuracy = questions.length > 0
    ? Math.round((correct / questions.length) * 100)
    : 0;

  try {
    await api.post("/practice-results", {
      user_id: user.id,
      topic: category,
      total_questions: questions.length,
      questions_answered: Object.keys(answers).length,
      correct_answers: correct,
      accuracy: accuracy
    });

    console.log("Practice result saved successfully");
  } catch (error) {
    console.error("Failed to save practice result:", error);
  }
}

  const currentQuestion = questions[currentIndex];

  return (
    <main className="practice-page">
      <header className="practice-header">
        <div>
          <span className="practice-brand">AptiGrow</span>
          <h1>Practice Arena</h1>
          <p>{category} — build your skills one question at a time.</p>
        </div>
        <button className="practice-back-button" onClick={onBack}>
          Back
        </button>
      </header>

      <section className="topic-section">
        <h2>Choose a topic</h2>
        <div className="topic-grid">
          {topics.map((topic) => (
            <button
              key={topic}
              className={`topic-button ${selectedTopic === topic ? "active" : ""}`}
              onClick={() => loadQuestions(topic)}
            >
              {topic}
            </button>
          ))}
        </div>
      </section>

      {loading && <p className="practice-message">Loading questions...</p>}
      {error && <p className="practice-error">{error}</p>}

      {questions.length > 0 && score === null && currentQuestion && (
        <section className="question-card">
          <div className="question-meta">
            <span>{selectedTopic}</span>
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{currentQuestion.difficulty}</span>
          </div>
          <div className="question-progress">
            <div style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
          </div>
          <h2>{currentQuestion.question_text}</h2>

          <div className="options-list">
            {["A", "B", "C", "D"].map((option) => {
              const optionText = currentQuestion[`option_${option.toLowerCase()}`];
              return (
                <button
                  key={option}
                  className={`answer-option ${answers[currentQuestion.id] === option ? "selected" : ""}`}
                  onClick={() => selectAnswer(currentQuestion.id, option)}
                >
                  <span className="option-letter">{option}</span>
                  <span>{optionText}</span>
                </button>
              );
            })}
          </div>

          <div className="question-navigation">
            <button className="nav-button" disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((index) => index - 1)}>
              Previous
            </button>
            {currentIndex < questions.length - 1 ? (
              <button className="nav-button primary"
                onClick={() => setCurrentIndex((index) => index + 1)}>
                Next Question
              </button>
            ) : (
              <button className="nav-button primary" onClick={submitTest}>
                Submit Test
              </button>
            )}
          </div>
          <p className="answered-count">
            {Object.keys(answers).length} of {questions.length} questions answered
          </p>
        </section>
      )}

      {score !== null && (
        <section className="result-card">
          <h2>Practice Complete!</h2>
          <p className="result-score">{score} / {questions.length}</p>
          <p>Your accuracy: {questions.length ? Math.round((score / questions.length) * 100) : 0}%</p>

          <div className="result-review">
            <h2>Answer Review</h2>
            {questions.map((question, index) => {
              const selectedAnswer = answers[question.id];
              const isCorrect = selectedAnswer === question.correct_answer;
              const optionTexts = {
                A: question.option_a, B: question.option_b,
                C: question.option_c, D: question.option_d,
              };
              return (
                <div key={question.id}
                  className={`review-question ${isCorrect ? "correct" : "incorrect"}`}>
                  <h3>Question {index + 1}: {question.question_text}</h3>
                  <p>Your answer: {selectedAnswer
                    ? `${selectedAnswer}. ${optionTexts[selectedAnswer]}`
                    : "Not answered"}</p>
                  <p>Correct answer: {question.correct_answer}. {optionTexts[question.correct_answer]}</p>
                  <strong>{isCorrect ? "Correct" : "Incorrect"}</strong>
                  <div className="question-explanation">
                    <strong>Explanation:</strong>
                    <p>{question.explanation || "Explanation is not available for this question."}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <button className="nav-button primary" onClick={() => loadQuestions(selectedTopic)}>
            Practice Again
          </button>
        </section>
      )}
    </main>
  );
}

export default Practice;

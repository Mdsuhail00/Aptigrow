from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String(100), nullable=False)
    question_text = Column(String(2000), nullable=False)
    option_a = Column(String(500), nullable=False)
    option_b = Column(String(500), nullable=False)
    option_c = Column(String(500), nullable=False)
    option_d = Column(String(500), nullable=False)
    correct_answer = Column(String(1), nullable=False)
    explanation = Column(String(2000), nullable=False)
    difficulty = Column(String(10), nullable=False)
    
class PracticeResult(Base):
    __tablename__ = "practice_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    topic = Column(String(100), nullable=False)
    total_questions = Column(Integer, nullable=False)
    questions_answered = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    accuracy = Column(Integer, nullable=False)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())
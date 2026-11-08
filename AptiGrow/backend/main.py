from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pwdlib import PasswordHash

from database import engine, Base, SessionLocal
import models
from schemas import UserRegister, UserResponse, UserLogin, PracticeResultCreate

app = FastAPI(title="AptiGrow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

password_hash = PasswordHash.recommended()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def home():
    return {
        "message": "Welcome to AptiGrow!",
        "status": "Backend is running"
    }


@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    try:
        db.execute(__import__("sqlalchemy").text("SELECT 1"))
        return {
            "status": "healthy",
            "database": "MySQL connected successfully"
        }
    except Exception:
        raise HTTPException(
            status_code=503,
            detail="Database connection failed"
        )


@app.post("/register", response_model=UserResponse, status_code=201)
def register_user(user: UserRegister, db: Session = Depends(get_db)):
    existing_user = (
        db.query(models.User)
        .filter(models.User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="This email is already registered."
        )

    new_user = models.User(
        full_name=user.full_name,
        email=user.email,
        hashed_password=password_hash.hash(user.password)
    )

    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="This email is already registered."
        )

@app.post("/login")
def login_user(user: UserLogin, db: Session = Depends(get_db)):
    existing_user = (
        db.query(models.User)
        .filter(models.User.email == user.email)
        .first()
    )

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not password_hash.verify(
        user.password,
        existing_user.hashed_password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return {
        "message": "Login successful",
        "user": {
            "id": existing_user.id,
            "full_name": existing_user.full_name,
            "email": existing_user.email
        }
    }



@app.get("/questions")
def get_questions(
    topic: str,
    db: Session = Depends(get_db)
):
    questions = (
        db.query(models.Question)
        .filter(
            models.Question.topic.ilike(topic.strip())
        )
        .all()
    )

    if not questions:
        available_topics = [
            row[0]
            for row in db.query(models.Question.topic)
            .distinct()
            .all()
        ]

        raise HTTPException(
            status_code=404,
            detail={
                "message": "No questions found for this topic",
                "requested_topic": topic,
                "available_topics": available_topics
            }
        )

    return [
        {
            "id": q.id,
            "topic": q.topic,
            "question_text": q.question_text,
            "option_a": q.option_a,
            "option_b": q.option_b,
            "option_c": q.option_c,
            "option_d": q.option_d,
            "correct_answer": q.correct_answer,
            "explanation": q.explanation,
            "difficulty": q.difficulty
        }
        for q in questions
    ]

@app.post("/practice-results")
def save_practice_result(
    result: PracticeResultCreate,
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(
        models.User.id == result.user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    practice_result = models.PracticeResult(
        user_id=result.user_id,
        topic=result.topic,
        total_questions=result.total_questions,
        questions_answered=result.questions_answered,
        correct_answers=result.correct_answers,
        accuracy=result.accuracy
    )

    db.add(practice_result)
    db.commit()
    db.refresh(practice_result)

    return {
        "message": "Practice result saved successfully",
        "result_id": practice_result.id
    }

@app.get("/dashboard-stats/{user_id}")
def get_dashboard_stats(
    user_id: int,
    db: Session = Depends(get_db)
):
    results = db.query(models.PracticeResult).filter(
        models.PracticeResult.user_id == user_id
    ).all()

    practice_sessions = len(results)

    questions_solved = sum(
        result.questions_answered for result in results
    )

    total_correct = sum(
        result.correct_answers for result in results
    )

    accuracy = (
        round((total_correct / questions_solved) * 100)
        if questions_solved > 0
        else 0
    )

    return {
        "practice_sessions": practice_sessions,
        "questions_solved": questions_solved,
        "accuracy": accuracy
    }
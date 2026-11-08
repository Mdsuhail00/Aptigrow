"""
AptiGrow question-bank seeder.
Run from the backend folder:
    python seed_questions.py

Creates 20 generated practice questions for each of 7 aptitude topics.
Existing questions with the same topic and question text are skipped.
"""
from decimal import Decimal, ROUND_HALF_UP
from sqlalchemy.orm import Session

from database import SessionLocal
import models


def fmt(value):
    value = Decimal(str(value)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    if value == value.to_integral():
        return str(int(value))
    return f"{value.normalize():f}"



def make_options(answer, step=1, correct_position=0):
    """Create four numeric options with a controlled correct-answer position."""
    a = Decimal(str(answer))
    s = Decimal(str(step))

    candidates = [
        a,
        a + s,
        a - s,
        a + s * 2,
    ]

    unique = []
    for item in candidates:
        if item >= 0 and item not in unique:
            unique.append(item)

    offset = 1
    while len(unique) < 4:
        item = a + s * offset
        if item >= 0 and item not in unique:
            unique.append(item)
        offset += 1

    correct_value = unique.pop(0)
    correct_position = correct_position % 4
    unique.insert(correct_position, correct_value)

    labels = ["A", "B", "C", "D"]
    options = [fmt(x) for x in unique]
    correct = labels[correct_position]

    return options, correct



POSITION_COUNTER = {}

def question(topic, text, answer, explanation, difficulty="Easy", step=1, suffix=""):
    correct_position = POSITION_COUNTER.get(topic, 0) % 4
    POSITION_COUNTER[topic] = POSITION_COUNTER.get(topic, 0) + 1

    options, correct = make_options(answer, step, correct_position)

    return {
        "topic": topic,
        "question_text": text,
        "option_a": options[0] + suffix,
        "option_b": options[1] + suffix,
        "option_c": options[2] + suffix,
        "option_d": options[3] + suffix,
        "correct_answer": correct,
        "explanation": explanation,
        "difficulty": difficulty,
    }


def build_questions():
    items = []

    # 20 Percentages questions: find p% of n.
    for i in range(20):
        p = [5, 10, 12, 15, 20, 25, 30, 35, 40, 45, 50, 8, 18, 22,  médi][i] if False else None
    percentages = [5, 10, 12, 15, 20, 25, 30, 35, 40, 45, 50, 8, 18, 22, 28, 32, 16, 24, 36, 42]
    bases = [200, 350, 250, 480, 150, 320, 270, 400, 125, 600, 90, 500, 250, 450, 300, 250, 625, 350, 225, 500]
    for i, (p, n) in enumerate(zip(percentages, bases), 1):
        ans = Decimal(p) * Decimal(n) / 100
        items.append(question("Percentages", f"What is {p}% of {n}?", ans,
                              f"{p}% of {n} = ({p}/100) × {n} = {fmt(ans)}.",
                              "Easy" if i <= 10 else "Medium", max(1, round(float(ans) * .1))))

    # 20 Profit and Loss questions: calculate selling price after profit.
    costs = [100, 250, 400, 600, 800, 1200, 500, 750, 900, 1500, 350, 640, 1100, 2000, 450, 720, 1250, 1800, 240, 960]
    profits = [10, 12, 15, 20, 25, 8, 18, 16, 30, 5, 20, 25, 10, 15, 12, 30, 8, 18, 25, 10]
    for i, (cost, pct) in enumerate(zip(costs, profits), 1):
        ans = Decimal(cost) * (Decimal(100 + pct) / 100)
        items.append(question("Profit and Loss",
            f"An item costs ₹{cost} and is sold at a profit of {pct}%. What is its selling price?",
            ans, f"Profit = {pct}% of ₹{cost}. Selling price = {cost} × {100+pct}/100 = ₹{fmt(ans)}.",
            "Easy" if i <= 10 else "Medium", max(1, round(float(ans) * .05)), " ₹"))

    # 20 Ratio and Proportion questions: split a total in a:b, find first share.
    ratios = [(2,3,100),(3,5,160),(4,1,250),(5,3,320),(7,5,360),(2,7,180),(3,4,210),(5,7,480),(4,5,270),(6,7,390),
              (1,4,125),(3,2,200),(7,8,450),(2,5,280),(5,6,330),(4,7,440),(8,3,550),(9,1,500),(3,7,400),(5,9,560)]
    for i, (a,b,total) in enumerate(ratios, 1):
        ans = Decimal(a) * Decimal(total) / Decimal(a+b)
        items.append(question("Ratio and Proportion",
            f"Divide {total} in the ratio {a}:{b}. What is the share belonging to the first part?",
            ans, f"Total parts = {a}+{b} = {a+b}. First share = {a}/{a+b} × {total} = {fmt(ans)}.",
            "Easy" if i <= 10 else "Medium", max(1, round(float(ans) * .1))))

    # 20 Simple Interest questions.
    si_values = [(1000,5,2),(2000,10,3),(1500,8,2),(2500,6,4),(3000,4,3),(5000,7,2),(1200,5,5),(800,10,4),(4500,6,2),(6000,3,5),
                 (2200,9,2),(3500,4,4),(7500,8,1),(1600,12,3),(900,5,6),(4200,7,3),(2800,10,2),(6400,5,4),(1800,6,5),(5200,4,2)]
    for i, (p,r,t) in enumerate(si_values, 1):
        ans = Decimal(p*r*t) / 100
        items.append(question("Simple Interest",
            f"Find the simple interest on ₹{p} at {r}% per year for {t} years.",
            ans, f"SI = P × R × T / 100 = {p} × {r} × {t} / 100 = ₹{fmt(ans)}.",
            "Easy" if i <= 10 else "Medium", max(1, round(float(ans) * .1)), " ₹"))

    # 20 Compound Interest questions: calculate compound interest annually.
    ci_values = [(1000,5,2),(2000,10,2),(1500,8,2),(3000,5,2),(4000,10,3),(2500,4,2),(5000,6,2),(8000,5,2),(1200,10,3),(6000,8,2),
                 (3500,12,2),(10000,10,2),(2400,5,3),(4500,4,2),(7500,6,2),(1600,25,2),(3200,10,3),(9000,5,2),(2800,8,2),(5200,7,2)]
    for i, (p,r,t) in enumerate(ci_values, 1):
        amount = Decimal(p) * (Decimal(1) + Decimal(r)/100) ** t
        ans = amount - Decimal(p)
        items.append(question("Compound Interest",
            f"Find the compound interest on ₹{p} at {r}% per year for {t} years, compounded annually.",
            ans, f"Amount = P(1 + R/100)^{t} = ₹{fmt(amount)}. Compound interest = amount − principal = ₹{fmt(ans)}.",
            "Medium" if i > 8 else "Easy", max(1, round(float(ans) * .08)), " ₹"))

    # 20 Time and Work questions: two people work together.
    work_values = [(10,15),(6,12),(8,8),(12,18),(5,10),(9,18),(15,20),(4,12),(7,14),(6,9),
                   (8,16),(10,20),(12,15),(5,15),(9,12),(4,6),(14,21),(16,24),(3,6),(10,30)]
    for i, (a,b) in enumerate(work_values, 1):
        ans = Decimal(a*b) / Decimal(a+b)
        items.append(question("Time and Work",
            f"A can complete a job in {a} days and B can complete it in {b} days. How many days will they take working together?",
            ans, f"Combined daily work = 1/{a} + 1/{b} = {(a+b)}/{a*b}. Time = {a*b}/{a+b} = {fmt(ans)} days.",
            "Medium" if i > 10 else "Easy", max(1, round(float(ans) * .2)), " days"))

    # 20 Time, Speed and Distance questions: calculate time from distance and speed.
    travel_values = [(120,60),(150,50),(240,80),(180,45),(300,75),(210,70),(96,32),(144,48),(250,50),(360,90),
                     (126,42),(200,40),(420,60),(270,54),(320,80),(225,45),(540,90),(168,56),(400,100),(330,55)]
    for i, (distance,speed) in enumerate(travel_values, 1):
        ans = Decimal(distance) / Decimal(speed)
        items.append(question("Time, Speed and Distance",
            f"A vehicle travels {distance} km at a constant speed of {speed} km/h. How long does the journey take?",
            ans, f"Time = distance ÷ speed = {distance} ÷ {speed} = {fmt(ans)} hours.",
            "Easy" if i <= 10 else "Medium", max(1, round(float(ans) * .2)), " hours"))

    return items


def main():
    questions = build_questions()
    db: Session = SessionLocal()
    inserted = 0
    skipped = 0
    try:
        for item in questions:
            exists = (
                db.query(models.Question.id)
                .filter(
                    models.Question.topic == item["topic"],
                    models.Question.question_text == item["question_text"],
                )
                .first()
            )
            if exists:
                skipped += 1
                continue
            db.add(models.Question(**item))
            inserted += 1
        db.commit()
        print(f"Question seeding complete. Added: {inserted}; skipped existing: {skipped}.")
        print(f"Question bank now contains {db.query(models.Question).count()} questions.")
        for topic in sorted({q["topic"] for q in questions}):
            count = db.query(models.Question).filter(models.Question.topic == topic).count()
            print(f"  {topic}: {count}")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()

from collections import defaultdict, Counter

from database import SessionLocal
import models


def update_options():
    db = SessionLocal()

    try:
        questions = (
            db.query(models.Question)
            .order_by(models.Question.topic, models.Question.id)
            .all()
        )

        # Check the existing question bank before making changes.
        topic_counts = Counter(q.topic for q in questions)

        if len(questions) != 140 or any(count != 20 for count in topic_counts.values()):
            raise ValueError(
                "Expected 140 questions with 20 questions per topic. "
                "No changes made."
            )

        position_counts = defaultdict(Counter)
        topic_positions = defaultdict(int)

        for q in questions:
            options = [
                q.option_a,
                q.option_b,
                q.option_c,
                q.option_d,
            ]

            labels = ["A", "B", "C", "D"]

            if q.correct_answer not in labels:
                raise ValueError(
                    f"Invalid answer key for question ID {q.id}"
                )

            # Preserve the currently marked correct option.
            correct_option = options[labels.index(q.correct_answer)]

            # Keep the other three options in their existing order.
            distractors = [
                option for option in options
                if option != correct_option
            ]

            if len(distractors) != 3:
                raise ValueError(
                    f"Unexpected duplicate options in question ID {q.id}"
                )

            # Assign A, B, C, D in a repeating sequence per topic.
            position = topic_positions[q.topic] % 4
            topic_positions[q.topic] += 1

            new_options = distractors[:]
            new_options.insert(position, correct_option)

            q.option_a = new_options[0]
            q.option_b = new_options[1]
            q.option_c = new_options[2]
            q.option_d = new_options[3]
            q.correct_answer = labels[position]

            position_counts[q.topic][labels[position]] += 1

        print("Planned answer distribution:")
        for topic in sorted(position_counts):
            print(topic, dict(position_counts[topic]))

        db.commit()
        print("\nSuccessfully updated all 140 questions.")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    update_options()
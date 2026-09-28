import sqlite3
from contextlib import closing
from pathlib import Path

from flask import Flask, jsonify, request, send_from_directory


BASE_DIR = Path(__file__).resolve().parent
DATABASE_PATH = BASE_DIR / "feedback.db"
SCHEMA = """
CREATE TABLE IF NOT EXISTS feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    message TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
)
"""

app = Flask(__name__, static_folder="static")


def get_connection():
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    with closing(get_connection()) as connection, connection:
        connection.execute(SCHEMA)


@app.get("/")
def home():
    return send_from_directory(app.static_folder, "index.html")


@app.get("/api/feedback")
def get_feedback():
    with closing(get_connection()) as connection, connection:
        rows = connection.execute(
            "SELECT id, name, rating, message, created_at "
            "FROM feedback ORDER BY id DESC"
        ).fetchall()

    return jsonify({"feedback": [dict(row) for row in rows]})


@app.post("/api/feedback")
def create_feedback():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be a JSON object."}), 400

    name = data.get("name")
    message = data.get("feedback")
    rating = data.get("rating")

    if not isinstance(name, str) or not name.strip():
        return jsonify({"error": "Name cannot be empty."}), 400
    if not isinstance(message, str) or not message.strip():
        return jsonify({"error": "Feedback cannot be empty."}), 400
    if isinstance(rating, bool) or not isinstance(rating, int) or not 1 <= rating <= 5:
        return jsonify({"error": "Rating must be a whole number from 1 to 5."}), 400

    with closing(get_connection()) as connection, connection:
        connection.execute(
            "INSERT INTO feedback (name, rating, message) VALUES (?, ?, ?)",
            (name.strip(), rating, message.strip()),
        )

    return jsonify({"message": "Feedback submitted successfully."}), 201


initialize_database()


if __name__ == "__main__":
    app.run(debug=True)
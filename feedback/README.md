# Fieldnotes Feedback

A small feedback app built with HTML, CSS, JavaScript, Flask, a REST API, and SQLite.

## Run the app

1. Open a terminal in this project folder.
2. Create and activate a virtual environment:

   ```powershell
   py -m venv .venv
   .venv\Scripts\Activate.ps1
   ```

3. Install Flask:

   ```powershell
   pip install -r requirements.txt
   ```

4. Start the server:

   ```powershell
   py app.py
   ```

5. Open <http://127.0.0.1:5000> in your browser.

The app creates `feedback.db` automatically beside `app.py` the first time it runs. The database is ignored by Git so submitted feedback is not committed.

## API

### `GET /api/feedback`

Returns all feedback, newest first:

```json
{
  "feedback": [
    {
      "id": 1,
      "name": "Alex Morgan",
      "rating": 5,
      "message": "Easy to use.",
      "created_at": "2026-09-28 12:30:00"
    }
  ]
}
```

### `POST /api/feedback`

Send a JSON object with a non-empty `name`, an integer `rating` from 1 to 5, and non-empty `feedback`:

```json
{
  "name": "Alex Morgan",
  "rating": 5,
  "feedback": "Easy to use."
}
```

A successful submission returns HTTP `201`. Invalid data returns HTTP `400` with an `error` message.
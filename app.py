import os
from datetime import datetime

from dotenv import load_dotenv
from flask import Flask, jsonify, render_template, request
from google import genai

load_dotenv()

app = Flask(__name__)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
MODEL_NAME = os.getenv("MODEL_NAME", "gemini-1.5-flash")


def build_prompt(data: dict) -> str:
    document_type = data["document_type"]
    party_a = data["party_a_name"]
    party_b = data["party_b_name"]
    effective_date = data["effective_date"]
    jurisdiction = data.get("jurisdiction", "India")
    terms = data["terms"]

    return f"""
You are an expert legal drafting assistant.
Generate a complete, professional, ready-to-sign {document_type}.

Rules:
1. Use clear formal legal language.
2. Avoid placeholders and blank markers.
3. Include headings and numbered clauses.
4. Include governing law and dispute resolution sections.
5. Ensure the document is coherent and internally consistent.

Document details:
- Document type: {document_type}
- Party A: {party_a}
- Party B: {party_b}
- Effective date: {effective_date}
- Jurisdiction: {jurisdiction}
- Key terms: {terms}

Output only the final document content in plain text.
Generated on: {datetime.utcnow().isoformat()}Z
""".strip()


@app.route("/", methods=["GET"])
def home():
    return render_template("index.html")


@app.route("/generate", methods=["POST"])
def generate_document():
    try:
        if not GEMINI_API_KEY:
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Server configuration error",
                        "message": "GEMINI_API_KEY is missing in .env",
                    }
                ),
                500,
            )

        payload = request.get_json(silent=True) or {}
        required_fields = [
            "document_type",
            "party_a_name",
            "party_b_name",
            "effective_date",
            "terms",
        ]

        missing = [field for field in required_fields if not str(payload.get(field, "")).strip()]
        if missing:
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Validation error",
                        "message": f"Missing required fields: {', '.join(missing)}",
                    }
                ),
                400,
            )

        client = genai.Client(api_key=GEMINI_API_KEY)
        prompt = build_prompt(payload)
        response = client.models.generate_content(model=MODEL_NAME, contents=prompt)
        generated_text = (response.text or "").strip()

        if not generated_text:
            return (
                jsonify(
                    {
                        "success": False,
                        "error": "Generation failed",
                        "message": "No content was returned by the model.",
                    }
                ),
                502,
            )

        return jsonify(
            {
                "success": True,
                "document": generated_text,
                "meta": {
                    "model": MODEL_NAME,
                    "document_type": payload["document_type"],
                },
            }
        )

    except Exception as exc:
        return (
            jsonify(
                {
                    "success": False,
                    "error": "Internal server error",
                    "message": str(exc),
                }
            ),
            500,
        )


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)

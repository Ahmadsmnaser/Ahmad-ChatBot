# Ahmad's Chatbot 🤖

A conversational AI chatbot built with **Streamlit** and **LangChain**, powered by **Groq** (Llama 3.1).

## Features

- Real-time chat interface with message history
- Powered by Llama 3.1 8B via Groq's fast inference API
- Clean, centered Streamlit UI

## Prerequisites

- Python 3.9+
- A [Groq API key](https://console.groq.com/keys) (free tier available)

## Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd chatbot_streamlit
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate   # Linux / macOS
   # venv\Scripts\activate    # Windows
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp env_template.txt .env
   ```
   Open `.env` and replace `your-groq-api-key-here` with your actual Groq API key.

## Running the App

```bash
streamlit run chatbot.py
```

The app will open at [http://localhost:8501](http://localhost:8501).

## Environment Variables

| Variable       | Description                          | Required |
|----------------|--------------------------------------|----------|
| `GROQ_API_KEY` | Your API key from Groq Console       | Yes      |

## Troubleshooting

| Problem                          | Solution                                                       |
|----------------------------------|----------------------------------------------------------------|
| `GROQ_API_KEY` not found         | Ensure `.env` exists in the project root with no spaces around `=` |
| `ModuleNotFoundError`            | Run `pip install -r requirements.txt` inside your virtual env  |
| App won't start                  | Check that you're using Python 3.9+ (`python --version`)      |
| Rate limit errors from Groq      | Wait a moment and retry — free tier has request limits         |

## License

This project is for educational purposes as part of the AI Agents Course.

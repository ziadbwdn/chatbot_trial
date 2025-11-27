# Chatbot App

This guideline will help us to build chatbot MVP,  with a **decoupled architecture**: a Python backend using FastAPI and a simple, framework-free frontend using vanilla JavaScript, HTML, and Tailwind CSS via CDN.

This approach gives you maximum control and a clear separation between the frontend and backend.

---

### **Project Goal**

Build a simple, single-page web chatbot application that:
*   Has a clean UI styled with **Tailwind CSS** (via CDN, no build step).
*   Uses **Vanilla JavaScript** for the frontend logic (no React framework).
*   Is powered by a **Python** backend built with **FastAPI**.
*   Connects to a local **Ollama** instance running the **Qwen** AI model.
*   Streams responses from the AI for a smooth user experience.

---

### **Why This New Tech Stack?**

*   **FastAPI (Python):** While you may not prefer Python for general use, it's an exceptional choice for AI backends. It has first-class support for `async` operations (perfect for streaming), automatic interactive API documentation, and seamless integration with the Python AI/ML ecosystem.
*   **Vanilla JavaScript/HTML/CSS:** This is the ultimate "manual" and "low-code" frontend. There are no frameworks, no build tools (like Vite or Webpack), and no `node_modules` folder. You just write code and open it in a browser. It's direct, fast to set up, and excellent for a lightweight MVP.
*   **Tailwind CSS (via CDN):** You still get the power of Tailwind for rapid styling, but you include it with a single `<script>` tag in your HTML file. Zero installation or configuration needed.

---

### **Prerequisites**

1.  **Python 3.8+:** Ensure you have Python installed. You can download it from [python.org](https://www.python.org/).
2.  **pip:** Usually comes with Python.
3.  **Code Editor:** A good code editor like [VS Code](https://code.visualstudio.com/).
4.  **Ollama:** Install Ollama on your machine. Follow the instructions at [ollama.com](https://ollama.com/).

---

### **Step 1: Set Up the AI Backend (Ollama & Qwen)**

This step is identical to the previous guide. Once Ollama is installed, open your terminal and run:

```bash
ollama pull qwen
```

Verify it works with `ollama run qwen` and then exit. **Keep Ollama running in the background.**

---

### **Step 2: Create the Project Structure**

We will create a main project folder containing two separate sub-folders: one for the backend and one for the frontend.

```
simple-chatbot-manual/
├── backend/
│   ├── main.py             # FastAPI application code
│   └── requirements.txt    # Python dependencies
└── frontend/
    ├── index.html          # The main HTML page
    ├── style.css           # Custom styles (minimal)
    └── script.js           # Frontend JavaScript logic
```

Create this folder structure manually in your file explorer or using the command line.

---

### **Step 3: Build the Backend with FastAPI**

Let's create the Python server that will communicate with Ollama.

1.  **Set up the Python Environment:**
    Open your terminal, navigate to the `backend` folder, and create a virtual environment.

    ```bash
    cd simple-chatbot-manual/backend
    python -m venv venv
    ```
    Activate it:
    *   On macOS/Linux: `source venv/bin/activate`
    *   On Windows: `.\venv\Scripts\activate`

2.  **Install Dependencies:**
    Create a `requirements.txt` file in the `backend` folder and add the following:

    ```
    fastapi
    uvicorn[standard]
    httpx
    ```
    Now, install them using pip:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Write the FastAPI Code:**
    Create the `backend/main.py` file and add the following code. This code creates an endpoint `/chat` that proxies requests to Ollama and streams the response.

    ```python
    # backend/main.py
    from fastapi import FastAPI, Request
    from fastapi.responses import StreamingResponse
    import httpx
    import json

    app = FastAPI()

    OLLAMA_API_URL = "http://localhost:11434/api/generate"

    async def generate(prompt: str):
        """An async generator that streams responses from Ollama."""
        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream(
                "POST",
                OLLAMA_API_URL,
                json={"model": "qwen", "prompt": prompt, "stream": True},
            ) as response:
                async for line in response.aiter_lines():
                    if line:
                        try:
                            # Ollama sends JSON objects per line
                            json_line = json.loads(line)
                            if "response" in json_line:
                                yield json_line["response"]
                        except json.JSONDecodeError:
                            # Skip lines that are not valid JSON
                            continue

    @app.post("/chat")
    async def chat_endpoint(request: Request):
        data = await request.json()
        prompt = data.get("prompt")
        if not prompt:
            return {"error": "No prompt provided"}, 400

        return StreamingResponse(generate(prompt), media_type="text/plain")

    # To run this file: uvicorn main:app --reload
    ```

---

### **Step 4: Build the Frontend with Vanilla JS**

Now for the simple, no-framework frontend.

1.  **Create the HTML (`index.html`):**
    This file defines the structure of your chat page. Notice the Tailwind CSS script in the `<head>`.

    ```html
    <!-- frontend/index.html -->
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Qwen Chatbot MVP</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link rel="stylesheet" href="style.css">
    </head>
    <body class="bg-gray-100 h-screen flex flex-col">
        <header class="bg-white shadow-md p-4">
            <h1 class="text-2xl font-bold text-center text-gray-800">Qwen Chatbot MVP (Manual Stack)</h1>
        </header>

        <main id="message-list" class="flex-1 overflow-y-auto p-4 space-y-4">
            <!-- Messages will be inserted here -->
        </main>

        <footer class="flex p-4 border-t">
            <form id="chat-form" class="flex w-full">
                <input
                    type="text"
                    id="message-input"
                    placeholder="Type your message..."
                    class="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autocomplete="off"
                />
                <button
                    type="submit"
                    id="send-button"
                    class="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600 disabled:bg-gray-400"
                >
                    Send
                </button>
            </form>
        </footer>

        <script src="script.js"></script>
    </body>
    </html>
    ```

2.  **Create the CSS (`style.css`):**
    This file is mostly empty because Tailwind does all the work, but it's good practice to have it.

    ```css
    /* frontend/style.css */
    /* Add any custom styles not covered by Tailwind here */
    ```

3.  **Write the JavaScript (`script.js`):**
    This is where all the frontend logic happens: handling form submission, sending requests to the FastAPI backend, and rendering the streaming response.

    ```javascript
    // frontend/script.js
    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('chat-form');
        const input = document.getElementById('message-input');
        const messageList = document.getElementById('message-list');
        const sendButton = document.getElementById('send-button');

        const addMessage = (content, sender) => {
            const messageDiv = document.createElement('div');
            const isUser = sender === 'user';
            messageDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'}`;
            messageDiv.innerHTML = `
                <div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'
                }">
                    ${content}
                </div>
            `;
            messageList.appendChild(messageDiv);
            messageList.scrollTop = messageList.scrollHeight; // Auto-scroll
        };

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userMessage = input.value.trim();
            if (!userMessage) return;

            // Add user message to chat
            addMessage(userMessage, 'user');
            input.value = '';
            sendButton.disabled = true;
            sendButton.textContent = '...';

            // Add placeholder for assistant response
            const assistantMessageDiv = document.createElement('div');
            assistantMessageDiv.className = 'flex justify-start';
            assistantMessageDiv.innerHTML = `<div class="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-gray-200 text-gray-800">...</div>`;
            messageList.appendChild(assistantMessageDiv);
            const assistantTextElement = assistantMessageDiv.querySelector('div');

            try {
                const response = await fetch('http://localhost:8000/chat', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt: userMessage }),
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let assistantContent = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    assistantContent += chunk;
                    assistantTextElement.textContent = assistantContent;
                }
            } catch (error) {
                console.error('Error:', error);
                assistantTextElement.textContent = 'Sorry, something went wrong. Please try again.';
            } finally {
                sendButton.disabled = false;
                sendButton.textContent = 'Send';
            }
        });
    });
    ```

---

### **Step 5: Run the Application**

You will need two separate terminals: one for the backend and one for the frontend.

1.  **Run the Backend:**
    In your first terminal (ensure your virtual environment is active), navigate to the `backend` folder and run:

    ```bash
    uvicorn main:app --reload
    ```
    Your FastAPI server is now running at `http://localhost:8000`. You can view the auto-generated API docs at `http://localhost:8000/docs`.

2.  **Run the Frontend:**
    In your second terminal, navigate to the `frontend` folder. The easiest way to serve static files is with Python's built-in server:

    ```bash
    # Make sure you are in the 'frontend' directory
    python -m http.server 5500
    ```
    *(Alternatively, if you use VS Code, you can install the "Live Server" extension and right-click `index.html` to open it with Live Server.)*

3.  **Use Your Chatbot:**
    Open your web browser and go to **`http://localhost:5500`**. You should see your chatbot interface. Type a message and see the streaming response from Qwen!

---

### **Next Steps & MVP Enhancements**

This manual setup is highly extensible.
1.  **CORS:** For production, you'll need to configure CORS properly in FastAPI to allow your frontend domain to communicate with the backend.
2.  **Conversation History:** Store conversation history on the backend (e.g., in a simple dictionary keyed by session ID) and include it with each prompt to Ollama to give the AI context.
3.  **Error Handling:** Improve the UI to display more user-friendly error messages.
4.  **Deployment:** Deploy the FastAPI backend to a service like Render or Fly.io. Deploy the static frontend files to Netlify or Vercel.
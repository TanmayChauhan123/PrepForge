const generateWithOllama = async (prompt, model = "llama3.1:8b") => {
  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        prompt: prompt,
        format: "json",
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama request failed: ${response.status}`);
    }

    const data = await response.json();

    return data.response;
  } catch (error) {
    console.error("Ollama error:", error.message);
    throw error;
  }
};

module.exports = generateWithOllama;

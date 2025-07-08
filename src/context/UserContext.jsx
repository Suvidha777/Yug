import React, { createContext, useState, useEffect } from 'react';
import run from '../gemini';

export const datacontext = createContext();

function UserContext({ children }) {
  const [speaking, setSpeaking] = useState(false);
  const [prompt, setPrompt] = useState("listening...");
  const [response, setResponse] = useState(false);

 
  useEffect(() => {
    window.speechSynthesis.onvoiceschanged = () => {
      window.speechSynthesis.getVoices();
    };
  }, []);

  function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.volume = 1;
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = "en-US";

    const voices = window.speechSynthesis.getVoices();
    utterance.voice = voices.find(v => v.lang === "en-US") || voices[0];

    utterance.onend = () => {
      setSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }

  async function aiResponse(prompt) {
    try {
      const text = await run(prompt);
     let newText = text.replace(/google/gi, "Suvidha");

    // Step 2: Replace full intro sentence (from Gemini) if present
    newText = newText.replace(
      /I am (a|an)? (.*?model.*?) trained by Suvidha \.?/i,
      "I am Yug, your virtual assistant trained by Suvidha."
    );

    // Optional: Add fallback check for similar variations
    if (/large language model/i.test(newText)) {
      newText = "I am Yug, your virtual assistant trained by Suvidha.";
    }   setPrompt(newText);
      speak(newText);
      setResponse(true);
    } catch (err) {
      console.error("Gemini API error:", err);
      setPrompt("Sorry, something went wrong.");
      setResponse(true);
      speak("Sorry, something went wrong.");
    }
  }

  const speechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new speechRecognition();

  recognition.onresult = (e) => {
    const currentIndex = e.resultIndex;
    const transcript = e.results[currentIndex][0].transcript;
    setPrompt(transcript);
    takeCommand(transcript.toLowerCase());
  };

  function takeCommand(command) {
    if (command.includes("open") && command.includes("youtube")) {
      window.open("https://www.youtube.com/", "_blank");
      speak("Opening YouTube");
      setResponse(true);
      setPrompt("Opening YouTube...");
    } else if (command.includes("open") && command.includes("google")) {
      window.open("https://www.google.com/", "_blank");
      speak("Opening Google");
      setResponse(true);
      setPrompt("Opening Google...");
    } else if (command.includes("open") && command.includes("instagram")) {
      window.open("https://www.instagram.com/", "_blank");
      speak("Opening Instagram");
      setResponse(true);
      setPrompt("Opening Instagram...");
    } else if (command.includes("time")) {
      const time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric" });
      speak(time);
      setResponse(true);
      setPrompt(time);
    } else if (command.includes("date")) {
      const date = new Date().toLocaleString(undefined, { day: "numeric", month: "short" });
      speak(date);
      setResponse(true);
      setPrompt(date);
    } else {
      aiResponse(command);
    }
  }

  const value = {
    recognition,
    speaking,
    setSpeaking,
    prompt,
    setPrompt,
    response,
    setResponse,
  };

  return (
    <datacontext.Provider value={value}>
      {children}
    </datacontext.Provider>
  );
}

export default UserContext;

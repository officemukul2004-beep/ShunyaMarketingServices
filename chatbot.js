// Shunya AI Chatbot - Gemini / GPT Integrated Widget
document.addEventListener("DOMContentLoaded", () => {
  // 1. Remove legacy elements
  const legacyBot = document.getElementById("ai-chatbot");
  if (legacyBot) {
    legacyBot.remove();
  }

  // 2. Inject Styles (typing indicator, settings panel, etc.)
  const style = document.createElement("style");
  style.innerHTML = `
    @keyframes typingBounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    .typing-dot {
      animation: typingBounce 0.8s infinite ease-in-out;
    }
    .typing-dot:nth-child(2) { animation-delay: 0.15s; }
    .typing-dot:nth-child(3) { animation-delay: 0.3s; }
    .chatbot-glow {
      box-shadow: 0 10px 40px -10px rgba(106, 28, 246, 0.3);
    }
    .settings-panel {
      transition: transform 0.3s ease, opacity 0.3s ease;
    }
  `;
  document.head.appendChild(style);

  // 3. Floating Toggle Button
  const toggleBtn = document.createElement("button");
  toggleBtn.id = "chatbot-toggle";
  toggleBtn.className = "fixed bottom-8 left-8 z-[100] group flex items-center justify-center bg-primary text-on-primary p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300";
  toggleBtn.innerHTML = `
    <span class="material-symbols-outlined text-white text-2xl" style="font-variation-settings: 'FILL' 1;">smart_toy</span>
    <span class="absolute left-full ml-4 bg-white text-on-surface px-4 py-2 rounded-xl border border-outline-variant/15 text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none font-headline">
      Chat with Shunya AI
    </span>
  `;
  document.body.appendChild(toggleBtn);

  // 4. Chatbot Window
  const chatWindow = document.createElement("div");
  chatWindow.id = "chatbot-window";
  chatWindow.className = "fixed bottom-24 left-8 z-[100] w-80 md:w-96 h-[500px] max-h-[80vh] bg-white/90 backdrop-blur-2xl border border-outline-variant/20 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col transition-all duration-500 scale-90 translate-y-4 opacity-0 pointer-events-none chatbot-glow";
  
  chatWindow.innerHTML = `
    <!-- Header -->
    <div class="bg-gradient-to-r from-primary to-secondary p-5 flex items-center justify-between relative z-20 shadow-sm">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
          <span class="material-symbols-outlined text-white text-xl" style="font-variation-settings: 'FILL' 1;">smart_toy</span>
        </div>
        <div>
          <div class="text-white text-sm font-headline font-bold flex items-center gap-1.5">
            Shunya Gemini Bot
            <span id="api-status-badge" class="text-[8px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Mock</span>
          </div>
          <div class="text-[10px] text-white/80 flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
            Online & Ready to Scale
          </div>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <button id="chatbot-settings-toggle" class="text-white/70 hover:text-white transition-colors" title="AI Settings">
          <span class="material-symbols-outlined text-xl">settings</span>
        </button>
        <button id="chatbot-close" class="text-white/70 hover:text-white hover:rotate-90 transition-all duration-300">
          <span class="material-symbols-outlined text-xl">close</span>
        </button>
      </div>
    </div>

    <!-- Settings Overlay Panel -->
    <div id="chatbot-settings" class="absolute inset-x-0 top-[80px] bg-white/95 backdrop-blur-xl p-6 border-b border-outline-variant/10 z-10 hidden flex-col space-y-4 text-xs font-body shadow-md">
      <div class="font-headline font-bold text-on-surface text-sm flex items-center gap-1.5">
        <span class="material-symbols-outlined text-primary text-lg">vpn_key</span>
        Gemini API Configuration
      </div>
      <p class="text-on-surface-variant leading-relaxed">
        Connect your personal <b>Gemini API Key</b> to enable live conversations. Your key is stored safely locally in your browser.
      </p>
      <div>
        <label class="block text-[10px] font-bold uppercase text-on-surface-variant mb-1" for="gemini-key-input">Gemini API Key</label>
        <input id="gemini-key-input" type="password" placeholder="AIzaSy..." 
          class="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs px-3 py-2.5 focus:ring-2 focus:ring-primary/50 text-on-surface" />
      </div>
      <div class="flex gap-2">
        <button id="save-key-btn" class="bg-primary text-white px-4 py-2 rounded-xl font-headline font-bold hover:opacity-90 active:scale-95 transition-all">
          Save Key
        </button>
        <button id="clear-key-btn" class="border border-outline-variant/30 text-on-surface-variant px-4 py-2 rounded-xl font-headline font-semibold hover:bg-surface-container-low transition-all">
          Reset to Mock
        </button>
      </div>
      <div class="text-[10px] text-on-surface-variant/80">
        Don't have a key? <a href="https://aistudio.google.com/" target="_blank" class="text-primary underline font-semibold">Get a free key from Google AI Studio</a>.
      </div>
    </div>

    <!-- Messages Container -->
    <div id="chatbot-messages" class="p-6 overflow-y-auto space-y-4 text-xs font-body flex-1 bg-surface-container-lowest/30">
      <!-- Bot Intro -->
      <div class="flex flex-col space-y-1">
        <div class="bg-surface-container-high/60 text-on-surface p-3.5 rounded-2xl rounded-tl-none max-w-[85%] leading-relaxed">
          Hello! Shunya Gemini AI Bot me aapka swagat hai. 🚀<br><br>Aap digital growth, paid ads, web development ya automation ke baare me kuch bhi pooch sakte hain. Main kaise help karun?
        </div>
        <span class="text-[9px] text-on-surface-variant/70 ml-1">Just now</span>
      </div>
    </div>

    <!-- Quick Reply Chips -->
    <div id="chatbot-chips" class="px-6 pb-4 flex flex-wrap gap-2">
      <button class="chip bg-primary/10 hover:bg-primary hover:text-on-primary text-primary px-3 py-1.5 rounded-full font-headline font-bold text-[10px] transition-colors border border-primary/20">
        Paid Ads & ROAS
      </button>
      <button class="chip bg-primary/10 hover:bg-primary hover:text-on-primary text-primary px-3 py-1.5 rounded-full font-headline font-bold text-[10px] transition-colors border border-primary/20">
        AI Automations
      </button>
      <button class="chip bg-primary/10 hover:bg-primary hover:text-on-primary text-primary px-3 py-1.5 rounded-full font-headline font-bold text-[10px] transition-colors border border-primary/20">
        Web Development
      </button>
      <button class="chip bg-primary/10 hover:bg-primary hover:text-on-primary text-primary px-3 py-1.5 rounded-full font-headline font-bold text-[10px] transition-colors border border-primary/20">
        Book Strategy Call
      </button>
    </div>

    <!-- Input Box -->
    <div class="p-4 border-t border-outline-variant/15 flex items-center space-x-2 bg-white/50 relative z-20">
      <input id="chatbot-input" class="flex-1 bg-surface-container-low border-none rounded-xl text-xs px-4 py-3 focus:ring-2 focus:ring-primary/50 text-on-surface placeholder:text-on-surface/40"
        placeholder="Type a message..." type="text" />
      <button id="chatbot-send" class="bg-primary text-white p-3 rounded-xl hover:scale-105 active:scale-95 transition-transform flex items-center justify-center">
        <span class="material-symbols-outlined text-sm">send</span>
      </button>
    </div>
  `;
  document.body.appendChild(chatWindow);

  // 5. DOM Handles & Variables
  const messagesContainer = document.getElementById("chatbot-messages");
  const chatbotInput = document.getElementById("chatbot-input");
  const chatbotSend = document.getElementById("chatbot-send");
  const chatbotChips = document.getElementById("chatbot-chips");
  
  const settingsToggle = document.getElementById("chatbot-settings-toggle");
  const settingsPanel = document.getElementById("chatbot-settings");
  const geminiKeyInput = document.getElementById("gemini-key-input");
  const saveKeyBtn = document.getElementById("save-key-btn");
  const clearKeyBtn = document.getElementById("clear-key-btn");
  const statusBadge = document.getElementById("api-status-badge");
  
  let botTyping = false;
  let userInteracted = false;
  let chatHistory = [
    { sender: "bot", text: "Hello! Shunya Gemini AI Bot me aapka swagat hai. 🚀\n\nAap digital growth, paid ads, web development ya automation ke baare me kuch bhi pooch sakte hain. Main kaise help karun?" }
  ];

  // 6. API Key Storage & Badge status updates
  const defaultApiKey = "AIzaSyCml5UhREBPhW74BB5ZGOetiouBZgeS09Q";
  const oldApiKey = "AIzaSyAKJFVReoasu-1b1g7g8PlSFX3WLZu3DSY";
  if (localStorage.getItem("shunya_gemini_api_key") === oldApiKey) {
    localStorage.removeItem("shunya_gemini_api_key");
  }
  const getStoredApiKey = () => {
    const stored = localStorage.getItem("shunya_gemini_api_key");
    if (stored === "mock") return "";
    return stored || defaultApiKey;
  };
  
  const updateBadgeStatus = () => {
    const key = getStoredApiKey();
    if (key) {
      statusBadge.textContent = "Gemini";
      statusBadge.className = "text-[8px] bg-green-500 text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm";
      geminiKeyInput.value = key;
    } else {
      statusBadge.textContent = "Mock";
      statusBadge.className = "text-[8px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider";
      geminiKeyInput.value = "";
    }
  };
  
  updateBadgeStatus();

  // Settings Panel toggle
  settingsToggle.addEventListener("click", () => {
    if (settingsPanel.classList.contains("hidden")) {
      settingsPanel.classList.remove("hidden");
    } else {
      settingsPanel.classList.add("hidden");
    }
  });

  // Save API Key
  saveKeyBtn.addEventListener("click", () => {
    const key = geminiKeyInput.value.trim();
    if (key) {
      localStorage.setItem("shunya_gemini_api_key", key);
      updateBadgeStatus();
      settingsPanel.classList.add("hidden");
      addMessage("💡 Gemini API key saved! Ab main live Gemini 1.5 model se directly baat kar sakta hoon.", "bot");
    }
  });

  // Clear API Key
  clearKeyBtn.addEventListener("click", () => {
    localStorage.setItem("shunya_gemini_api_key", "mock");
    updateBadgeStatus();
    settingsPanel.classList.add("hidden");
    addMessage("🔄 API Key removed. Offline simulated mode activated.", "bot");
  });

  // Toggle widget open/close
  toggleBtn.addEventListener("click", () => {
    toggleBtn.classList.add("scale-0");
    toggleBtn.style.pointerEvents = "none";
    chatWindow.classList.remove("scale-90", "opacity-0", "pointer-events-none", "translate-y-4");
    chatWindow.classList.add("scale-100", "opacity-100", "translate-y-0");
    chatbotInput.focus();
    // Mark as shown and interacted to prevent auto-open/auto-close cycles
    sessionStorage.setItem("shunya_chatbot_popup_shown", "true");
    userInteracted = true;
  });

  document.getElementById("chatbot-close").addEventListener("click", () => {
    chatWindow.classList.remove("scale-100", "opacity-100", "translate-y-0");
    chatWindow.classList.add("scale-90", "opacity-0", "pointer-events-none", "translate-y-4");
    settingsPanel.classList.add("hidden");
    setTimeout(() => {
      toggleBtn.classList.remove("scale-0");
      toggleBtn.style.pointerEvents = "auto";
    }, 200);
  });

  const scrollToBottom = () => {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  const addMessage = (text, sender) => {
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const msgDiv = document.createElement("div");
    if (sender === "user") {
      msgDiv.className = "flex flex-col items-end space-y-1";
      msgDiv.innerHTML = `
        <div class="bg-primary text-on-primary p-3.5 rounded-2xl rounded-tr-none max-w-[85%] leading-relaxed shadow-sm">
          ${text}
        </div>
        <span class="text-[9px] text-on-surface-variant/70 mr-1">${timeString}</span>
      `;
    } else {
      msgDiv.className = "flex flex-col space-y-1";
      msgDiv.innerHTML = `
        <div class="bg-surface-container-high/60 text-on-surface p-3.5 rounded-2xl rounded-tl-none max-w-[85%] leading-relaxed border border-outline-variant/10 shadow-sm">
          ${text}
        </div>
        <span class="text-[9px] text-on-surface-variant/70 ml-1">${timeString}</span>
      `;
    }
    messagesContainer.appendChild(msgDiv);
    scrollToBottom();
  };

  const showTypingIndicator = () => {
    const indicator = document.createElement("div");
    indicator.id = "chatbot-typing-indicator";
    indicator.className = "flex flex-col space-y-1";
    indicator.innerHTML = `
      <div class="bg-surface-container-high/40 text-on-surface px-4 py-3 rounded-2xl rounded-tl-none w-20 flex items-center justify-center space-x-1 border border-outline-variant/5">
        <span class="w-1.5 h-1.5 bg-on-surface-variant/60 rounded-full typing-dot"></span>
        <span class="w-1.5 h-1.5 bg-on-surface-variant/60 rounded-full typing-dot"></span>
        <span class="w-1.5 h-1.5 bg-on-surface-variant/60 rounded-full typing-dot"></span>
      </div>
    `;
    messagesContainer.appendChild(indicator);
    scrollToBottom();
  };

  const removeTypingIndicator = () => {
    const indicator = document.getElementById("chatbot-typing-indicator");
    if (indicator) {
      indicator.remove();
    }
  };

  // 7. Advanced Offline Mock Engine (Simulates Gemini's style and reasoning)
  const getOfflineBotResponse = (userInput) => {
    const text = userInput.toLowerCase();
    
    // Greeting
    if (text.match(/\b(hi|hello|hey|hola|greetings|pranam|namaste|kya haal hai|kya chal raha hai)\b/)) {
      return "Hello! Main bilkul fine hoon. Aap bataiye, aapke B2B business scaling targets kya hain? Hum ad campaign optimization, web speed, aur custom automation ke through digital operations boost karte hain. 🚀";
    }

    // Ads and Marketing
    if (text.includes("ad") || text.includes("roas") || text.includes("marketing") || text.includes("facebook") || text.includes("instagram") || text.includes("meta") || text.includes("google")) {
      return "Paid Ads scaling humari core strength hai. Hum <b>Meta Ads, Google Search/YouTube Ads</b>, aur targeted <b>LinkedIn Ads</b> deploy karte hain.<br><br>• We construct high-converting creative hooks.<br>• We optimize conversion pathways.<br>• Our average active client ad accounts see a <b>4.5x - 5.2x ROAS</b> bump.<br><br>Would you like us to run a free audit of your current ad account?";
    }

    // AI & Automations
    if (text.includes("ai") || text.includes("automation") || text.includes("bot") || text.includes("chat") || text.includes("flow") || text.includes("crm")) {
      return "AI automations operate 24/7 to scale workflows without increasing payroll. Hum log:<br><br>• Custom AI client-onboarding bots design karte hain.<br>• Auto-replies set up karte hain WhatsApp, Email aur Socials par.<br>• Leads information seedhe CRM/Slack me feed karte hain automatically.<br><br>Operational workloads down by nearly <b>70%</b> and response delays are minimized. 🤖";
    }

    // Web experience / dev
    if (text.includes("web") || text.includes("tech") || text.includes("shopify") || text.includes("development") || text.includes("design") || text.includes("site") || text.includes("code") || text.includes("coding")) {
      return "Website experience hi final conversion point hai. Hum custom <b>Next.js, React, TailwindCSS, Shopify</b>, aur headless systems architecture me specializing hain.<br><br>Aapki site visually premium look degi, extremely responsive rahegi, aur page speed <b>95+ on Lighthouse</b> touch karegi. 💻";
    }

    // Booking a strategy call
    if (text.includes("book") || text.includes("call") || text.includes("strategy") || text.includes("schedule") || text.includes("contact") || text.includes("milna") || text.includes("appointment")) {
      return "Zaroor! Let's build a customized scaling roadmap. Hum 15-minute ka absolute free audit calls perform karte hain. Strategy session book karne ke liye:<br><br>1. Directly fill our <a href='contact.html' class='text-primary underline font-bold'>Strategy Form</a>.<br>2. Click the floating WhatsApp button to chat instantly. 📞";
    }

    // Case studies/Portfolio
    if (text.includes("case") || text.includes("study") || text.includes("portfolio") || text.includes("result") || text.includes("success") || text.includes("client") || text.includes("work")) {
      return "Humne NeoBank, swiftRide, aur Velvet Bloom jaise industry leaders ke campaigns architecture set up kiye hain:<br><br>• <b>NeoBank</b>: Scaled 400% in 6 months.<br>• <b>Velvet Bloom</b>: 2.5x e-commerce revenue growth.<br>• <b>SwiftRide</b>: CPA decreased by 40%.<br><br>Detailed case reports padhne ke liye aap <a href='portfolio.html' class='text-primary underline font-bold'>Portfolio page</a> explore kijiye!";
    }

    // Default fallback
    return "Bilkul sahi! Shunya me hum absolute data tracking aur design clarity follow karte hain. Paid ads boost, speed optimization, and custom client flows setup are all part of our core services.<br><br>Let's book a growth audit call to trace scaling blockages. Check out our <a href='contact.html' class='text-primary underline font-bold'>Booking Portal</a>.";
  };

  // 8. Live Gemini API Connection (using client-side dynamic ESM script import)
  const callLiveGemini = async (apiKey, userText) => {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      
      // Format chat history for the API
      const formattedContents = chatHistory.slice(-8).map(msg => ({
        role: msg.sender === "user" ? "user" : "model",
        parts: [{ text: msg.text }]
      }));

      const requestBody = {
        contents: formattedContents,
        systemInstruction: {
          parts: [{
            text: "You are the Shunya Gemini Bot, an intelligent AI growth assistant representing Shunya Marketing Services (a premium B2B growth agency specializing in Paid Ads, AI Automations, and Web/SaaS Development). Respond in professional, engaging Hinglish (Hindi + English) or English. Keep responses relatively short, conversational, and direct the user to click the booking links (contact.html) or WhatsApp link when relevant. Use simple HTML formatting tags like <b> or <li> for formatting text. Avoid using raw markdown blocks like ```."
          }]
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300
        }
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API REST Error:", errorData);
        const errMsg = errorData?.error?.message || "HTTP error " + response.status;
        throw new Error(errMsg);
      }

      const data = await response.json();
      const responseText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) {
        throw new Error("Empty response from Gemini API");
      }
      return responseText;
    } catch (err) {
      console.error("Gemini API Error:", err);
      return `⚠️ <b>Gemini API Error</b>: ${err.message}<br><br>${getOfflineBotResponse(userText)}`;
    }
  };

  // 9. Message Handling flow
  const handleUserMessage = async (text) => {
    if (!text || botTyping) return;
    
    // Add user message
    addMessage(text, "user");
    chatHistory.push({ sender: "user", text: text });
    
    botTyping = true;
    showTypingIndicator();

    const apiKey = getStoredApiKey();
    let reply = "";
    
    if (apiKey) {
      // Live Gemini Mode
      reply = await callLiveGemini(apiKey, text);
    } else {
      // Offline Simulated Mode
      await new Promise(resolve => setTimeout(resolve, 800)); // Mimic network/thinking latency
      reply = getOfflineBotResponse(text);
    }
    
    removeTypingIndicator();
    addMessage(reply, "bot");
    chatHistory.push({ sender: "bot", text: reply });
    botTyping = false;
  };

  // Bind interactions
  chatbotSend.addEventListener("click", () => {
    const text = chatbotInput.value.trim();
    if (text) {
      handleUserMessage(text);
      chatbotInput.value = "";
    }
  });

  chatbotInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const text = chatbotInput.value.trim();
      if (text) {
        handleUserMessage(text);
        chatbotInput.value = "";
      }
    }
  });

  chatbotChips.addEventListener("click", (e) => {
    if (e.target.classList.contains("chip")) {
      const text = e.target.textContent.trim();
      handleUserMessage(text);
    }
  });

  // --- Auto Appear/Disappear Logic ---
  const markInteracted = () => {
    userInteracted = true;
    sessionStorage.setItem("shunya_chatbot_popup_shown", "true");
  };
  chatbotInput.addEventListener("input", markInteracted);
  chatbotSend.addEventListener("click", markInteracted);
  chatbotChips.addEventListener("click", markInteracted);

  // Start the popup timer if it hasn't been shown in this session yet
  if (!sessionStorage.getItem("shunya_chatbot_popup_shown")) {
    setTimeout(() => {
      // Only pop up if they haven't interacted or manually opened it in the last 20 seconds
      if (!sessionStorage.getItem("shunya_chatbot_popup_shown") && !userInteracted) {
        // Open the chatbot
        if (chatWindow.classList.contains("pointer-events-none")) {
          toggleBtn.click();
        }
        
        sessionStorage.setItem("shunya_chatbot_popup_shown", "true");

        // Keep it open for 20 seconds only, then close it if there's still no interaction
        setTimeout(() => {
          if (!userInteracted && !chatWindow.classList.contains("pointer-events-none")) {
            document.getElementById("chatbot-close").click();
          }
        }, 20000); // 20 seconds open time
      }
    }, 20000); // Popup after 20 seconds of page load
  }
});

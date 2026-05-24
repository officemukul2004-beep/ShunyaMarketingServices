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
    // Simple language detection based on keywords/common greetings
    const langMap = {
      hi: /\b(hi|hello|hey|hola|greetings|pranam|namaste|kya haal hai|kya chal raha hai)\b|\b(दिखाइ|हैलो|नमस्ते)\b/,
      mr: /\b(namaskar|kase aahat|namaste)\b|\b(नमस्कार|कसे आहात)\b/, // Marathi
      ta: /\b(vanakkam|வணக்கம்)\b/, // Tamil
      bn: /\b(halo|হ্যালো|নমস্কার)\b/, // Bengali
      te: /\b(namaskaram|నమస్కారం)\b/, // Telugu
      gu: /\b(namaste|નમસ્તે)\b/ // Gujarati
    };
    let detectedLang = "en"; // default English
    for (const [lang, regex] of Object.entries(langMap)) {
      if (regex.test(text)) { detectedLang = lang; break; }
    }
    // Helper to translate a generic English response into the detected language (very basic substitution)
    const translate = (enMsg) => {
      const translations = {
        hi: {
          greeting: "Hello! Main bilkul fine hoon. Aap bataiye, aapke B2B business scaling targets kya hain? Hum ad campaign optimization, web speed, aur custom automation ke through digital operations boost karte hain. 🚀",
          ads: "Paid Ads scaling humari core strength hai. Hum <b>Meta Ads, Google Search/YouTube Ads</b>, aur targeted <b>LinkedIn Ads</b> deploy karte hain.\n\n• High-converting creative hooks.\n• Optimized conversion pathways.\n• Average client ROAS bump 4.5x‑5.2x.\n\nKya aap free audit chahte hain?",
          ai: "AI automation 24/7 scale workflows bina payroll badhaye. Hum log:\n\n• Custom AI onboarding bots.\n• Auto-replies for WhatsApp, Email, Socials.\n• Leads feed directly to CRM/Slack.\n\nOperational workload down 70% and response delays minimized. 🤖",
          web: "Website experience hi final conversion point hai. Hum custom <b>Next.js, React, TailwindCSS, Shopify</b>, aur headless architecture me specialize karte hain.\n\nSite premium look, extremely responsive, page speed 95+ on Lighthouse.",
          call: "Zaroor! 15‑minute free audit call ke liye direct strategy form ya WhatsApp button use karein.",
          case: "Humne NeoBank, swiftRide, Velvet Bloom jaise leaders ke campaigns set up kiye hain:\n\n• NeoBank: 400% growth in 6 months.\n• Velvet Bloom: 2.5x e‑commerce revenue.\n• SwiftRide: CPA 40% down.\n\nDetails ke liye Portfolio page dekhe.",
          fallback: "Bilkul sahi! Shunya me hum data tracking, ad boost, speed optimization, aur custom client flows setup karte hain. Strategy audit book karein."
        },
        mr: {
          greeting: "नमस्कार! मी ठीक आहे. तुमचे B2B व्यवसाय वाढीचे लक्ष्य काय आहेत? आम्ही अॅड कॅम्पेन ऑप्टिमायझेशन, वेब स्पीड, आणि कस्टम ऑटोमेशन द्वारे डिजिटल ऑपरेशन्स वाढवतो.",
          ads: "Paid Ads स्केलिंग आमची मुख्य ताकद आहे. आम्ही Meta Ads, Google Search/YouTube Ads, आणि लक्ष्यित LinkedIn Ads चालवतो.",
          ai: "AI ऑटोमेशन 24/7 वर्कफ्लो स्केल करतो, पेरोल वाढवता नाही.",
          web: "वेबसाइट अनुभवच अंतिम रूपांतरण पॉइंट आहे. आम्ही Next.js, React, TailwindCSS, Shopify मध्ये विशेषज्ञ आहोत.",
          call: "नक्की! 15‑minute मोफत ऑडिट कॉलसाठी फॉर्म भरून किंवा व्हॉट्सअॅप बटण वापरून बुक करा.",
          case: "आम्ही NeoBank, swiftRide इत्यादींसाठी कॅम्पेन सेट अप केले आहेत.",
          fallback: "होय! डेटा ट्रॅकिंग, अॅड बूस्ट, स्पीड ऑप्टिमायझेशन इत्यादी आमचे कोर सर्विसेस आहेत."
        },
        ta: {
          greeting: "வணக்கம்! நான் நன்றாக இருக்கிறேன். உங்கள் B2B வணிக வளர்ச்சி இலக்குகள் என்ன? நாங்கள் Ads, web speed, AI automation மூலம் டிஜிட்டல் செயல்பாடுகளை மேம்படுத்துகிறோம்.",
          ads: "Paid Ads ஆனது எங்கள் முக்கிய பலம். நாம் Meta Ads, Google Ads, LinkedIn Ads ஆகியவற்றை பயன்படுத்துகிறோம்.",
          ai: "AI automation 24/7 வேலைப்போக்குகளை அளிக்கிறது, பணியாளர் செலவுகள் குறைகிறது.",
          web: "வலைத்தளம் பயனர் அனுபவம் முக்கியம். நாம் Next.js, React, TailwindCSS ஆகியவற்றில் நிபுணர்கள்.",
          call: "ஆம்! 15‑minute இலவச ஆலோசனை அழைப்பை பதிவு செய்யவும்.",
          case: "NeoBank, swiftRide போன்ற நிறுவனங்களுக்கு காம்பெயின்கள் அமைத்துள்ளோம்.",
          fallback: "நிச்சயம்! எங்கள் சேவைகள் data tracking, ads, speed optimization, மற்றும் custom flows.")
        },
        bn: {
          greeting: "হ্যালো! আমি ভাল আছি। আপনার B2B ব্যবসা স্কেলিং টার্গেট কী?",
          ads: "Paid Ads আমাদের মেইন স্ট্রেংথ। আমরা Meta Ads, Google Ads, LinkedIn Ads ব্যবহার করি।",
          ai: "AI automation ২৪/৭ ওয়ার্কফ্লো স্কেল করে, পেরোল বাড়ায় না।",
          web: "ওয়েবসাইট অভিজ্ঞতা শেষ কনভার্সন পয়েন্ট। আমরা Next.js, React, TailwindCSS-এ দক্ষ।",
          call: "অবশ্যই! 15‑minute ফ্রি অডিট কলের জন্য ফর্ম বা WhatsApp ব্যবহার করুন।",
          case: "NeoBank, swiftRide ইত্যাদির জন্য ক্যাম্পেইন তৈরি করেছি।",
          fallback: "নিশ্চয়! আমাদের সেবা ডেটা ট্র্যাকিং, Ads, Speed Optimization ইত্যাদি।"
        },
        te: {
          greeting: "నమస్కారం! నేను బాగున్నాను. మీ B2B బిజినెస్ స్కేలింగ్ లక్ష్యాలు ఏమిటి?",
          ads: "Paid Ads మా ప్రధాన బలం. మేము Meta Ads, Google Ads, LinkedIn Ads వాడుతాం.",
          ai: "AI automation 24/7 వర్కఫ్లోలను స్కేలు చేస్తుంది, పేరోల్ పెంచదు.",
          web: "వెబ్‌సైట్ అనుభవం చివరి కన్వర్ట్ పాయింట్. మాకు Next.js, React, TailwindCSS తెలుసు.",
          call: "ఖచ్చితంగా! 15‑minute ఫ్రీ ఆడిట్ కాల్ కోసం ఫారం లేదా WhatsApp బటన్ వాడండి.",
          case: "NeoBank, swiftRide వంటి సంస్థల కోసం క్యాంపెయిన్ సెట్ చేసాము.",
          fallback: "అవును! మా సేవలు data tracking, ads, speed optimization, custom flows.")
        },
        gu: {
          greeting: "નમસ્તે! હું બરાબર છું. તમારા B2B બિઝનેસ સ્કેલિંગ ટાર્ગેટ શું છે?",
          ads: "Paid Ads અમારી મુખ્ય શક્તિ છે. અમે Meta Ads, Google Ads, LinkedIn Ads ઉપયોગ કરીએ છીએ.",
          ai: "AI automation 24/7 workflow ને સ્કેલ કરે છે, payroll વધારતું નથી.",
          web: "વેબસાઇટ અનુભવ અંતિમ conversion point છે. અમે Next.js, React, TailwindCSS માં નિષ્ણાત છીએ.",
          call: "ખરેખર! 15‑minute મફત audit call માટે ફોર્મ અથવા WhatsApp બટન વાપરો.",
          case: "NeoBank, swiftRide જેવા ક્લાયન્ટ્સ માટે campaign સેટ કર્યો છે.",
          fallback: "નિશ્ચિત! અમારી સેવાઓ data tracking, ads, speed optimization, custom flows છે."
        }
      };
      // Return translated message based on detected language and category key
      const getMsg = (category) => {
        const langObj = translations[detectedLang] || translations["en"];
        return (langObj && langObj[category]) || translations["en"][category];
      };
      // Determine category based on keywords (same as original logic)
      // Greeting
      if (/\b(hi|hello|hey|hola|greetings|pranam|namaste|kya haal hai|kya chal raha hai)\b/.test(text) || /\b(नमस्ते|हैलो)\b/.test(text)) {
        return getMsg("greeting");
      }
      // Ads and Marketing
      if (text.includes("ad") || text.includes("roas") || text.includes("marketing") || text.includes("facebook") || text.includes("instagram") || text.includes("meta") || text.includes("google")) {
        return getMsg("ads");
      }
      // AI & Automations
      if (text.includes("ai") || text.includes("automation") || text.includes("bot") || text.includes("chat") || text.includes("flow") || text.includes("crm")) {
        return getMsg("ai");
      }
      // Web experience / dev
      if (text.includes("web") || text.includes("tech") || text.includes("shopify") || text.includes("development") || text.includes("design") || text.includes("site") || text.includes("code") || text.includes("coding")) {
        return getMsg("web");
      }
      // Booking a strategy call
      if (text.includes("book") || text.includes("call") || text.includes("strategy") || text.includes("schedule") || text.includes("contact") || text.includes("milna") || text.includes("appointment")) {
        return getMsg("call");
      }
      // Case studies/Portfolio
      if (text.includes("case") || text.includes("study") || text.includes("portfolio") || text.includes("result") || text.includes("success") || text.includes("client") || text.includes("work")) {
        return getMsg("case");
      }
      // Default fallback
      return getMsg("fallback");
    };



  const callLiveGemini = async (apiKey, userText) => {
    try {
      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: userText }] }] })
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

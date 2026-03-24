const floatingChat = document.getElementById('floatingChat');
const chatToggle = document.getElementById('chatToggle');
const closeChat = document.getElementById('closeChat');

chatToggle.addEventListener('click', () => {
  floatingChat.classList.remove('hidden');
  document.getElementById('landingUserInput').focus();
});

closeChat.addEventListener('click', () => {
  floatingChat.classList.add('hidden');
});

// The Gemini-powered landing chatbot (reuse from previous step)
const landingChatWindow = document.getElementById('landingChatWindow');
const landingUserInput = document.getElementById('landingUserInput');
const landingSendBtn = document.getElementById('landingSendBtn');

if (landingSendBtn && landingUserInput && landingChatWindow) {
  landingSendBtn.addEventListener('click', async () => {
    const question = landingUserInput.value.trim();
    if (!question) return;

    appendLandingMessage('You', question);
    landingUserInput.value = '...';

    // Show "typing..." message
    const thinkingEl = document.createElement('div');
    thinkingEl.classList.add('chat-msg');
    thinkingEl.innerHTML = `<strong>EcoBot:</strong> <em>Thinking...</em>`;
    landingChatWindow.appendChild(thinkingEl);
    landingChatWindow.scrollTop = landingChatWindow.scrollHeight;


    const prompt = `
You are a friendly climate assistant chatbot. The user asked: "${question}"
Give a clear, short, beginner-friendly answer about carbon footprint or the climate.
    `;

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("API Error data:", errorData);
        throw new Error(errorData?.error?.message || "Failed to fetch from Gemini API");
      }

      const data = await res.json();
      let reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Hmm, I couldn't answer that. Try asking differently!";

      if (typeof marked !== 'undefined') {
        reply = `<div style="display:inline-block; margin-top:5px; width:100%; line-height:1.4;">${marked.parse(reply)}</div>`;
      } else {
        reply = reply.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
      }

      thinkingEl.innerHTML = `<strong>EcoBot:</strong> ${reply}`;



    } catch (err) {
      console.error("Landing Chatbot Error:", err);
      thinkingEl.innerHTML = `<strong>EcoBot:</strong> Oops! Something went wrong: ${err.message}`;
    }

    landingUserInput.value = '';
    landingUserInput.focus();
    hideSampleQuestions();
  });



  landingUserInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') landingSendBtn.click();
  });
}


function appendLandingMessage(sender, message) {
  const msg = document.createElement('div');
  msg.style.marginBottom = '10px';
  msg.innerHTML = `<strong>${sender}:</strong> ${message}`;
  landingChatWindow.appendChild(msg);
  landingChatWindow.scrollTop = landingChatWindow.scrollHeight;
}

// const sampleBtns = document.querySelectorAll('.sample-btn');

// sampleBtns.forEach((btn) => {
//   btn.addEventListener('click', () => {
//     const sampleQuestion = btn.textContent;
//     landingUserInput.value = sampleQuestion;
//     landingSendBtn.click(); // Simulate click
//   });
// });

function hideSampleQuestions() {
  const samples = document.getElementById('sampleQuestions');
  if (samples) samples.style.display = 'none';
}

//   // Then call this inside your `landingSendBtn.addEventListener` logic:


// New Fresh logic for sample input:

// 🌿 Sample question pool
const allSampleQuestions = [
  "What is a carbon footprint?",
  "How can I reduce food waste?",
  "Is vegetarian diet better for the environment?",
  "How much CO2 does a car emit per km?",
  "What’s the best way to save energy at home?",
  "How does flying affect the environment?",
  "What’s the carbon footprint of electricity?",
  "Why should I care about climate change?",
  "How do public transport and biking help?",
  "Is going vegan better for the planet?"
];

// 🎯 Display 3 random questions
function showRandomSampleQuestions() {
  const sampleContainer = document.getElementById('sampleQuestions');
  if (!sampleContainer) return;

  sampleContainer.innerHTML = "<p><strong>Try asking:</strong></p>";

  const used = new Set();
  while (used.size < 3) {
    const randomIndex = Math.floor(Math.random() * allSampleQuestions.length);
    used.add(allSampleQuestions[randomIndex]);
  }

  used.forEach((question) => {
    const btn = document.createElement('button');
    btn.classList.add('sample-btn');
    btn.textContent = question;
    btn.addEventListener('click', () => {
      landingUserInput.value = question;
      landingSendBtn.click();
    });
    sampleContainer.appendChild(btn);
  });
}

// 🟢 Trigger sample suggestions on chatbot open
chatToggle.addEventListener('click', () => {
  floatingChat.classList.remove('hidden');
  landingUserInput.focus();
  showRandomSampleQuestions(); // 👈 Here it gets called
});




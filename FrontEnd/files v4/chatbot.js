/* ═══════════════════════════════════════════════════════
   CYNTIA SIEM — chatbot.js
   Chatbot IA usando Groq API (Llama 3.1)

   CÓMO CONFIGURARLO:
   ─────────────────────────────────────────────────────
   1. Ve a https://console.groq.com y crea una cuenta gratuita
   2. En "API Keys", genera una nueva clave
   3. Pega la clave en la variable GROQ_API_KEY de abajo
   4. El modelo llama-3.1-8b-instant es GRATUITO y muy rápido

   ⚠️ SEGURIDAD: Para producción real, la clave debería estar
   en un backend (Node.js, Python...) que actúe de proxy.
   Para el TFG/prototipo es aceptable tenerla en el frontend.
═══════════════════════════════════════════════════════ */

"use strict";

// ─── CONFIGURACIÓN ────────────────────────────────────
const GROQ_CONFIG = {
  apiKey:   "AQUI_TU_API_KEY_DE_GROQ",        // ← Pon tu clave aquí
  model:    "llama-3.1-8b-instant",             // Modelo gratuito y rápido
  endpoint: "https://api.groq.com/openai/v1/chat/completions",
  maxTokens: 600,
  temperature: 0.65,

  // Prompt del sistema: define la personalidad del chatbot
  systemPrompt: `Eres el asistente virtual de Cyntia, un sistema SIEM (Security Information and Event Management) de código abierto diseñado para PYMEs. 

Tu función es ayudar a los usuarios con:
- Preguntas sobre ciberseguridad y el producto Cyntia
- Configuración e instalación del sistema
- Interpretación de alertas y eventos de seguridad
- Buenas prácticas de seguridad para empresas pequeñas
- Características y planes de servicio de Cyntia
- Conceptos de seguridad como MITRE ATT&CK, SIEM, IDS/IPS, etc.

Responde siempre en español, de forma clara, concisa y profesional. 
Si no sabes algo con certeza, dilo honestamente.
Mantén las respuestas breves (máximo 3-4 párrafos).
No inventes características que Cyntia no tenga.
Si el usuario pregunta algo fuera del ámbito de ciberseguridad, redirige amablemente hacia temas de seguridad.`
};

// ─── ESTADO DEL CHAT ──────────────────────────────────
const chatState = {
  messages:    [],   // historial de conversación
  isOpen:      false,
  isTyping:    false,
};

// ─── ELEMENTOS DOM ────────────────────────────────────
const fab         = document.getElementById('chatbotFab');
const panel       = document.getElementById('chatbotPanel');
const minimize    = document.getElementById('chatMinimize');
const messagesDiv = document.getElementById('chatMessages');
const input       = document.getElementById('chatInput');
const sendBtn     = document.getElementById('chatSend');
const typingDiv   = document.getElementById('chatTyping');
const fabOpen     = fab?.querySelector('.fab-open');
const fabClose    = fab?.querySelector('.fab-close');

// ─── CHATBOT: SOLO PARA USUARIOS CON SESIÓN ──────────
(function initChatbotAuth() {
  const wrapper = document.getElementById('chatbotWrapper');
  if (!wrapper) return;

  function updateChatbotVisibility() {
    const user = sessionStorage.getItem('cyntia_user');
    if (user) {
      wrapper.classList.remove('auth-required');
    } else {
      wrapper.classList.add('auth-required');
    }
  }

  updateChatbotVisibility();

  // Listen for login state changes (called from auth.js)
  window._updateChatbotVisibility = updateChatbotVisibility;
})();

// ─── TOGGLE DEL PANEL ─────────────────────────────────
function openChat() {
  chatState.isOpen = true;
  panel?.classList.remove('hidden');
  fabOpen?.classList.add('hidden');
  fabClose?.classList.remove('hidden');
  input?.focus();
  scrollToBottom();
}

function closeChat() {
  chatState.isOpen = false;
  panel?.classList.add('hidden');
  fabOpen?.classList.remove('hidden');
  fabClose?.classList.add('hidden');
}

fab?.addEventListener('click', () => {
  chatState.isOpen ? closeChat() : openChat();
});

minimize?.addEventListener('click', closeChat);

// ─── FORMATEAR HORA ───────────────────────────────────
function formatTime() {
  const now = new Date();
  return now.getHours().toString().padStart(2, '0') + ':' +
         now.getMinutes().toString().padStart(2, '0');
}

// ─── AÑADIR MENSAJE AL DOM ────────────────────────────
function addMessage(text, role, time = null) {
  const wrapper = document.createElement('div');
  wrapper.className = `chat-msg ${role}`;

  // Convertir markdown básico a HTML
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, `<code style="font-family:var(--mono);background:var(--surface3);padding:1px 5px;border-radius:4px;font-size:0.85em">$1</code>`)
    .replace(/\n/g, '<br>');

  wrapper.innerHTML = `
    <div class="msg-bubble">${formatted}</div>
    <span class="msg-time">${time || formatTime()}</span>
  `;

  messagesDiv?.appendChild(wrapper);
  scrollToBottom();
}

// ─── SCROLL AL ÚLTIMO MENSAJE ─────────────────────────
function scrollToBottom() {
  if (messagesDiv) {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
}

// ─── MOSTRAR / OCULTAR INDICADOR DE ESCRITURA ─────────
function showTyping(show) {
  chatState.isTyping = show;
  if (typingDiv) {
    typingDiv.classList.toggle('hidden', !show);
    if (show) scrollToBottom();
  }
  if (sendBtn) sendBtn.disabled = show;
  if (input)   input.disabled   = show;
}

// ─── LLAMAR A LA API DE GROQ ──────────────────────────
async function callGroqAPI(userMessage) {
  // Añadir mensaje al historial
  chatState.messages.push({ role: 'user', content: userMessage });

  // Construir payload
  const payload = {
    model:       GROQ_CONFIG.model,
    max_tokens:  GROQ_CONFIG.maxTokens,
    temperature: GROQ_CONFIG.temperature,
    messages: [
      { role: 'system', content: GROQ_CONFIG.systemPrompt },
      ...chatState.messages
    ]
  };

  try {
    const response = await fetch(GROQ_CONFIG.endpoint, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${GROQ_CONFIG.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err?.error?.message || `Error ${response.status}`);
    }

    const data    = await response.json();
    const reply   = data?.choices?.[0]?.message?.content;

    if (!reply) throw new Error('Respuesta vacía del modelo');

    // Añadir respuesta al historial
    chatState.messages.push({ role: 'assistant', content: reply });

    // Limitar historial a últimos 16 mensajes (para no exceder tokens)
    if (chatState.messages.length > 16) {
      chatState.messages = chatState.messages.slice(-16);
    }

    return reply;

  } catch (error) {
    console.error('[Cyntia Chatbot]', error);

    // Respuesta de error amigable
    if (GROQ_CONFIG.apiKey === "AQUI_TU_API_KEY_DE_GROQ") {
      return '⚙️ El chatbot no está configurado aún. Para activarlo, edita **chatbot.js** y añade tu clave de API de Groq (gratuita en console.groq.com).';
    }
    if (error.message.includes('401') || error.message.includes('invalid_api_key')) {
      return '🔑 La clave de API parece incorrecta. Verifica que has copiado bien tu clave de Groq.';
    }
    if (error.message.includes('429')) {
      return '⏱️ Has enviado demasiadas preguntas seguidas. Espera un momento antes de continuar.';
    }
    return `❌ Ha ocurrido un error al contactar con el asistente. Por favor, inténtalo de nuevo. (${error.message})`;
  }
}

// ─── ENVIAR MENSAJE ───────────────────────────────────
async function sendMessage() {
  const text = input?.value.trim();
  if (!text || chatState.isTyping) return;

  // Limpiar input
  if (input) {
    input.value = '';
    input.style.height = 'auto';
  }

  // Mostrar mensaje del usuario
  addMessage(text, 'user');

  // Mostrar indicador de escritura
  showTyping(true);
  typingDiv?.classList.remove('hidden');
  if (messagesDiv) scrollToBottom();

  // Llamar a la API
  const reply = await callGroqAPI(text);

  // Ocultar indicador y mostrar respuesta
  showTyping(false);
  typingDiv?.classList.add('hidden');
  addMessage(reply, 'bot');
}

// ─── EVENTOS ──────────────────────────────────────────
sendBtn?.addEventListener('click', sendMessage);

input?.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Auto-resize textarea
input?.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 100) + 'px';
});

// ─── PREGUNTAS SUGERIDAS (botones rápidos) ────────────
const QUICK_QUESTIONS = [
  '¿Qué es Cyntia SIEM?',
  '¿Cómo instalo un agente?',
  '¿Qué planes ofrecéis?',
  '¿Qué es MITRE ATT&CK?'
];

function addQuickReplies() {
  if (!messagesDiv) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'quick-replies';
  wrapper.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;padding:8px 16px 4px;';

  QUICK_QUESTIONS.forEach(q => {
    const btn = document.createElement('button');
    btn.textContent = q;
    btn.style.cssText = `
      font-size:0.7rem;
      padding:4px 10px;
      border-radius:100px;
      background:var(--surface2);
      border:1px solid var(--border);
      color:var(--text-dim);
      cursor:pointer;
      transition:all 0.2s;
      font-family:var(--font);
    `;
    btn.addEventListener('mouseenter', () => {
      btn.style.borderColor = 'var(--blue)';
      btn.style.color       = 'var(--blue)';
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.borderColor = 'var(--border)';
      btn.style.color       = 'var(--text-dim)';
    });
    btn.addEventListener('click', () => {
      if (input) input.value = q;
      wrapper.remove();
      sendMessage();
    });
    wrapper.appendChild(btn);
  });

  messagesDiv.parentElement?.insertBefore(wrapper, messagesDiv.nextSibling);
}

// Añadir botones de preguntas rápidas al abrir el chat por primera vez
let quickRepliesAdded = false;
fab?.addEventListener('click', () => {
  if (!quickRepliesAdded && chatState.messages.length === 0) {
    setTimeout(addQuickReplies, 300);
    quickRepliesAdded = true;
  }
});

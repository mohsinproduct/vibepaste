// content/voice.js

window.VibeVoice = {
  recognition: null,
  isListening: false,
  textBeforeCursor: '',
  textAfterCursor: '',

  init: function(micBtn, vibeInput, onIntentUpdate) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      micBtn.style.display = 'none';
      console.warn("VibePaste: Web Speech API not supported in this browser.");
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    micBtn.addEventListener('click', () => {
      if (!this.isListening) {
        const cursorPos = vibeInput.selectionStart;
        const selectionEnd = vibeInput.selectionEnd;

        this.textBeforeCursor = vibeInput.value.substring(0, cursorPos);
        this.textAfterCursor = vibeInput.value.substring(selectionEnd);

        if (this.textBeforeCursor.length > 0 && !this.textBeforeCursor.endsWith(' ')) {
          this.textBeforeCursor += ' ';
        }
        if (this.textAfterCursor.length > 0 && !this.textAfterCursor.startsWith(' ')) {
          this.textAfterCursor = ' ' + this.textAfterCursor;
        }

        this.recognition.start();
      } else {
        this.stop();
      }
    });

    this.recognition.onstart = () => {
      this.isListening = true;
      micBtn.textContent = '🛑';
      micBtn.style.filter = "grayscale(0) sepia(1) hue-rotate(320deg)";
      vibeInput.placeholder = "Listening...";
    };

    this.recognition.onresult = (event) => {
      let currentVoiceSession = '';

      for (let i = 0; i < event.results.length; ++i) {
        currentVoiceSession += event.results[i][0].transcript;
      }
      vibeInput.value = this.textBeforeCursor + currentVoiceSession.trim() + this.textAfterCursor;
      
      onIntentUpdate(vibeInput.value); 
    };

    this.recognition.onend = () => {
      this.isListening = false;
      micBtn.textContent = '🎙️';
      micBtn.style.filter = "grayscale(1)";
      vibeInput.placeholder = "What should the AI do? (Press Enter)";
      vibeInput.focus();
    };

    this.recognition.onerror = (event) => {
      console.error("VibePaste Voice Error:", event.error);
      this.stop();
    };
  },

  stop: function() {
    if (this.isListening && this.recognition) {
      this.recognition.stop();
    }
  }
};
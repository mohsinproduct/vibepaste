// content/voice.js

window.VP_Voice = {
  recognition: null,
  isListening: false,
  shouldListen: false,
  textBeforeCursor: '',
  textAfterCursor: '',

  init: function(micBtn, vpInput, onIntentUpdate) {
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

    const prepareToListen = () => {
      const cursorPos = vpInput.selectionStart;
      const selectionEnd = vpInput.selectionEnd;

      this.textBeforeCursor = vpInput.value.substring(0, cursorPos);
      this.textAfterCursor = vpInput.value.substring(selectionEnd);

      if (this.textBeforeCursor.length > 0 && !this.textBeforeCursor.endsWith(' ')) {
        this.textBeforeCursor += ' ';
      }
      if (this.textAfterCursor.length > 0 && !this.textAfterCursor.startsWith(' ')) {
        this.textAfterCursor = ' ' + this.textAfterCursor;
      }
    };
    micBtn.addEventListener('click', () => {
      if (!this.isListening) {
        this.shouldListen = true;
        prepareToListen();
        this.recognition.start();
      } else {
        this.stop();
      }
    });

    this.recognition.onstart = () => {
      this.isListening = true;
      micBtn.textContent = '🛑';
      micBtn.style.filter = "grayscale(0) sepia(1) hue-rotate(320deg)";
      vpInput.placeholder = "Listening...";
    };

    this.recognition.onresult = (event) => {
      let currentVoiceSession = '';

      for (let i = 0; i < event.results.length; ++i) {
        currentVoiceSession += event.results[i][0].transcript;
      }
      vpInput.value = this.textBeforeCursor + currentVoiceSession.trim() + this.textAfterCursor;
      
      onIntentUpdate(vpInput.value); 
    };

    this.recognition.onend = () => {
      this.isListening = false;
      // If chrome killed the mic but user didn't ask it then restart it!
      if (this.shouldListen) {
        prepareToListen(); 
        try {
          this.recognition.start();
        } catch (e) {
          console.error("VibePaste: Failed to auto-restart mic", e);
        }
      } else {
        micBtn.textContent = '🎙️';
        micBtn.style.filter = "grayscale(1)";
        vpInput.placeholder = "What should the AI do? (Press Enter)";
        vpInput.focus();
      }
    };

    this.recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        console.error("VibePaste Voice Error:", event.error);
        this.stop();
      }
    };
  },

  stop: function() {
    this.shouldListen = false;
    if (this.isListening && this.recognition) {
      this.recognition.stop();
    }
  }
};
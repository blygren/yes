(function() {
  const guideText = document.getElementById('guideText');
  const guideOptions = document.getElementById('guideOptions');
  const guideClose = document.getElementById('guideClose');
  const guideContainer = document.getElementById('guideContainer');
  let jeffClickCount = 0;
  let jeffClicked = false;
  
  const conversation = {
    start: {
      text: "Hello! I'm Jeff, your milk guide! 🥛 What would you like to know?",
      options: [
        { text: "Say hello to Jeff 👋", next: 'hello' },
        { text: "What's the game price? 💰", next: 'price' },
        { text: "Tell me about the milk physics 🌧️", next: 'physics' },
        { text: "Name a milk drop! 🏷️", next: 'nameMilk' },
        { text: "What features are coming? 🚀", next: 'features' }
      ]
    },
    hello: {
      text: "Hey there! 😊 I'm so glad you're here! I love showing people around MilkSimulator. Is there anything else you'd like to know?",
      options: [
        { text: "What's the game price?", next: 'price' },
        { text: "Tell me about the milk physics", next: 'physics' },
        { text: "Name a milk drop!", next: 'nameMilk' },
        { text: "Back to main menu", next: 'start' }
      ]
    },
    price: {
      text: "Great question! MilkSimulator costs just $1.15 USD on itch.io! 💵 That's less than a coffee and way more fun! ☕➡️🥛",
      options: [
        { text: "That's a good deal! Where can I play?", next: 'play' },
        { text: "Tell me about features", next: 'features' },
        { text: "Back to main menu", next: 'start' }
      ]
    },
    physics: {
      text: "The milk drops are powered by Matter.js! They fall from the sky, bounce off elements, and are even attracted to your cursor like magnets! Try moving your mouse around! 🖱️✨",
      options: [
        { text: "Cool! What else can I explore?", next: 'explore' },
        { text: "How much does it cost?", next: 'price' },
        { text: "Back to main menu", next: 'start' }
      ]
    },
    features: {
      text: "We're constantly updating! Current features include caves, bombs, and physics-based gameplay. Check the roadmap tiles to see what's in progress! 🛠️",
      options: [
        { text: "Where can I see the gallery?", next: 'gallery' },
        { text: "How do I play the game?", next: 'play' },
        { text: "Back to main menu", next: 'start' }
      ]
    },
    explore: {
      text: "Scroll down to see our development roadmap with 6 feature tiles, plus a gallery with 9 screenshots! Everything is interactive with the falling milk! 📜🖼️",
      options: [
        { text: "Show me the gallery!", next: 'gallery' },
        { text: "I want to play now!", next: 'play' },
        { text: "Back to main menu", next: 'start' }
      ]
    },
    gallery: {
      text: "The gallery is just below the roadmap section! It has 9 awesome screenshots from development. The milk drops even bounce off the gallery images! 🎨",
      options: [
        { text: "How do I play the game?", next: 'play' },
        { text: "What's new in development?", next: 'features' },
        { text: "Back to main menu", next: 'start' }
      ]
    },
    play: {
      text: "You can play MilkSimulator on itch.io! Just scroll to the bottom and click the big 'Get on itch.io' button. It's only $1.15! See you in the game! 🎮🥛",
      options: [
        { text: "Thanks Jeff! Anything else?", next: 'start' },
        { text: "Tell me about the physics again", next: 'physics' },
        { text: "Close guide", next: 'close' }
      ]
    },
    nameMilk: {
      text: "That's awesome! You can name your very own milk drop! 🥛✨ It will have a nametag and never despawn. What would you like to name it?",
      options: [],
      input: true
    },
    milkNamed: {
      text: "Perfect! Your milk drop '{name}' has been created! 🎉 It's falling now with its special nametag and will stick around forever!",
      options: [
        { text: "Name another milk!", next: 'nameMilk' },
        { text: "Tell me about features", next: 'features' },
        { text: "Back to main menu", next: 'start' }
      ]
    }
  };
  
  function createNamedMilk(name) {
    // Dispatch custom event for milk-animation.js to handle
    const event = new CustomEvent('createNamedMilk', { detail: { name: name } });
    window.dispatchEvent(event);
    
    // Save to localStorage
    const namedMilks = JSON.parse(localStorage.getItem('namedMilks') || '[]');
    namedMilks.push(name);
    localStorage.setItem('namedMilks', JSON.stringify(namedMilks));
  }
  
  function showMessage(key, data = {}) {
    if (key === 'close') {
      closeGuide();
      return;
    }
    
    const message = conversation[key];
    if (!message) return;
    
    let text = message.text;
    if (data.name) {
      text = text.replace('{name}', data.name);
    }
    
    guideText.textContent = text;
    guideOptions.innerHTML = '';
    
    // Handle input mode for naming milk
    if (message.input) {
      const inputContainer = document.createElement('div');
      inputContainer.style.cssText = 'display:flex;gap:8px;margin-bottom:12px;';
      
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Enter milk name...';
      input.maxLength = 20;
      input.style.cssText = `
        flex: 1;
        padding: 10px 12px;
        border-radius: 8px;
        border: 1px solid rgba(255,255,255,0.2);
        background: rgba(255,255,255,0.05);
        color: #ffffff;
        font-size: 0.9rem;
        font-family: inherit;
      `;
      
      const submitBtn = document.createElement('button');
      submitBtn.textContent = '✓';
      submitBtn.className = 'guide-option';
      submitBtn.style.cssText = `
        padding: 10px 16px;
        margin: 0;
        min-width: auto;
      `;
      
      submitBtn.addEventListener('click', () => {
        const milkName = input.value.trim();
        if (milkName) {
          createNamedMilk(milkName);
          showMessage('milkNamed', { name: milkName });
        }
      });
      
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          submitBtn.click();
        }
      });
      
      inputContainer.appendChild(input);
      inputContainer.appendChild(submitBtn);
      guideOptions.appendChild(inputContainer);
      
      setTimeout(() => input.focus(), 100);
      
      // Add back button
      const backBtn = document.createElement('button');
      backBtn.className = 'guide-option';
      backBtn.textContent = '← Back to menu';
      backBtn.addEventListener('click', () => showMessage('start'));
      guideOptions.appendChild(backBtn);
    } else {
      // Regular options
      message.options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'guide-option';
        btn.textContent = option.text;
        btn.addEventListener('click', () => showMessage(option.next));
        guideOptions.appendChild(btn);
      });
    }
  }
  
  function activateChaosMode() {
    const event = new CustomEvent('activateChaosMode');
    window.dispatchEvent(event);
  }
  
  function closeGuide() {
    guideContainer.classList.add('hidden');
    localStorage.setItem('guideShown', 'true');
  }
  
  guideClose.addEventListener('click', closeGuide);
  
  // Track clicks on Jeff image
  const jeffImage = document.querySelector('.guide-image');
  if (jeffImage) {
    jeffImage.addEventListener('click', () => {
      if (!jeffClicked) return;
      
      jeffClickCount++;
      
      if (jeffClickCount === 10) {
        activateChaosMode();
      } else if (jeffClickCount < 10) {
        guideText.textContent = `You clicked me ${jeffClickCount} time${jeffClickCount > 1 ? 's' : ''}! Keep going... 🥛`;
        guideOptions.innerHTML = '';
      }
    });
    
    jeffImage.style.cursor = 'pointer';
  }
  
  // Initialize with start message
  showMessage('start');
  
  // Auto-show guide on first visit
  if (localStorage.getItem('guideShown') !== 'true') {
    setTimeout(() => {
      guideContainer.classList.remove('hidden');
    }, 1000);
  } else {
    guideContainer.classList.add('hidden');
  }
  
  // Show JEFF! button (instead of Help)
  const showGuideBtn = document.createElement('button');
  showGuideBtn.textContent = 'JEFF!';
  showGuideBtn.className = 'show-guide-btn';
  showGuideBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 30px;
    z-index: 150;
    background: linear-gradient(135deg, #6ad1ff, #786ff6);
    border: none;
    color: #04202a;
    font-weight: 900;
    padding: 12px 20px;
    border-radius: 12px;
    cursor: pointer;
    font-size: 1.1rem;
    box-shadow: 0 4px 16px rgba(106,209,255,0.3);
    transition: transform 0.2s;
    letter-spacing: 1px;
  `;
  showGuideBtn.addEventListener('click', () => {
    guideContainer.classList.remove('hidden');
    showMessage('start');
    jeffClicked = true;
    jeffClickCount = 0;
  });
  showGuideBtn.addEventListener('mouseenter', () => {
    showGuideBtn.style.transform = 'translateY(-3px) scale(1.05)';
  });
  showGuideBtn.addEventListener('mouseleave', () => {
    showGuideBtn.style.transform = 'translateY(0) scale(1)';
  });
  document.body.appendChild(showGuideBtn);
})();

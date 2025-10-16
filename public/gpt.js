 // DOM Elements
  const chatBox = document.getElementById("chatBox");
  const chatInput = document.getElementById("chatInput");
  const sendBtn = document.getElementById("sendBtn");
  const newChatBtn = document.getElementById("newChatBtn");
  const chatHistory = document.getElementById("chatHistory");
  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebarToggle");
  const toggleSidebarBtn = document.getElementById("toggleSidebarBtn");
  const imageInput = document.getElementById("imageInput");
  const fileInput = document.getElementById("fileInput");
  const previewArea = document.getElementById("previewArea");
  const scrollToBottomBtn = document.getElementById("scrollToBottomBtn");
  
  // State variables
  let isWaitingForResponse = false;
  
  // Sample chat history data
  const sampleChats = [
    "How to center a div?",
    "Explain quantum physics",
    "Python code for web scraping",
    "Dinner ideas for tonight",
    "Best productivity tips"
  ];
  
  // Initialize the app
  function init() {
    // Load chat history
    loadChatHistory();
    
    // Set up event listeners
    setupEventListeners();
    
    // Auto-resize textarea
    autoResizeTextarea();
    
    // Check for scroll position
    checkScrollPosition();
    
    // Set initial sidebar state
    updateSidebarState();
  }
  
  // Load sample chat history
  function loadChatHistory() {
    sampleChats.forEach(chat => {
      const chatItem = document.createElement("div");
      chatItem.className = "history-item";
      chatItem.innerHTML = `
        <i class="fas fa-comment-alt"></i>
        <span>${chat}</span>
      `;
      chatItem.addEventListener("click", () => loadChat(chat));
      chatHistory.appendChild(chatItem);
    });
  }
  
  // Set up event listeners
  function setupEventListeners() {
    // Send message on button click
    sendBtn.addEventListener("click", sendMessage);
    
    // Send message on Enter key (but allow Shift+Enter for new line)
    chatInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
    
    // New chat button
    newChatBtn.addEventListener("click", startNewChat);
    
    // Sidebar toggle for mobile
    sidebarToggle.addEventListener("click", toggleSidebar);
    
    // Toggle sidebar collapse/expand
    toggleSidebarBtn.addEventListener("click", toggleSidebarCollapse);
    
    // File input handlers
    imageInput.addEventListener("change", handleImageUpload);
    fileInput.addEventListener("change", handleFileUpload);
    
    // Check for scroll events
    chatBox.addEventListener("scroll", checkScrollPosition);
    
    // Scroll to bottom button
    scrollToBottomBtn.addEventListener("click", scrollToBottom);
  }
  
  // Toggle sidebar for mobile
  function toggleSidebar() {
    sidebar.classList.toggle("open");
  }
  
  // Toggle sidebar collapse/expand
  function toggleSidebarCollapse() {
    sidebar.classList.toggle("collapsed");
    const isCollapsed = sidebar.classList.contains("collapsed");
    toggleSidebarBtn.innerHTML = isCollapsed 
      ? '<i class="fas fa-chevron-right"></i><span>Expand sidebar</span>'
      : '<i class="fas fa-chevron-left"></i><span>Collapse sidebar</span>';
  }
  
  // Update sidebar state based on window size
  function updateSidebarState() {
    if (window.innerWidth <= 1200) {
      sidebar.classList.remove("collapsed");
      sidebar.classList.remove("open");
    }
  }
  
  // Auto-resize textarea as user types
  function autoResizeTextarea() {
    chatInput.addEventListener("input", function() {
      this.style.height = "auto";
      this.style.height = (this.scrollHeight) + "px";
    });
  }
  
  // Send message function
  function sendMessage() {
    if (isWaitingForResponse) return;
    
    const message = chatInput.value.trim();
    const previewItems = previewArea.querySelectorAll(".preview-item");
    
    if (message || previewItems.length > 0) {
      // Add user message
      if (message) {
        appendMessage(message, 'text', true);
      }
      
      // Add any attachments
      previewItems.forEach(item => {
        const type = item.dataset.type;
        const src = item.querySelector("img, video")?.src || "";
        const filename = item.querySelector(".preview-filename, .preview-file span")?.textContent || "file";
        appendMessage(filename, type, true, src);
      });
      
      // Clear input and preview
      chatInput.value = '';
      chatInput.style.height = "auto";
      previewArea.innerHTML = '';
      
      // Show typing indicator
      showTypingIndicator();
      
      // Disable send button while waiting for response
      isWaitingForResponse = true;
      sendBtn.innerHTML = '<div class="spinner"></div>';
      
      // Simulate bot response after a delay
      setTimeout(sendBotResponse, 1500 + Math.random() * 1000);
    }
  }
  
  // Append message to chat
  function appendMessage(content, type = 'text', isUser = false, src = '') {
    const messageContainer = chatBox.querySelector(".message-container");
    const messageDiv = document.createElement("div");
    messageDiv.className = `chat-message ${isUser ? '' : 'bot-message'}`;

    
    // Create avatar
    const avatarDiv = document.createElement("div");
    avatarDiv.className = `avatar ${isUser ? 'user-avatar' : 'bot-avatar'}`;
    avatarDiv.innerHTML = isUser ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    // Create message content
    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";
    
    if (type === 'text') {
      // Simple markdown parsing (very basic)
      const formattedContent = content
        .replace(/([\s\S]*?)/g, '<pre>$1</pre>')
        .replace(/([^]+)`/g, '<code>$1</code>')
        .replace(/\\(.?)\\*/g, '<strong>$1</strong>')
        .replace(/\(.?)\*/g, '<em>$1</em>');
      
      contentDiv.innerHTML = formattedContent
        .split('\n')
        .map(para => para.trim() ? <p>${para}</p> : '')
        .join('');
    } 
    else if (type === 'image') {
      const imgContainer = document.createElement("div");
      imgContainer.className = "preview-container";
      
      const img = document.createElement("img");
      img.src = src || content;
      img.className = "preview-img";
      img.alt = "Attached image";
      
      imgContainer.appendChild(img);
      contentDiv.appendChild(imgContainer);
    } 
    else if (type === 'video') {
      const videoContainer = document.createElement("div");
      videoContainer.className = "preview-container";
      
      const video = document.createElement("video");
      video.src = src || content;
      video.controls = true;
      video.className = "preview-video";
      
      videoContainer.appendChild(video);
      contentDiv.appendChild(videoContainer);
    }
    else if (type === 'file') {
      const fileLink = document.createElement("a");
      fileLink.href = src || content;
      fileLink.textContent = `Download ${content}`;
      fileLink.download = content;
      fileLink.className = "file-download";
      contentDiv.appendChild(fileLink);
    }
    
    // Create message actions (copy, like, dislike)
    if (!isUser) {
      const actionsDiv = document.createElement("div");
      actionsDiv.className = "message-actions";
      actionsDiv.innerHTML = `
        <button class="action-btn"><i class="far fa-copy"></i> Copy</button>
        <button class="action-btn"><i class="far fa-thumbs-up"></i> Like</button>
        <button class="action-btn"><i class="far fa-thumbs-down"></i> Dislike</button>
      `;
      contentDiv.appendChild(actionsDiv);
    }
    
    // Assemble message
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);
    messageContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    scrollToBottom();
  }
  
  // Show typing indicator
  function showTypingIndicator() {
    const messageContainer = chatBox.querySelector(".message-container");
    const typingDiv = document.createElement("div");
    typingDiv.className = "chat-message bot-message";
    
    const avatarDiv = document.createElement("div");
    avatarDiv.className = "avatar bot-avatar";
    avatarDiv.innerHTML = '<i class="fas fa-robot"></i>';
    
    const contentDiv = document.createElement("div");
    contentDiv.className = "message-content";
    
    const typingIndicator = document.createElement("div");
    typingIndicator.className = "typing-indicator";
    typingIndicator.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;
    
    contentDiv.appendChild(typingIndicator);
    typingDiv.appendChild(avatarDiv);
    typingDiv.appendChild(contentDiv);
    messageContainer.appendChild(typingDiv);
    
    // Scroll to bottom
    scrollToBottom();
    
    return typingDiv;
  }
  
  // Remove typing indicator
  function removeTypingIndicator(typingDiv) {
    if (typingDiv && typingDiv.parentNode) {
      typingDiv.parentNode.removeChild(typingDiv);
    }
  }
  
  // Simulate bot response
  function sendBotResponse() {
    const typingDiv = showTypingIndicator();
    
    // Sample responses
    const responses = [
      "I'm analyzing your request... Here's what I found:",
      "That's an interesting question! Here's some information that might help:",
      "Based on my knowledge, here's the answer to your query:",
      "I've researched this topic and here are the key points:"
    ];
    
    const sampleResponse = responses[Math.floor(Math.random() * responses.length)];
    const randomDelay = 1000 + Math.random() * 2000;
    
    // Remove typing indicator after delay
    setTimeout(() => {
      removeTypingIndicator(typingDiv);
      
      // Add bot response
      appendMessage(sampleResponse + "\n\nThis is a simulated response in this demo interface. In a real ChatGPT implementation, you would receive an AI-generated response based on your input.", 'text', false);
      
      // Add to chat history if it's the first message
      if (chatHistory.children.length === sampleChats.length + 1) { // +1 for the toggle button
        const firstMessage = chatInput.value.trim() || "Media message";
        const chatItem = document.createElement("div");
        chatItem.className = "history-item";
        chatItem.innerHTML = `
          <i class="fas fa-comment-alt"></i>
          <span>${firstMessage.length > 30 ? firstMessage.substring(0, 30) + "..." : firstMessage}</span>
        `;
        chatItem.addEventListener("click", () => loadChat(firstMessage));
        chatHistory.insertBefore(chatItem, chatHistory.children[1]); // Insert after new chat button
      }
      
      // Re-enable send button
      isWaitingForResponse = false;
      sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>';
    }, randomDelay);
  }
  
  // Handle image upload
  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        addPreviewItem(event.target.result, 'image', file.name);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = ''; // Reset input to allow same file to be selected again
  }
  
  // Handle file upload
  function handleFileUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        addPreviewItem(event.target.result, 'file', file.name);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = ''; // Reset input to allow same file to be selected again
  }
  
  // Add preview item
  function addPreviewItem(src, type, filename) {
    const previewItem = document.createElement("div");
    previewItem.className = "preview-item";
    previewItem.dataset.type = type;
    
    if (type === 'image') {
      previewItem.innerHTML = `
        <img src="${src}" class="preview-img" alt="Preview">
        <button class="remove-preview" onclick="removePreview(this.parentNode)">×</button>
        <div class="preview-filename">${filename}</div>
      `;
    } else {
      previewItem.innerHTML = `
        <div class="preview-file">
          <i class="fas fa-file-alt"></i>
          <span>${filename}</span>
        </div>
        <button class="remove-preview" onclick="removePreview(this.parentNode)">×</button>
      `;
    }
    
    previewArea.appendChild(previewItem);
  }
  
  // Remove preview item
  window.removePreview = function(previewItem) {
    previewItem.remove();
  };
  
  // Start new chat
  function startNewChat() {
    chatInput.value = '';
    previewArea.innerHTML = '';
    const messageContainer = chatBox.querySelector(".message-container");
    messageContainer.innerHTML = '';
    
    // Add welcome message again
    appendMessage("Hello! How can I help you today?", 'text', false);
    
    // Scroll to bottom
    scrollToBottom();
  }
  
  // Load chat from history
  function loadChat(topic) {
    startNewChat();
    chatInput.value = topic;
    chatInput.focus();
  }
  
  // Scroll to bottom of chat
  function scrollToBottom() {
    chatBox.scrollTop = chatBox.scrollHeight;
  }
  
  // Check scroll position to show/hide scroll to bottom button
  function checkScrollPosition() {
    const scrollThreshold = 100;
    const isNearBottom = chatBox.scrollHeight - chatBox.scrollTop - chatBox.clientHeight < scrollThreshold;
    
    if (isNearBottom) {
      scrollToBottomBtn.classList.remove("visible");
    } else {
      scrollToBottomBtn.classList.add("visible");
    }
  }
  
  // Initialize the app
  init();
  
  // Handle window resize
  window.addEventListener("resize", updateSidebarState);
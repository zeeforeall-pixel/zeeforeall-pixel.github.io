// ═══════════════════════════════════════════════════════════════
// LANDING PAGE CONTROLLER
// Handles landing page interactions and transition to main website
// ═══════════════════════════════════════════════════════════════

class LandingPageController {
  constructor() {
    this.landingPage = document.getElementById('landing-page');
    this.mainWebsite = document.getElementById('main-website');
    this.getStartedBtn = document.getElementById('get-started-btn');
    this.landingAudio = document.getElementById('landing-audio');
    
    this.visualizer = null;
    this.isTransitioning = false;
    this.transitionType = 'fade'; // Options: 'fade', 'slide', 'zoom'
    this.transitionDuration = 1500; // milliseconds
    
    if (!this.landingPage || !this.mainWebsite || !this.getStartedBtn) {
      console.error('Landing page elements not found');
      return;
    }
    
    this.init();
  }
  
  init() {
    // Initialize visualizer for landing page
    this.initVisualizer();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Prevent scrolling on landing page
    document.body.style.overflow = 'hidden';
  }
  
  initVisualizer() {
    try {
      // Initialize music visualizer for landing page
      this.visualizer = new MusicVisualizer('landing-visualizer');
      console.log('Landing visualizer initialized');
    } catch (error) {
      console.error('Error initializing landing visualizer:', error);
    }
  }
  
  setupEventListeners() {
    // GET STARTED button click
    this.getStartedBtn.addEventListener('click', () => this.handleGetStarted());
    
    // Prevent accidental navigation
    window.addEventListener('beforeunload', (e) => {
      if (!this.isTransitioning) {
        // Don't show confirmation on landing page
        return;
      }
    });
  }
  
  async handleGetStarted() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    
    // Update button state
    this.getStartedBtn.disabled = true;
    this.getStartedBtn.innerHTML = '<span class="button-text">LOADING...</span>';
    
    // Stop visualizer audio if playing
    if (this.landingAudio && !this.landingAudio.paused) {
      this.fadeOutAudio();
    }
    
    // Play transition animation
    await this.playTransition();
    
    // Hide landing page
    this.landingPage.classList.add('hidden');
    
    // Show main website
    this.mainWebsite.classList.add('visible');
    
    // Enable scrolling
    document.body.style.overflow = '';
    
    // Cleanup after transition
    setTimeout(() => {
      this.cleanup();
    }, 1000);
  }
  
  async playTransition() {
    return new Promise((resolve) => {
      switch(this.transitionType) {
        case 'fade':
          this.landingPage.style.animation = `fadeOutLanding ${this.transitionDuration}ms ease forwards`;
          setTimeout(resolve, this.transitionDuration);
          break;
          
        case 'slide':
          this.landingPage.style.animation = `slideUp ${this.transitionDuration}ms ease forwards`;
          setTimeout(resolve, this.transitionDuration);
          break;
          
        case 'zoom':
          this.landingPage.style.animation = `zoomOut ${this.transitionDuration}ms ease forwards`;
          setTimeout(resolve, this.transitionDuration);
          break;
          
        default:
          setTimeout(resolve, this.transitionDuration);
      }
    });
  }
  
  fadeOutAudio() {
    if (!this.landingAudio) return;
    
    const fadeInterval = 50; // ms
    const fadeStep = 0.05;
    
    const fade = setInterval(() => {
      if (this.landingAudio.volume > fadeStep) {
        this.landingAudio.volume -= fadeStep;
      } else {
        this.landingAudio.volume = 0;
        this.landingAudio.pause();
        clearInterval(fade);
      }
    }, fadeInterval);
  }
  
  cleanup() {
    // Remove landing page from DOM
    if (this.landingPage) {
      this.landingPage.style.display = 'none';
    }
    
    // Destroy visualizer
    if (this.visualizer && typeof this.visualizer.destroy === 'function') {
      this.visualizer.destroy();
    }
    
    // Remove audio element
    if (this.landingAudio) {
      this.landingAudio.pause();
      this.landingAudio.src = '';
    }
    
    console.log('Landing page cleaned up');
  }
}

// Initialize landing page when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.landingPageController = new LandingPageController();
  });
} else {
  window.landingPageController = new LandingPageController();
}

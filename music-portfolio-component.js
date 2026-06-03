// ═══════════════════════════════════════════════════════════════
// MUSIC PORTFOLIO COMPONENT (GSAP Vanilla JS)
// Converted from GSAP React component for single-file HTML integration
// ═══════════════════════════════════════════════════════════════

class MusicPortfolioComponent {
  constructor(containerId, tracksData, config = {}) {
    this.container = document.getElementById(containerId);
    this.tracksData = tracksData;
    this.config = {
      timeZone: config.timeZone || 'Asia/Jakarta',
      timeUpdateInterval: config.timeUpdateInterval || 1000,
      idleDelay: config.idleDelay || 4000,
      location: config.location || '8.3405° S, 115.0920° E', // Bali coordinates
      ...config
    };
    
    // Static metadata for tracks (fetched once from MusicBrainz)
    this.trackMetadata = [
      { releaseType: "Album", label: "Demajors", year: "2025", album: "Doves, '25 on Blank Canvas", genre: "Indie Pop" },
      { releaseType: "Album", label: "Dirty Hit", year: "2022", album: "Being Funny in a Foreign Language", genre: "Pop Rock" },
      { releaseType: "Album", label: "Juni Records", year: "2019", album: "What Do You Really Know?", genre: "Indie Rock" },
      { releaseType: "Album", label: "Juni Records", year: "2019", album: "What Do You Really Know?", genre: "Indie Rock" },
      { releaseType: "Album", label: "Captured Tracks", year: "2015", album: "Another One", genre: "Indie Rock" },
      { releaseType: "Album", label: "Creation Records", year: "1995", album: "(What's the Story) Morning Glory?", genre: "Britpop" },
      { releaseType: "Album", label: "DGC Records", year: "1991", album: "Nevermind", genre: "Grunge" },
      { releaseType: "Album", label: "Phonogenic Records", year: "2008", album: "The Script", genre: "Pop Rock" },
      { releaseType: "Single", label: "Apple Records", year: "1968", album: "Hey Jude", genre: "Rock" },
      { releaseType: "Single", label: "Hopeless Records", year: "2014", album: "Wishful Thinking", genre: "Pop Punk" },
      { releaseType: "Album", label: "Hopeless Records", year: "2017", album: "The Peace and the Panic", genre: "Pop Punk" }
    ];
    
    this.state = {
      activeIndex: -1,
      selectedIndex: -1,
      isIdle: true
    };
    
    this.refs = {
      backgroundEl: null,
      projectItems: [],
      idleTimer: null,
      idleAnimation: null,
      debounceTimer: null,
      timeUpdateIntervalId: null
    };
    
    this.init();
  }
  
  init() {
    this.render();
    this.attachEventListeners();
    this.preloadImages();
    this.startIdleTimer();
  }
  
  render() {
    // Generate projects markup exactly like React ProjectItem
    const projectsHtml = this.tracksData.map((track, index) => {
      const metadata = this.trackMetadata[index] || { releaseType: 'Single', label: 'Self Released', year: '2024' };
      return `
        <li class="project-item" data-index="${index}" data-image="${track.thumbnail || ''}">
          <span class="project-data artist hover-text">${this.escapeHtml(track.artist)}</span>
          <span class="project-data album hover-text">${this.escapeHtml(track.title)}</span>
          <span class="project-data category hover-text">${metadata.releaseType.toUpperCase()}</span>
          <span class="project-data label hover-text">${metadata.label.toUpperCase()}</span>
          <span class="project-data year hover-text">${metadata.year}</span>
        </li>
      `;
    }).join('');
    
    const html = `
      <div class="music-portfolio-container">
        <main class="portfolio-main">
          <h1 class="sr-only">Music Portfolio</h1>
          <ul class="project-list" role="list">
            ${projectsHtml}
          </ul>
        </main>
        
        <div class="background-image" id="backgroundImage" role="img" aria-hidden="true"></div>
        
        <aside class="corner-elements">
        </aside>
      </div>
    `;
    
    this.container.innerHTML = html;
    
    // Set DOM references
    this.refs.backgroundEl = this.container.querySelector('.background-image');
    this.refs.projectItems = Array.from(this.container.querySelectorAll('.project-item'));
    
    // Start time display
    this.updateTime();
    this.refs.timeUpdateIntervalId = setInterval(() => this.updateTime(), this.config.timeUpdateInterval);
  }
  
  attachEventListeners() {
    const main = this.container.querySelector('.portfolio-main');
    
    this.refs.projectItems.forEach((item, index) => {
      item.addEventListener('mouseenter', () => this.handleProjectMouseEnter(index));
      item.addEventListener('mouseleave', () => this.handleProjectMouseLeave());
      item.addEventListener('click', () => this.handleProjectClick(index));
    });
    
    main.addEventListener('mouseleave', () => this.handleContainerMouseLeave());
    
    // Keyboard navigation
    this.handleKeyDownBound = (e) => this.handleKeyDown(e);
    document.addEventListener('keydown', this.handleKeyDownBound);
  }
  
  updateScrambleEffects(activeIndex) {
    if (typeof gsap === 'undefined' || !gsap.plugins.scrambleText) {
      // Simple fallback if GSAP or ScrambleTextPlugin is not loaded
      this.refs.projectItems.forEach((item, index) => {
        const isCurrentActive = (index === activeIndex);
        item.querySelectorAll('.hover-text').forEach(el => {
          el.style.color = isCurrentActive ? 'var(--fg0)' : '';
        });
      });
      return;
    }
    
    this.refs.projectItems.forEach((item, index) => {
      const textElements = {
        artist: item.querySelector('.artist'),
        album: item.querySelector('.album'),
        category: item.querySelector('.category'),
        label: item.querySelector('.label'),
        year: item.querySelector('.year')
      };
      
      const track = this.tracksData[index];
      const metadata = this.trackMetadata[index] || { releaseType: 'Single', label: 'Self Released', year: '2024' };
      const projectData = {
        artist: track.artist,
        album: track.title,
        category: metadata.releaseType.toUpperCase(),
        label: metadata.label.toUpperCase(),
        year: metadata.year
      };
      
      const isActive = (index === activeIndex);
      
      Object.entries(textElements).forEach(([key, el]) => {
        if (!el) return;
        
        gsap.killTweensOf(el);
        
        if (isActive) {
          gsap.to(el, {
            duration: 0.8,
            scrambleText: {
              text: projectData[key],
              chars: "qwerty1337h@ck3r",
              revealDelay: 0.3,
              speed: 0.4
            }
          });
        } else {
          el.textContent = projectData[key];
        }
      });
    });
  }
  
  startIdleAnimation() {
    if (this.refs.idleAnimation) return;
    if (typeof gsap === 'undefined') return;
    
    const timeline = gsap.timeline({
      repeat: -1,
      repeatDelay: 2
    });
    
    this.refs.projectItems.forEach((item, index) => {
      if (!item) return;
      
      const hideTime = 0 + index * 0.05;
      const showTime = 0 + (this.tracksData.length * 0.05 * 0.5) + index * 0.05;
      
      timeline.to(item, {
        opacity: 0.05,
        duration: 0.1,
        ease: "power2.inOut"
      }, hideTime);
      
      timeline.to(item, {
        opacity: 1,
        duration: 0.1,
        ease: "power2.inOut"
      }, showTime);
    });
    
    this.refs.idleAnimation = timeline;
  }
  
  stopIdleAnimation() {
    if (this.refs.idleAnimation) {
      this.refs.idleAnimation.kill();
      this.refs.idleAnimation = null;
      
      this.refs.projectItems.forEach(item => {
        if (item) {
          gsap.set(item, { opacity: 1 });
        }
      });
    }
  }
  
  startIdleTimer() {
    if (this.refs.idleTimer) {
      clearTimeout(this.refs.idleTimer);
    }
    
    this.refs.idleTimer = setTimeout(() => {
      if (this.state.activeIndex === -1) {
        this.state.isIdle = true;
        this.refs.projectItems.forEach(item => {
          if (item) item.classList.add('idle');
        });
        this.startIdleAnimation();
      }
    }, this.config.idleDelay);
  }
  
  stopIdleTimer() {
    if (this.refs.idleTimer) {
      clearTimeout(this.refs.idleTimer);
      this.refs.idleTimer = null;
    }
  }
  
  handleProjectMouseEnter(index) {
    if (this.refs.debounceTimer) {
      clearTimeout(this.refs.debounceTimer);
    }
    
    this.stopIdleAnimation();
    this.stopIdleTimer();
    
    this.state.isIdle = false;
    this.refs.projectItems.forEach(item => {
      if (item) item.classList.remove('idle');
    });
    
    if (this.state.activeIndex === index) return;
    
    this.state.activeIndex = index;
    
    // Toggle active class on elements
    this.refs.projectItems.forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
    
    const main = this.container.querySelector('.portfolio-main');
    if (main) {
      main.classList.add('has-active');
    }
    
    // Scramble Text
    this.updateScrambleEffects(index);
    
    // Background animation exactly like React component
    const imageUrl = this.tracksData[index].thumbnail;
    const bg = this.refs.backgroundEl;
    if (imageUrl && bg) {
      bg.style.transition = "none";
      bg.style.transform = "translate(-50%, -50%) scale(1.2)";
      bg.style.backgroundImage = `url(${imageUrl})`;
      bg.style.opacity = "1";
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bg.style.transition = "opacity 0.6s ease, transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
          bg.style.transform = "translate(-50%, -50%) scale(1.0)";
        });
      });
    }
  }
  
  handleProjectMouseLeave() {
    this.refs.debounceTimer = setTimeout(() => {
      // Handled in container leave
    }, 50);
  }
  
  handleContainerMouseLeave() {
    if (this.refs.debounceTimer) {
      clearTimeout(this.refs.debounceTimer);
    }
    
    this.state.activeIndex = -1;
    
    this.refs.projectItems.forEach(item => {
      item.classList.remove('active');
    });
    
    const main = this.container.querySelector('.portfolio-main');
    if (main) {
      main.classList.remove('has-active');
    }
    
    // Reset Scramble Text
    this.updateScrambleEffects(-1);
    
    if (this.refs.backgroundEl) {
      this.refs.backgroundEl.style.opacity = "0";
    }
    
    this.startIdleTimer();
  }
  
  handleProjectClick(index) {
    if (typeof playLocalTrack === 'function') {
      playLocalTrack(index);
      
      if (typeof audio !== 'undefined' && audio.paused) {
        audio.play().catch(e => console.warn('Autoplay blocked:', e.message));
      }
    }
    
    // Update selected index when clicking
    this.selectTrack(index);
  }
  
  handleKeyDown(e) {
    // Don't handle if user is typing in an input field
    if (document.activeElement.tagName === 'INPUT' || 
        document.activeElement.tagName === 'TEXTAREA') {
      return;
    }
    
    const { selectedIndex } = this.state;
    const maxIndex = this.tracksData.length - 1;
    
    switch(e.key) {
      case 'ArrowDown':
        // Allow natural page scrolling while navigating tracks
        // Circular navigation: wrap to first track
        this.selectTrack(selectedIndex < maxIndex ? selectedIndex + 1 : 0);
        break;
        
      case 'ArrowUp':
        // Allow natural page scrolling while navigating tracks
        // Circular navigation: wrap to last track
        this.selectTrack(selectedIndex > 0 ? selectedIndex - 1 : maxIndex);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          this.handleProjectClick(selectedIndex);
        }
        break;
        
      case 'Escape':
        e.preventDefault();
        this.selectTrack(-1); // Deselect
        break;
    }
  }
  
  selectTrack(index) {
    this.state.selectedIndex = index;
    
    // Reuse the existing hover effect instead of separate selected state
    if (index >= 0) {
      this.handleProjectMouseEnter(index);
      
      // Scroll selected track into view
      if (this.refs.projectItems[index]) {
        this.refs.projectItems[index].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    } else {
      // Clear hover effect
      this.handleContainerMouseLeave();
    }
  }
  
  preloadImages() {
    this.tracksData.forEach(track => {
      if (track.thumbnail) {
        const img = new Image();
        img.src = track.thumbnail;
      }
    });
  }
  
  updateTime() {
    const now = new Date();
    const options = {
      timeZone: this.config.timeZone,
      hour12: true,
      hour: 'numeric',
      minute: 'numeric'
    };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(now);
    
    const hours = parts.find(p => p.type === 'hour')?.value || '00';
    const minutes = parts.find(p => p.type === 'minute')?.value || '00';
    const period = parts.find(p => p.type === 'dayPeriod')?.value || 'AM';
    
    const timeEl = document.getElementById('current-time');
    if (timeEl) {
      const hoursEl = timeEl.querySelector('.time-hours');
      const minutesEl = timeEl.querySelector('.time-minutes');
      const periodEl = timeEl.querySelector('.time-period');
      
      if (hoursEl) hoursEl.textContent = hours;
      if (minutesEl) minutesEl.textContent = minutes;
      if (periodEl) periodEl.textContent = period;
    }
  }
  
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  destroy() {
    this.stopIdleTimer();
    this.stopIdleAnimation();
    if (this.refs.debounceTimer) {
      clearTimeout(this.refs.debounceTimer);
    }
    if (this.refs.timeUpdateIntervalId) {
      clearInterval(this.refs.timeUpdateIntervalId);
    }
    // Remove keyboard listener
    if (this.handleKeyDownBound) {
      document.removeEventListener('keydown', this.handleKeyDownBound);
    }
  }
}

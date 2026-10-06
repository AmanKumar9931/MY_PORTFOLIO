/**
 * AMAN KUMAR -- WORLD-CLASS DATA SCIENCE PORTFOLIO
 * Core Interactions, Three.js 3D Neural Scene, Motion Choreography
 * Stack: Three.js, GSAP, ScrollTrigger, Lenis, SplitType, Vanilla Tilt
 */

(function () {
  'use strict';

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  // --------------------------------------------------------------------------
  // 01. GLOBAL CONFIGURATION & STATE
  // --------------------------------------------------------------------------
  const state = {
    isPreloaded: false,
    introVideoPlayed: false,
    mouse: { x: 0, y: 0, targetX: 0, targetY: 0 },
    windowSize: { width: window.innerWidth, height: window.innerHeight }
  };

  // --------------------------------------------------------------------------
  // 02. LENIS SMOOTH SCROLL & GSAP SYNC
  // --------------------------------------------------------------------------
  let lenisInstance = null;

  function initSmoothScroll() {
    if (typeof Lenis === 'undefined') return;

    lenisInstance = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false
    });

    if (typeof ScrollTrigger !== 'undefined') {
      lenisInstance.on('scroll', ScrollTrigger.update);

      gsap.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenisInstance.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    // Anchor smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#' || href === '') return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          lenisInstance.scrollTo(target, { offset: -60, duration: 1.4 });
          
          // Close mobile menu if open
          const mobileMenu = document.getElementById('mobile-menu');
          const toggleBtn = document.getElementById('mobile-menu-toggle');
          if (mobileMenu && mobileMenu.classList.contains('open')) {
            mobileMenu.classList.remove('open');
            toggleBtn?.classList.remove('active');
          }
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 04. CINEMATIC PRELOADER & INTRO VIDEO CHOREOGRAPHY
  // --------------------------------------------------------------------------
  function initPreloader() {
    const preloader = document.getElementById('preloader');
    const bar = document.getElementById('preloader-bar');
    const counter = document.getElementById('preloader-counter');
    const statusText = document.getElementById('preloader-status');

    if (!preloader || !bar || !counter) {
      revealHero();
      return;
    }

    const statuses = [
      'INITIALIZING NEURAL TENSORS...',
      'CALIBRATING RANDOM FOREST MATRICES...',
      'CONNECTING POWER BI PIPELINE...',
      'SYNCING OPENCV STREAM...',
      'SYSTEM READY'
    ];

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 8) + 3;
      if (progress > 100) progress = 100;

      bar.style.width = progress + '%';
      counter.textContent = String(progress).padStart(2, '0') + '%';

      const statusIdx = Math.min(Math.floor((progress / 100) * statuses.length), statuses.length - 1);
      if (statusText) statusText.textContent = statuses[statusIdx];

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          gsap.to(preloader, {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.inOut',
            onComplete: () => {
              preloader.style.display = 'none';
              state.isPreloaded = true;
              handleIntroVideoOrHero();
            }
          });
        }, 350);
      }
    }, 45);
  }

  function handleIntroVideoOrHero() {
    const videoOverlay = document.getElementById('hero-video-overlay');
    const video = document.getElementById('intro-video');
    const muteButton = document.getElementById('mute-intro-button');
    const skipButton = document.getElementById('skip-intro-button');

    if (!videoOverlay || !video || !muteButton || !skipButton || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      revealHero();
      return;
    }

    let finished = false;
    const finishIntro = () => {
      if (finished) return;
      finished = true;
      state.introVideoPlayed = true;
      video.pause();
      videoOverlay.classList.remove('is-active');
      videoOverlay.classList.add('is-ending');
      videoOverlay.setAttribute('aria-hidden', 'true');
      window.setTimeout(() => {
        videoOverlay.style.display = 'none';
        revealHero();
      }, 700);
    };

    const updateMuteButton = () => {
      const isMuted = video.muted;
      muteButton.textContent = isMuted ? 'Unmute sound' : 'Mute sound';
      muteButton.setAttribute('aria-label', `${isMuted ? 'Unmute' : 'Mute'} intro video`);
      muteButton.setAttribute('aria-pressed', String(!isMuted));
    };

    video.muted = true;
    updateMuteButton();
    videoOverlay.style.display = 'flex';
    videoOverlay.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => videoOverlay.classList.add('is-active'));

    muteButton.addEventListener('click', () => {
      if (video.paused) {
        video.muted = false;
        video.play().then(updateMuteButton).catch((error) => {
          console.error('Unable to start the introduction video after user interaction.', error);
          muteButton.textContent = 'Try again';
          muteButton.setAttribute('aria-label', 'Try playing the intro video again');
        });
        return;
      }

      video.muted = !video.muted;
      updateMuteButton();
    });
    skipButton.addEventListener('click', finishIntro);
    video.addEventListener('ended', finishIntro, { once: true });
    video.addEventListener('error', () => {
      console.error('Unable to load the introduction video.', video.error);
      finishIntro();
    }, { once: true });

    video.play().catch((error) => {
      console.error('Unable to start the introduction video.', error);
      muteButton.textContent = 'Play intro';
      muteButton.setAttribute('aria-label', 'Play intro video');
    });
  }

  // --------------------------------------------------------------------------
  // 05. THREE.JS 3D NEURAL DATA ENVIRONMENT
  // --------------------------------------------------------------------------
  let threeScene, threeCamera, threeRenderer, particlesMesh, linesMesh, tensorObject;
  const particleCount = 280;
  const maxDistance = 90;
  let particlePositions, particleVelocities;

  function initThreeScene() {
    const canvas = document.getElementById('webgl-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    threeScene = new THREE.Scene();
    threeCamera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
    threeCamera.position.z = 600;

    threeRenderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    threeRenderer.setSize(window.innerWidth, window.innerHeight);
    threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // A. Neural Particles Geometry
    const pGeometry = new THREE.BufferGeometry();
    particlePositions = new Float32Array(particleCount * 3);
    particleVelocities = [];

    const spread = 800;
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      particlePositions[i3] = (Math.random() - 0.5) * spread;
      particlePositions[i3 + 1] = (Math.random() - 0.5) * spread;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * (spread * 0.7);

      particleVelocities.push({
        x: (Math.random() - 0.5) * 0.6,
        y: (Math.random() - 0.5) * 0.6,
        z: (Math.random() - 0.5) * 0.6
      });
    }

    pGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3).setUsage(THREE.DynamicDrawUsage));

    // Custom circular glowing particle texture
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const pCtx = pCanvas.getContext('2d');
    const gradient = pCtx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, 'rgba(0, 240, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(0, 102, 255, 0.7)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    pCtx.fillStyle = gradient;
    pCtx.fillRect(0, 0, 32, 32);

    const particleTexture = new THREE.CanvasTexture(pCanvas);

    const pMaterial = new THREE.PointsMaterial({
      size: 14,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      color: 0x00F0FF
    });

    particlesMesh = new THREE.Points(pGeometry, pMaterial);
    threeScene.add(particlesMesh);

    // B. Synaptic Distance Lines (LineSegments)
    const maxLines = (particleCount * (particleCount - 1)) / 2;
    const linePositions = new Float32Array(maxLines * 6);
    const lineColors = new Float32Array(maxLines * 6);

    const lGeometry = new THREE.BufferGeometry();
    lGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage));
    lGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3).setUsage(THREE.DynamicDrawUsage));

    const lMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    linesMesh = new THREE.LineSegments(lGeometry, lMaterial);
    threeScene.add(linesMesh);

    // C. 3D Floating Tensor Wireframe Crystal
    const tensorGeo = new THREE.IcosahedronGeometry(75, 1);
    const tensorMat = new THREE.MeshBasicMaterial({
      color: 0x0066FF,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    tensorObject = new THREE.Mesh(tensorGeo, tensorMat);
    tensorObject.position.set(280, 50, -100);
    threeScene.add(tensorObject);

    // Inner glowing core
    const coreGeo = new THREE.IcosahedronGeometry(35, 0);
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x00F0FF,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    tensorObject.add(coreMesh);

    // Mouse Parallax Trackers
    window.addEventListener('mousemove', (e) => {
      state.mouse.targetX = (e.clientX - window.innerWidth / 2) * 0.4;
      state.mouse.targetY = (e.clientY - window.innerHeight / 2) * 0.4;
    });

    // Window Resize Handler
    window.addEventListener('resize', onWindowResize);

    // Start 60FPS Animation Loop
    animateThree();
  }

  function onWindowResize() {
    if (!threeCamera || !threeRenderer) return;
    threeCamera.aspect = window.innerWidth / window.innerHeight;
    threeCamera.updateProjectionMatrix();
    threeRenderer.setSize(window.innerWidth, window.innerHeight);
  }

  function animateThree() {
    requestAnimationFrame(animateThree);

    // Pause Three.js computation if tab is hidden
    if (document.hidden) return;

    // Mouse Lerp for Camera
    state.mouse.x += (state.mouse.targetX - state.mouse.x) * 0.04;
    state.mouse.y += (state.mouse.targetY - state.mouse.y) * 0.04;
    threeCamera.position.x = state.mouse.x;
    threeCamera.position.y = -state.mouse.y;
    threeCamera.lookAt(threeScene.position);

    // Rotate Tensor Crystal
    if (tensorObject) {
      tensorObject.rotation.x += 0.005;
      tensorObject.rotation.y += 0.008;
    }

    // Particle Velocity & Bounds Update
    let vertexPos = 0;
    let colorPos = 0;
    let numConnected = 0;

    const positions = particlesMesh.geometry.attributes.position.array;
    const linePos = linesMesh.geometry.attributes.position.array;
    const lineCol = linesMesh.geometry.attributes.color.array;

    const bounds = 400;

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;

      positions[i3] += particleVelocities[i].x;
      positions[i3 + 1] += particleVelocities[i].y;
      positions[i3 + 2] += particleVelocities[i].z;

      if (positions[i3] < -bounds || positions[i3] > bounds) particleVelocities[i].x *= -1;
      if (positions[i3 + 1] < -bounds || positions[i3 + 1] > bounds) particleVelocities[i].y *= -1;
      if (positions[i3 + 2] < -bounds || positions[i3 + 2] > bounds) particleVelocities[i].z *= -1;

      // Find nearby connections
      for (let j = i + 1; j < particleCount; j++) {
        const j3 = j * 3;
        const dx = positions[i3] - positions[j3];
        const dy = positions[i3 + 1] - positions[j3 + 1];
        const dz = positions[i3 + 2] - positions[j3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < maxDistance) {
          const alpha = 1.0 - dist / maxDistance;

          linePos[vertexPos++] = positions[i3];
          linePos[vertexPos++] = positions[i3 + 1];
          linePos[vertexPos++] = positions[i3 + 2];

          linePos[vertexPos++] = positions[j3];
          linePos[vertexPos++] = positions[j3 + 1];
          linePos[vertexPos++] = positions[j3 + 2];

          lineCol[colorPos++] = 0.0;
          lineCol[colorPos++] = 0.94 * alpha;
          lineCol[colorPos++] = 1.0 * alpha;

          lineCol[colorPos++] = 0.0;
          lineCol[colorPos++] = 0.4 * alpha;
          lineCol[colorPos++] = 1.0 * alpha;

          numConnected++;
        }
      }
    }

    linesMesh.geometry.setDrawRange(0, numConnected * 2);
    particlesMesh.geometry.attributes.position.needsUpdate = true;
    linesMesh.geometry.attributes.position.needsUpdate = true;
    linesMesh.geometry.attributes.color.needsUpdate = true;

    threeRenderer.render(threeScene, threeCamera);
  }

  // --------------------------------------------------------------------------
  // 06. HERO REVEAL CHOREOGRAPHY
  // --------------------------------------------------------------------------
  function revealHero() {
    if (typeof gsap === 'undefined') return;

    const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    heroTl
      .fromTo('.site-header', { y: -40, opacity: 0 }, { y: 0, opacity: 1, duration: 1 })
      .fromTo('[data-reveal="fade"]', { y: 25, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.9 }, '-=0.6')
      .fromTo('.hero-headline', { scale: 0.95, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.1 }, '-=0.8')
      .fromTo('[data-reveal="hero-visual"]', { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 1.2 }, '-=0.9');

    // Start Typewriter
    initTypewriter();
  }

  // --------------------------------------------------------------------------
  // 07. DYNAMIC TYPEWRITER ROTATOR
  // --------------------------------------------------------------------------
  function initTypewriter() {
    const el = document.getElementById('hero-typewriter');
    if (!el) return;

    const roles = [
      'Data Science Student',
      'Data Analyst',
      'Python Developer',
      'Machine Learning Enthusiast',
      'Data Visualization Enthusiast',
      'AI & Analytics Explorer'
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 90;

    function type() {
      const currentRole = roles[roleIndex];

      if (isDeleting) {
        el.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 45;
      } else {
        el.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 90;
      }

      if (!isDeleting && charIndex === currentRole.length) {
        typingSpeed = 1800; // Pause at end of word
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typingSpeed = 400; // Pause before new word
      }

      setTimeout(type, typingSpeed);
    }

    type();
  }

  // --------------------------------------------------------------------------
  // 08. GSAP SCROLLTRIGGER & SECTION ENTRANCES (SPLITTYPE)
  // --------------------------------------------------------------------------
  function initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Text Split / Section Heading Reveals
    const headings = document.querySelectorAll('.split-text');
    if (typeof SplitType !== 'undefined') {
      headings.forEach((heading) => {
        try {
          const split = new SplitType(heading, { types: 'lines, words' });
          gsap.from(split.words, {
            scrollTrigger: {
              trigger: heading,
              start: 'top 85%',
              toggleActions: 'play none none none'
            },
            y: 35,
            opacity: 0,
            duration: 0.9,
            stagger: 0.02,
            ease: 'power3.out'
          });
        } catch(e) {
          gsap.from(heading, {
            scrollTrigger: {
              trigger: heading,
              start: 'top 85%',
              toggleActions: 'play none none none'
            },
            y: 40,
            opacity: 0,
            duration: 1,
            ease: 'power3.out'
          });
        }
      });
    } else {
      headings.forEach((heading) => {
        gsap.from(heading, {
          scrollTrigger: {
            trigger: heading,
            start: 'top 85%',
            toggleActions: 'play none none none'
          },
          y: 40,
          opacity: 0,
          duration: 1,
          ease: 'power3.out'
        });
      });
    }

    // Bento Project Cards Stagger
    const projectCards = document.querySelectorAll('.project-bento-card');
    projectCards.forEach((card) => {
      gsap.from(card, {
        scrollTrigger: {
          trigger: card,
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });
    });

    // Timeline Connecting Spine Laser Animation
    const spine = document.getElementById('timeline-spine');
    if (spine) {
      gsap.fromTo(
        spine,
        { scaleY: 0, transformOrigin: 'top center' },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.journey-section',
            start: 'top 70%',
            end: 'bottom 85%',
            scrub: 1
          }
        }
      );
    }

    // Timeline Milestones
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach((item) => {
      gsap.from(item, {
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          toggleActions: 'play none none none'
        },
        y: 35,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
      });
    });

    // Number Counters Animation
    initNumberCounters();
  }

  // --------------------------------------------------------------------------
  // 09. REAL CV-BASED NUMBER COUNTERS
  // --------------------------------------------------------------------------
  function initNumberCounters() {
    const counterElements = document.querySelectorAll('.counter-val');
    if (!counterElements.length) return;

    counterElements.forEach((el) => {
      const target = parseFloat(el.getAttribute('data-target'));
      const isFloat = el.getAttribute('data-decimals') === '1';

      ScrollTrigger.create({
        trigger: el,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          const counterObj = { val: 0 };
          gsap.to(counterObj, {
            val: target,
            duration: 2,
            ease: 'power3.out',
            onUpdate: () => {
              if (isFloat) {
                el.textContent = counterObj.val.toFixed(1);
              } else {
                el.textContent = Math.floor(counterObj.val);
              }
            }
          });
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 10. SKILLS FILTERING TABS
  // --------------------------------------------------------------------------
  function initSkillsFilter() {
    const tabs = document.querySelectorAll('.filter-tab');
    const cards = document.querySelectorAll('.skill-card');

    if (!tabs.length || !cards.length) return;

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        tabs.forEach((t) => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        const filter = tab.getAttribute('data-filter');

        cards.forEach((card) => {
          const category = card.getAttribute('data-category');
          if (filter === 'all' || category === filter) {
            card.classList.remove('hidden-card');
            gsap.fromTo(card, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'power2.out' });
          } else {
            card.classList.add('hidden-card');
          }
        });

        // Refresh ScrollTrigger calculations
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      });
    });
  }

  // --------------------------------------------------------------------------
  // 11. VANILLA TILT 3D PERSPECTIVE INITIALIZATION
  // --------------------------------------------------------------------------
  function initTilt() {
    if (typeof VanillaTilt === 'undefined') return;

    // Only apply on non-touch desktop screens
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
        max: 12,
        speed: 400,
        glare: true,
        'max-glare': 0.15,
        perspective: 1000
      });
    }
  }

  // --------------------------------------------------------------------------
  // 12. MAGNETIC BUTTONS EFFECT
  // --------------------------------------------------------------------------
  function initMagneticButtons() {
    if (window.matchMedia('(hover: none)').matches) return;

    const magneticElements = document.querySelectorAll('.magnetic-btn');
    magneticElements.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        gsap.to(btn, {
          x: x * 0.28,
          y: y * 0.28,
          duration: 0.3,
          ease: 'power2.out'
        });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: 'elastic.out(1, 0.4)'
        });
      });
    });
  }

  // --------------------------------------------------------------------------
  // 13. INTERACTIVE SIMULATIONS (CV HUD & RAINFALL BARS)
  // --------------------------------------------------------------------------
  function initSimulations() {
    // Face Recognition subtle tracking drift
    const primaryFaceBox = document.querySelector('.box-primary');
    if (primaryFaceBox) {
      setInterval(() => {
        const dx = (Math.random() - 0.5) * 6;
        const dy = (Math.random() - 0.5) * 6;
        primaryFaceBox.style.transform = `translate(${dx}px, ${dy}px)`;
      }, 2000);
    }

    // Rainfall Month Bars Tooltips
    const monthCols = document.querySelectorAll('.month-col');
    const rainfallStats = [
      { m: 'January', mm: '58 mm', pct: '1.0%' },
      { m: 'February', mm: '64 mm', pct: '1.1%' },
      { m: 'March', mm: '72 mm', pct: '1.2%' },
      { m: 'April', mm: '112 mm', pct: '1.9%' },
      { m: 'May', mm: '154 mm', pct: '2.6%' },
      { m: 'June', mm: '490 mm', pct: '8.3%' },
      { m: 'July (Peak)', mm: '3,200 mm', pct: '54.0%' },
      { m: 'August', mm: '1,120 mm', pct: '18.9%' },
      { m: 'September', mm: '480 mm', pct: '8.1%' },
      { m: 'October', mm: '124 mm', pct: '2.1%' },
      { m: 'November', mm: '70 mm', pct: '1.2%' },
      { m: 'December', mm: '42 mm', pct: '0.7%' }
    ];

    monthCols.forEach((col, i) => {
      if (rainfallStats[i]) {
        col.setAttribute('title', `${rainfallStats[i].m}: ${rainfallStats[i].mm} (${rainfallStats[i].pct} of season)`);
      }
    });
  }

  // --------------------------------------------------------------------------
  // 14. CONTACT FORM VALIDATION & COPY EMAIL UTILITY
  // --------------------------------------------------------------------------
  function initContactUtilities() {
    // A. Copy Email to Clipboard
    const copyBtn = document.getElementById('copy-email-btn');
    const toast = document.getElementById('toast');

    function showToast(msg) {
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const email = copyBtn.getAttribute('data-email') || 'amanrajputjee122@gmail.com';
        navigator.clipboard.writeText(email).then(() => {
          showToast(`Copied to clipboard: ${email}`);
        }).catch(() => {
          showToast(`Direct email: ${email}`);
        });
      });
    }

    const copyPhoneBtn = document.getElementById('copy-phone-btn');
    if (copyPhoneBtn) {
      copyPhoneBtn.addEventListener('click', () => {
        const phone = copyPhoneBtn.getAttribute('data-phone') || '+919006288550';
        navigator.clipboard.writeText(phone).then(() => {
          showToast(`Copied phone: ${phone}`);
        }).catch(() => {
          showToast(`Direct phone: ${phone}`);
        });
      });
    }

    // B. Interactive Contact Form Submission
    const form = document.getElementById('contact-form');
    const statusMsg = document.getElementById('form-status');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const subject = form.subject.value.trim();
        const message = form.message.value.trim();

        if (!name || !email || !message) {
          statusMsg.className = 'form-status-msg error';
          statusMsg.textContent = 'Please fill out all required fields.';
          statusMsg.classList.remove('hidden');
          return;
        }

        // Email validation regex
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          statusMsg.className = 'form-status-msg error';
          statusMsg.textContent = 'Please enter a valid email address.';
          statusMsg.classList.remove('hidden');
          return;
        }

        // Success state & prepare direct transmission
        statusMsg.className = 'form-status-msg success';
        statusMsg.textContent = 'Preparing email dispatch to amanrajputjee122@gmail.com...';
        statusMsg.classList.remove('hidden');

        // Construct mailto link as seamless client dispatch
        const mailtoSubject = encodeURIComponent(subject || `Portfolio Inquiry from ${name}`);
        const mailtoBody = encodeURIComponent(`Sender Name: ${name}\nSender Email: ${email}\n\nMessage:\n${message}`);
        const mailtoLink = `mailto:amanrajputjee122@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

        setTimeout(() => {
          window.location.href = mailtoLink;
          statusMsg.textContent = '[OK] Direct transmission generated. Opening your mail client!';
          form.reset();
        }, 800);
      });
    }

    // C. Mobile Hamburger Menu Toggle
    const mobileBtn = document.getElementById('mobile-menu-toggle');
    const mobileDrawer = document.getElementById('mobile-menu');

    if (mobileBtn && mobileDrawer) {
      mobileBtn.addEventListener('click', () => {
        const isOpen = mobileDrawer.classList.toggle('open');
        mobileBtn.classList.toggle('active', isOpen);
        mobileBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    }
  }

  // --------------------------------------------------------------------------
  // 15. ACTIVE NAVIGATION LINK SPY
  // --------------------------------------------------------------------------
  function initNavSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!sections.length || !navLinks.length) return;

    window.addEventListener('scroll', () => {
      let currentSection = '';
      const scrollY = window.pageYOffset;

      sections.forEach((section) => {
        const sectionTop = section.offsetTop - 120;
        const sectionHeight = section.offsetHeight;
        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
          currentSection = section.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
          link.classList.add('active');
        }
      });
    });
  }

  // --------------------------------------------------------------------------
  // 16. INITIALIZATION ENTRY POINT
  // --------------------------------------------------------------------------
  document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
    initThreeScene();
    initPreloader();
    initScrollAnimations();
    initSkillsFilter();
    initTilt();
    initMagneticButtons();
    initSimulations();
    initContactUtilities();
    initNavSpy();
  });

})();

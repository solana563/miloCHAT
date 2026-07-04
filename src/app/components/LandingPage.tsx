import { useEffect, useRef, useState } from 'react';
import { Music, Mail, MessageCircle, ArrowRight, Menu, X } from 'lucide-react';

interface LandingPageProps {
  onOpenPlayer: () => void;
}

export function LandingPage({ onOpenPlayer }: LandingPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [heroReady, setHeroReady] = useState(false);
  const [clockLabel, setClockLabel] = useState('');
  const [showLoader, setShowLoader] = useState(true);
  const [navOpen, setNavOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [kbHintVisible, setKbHintVisible] = useState(false);
  const animationFrameRef = useRef<number>();
  const timeRef = useRef(0);

  // Canvas animation for hero background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    
    const resize = () => {
      const rect = canvas.parentElement;
      if (!rect) return;
      const w = Math.ceil(rect.offsetWidth * dpr);
      const h = Math.ceil(rect.offsetHeight * dpr);
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = rect.offsetWidth + 'px';
      canvas.style.height = rect.offsetHeight + 'px';
    };

    resize();
    const observer = new ResizeObserver(resize);
    if (canvas.parentElement) observer.observe(canvas.parentElement);

    const animate = (t: number) => {
      const time = t * 0.001;
      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;

      // Background
      const bg = ctx.createRadialGradient(cx, cy * 0.85, 0, cx, cy, Math.max(W, H) * 0.8);
      bg.addColorStop(0, 'rgba(18,10,4,1)');
      bg.addColorStop(0.5, 'rgba(8,5,2,1)');
      bg.addColorStop(1, 'rgba(3,3,3,1)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Frequency bars ring
      const barCount = 80;
      const barR = Math.min(W, H) * 0.26;
      for (let i = 0; i < barCount; i++) {
        const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2;
        const val = 0.06 + 0.05 * Math.sin(time * 1.3 + i * 0.22) + 0.03 * Math.sin(time * 2.1 + i * 0.09);
        const barH = val * Math.min(W, H) * 0.16 * dpr;
        const x1 = cx + Math.cos(angle) * barR;
        const y1 = cy + Math.sin(angle) * barR;
        const x2 = cx + Math.cos(angle) * (barR + barH);
        const y2 = cy + Math.sin(angle) * (barR + barH);
        const alpha = 0.12 + val * 0.65;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(207,128,71,${alpha})`;
        ctx.lineWidth = 2 * dpr;
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Inner subtle ring
      const pulse = 0.012 * Math.sin(time * 0.8);
      ctx.beginPath();
      ctx.arc(cx, cy, barR * (0.95 + pulse), 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(207,128,71,0.07)';
      ctx.lineWidth = 1 * dpr;
      ctx.stroke();

      // Logo
      const logoSize = Math.round(Math.min(W, H) * 0.32);
      const breathe = 0.02 * Math.sin(time * 0.6);
      const scale = 1 + breathe;
      const glowR = logoSize * scale * 0.55;
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      const glowA = 0.07 + 0.03 * Math.sin(time * 0.7);
      glow.addColorStop(0, `rgba(207,128,71,${glowA})`);
      glow.addColorStop(1, 'rgba(207,128,71,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);

      // Horizontal waveform at bottom
      const wY = H * 0.78;
      const wAmp = H * 0.04;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const nx = x / W;
        const wave = wAmp * (
          Math.sin(nx * Math.PI * 6 + time * 1.8) * 0.45 +
          Math.sin(nx * Math.PI * 14 - time * 2.4) * 0.3 +
          Math.sin(nx * Math.PI * 3 + time * 0.9) * 0.25
        );
        if (x === 0) ctx.moveTo(x, wY + wave);
        else ctx.lineTo(x, wY + wave);
      }
      const wg = ctx.createLinearGradient(0, 0, W, 0);
      wg.addColorStop(0, 'rgba(207,128,71,0)');
      wg.addColorStop(0.2, 'rgba(207,128,71,0.3)');
      wg.addColorStop(0.5, 'rgba(207,128,71,0.5)');
      wg.addColorStop(0.8, 'rgba(207,128,71,0.3)');
      wg.addColorStop(1, 'rgba(207,128,71,0)');
      ctx.strokeStyle = wg;
      ctx.lineWidth = 1.2 * dpr;
      ctx.stroke();

      timeRef.current = time;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    const updateClock = () => {
      const now = new Date();
      const time = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      const date = now.toLocaleDateString([], { month: 'short', day: 'numeric' });
      setClockLabel(`${time} · ${date}`);
    };

    updateClock();
    const clockTimer = window.setInterval(updateClock, 60000);

    const loaderTimer = window.setTimeout(() => setShowLoader(false), 1200);
    const hintTimer = window.setTimeout(() => setKbHintVisible(true), 1800);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setNavOpen(false);
        setModalOpen(false);
      }
      if (event.key === '/') {
        event.preventDefault();
        setModalOpen(true);
      }
      if (event.key.toLowerCase() === 'm') {
        event.preventDefault();
        setNavOpen(true);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    // Trigger reveal animations
    setTimeout(() => setHeroReady(true), 300);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.clearInterval(clockTimer);
      window.clearTimeout(loaderTimer);
      window.clearTimeout(hintTimer);
      window.removeEventListener('keydown', onKeyDown);
      observer.disconnect();
    };
  }, []);

  // Scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    document.querySelectorAll('.reveal-up').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full min-h-screen bg-white">
      <a href="#home" className="skip">Skip to content</a>

      {showLoader && (
        <div id="loader" className={showLoader ? '' : 'exit'}>
          <div className="loader-center">
            <div className="loader-brand">
              <Music className="w-8 h-8" />
              <span>MYLO</span>
            </div>
            <p className="loader-tag">Loading your personal listening space with the beta experience.</p>
            <div className="loader-progress" aria-hidden="true">
              <div className="loader-track">
                <div className="loader-fill" style={{ width: '100%' }} />
              </div>
              <div className="loader-meta">
                <span>Ready</span>
                <span className="loader-count">Beta</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div id="nav-overlay" className={navOpen ? 'open' : ''} aria-hidden={!navOpen}>
        <div className="nav-ov-head">
          <a href="#home" className="nav-ov-brand" onClick={() => setNavOpen(false)}>
            <Music className="w-7 h-7" />
            <span>MYLO</span>
          </a>
          <button className="nav-ov-close" onClick={() => setNavOpen(false)}>
            <X className="w-4 h-4" />
            <span>Close</span>
          </button>
        </div>
        <div className="nav-ov-body">
          <div className="nav-ov-links">
            <a href="#about" className="nav-ov-link" onClick={() => setNavOpen(false)}>About</a>
            <a href="#works" className="nav-ov-link" onClick={() => setNavOpen(false)}>Features</a>
            <a href="#services" className="nav-ov-link" onClick={() => setNavOpen(false)}>Plans</a>
            <a href="#stats" className="nav-ov-link" onClick={() => setNavOpen(false)}>Stats</a>
          </div>
        </div>
        <div className="nav-ov-foot">
          <div className="nav-ov-socials">
            <a href="#" onClick={() => { setNavOpen(false); setModalOpen(true); }}>Request access</a>
            <a href="#" onClick={() => { setNavOpen(false); onOpenPlayer(); }}>Open player</a>
          </div>
          <div className="nav-ov-legal">© 2025 MYLO</div>
        </div>
      </div>

      <div id="req-modal" className={modalOpen ? 'open' : ''} role="dialog" aria-modal="true" onClick={() => setModalOpen(false)}>
        <div className="modal-box" onClick={(event) => event.stopPropagation()}>
          <div className="modal-head">
            <div>
              <h2>Request early access</h2>
              <p>Join the beta and get the polished MYLO experience first.</p>
            </div>
            <button className="modal-close" onClick={() => setModalOpen(false)}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <form className="modal-form" onSubmit={(event) => {
            event.preventDefault();
            setFormSubmitted(true);
          }}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" placeholder="Alicia" required />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label htmlFor="note">What do you want from MYLO?</label>
              <textarea id="note" name="note" placeholder="Tell us what you want to hear, organize, or discover." />
            </div>
            <button type="submit" className="modal-submit">
              {formSubmitted ? 'Request sent' : 'Request access'}
            </button>
          </form>
        </div>
      </div>

      <div className={`kb-hint ${kbHintVisible ? 'show' : ''}`}>Press M for menu • Press / for early access</div>

      {/* HERO SECTION */}
      <section id="home" className="relative overflow-hidden bg-gray-900 min-h-screen">
        <canvas
          ref={canvasRef}
          className="hero-canvas"
          aria-hidden="true"
        />
        <div className="hero-vignette"></div>

        {/* Hero watermark */}
        <div className={`hero-wm ${heroReady ? 'ready' : ''}`}>MYLO</div>

        {/* Header */}
        <header className="absolute inset-x-0 top-0 z-50">
          <div className="header-inner max-w-7xl mx-auto">
            <a href="/" className="header-brand">
              <Music className="w-7 h-7 text-orange-600" />
              <span className="text-white font-semibold">MYLO</span>
            </a>
            <nav className="header-nav" aria-label="Primary">
              <ul>
                <li><a href="#about">About</a></li>
                <li><a href="#works">Features</a></li>
                <li><a href="#services">Plans</a></li>
                <li><a href="#stats">Stats</a></li>
              </ul>
            </nav>
            <div className="header-right">
              <div className="clock-chip" aria-label="Current time">
                <span className="clock-label">Local</span>
                <span className="clock-time">{clockLabel.split(' · ')[0] || 'Now'}</span>
                <span className="clock-sep">•</span>
                <span className="clock-date">{clockLabel.split(' · ')[1] || 'Today'}</span>
              </div>
              <button className="menu-btn" onClick={() => setModalOpen(true)}>
                <span>Request access</span>
              </button>
              <button className="menu-btn" onClick={() => setNavOpen(true)}>
                <Menu className="w-4 h-4" />
                <span>Menu</span>
              </button>
              <button
                onClick={onOpenPlayer}
                className="menu-btn"
              >
                <span>Open Player</span>
              </button>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="hero-content">
          <div className="hero-left">
            <div className={`hero-eyebrow ${heroReady ? 'ready' : ''}`}>
              <span className="eyebrow-dot"></span>
              <span>Your music, your way</span>
            </div>

            <h1 className={`hero-h1 ${heroReady ? 'ready' : ''}`}>
              My Music,<br />
              played<br />
              my way.
            </h1>

            <div className={`hero-rating ${heroReady ? 'ready' : ''}`}>
              <div className="hero-stars">★★★★★</div>
              <span className="hero-rating-text">Rated 4.9/5 by listeners</span>
            </div>

            <div className={`hero-ctas ${heroReady ? 'ready' : ''}`}>
              <button
                onClick={onOpenPlayer}
                className="btn btn-dark"
              >
                <Music className="w-4 h-4" />
                Open MYLO
              </button>
              <a href="#about" className="btn btn-outline">
                Learn more
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className={`hero-partners ${heroReady ? 'ready' : ''}`}>
              <div className="hp-label">Featured in</div>
              <div className="hp-grid">
                {['Studio Sessions', 'Night Mode', 'Loop Labs', 'Audio First'].map((name) => (
                  <div key={name} className="hp-item">{name}</div>
                ))}
              </div>
            </div>
          </div>

          {/* Hero Card */}
          <div className="hero-right">
            <div className={`hero-card ${heroReady ? 'ready' : ''}`}>
              <div className="hero-card-head">
                <span className="hero-card-label">Now Playing</span>
                <div className="hero-card-badge">
                  <span className="hcb-dot"></span>
                  <span>Live</span>
                </div>
              </div>

              <div className="hero-card-art">
                <img
                  id="card-art-bg"
                  src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=300&fit=crop"
                  alt="Album art"
                  className="absolute inset-0 w-full h-full object-cover"
                  onLoad={(e) => {
                    const el = e.currentTarget;
                    el.classList.add('loaded');
                  }}
                />
                <div className="hero-card-art-shade"></div>
                <div className="hero-card-art-inner">
                  <div className="eq-bar" style={{ '--d': '0.9s', '--mn': '20%', '--mx': '85%', '--dl': '0s' } as any}></div>
                  <div className="eq-bar" style={{ '--d': '1.1s', '--mn': '35%', '--mx': '100%', '--dl': '0.08s' } as any}></div>
                  <div className="eq-bar" style={{ '--d': '0.7s', '--mn': '50%', '--mx': '90%', '--dl': '0.16s' } as any}></div>
                  <div className="eq-bar" style={{ '--d': '1.3s', '--mn': '25%', '--mx': '95%', '--dl': '0.04s' } as any}></div>
                  <div className="eq-bar" style={{ '--d': '0.85s', '--mn': '40%', '--mx': '80%', '--dl': '0.22s' } as any}></div>
                </div>
              </div>

              <div className="hero-card-track">
                <div className="hero-card-thumb">
                  🎵
                </div>
                <div className="hero-card-info">
                  <div className="hci-title">MYLO Music Player</div>
                  <div className="hci-artist">Open to start listening</div>
                </div>
              </div>

              <div className="hero-card-controls">
                <button className="hcc-btn" onClick={onOpenPlayer}>
                  ◀
                </button>
                <button
                  className="hcc-btn play"
                  onClick={onOpenPlayer}
                >
                  ▶
                </button>
                <button className="hcc-btn" onClick={onOpenPlayer}>
                  ▶▶
                </button>
              </div>

              <div className="hero-card-prog">
                <div className="hcp-bar">
                  <div className="hcp-fill"></div>
                </div>
                <div className="hcp-times">
                  <span>0:00</span>
                  <span>0:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="shell py-20 md:py-24">
        <div className="about-inner">
          <div className="about-label-col">
            <div className="about-eyebrow">
              <div className="about-eyebrow-num">03</div>
              <span>About</span>
            </div>
            <div className="about-badge">
              <Music className="w-4 h-4" />
              Your library, your flow
            </div>
          </div>

          <div className="about-statement reveal-up">
            <p>
              MYLO turns your own music collection into a calm, focused listening space—without ads, noise, or compromise.
            </p>
          </div>
        </div>
      </section>

      <section id="band" className="shell my-8">
        <div className="band-inner">
          {['MYLO', 'YOUR MUSIC', 'YOUR WAY'].map((item) => (
            <div key={item} className="band-pill">
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="works" className="shell">
        <div className="section-head mb-12">
          <div>
            <div className="section-eyebrow">
              <div className="section-eyebrow-num">01</div>
              <span>Features</span>
            </div>
            <h2 className="section-title">Everything you love about music.</h2>
          </div>
        </div>

        <div className="works-grid">
          {[
            {
              icon: '🎵',
              title: 'Stream & Sync',
              desc: 'Stream unlimited music across all your devices with seamless sync.',
            },
            {
              icon: '❤️',
              title: 'Favorites',
              desc: 'Save your favorite tracks and build collections that matter to you.',
            },
            {
              icon: '🎧',
              title: 'High Quality',
              desc: 'Experience crystal-clear audio with lossless quality streaming.',
            },
            {
              icon: '🌍',
              title: 'Global Library',
              desc: 'Access millions of tracks from artists worldwide, instant access.',
            },
          ].map((card, i) => (
            <div key={i} className="reveal-up work-card">
              <div className="work-card-icon">{card.icon}</div>
              <div className="work-card-body">
                <h3 className="work-card-title">{card.title}</h3>
                <p className="work-card-desc">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="services">
        <div className="shell">
          <div className="section-head mb-8">
            <div>
              <div className="section-eyebrow">
                <div className="section-eyebrow-num">02</div>
                <span>Plans</span>
              </div>
              <h2 className="section-title">Simple, flexible pricing.</h2>
            </div>
          </div>

          <div className="services-list">
            {[
              {
                num: '01',
                name: 'Free',
                tags: ['Limited', 'Ad-supported', 'Standard audio'],
              },
              {
                num: '02',
                name: 'Premium',
                tags: ['$9.99/mo', 'Unlimited', 'Lossless audio'],
              },
              {
                num: '03',
                name: 'Family',
                tags: ['$16.99/mo', '6 accounts', 'All features'],
              },
              {
                num: '04',
                name: 'Student',
                tags: ['$4.99/mo', '50% off Premium', 'Verified'],
              },
            ].map((service, i) => (
              <div
                key={i}
                className="reveal-up service-row"
                style={{ transitionDelay: `${i * 60}ms` }}
              >
                <div className="service-left">
                  <span className="text-gray-500 text-sm font-semibold">{service.num}</span>
                  <span className="text-xl font-bold text-gray-900">{service.name}</span>
                </div>
                <div className="service-tags">
                  {service.tags.map((tag, j) => (
                    <span key={j} className="service-tag">{tag}</span>
                  ))}
                </div>
                <button className="service-arrow">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section id="stats" className="shell my-12">
        <div className="stats-head">
          <div className="section-eyebrow justify-center">
            <div className="section-eyebrow-num" style={{ borderColor: 'rgba(255,255,255,.15)', color: 'rgba(255,255,255,.35)' }}>04</div>
            <span style={{ color: 'rgba(255,255,255,.35)' }}>By the numbers</span>
          </div>
          <h2 className="stats-head-title">Music without limits.</h2>
        </div>

        <div className="stats-grid">
          {[
            { num: '50K+', label: 'Active Listeners', sub: 'and growing every day' },
            { num: '5M+', label: 'Tracks Available', sub: 'across every genre' },
            { num: '120+', label: 'Countries', sub: 'available worldwide' },
            { num: '4.9', label: 'App Rating', sub: 'from 12K+ reviews', suffix: '/5' },
          ].map((stat, i) => (
            <div key={i} className="reveal-up stat-item" style={{ transitionDelay: `${i * 70}ms` }}>
              <div className="stat-num">
                {stat.num}<span className="stat-suffix text-orange-500">{stat.suffix}</span>
              </div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-sub">{stat.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-top shell">
          <div className="footer-cta">
            <h2>Your music.<br />Your rules.<br />
              <span className="text-xs opacity-25 font-medium uppercase tracking-wider">No algorithms. No compromise.</span>
            </h2>
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={onOpenPlayer}
                className="btn btn-dark"
              >
                Get MYLO Free
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setModalOpen(true)}
                className="btn btn-outline"
              >
                Request access
              </button>
            </div>
          </div>
          <div className="footer-links">
            <div className="fl-col">
              <h4>Product</h4>
              <ul>
                <li><a href="#works">Features</a></li>
                <li><a href="#services">Pricing</a></li>
                <li><a href="#" onClick={onOpenPlayer}>Download</a></li>
                <li><a href="#">What's New</a></li>
              </ul>
            </div>
            <div className="fl-col">
              <h4>Company</h4>
              <ul>
                <li><a href="#">About</a></li>
                <li><a href="#">Blog</a></li>
                <li><a href="#">Careers</a></li>
                <li><a href="#">Press</a></li>
              </ul>
            </div>
            <div className="fl-col">
              <h4>Support</h4>
              <ul>
                <li><a href="#">Help Center</a></li>
                <li><a href="#">Community</a></li>
                <li><a href="#">Privacy</a></li>
                <li><a href="#">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-brand">
            <Music className="w-5 h-5 text-orange-600" />
            MYLO Music
          </div>
          <div className="footer-social">
            <a href="https://instagram.com" className="social-pill" target="_blank" rel="noopener">
              <span>Instagram</span>
            </a>
            <a href="mailto:hello@mylo.music" className="social-pill">
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </a>
            <a href="https://wa.me/1234567890" className="social-pill" target="_blank" rel="noopener">
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>
          </div>
          <p className="text-gray-500 text-xs">© 2025 MYLO Music</p>
        </div>
      </footer>
    </div>
  );
}

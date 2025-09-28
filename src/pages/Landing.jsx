import { useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useScroll, useTransform, useAnimation } from "framer-motion";

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const glowOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.25]);
  const carouselControls = useAnimation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div>
      <section className="hero-section">
        <motion.div className="hero-content" style={{ y: heroY }}>
          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          >
            Predict the future
            <br />
            Own the outcome
          </motion.h1>
          <motion.p
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.9, ease: "easeOut" }}
          >
            A permissionless, decentralized prediction market built for Degens.
            Create markets, stake outcomes, and earn for being right.
          </motion.p>
          {/* <motion.div className="hero-cta" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <Link to="/markets" className="btn btn-primary">Enter Markets</Link>
            <a href="#how" className="btn btn-outline">How it works</a>
          </motion.div> */}
        </motion.div>
        <motion.div className="hero-glow" style={{ opacity: glowOpacity }} />
      </section>

      <section className="carousel-section" aria-label="Trending Questions">
        <motion.h2
          className="section-title"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Trending Markets
        </motion.h2>
        <div
          className="carousel-viewport"
          onMouseEnter={() => carouselControls.stop()}
          onMouseLeave={() =>
            carouselControls.start({
              x: ["0%", "-50%"],
              transition: { duration: 24, ease: "linear", repeat: Infinity },
            })
          }
        >
          <motion.div
            className="carousel-track"
            animate={carouselControls}
            initial={{ x: "0%" }}
            onViewportEnter={() =>
              carouselControls.start({
                x: ["0%", "-50%"],
                transition: { duration: 24, ease: "linear", repeat: Infinity },
              })
            }
          >
            {[
              {
                question: "Bitcoin above 110,000$ on September 30, 2025?",
                image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=480&auto=format&fit=crop",
                category: "Crypto"
              },
              {
                question: "Will Trump pardon SBF?",
                image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=480&auto=format&fit=crop",
                category: "Politics"
              },
              {
                question: "Kraken IPO in 2025?",
                image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=480&auto=format&fit=crop",
                category: "Finance"
              },
              {
                question: "Will India win the T20 World Cup in 2026?",
                image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=480&auto=format&fit=crop",
                category: "Sports"
              },
              {
                question: "Will Solana make a new ATH before 2026?",
                image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=480&auto=format&fit=crop",
                category: "Crypto"
              },
              {
                question: "Monad token before Nov 2026?",
                image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=480&auto=format&fit=crop",
                category: "Crypto"
              },
              {
                question: "Cardano to fall out of top 10 by 2026?",
                image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=480&auto=format&fit=crop",
                category: "Crypto"
              },
              {
                question: "Global climate deal signed by G20 in 2026?",
                image: "https://images.unsplash.com/photo-1569163139394-de446e504f7b?q=80&w=480&auto=format&fit=crop",
                category: "Environment"
              },
              {
                question: "Tesla stock to cross $2,000 before 2027?",
                image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=480&auto=format&fit=crop",
                category: "Stocks"
              },
            ]
              .concat([
                {
                  question: "Bitcoin above 110,000$ on September 30, 2025?",
                  image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=480&auto=format&fit=crop",
                  category: "Crypto"
                },
                {
                  question: "Will Trump pardon SBF?",
                  image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=480&auto=format&fit=crop",
                  category: "Politics"
                },
                {
                  question: "Kraken IPO in 2025?",
                  image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=480&auto=format&fit=crop",
                  category: "Finance"
                },
                {
                  question: "Will India win the T20 World Cup in 2026?",
                  image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=480&auto=format&fit=crop",
                  category: "Sports"
                },
                {
                  question: "Will Solana make a new ATH before 2026?",
                  image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=480&auto=format&fit=crop",
                  category: "Crypto"
                },
                {
                  question: "Monad token before Nov 2026?",
                  image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=480&auto=format&fit=crop",
                  category: "Crypto"
                },
                {
                  question: "Cardano to fall out of top 10 by 2026?",
                  image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=480&auto=format&fit=crop",
                  category: "Crypto"
                },
                {
                  question: "Global climate deal signed by G20 in 2026?",
                  image: "https://images.unsplash.com/photo-1569163139394-de446e504f7b?q=80&w=480&auto=format&fit=crop",
                  category: "Environment"
                },
                {
                  question: "Tesla stock to cross $2,000 before 2027?",
                  image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=480&auto=format&fit=crop",
                  category: "Stocks"
                },
              ])
              .map((item, i) => (
                <div key={i} className="carousel-card glass-card" aria-hidden>
                  <div className="carousel-image-container">
                    <img
                      className="carousel-image"
                      src={item.image}
                      alt={`${item.category} market`}
                      loading="lazy"
                    />
                    <div className="carousel-category">{item.category}</div>
                  </div>
                  <div className="carousel-question">{item.question}</div>
                  <div className="carousel-options">
                    <span className="pill pill-yes">Yes</span>
                    <span className="pill pill-no">No</span>
                  </div>
                </div>
              ))}
          </motion.div>
        </div>
      </section>

      

      <section id="how" className="features-section">
        <div className="features-grid">
          {[
            {
              title: "Permissionless",
              desc: "Anyone can create markets. No approvals, no gatekeepers.",
              icon: "🔓",
            },
            {
              title: "On-chain Finality",
              desc: "Transparent smart contracts settle outcomes trustlessly.",
              icon: "⛓️",
            },
            {
              title: "Fair Economics",
              desc: "Stake either side, earn proportionally to being right.",
              icon: "⚖️",
            },
            // { title: 'Sleek UX', desc: 'Minimal, fast, motion-first interface for pros and newcomers.', icon: '✨' },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              className="feature-card glass-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{
                delay: 0.1 * i,
                type: "spring",
                stiffness: 120,
                damping: 18,
              }}
            >
              <div className="feature-icon">{f.icon}</div>
              <div className="feature-title">{f.title}</div>
              <div className="feature-desc">{f.desc}</div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, BarChart, Users, Calendar, Sparkles, Download } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import './landing.css';

const features = [
  { icon: Star, title: 'Rate Everything', desc: 'Keep track of what you loved and what you hated with our nuanced rating system.' },
  { icon: BarChart, title: 'Beautiful Statistics', desc: 'Visualize your viewing habits with deep, insightful analytics and charts.' },
  { icon: Users, title: 'Social Profiles', desc: 'Follow friends, compare tastes, and see what everyone is watching right now.' },
  { icon: Calendar, title: 'Release Calendar', desc: 'Never miss an episode. Track upcoming releases for all your favorite shows.' },
  { icon: Sparkles, title: 'AI Recommendations', desc: 'Get personalized suggestions based on your unique taste profile, not just popularity.' },
  { icon: Download, title: 'Import Libraries', desc: 'Seamlessly migrate your data from Letterboxd, MyAnimeList, Trakt, and more.' }
];

export function LandingPage() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, -200]);
  const y2 = useTransform(scrollY, [0, 1000], [0, 200]);

  return (
    <div style={{ background: 'var(--bg-primary)' }}>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg" />
        
        <div className="floating-posters">
          <motion.div style={{ y: y1, top: '10%', left: '15%', rotate: -15 }} className="poster-card">
            <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=300&q=80" alt="Movie" />
          </motion.div>
          <motion.div style={{ y: y2, top: '60%', right: '15%', rotate: 10 }} className="poster-card">
            <img src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&w=300&q=80" alt="Movie" />
          </motion.div>
          <motion.div style={{ y: y1, top: '20%', right: '25%', rotate: 5 }} className="poster-card">
            <img src="https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=300&q=80" alt="Anime" />
          </motion.div>
        </div>

        <motion.div 
          className="hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: 'spring' }}
        >
          <div style={{ padding: '8px 16px', background: 'var(--glass-bg)', border: '1px solid var(--border)', borderRadius: 999, fontSize: '0.875rem', fontWeight: 500, marginBottom: '1rem', backdropFilter: 'blur(10px)' }}>
            <Sparkles size={14} style={{ display: 'inline', marginRight: 8, color: 'var(--accent)' }}/>
            Introducing TrackerPro 2.0
          </div>
          
          <h1 className="hero-title">
            Track Every <br />
            <span className="text-gradient">Story You Love.</span>
          </h1>
          
          <p className="hero-subtitle">
            One beautiful home for movies, TV shows, anime, K-dramas, and everything you watch. Experience entertainment tracking like never before.
          </p>
          
          <div className="hero-actions">
            <Button 
              variant="accent" 
              style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
              onClick={() => navigate('/dashboard')}
            >
              Get Started <ArrowRight size={20} />
            </Button>
            <Button 
              variant="secondary" 
              style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
              onClick={() => navigate('/dashboard')}
            >
              View Demo
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '1rem' }}>Everything you need.</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>Powerful features wrapped in an elegant interface.</p>
        </div>
        
        <div className="features-grid">
          {features.map((feat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
            >
              <Card glass className="feature-card">
                <div className="feature-icon-wrapper">
                  <feat.icon size={24} />
                </div>
                <h3 className="feature-title">{feat.title}</h3>
                <p className="feature-desc">{feat.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* Simple Footer */}
      <footer style={{ padding: '4rem 2rem', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <p>© 2026 TrackerPro. Crafted with care.</p>
      </footer>
    </div>
  );
}

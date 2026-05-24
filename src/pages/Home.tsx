import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiStar, FiArrowRight, FiFeather } from 'react-icons/fi';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar/Sidebar';
import Feed from '../components/Feed/Feed';
import {
  getRecommendations,
  type RecommendedGame,
} from '../api/recommendations';
import { renderStars } from '../utils/renderStars';
import { motion, type Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const Home = () => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<RecommendedGame[]>([]);
  const [personalized, setPersonalized] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadRecommendations = async () => {
      setLoading(true);
      try {
        const data = await getRecommendations(6);
        if (!mounted) return;
        setRecommendations(data.data);
        setPersonalized(data.personalized);
      } catch (err) {
        if (!mounted) return;
        console.error('Failed to load recommendations:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadRecommendations();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="bg-zinc-950 h-screen overflow-hidden">
      <Header />
      <div className="flex h-[calc(100vh-76px)] overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto flex flex-col px-4 md:px-8 pt-8 pb-6 gap-8 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-zinc-800">
          <motion.div
            className="max-w-2xl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={itemVariants}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/5 px-4 py-2 text-sm text-zinc-300"
            >
              <FiFeather className="text-violet-300" size={14} />
              <span>Feed</span>
            </motion.div>
            <motion.h1
              variants={itemVariants}
              className="font-google text-4xl font-semibold tracking-tight text-white sm:text-5xl"
            >
              Stay updated with your community
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="mt-4 max-w-xl text-base leading-7 text-zinc-400"
            >
              Follow your favorite gamers, read reviews, and discover what's
              trending in your gaming community.
            </motion.p>
          </motion.div>
          <motion.div
            className="flex flex-col lg:flex-row gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="flex-1 min-w-0">
              <Feed />
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="w-full lg:w-80 flex flex-col gap-4 h-fit"
            >
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col">
                <div className="p-4 border-b border-zinc-800">
                  <div className="flex items-center gap-2 mb-2">
                    <FiStar className="text-violet-400" size={16} />
                    <h3 className="text-white font-semibold text-sm">
                      Recommendations
                    </h3>
                  </div>
                  <p className="text-xs text-zinc-400">
                    {personalized ? 'For you' : 'Popular picks'}
                  </p>
                </div>

                {loading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="bg-zinc-800 h-24 rounded-lg animate-shimmer"
                      />
                    ))}
                  </div>
                ) : recommendations.length > 0 ? (
                  <motion.div
                    className="p-4 space-y-3"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {recommendations.map((game) =>
                      (() => {
                        const score = game.score ?? 0;
                        const rating = game.rating ?? 0;

                        return (
                          <motion.div
                            key={game.id}
                            variants={itemVariants}
                            onClick={() => navigate(`/games/${game.id}`)}
                            whileHover={{ x: 3 }}
                            transition={{
                              type: 'spring',
                              stiffness: 400,
                              damping: 20,
                            }}
                            className="group cursor-pointer"
                          >
                            <div className="relative h-20 overflow-hidden bg-zinc-800 rounded-lg mb-2">
                              <img
                                src={game.background_image ?? undefined}
                                alt={game.name}
                                loading="lazy"
                                decoding="async"
                                width={300}
                                height={80}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-linear-to-t from-zinc-900 to-transparent" />
                              <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                <span>📈</span>
                                <span>{Math.round(score * 100)}%</span>
                              </div>
                            </div>
                            <p className="text-xs font-semibold text-white truncate group-hover:text-violet-400 transition">
                              {game.name}
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              {renderStars(rating)}
                              <span className="text-[10px] text-zinc-400 ml-1">
                                {rating.toFixed(1)}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })(),
                    )}
                  </motion.div>
                ) : null}

                <div className="p-4 border-t border-zinc-800">
                  <motion.button
                    onClick={() => navigate('/recommendations')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center justify-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold py-2 rounded-lg transition"
                  >
                    View All
                    <FiArrowRight size={14} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Home;

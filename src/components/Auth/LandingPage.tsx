import { motion } from 'framer-motion';
import { Layout, LogIn, UserPlus, ArrowRight, ShieldCheck, Zap, Globe } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
  onSignUp: () => void;
  onContinueAsGuest: () => void;
}

export default function LandingPage({ onLogin, onSignUp, onContinueAsGuest }: LandingPageProps) {
  return (
    <div className="fixed inset-0 z-[150] bg-background overflow-y-auto lg:overflow-hidden h-screen custom-scrollbar">
      <div className="min-h-full lg:h-full w-full flex flex-col items-center justify-start lg:justify-center relative px-6 py-8 lg:py-0">
        
        {/* Animated Background Glows */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div 
            animate={{ 
              scale: [1, 1.4, 1],
              x: [-100, 100, -100],
              y: [-100, 50, -100]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] bg-primary/20 blur-[150px] rounded-full"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              x: [100, -100, 100],
              y: [100, -50, 100]
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] bg-purple-500/10 blur-[150px] rounded-full"
          />
        </div>

        <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-8 lg:mb-12"
          >
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-primary rounded-[1.25rem] lg:rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-primary/40">
              <Layout className="w-6 h-6 lg:w-8 lg:h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-4xl font-black tracking-tighter">DevDown</h1>
              <p className="text-[10px] font-bold text-primary tracking-[0.3em] uppercase">Premium Markdown</p>
            </div>
          </motion.div>

          {/* Hero Section */}
          <div className="text-center mb-8 md:mb-12 max-w-2xl">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 lg:mb-6 leading-[0.95]"
            >
              Your thoughts, <br/>
              <span className="text-primary">perfectly synced.</span>
            </motion.h2 >
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base md:text-lg text-muted-foreground font-medium"
            >
              A high-performance markdown editor designed for developers. <br className="hidden md:block"/>
              Sync to your private cloud or keep it local. You decide.
            </motion.p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            <ActionCard 
              delay={0.3}
              icon={UserPlus} 
              title="Get Started" 
              description="Create an account to sync your notes to Google Drive."
              onClick={onSignUp}
              primary
            />
            <ActionCard 
              delay={0.4}
              icon={LogIn} 
              title="Sign In" 
              description="Already have an account? Log back in here."
              onClick={onLogin}
            />
            <ActionCard 
              delay={0.5}
              icon={Zap} 
              title="Guest Mode" 
              description="No account? No problem. Store everything locally."
              onClick={onContinueAsGuest}
            />
          </div>

          {/* Features Minimalist */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-10 lg:mt-20 flex flex-wrap justify-center gap-6 md:gap-12 opacity-50"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> Privacy First
            </div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              <Globe className="w-4 h-4" /> Cloud Sync
            </div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              <Zap className="w-4 h-4" /> Blazing Fast
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, title, description, onClick, primary = false, delay = 0 }: any) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className={`
        relative group p-8 rounded-[2rem] text-left transition-all duration-500
        ${primary 
          ? 'bg-primary text-primary-foreground shadow-[0_20px_50px_rgba(var(--primary-rgb),0.3)] hover:scale-[1.02]' 
          : 'bg-card/50 backdrop-blur-xl border border-border/50 hover:bg-card hover:scale-[1.02]'}
      `}
    >
      <div className={`
        w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110
        ${primary ? 'bg-white/20' : 'bg-primary/10 text-primary'}
      `}>
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-xl font-black mb-2">{title}</h3>
      <p className={`text-sm font-medium leading-relaxed ${primary ? 'opacity-80' : 'text-muted-foreground'}`}>
        {description}
      </p>
      <div className={`
        mt-6 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all
        ${primary ? 'text-white' : 'text-primary opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0'}
      `}>
        Continue <ArrowRight className="w-3 h-3" />
      </div>
    </motion.button>
  );
}

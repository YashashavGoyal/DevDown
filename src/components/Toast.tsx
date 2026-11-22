import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export interface ToastMessage {
  id: string;
  icon?: LucideIcon;
  title: string;
  description?: string;
  badge?: string;
}

interface ToastProps {
  toast: ToastMessage | null;
}

export const Toast: React.FC<ToastProps> = ({ toast }) => {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[300] pointer-events-none flex flex-col items-center">
      <AnimatePresence mode="wait">
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-2xl",
              "bg-card/90 dark:bg-card/90 backdrop-blur-xl border border-border/80 shadow-2xl",
              "text-foreground text-sm font-medium"
            )}
          >
            {toast.icon && (
              <div className="p-1.5 rounded-xl bg-primary/10 text-primary shrink-0 flex items-center justify-center">
                <toast.icon className="w-4 h-4" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-semibold text-xs sm:text-sm">{toast.title}</span>
              {toast.description && (
                <span className="text-[11px] text-muted-foreground">{toast.description}</span>
              )}
            </div>
            {toast.badge && (
              <span className="ml-2 px-1.5 py-0.5 rounded-md bg-muted border border-border/50 text-[10px] font-mono text-muted-foreground">
                {toast.badge}
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Toast;


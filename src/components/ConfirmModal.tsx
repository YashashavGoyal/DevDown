import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface ConfirmModalProps {
  title: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  danger?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ 
  title, 
  description, 
  onConfirm, 
  onCancel, 
  confirmLabel = "Confirm",
  danger = false 
}) => (
  <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
    {/* Backdrop */}
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      onClick={onCancel} 
      className="absolute inset-0 bg-background/60 backdrop-blur-sm" 
    />
    
    {/* Modal */}
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative w-full max-w-sm bg-card border border-border rounded-3xl p-8 shadow-2xl space-y-6"
    >
      <div className="text-center space-y-2">
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={onCancel} 
          className="p-3 bg-muted rounded-2xl font-bold text-sm tracking-tight hover:bg-muted/80 transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={onConfirm}
          className={cn(
            "p-3 rounded-2xl font-bold text-sm tracking-tight text-white transition-opacity hover:opacity-90 shadow-lg",
            danger ? "bg-destructive shadow-destructive/20" : "bg-primary shadow-primary/20"
          )}
        >
          {confirmLabel}
        </button>
      </div>
    </motion.div>
  </div>
);

export default ConfirmModal;

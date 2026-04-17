import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Settings, Monitor, Type, 
  Database, Keyboard, Download, 
  Upload, Trash2, Maximize2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { type AppSettings } from '../hooks/useSettings';
import { type Document } from './Sidebar';
import JSZip from 'jszip';
import ConfirmModal from './ConfirmModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
  documents: Document[];
  onImport: (docs: Document[]) => void;
}

type Tab = 'general' | 'appearance' | 'data' | 'shortcuts';

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  settings, 
  updateSettings, 
  resetSettings,
  documents,
  onImport
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showZenConfirm, setShowZenConfirm] = useState(false);

  const handleExportJSON = () => {
    const data = JSON.stringify(documents, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devdown-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportZIP = async () => {
    const zip = new JSZip();
    const usedFilenames = new Set<string>();

    documents.forEach(doc => {
      let baseName = (doc.title || 'Untitled').replace(/[/\\?%*:|"<>]/g, '-');
      let filename = `${baseName}.md`;
      let counter = 1;

      while (usedFilenames.has(filename.toLowerCase())) {
        filename = `${baseName}-${counter}.md`;
        counter++;
      }
      
      usedFilenames.add(filename.toLowerCase());
      zip.file(filename, doc.content);
    });

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devdown-notes-${new Date().toISOString().split('T')[0]}.zip`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (Array.isArray(data)) {
          onImport(data);
          alert('Import successful!');
        }
      } catch (err) {
        alert('Failed to parse import file.');
      }
    };
    reader.readAsText(file);
  };

  const handleZenToggle = () => {
    if (!settings.zenMode) {
      setShowZenConfirm(true);
    } else {
      updateSettings({ zenMode: false });
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-background/80 backdrop-blur-md"
        />

        {/* Modal */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-card border border-border shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">Settings</h2>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Personalize your experience</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Tabs Sidebar */}
            <div className="w-48 border-r border-border/50 p-4 space-y-1 bg-muted/10 hidden sm:block">
              <TabButton active={activeTab === 'general'} onClick={() => setActiveTab('general')} icon={Monitor} label="General" />
              <TabButton active={activeTab === 'appearance'} onClick={() => setActiveTab('appearance')} icon={Type} label="Appearance" />
              <TabButton active={activeTab === 'data'} onClick={() => setActiveTab('data')} icon={Database} label="Data" />
              <TabButton active={activeTab === 'shortcuts'} onClick={() => setActiveTab('shortcuts')} icon={Keyboard} label="Shortcuts" />
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {activeTab === 'general' && (
                <div className="space-y-8">
                  <Section title="Zen Mode">
                    <div className="flex items-center justify-between p-4 glass-inset rounded-2xl bg-muted/20">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-semibold flex items-center gap-2 italic">
                           <Maximize2 className="w-4 h-4 text-primary" /> Distraction-Free Writing
                        </span>
                        <p className="text-xs text-muted-foreground italic">Exit Zen Mode by pressing <kbd className="px-1.5 py-0.5 bg-muted rounded border border-border text-[10px] font-mono">ESC</kbd></p>
                      </div>
                      <Switch checked={settings.zenMode} onChange={handleZenToggle} />
                    </div>
                  </Section>

                  <Section title="Editor Behavior">
                    <SettingToggle 
                      label="Line Numbers" 
                      description="Show line numbers on the left gutter"
                      checked={settings.lineNumbers} 
                      onChange={(val) => updateSettings({ lineNumbers: val })} 
                    />
                    <SettingToggle 
                      label="Line Wrapping" 
                      description="Wrap long lines instead of scrolling horizontally"
                      checked={settings.lineWrapping} 
                      onChange={(val) => updateSettings({ lineWrapping: val })} 
                    />
                  </Section>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-8">
                  <Section title="Typography">
                    <div className="space-y-4">
                       <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">Font Size</label>
                       <div className="flex items-center gap-4">
                          <input 
                            type="range" min="12" max="24" step="1" 
                            value={settings.fontSize} 
                            onChange={(e) => updateSettings({ fontSize: parseInt(e.target.value) })}
                            className="flex-1 h-1.5 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                          />
                          <span className="text-sm font-mono w-8">{settings.fontSize}px</span>
                       </div>
                    </div>

                    <div className="space-y-4 pt-4">
                       <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground block">Font Family</label>
                       <div className="grid grid-cols-3 gap-2">
                          <FontOption 
                            active={settings.fontFamily === 'sans'} 
                            onClick={() => updateSettings({ fontFamily: 'sans' })}
                            label="Inter" fontClass="font-sans"
                          />
                          <FontOption 
                             active={settings.fontFamily === 'serif'} 
                             onClick={() => updateSettings({ fontFamily: 'serif' })}
                             label="Georgia" fontClass="font-serif"
                          />
                          <FontOption 
                             active={settings.fontFamily === 'mono'} 
                             onClick={() => updateSettings({ fontFamily: 'mono' })}
                             label="Mono" fontClass="font-mono"
                          />
                       </div>
                    </div>
                  </Section>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="space-y-8">
                  <Section title="Backup & Restore">
                    <div className="grid grid-cols-1 gap-3">
                      <DataAction icon={Download} title="Export as JSON" description="Backup your app state for restoration later" onClick={handleExportJSON} />
                      <DataAction icon={Download} title="Export as ZIP" description="Port your notes to other editors like Obsidian" onClick={handleExportZIP} highlight />
                      <label className="relative flex items-center gap-4 p-4 rounded-2xl hover:bg-muted/50 border border-border/50 cursor-pointer transition-all group">
                        <div className="p-2.5 bg-muted rounded-xl text-muted-foreground group-hover:text-primary transition-colors">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-sm font-semibold">Import Backup</p>
                          <p className="text-[11px] text-muted-foreground">Restore from a previously saved JSON file</p>
                        </div>
                        <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
                      </label>
                    </div>
                  </Section>

                  <Section title="Danger Zone">
                     <button 
                       onClick={() => setShowResetConfirm(true)}
                       className="w-full flex items-center gap-4 p-4 rounded-2xl bg-destructive/5 hover:bg-destructive/10 border border-destructive/20 text-destructive transition-all group"
                     >
                        <Trash2 className="w-5 h-5" />
                        <div className="text-left">
                          <p className="text-sm font-bold">Reset Application</p>
                          <p className="text-[11px] opacity-70">Wipe all notes and settings. This cannot be undone.</p>
                        </div>
                     </button>
                  </Section>
                </div>
              )}

              {activeTab === 'shortcuts' && (
                <div className="space-y-6">
                  <Section title="Keyboard Shortcuts">
                    <div className="space-y-2">
                      <ShortcutItem keys={['Mod', '/']} label="Focus Search" />
                      <ShortcutItem keys={['Mod', 'P']} label="Quick Open Switcher" />
                      <ShortcutItem keys={['Mod', 'B']} label="Bold Text" />
                      <ShortcutItem keys={['Mod', 'I']} label="Italic Text" />
                      <ShortcutItem keys={['Mod', 'K']} label="Insert Link" />
                      <ShortcutItem keys={['Mod', 'Shift', 'K']} label="Insert Code" />
                      <ShortcutItem keys={['Mod', 'Q']} label="Blockquote" />
                      <ShortcutItem keys={['Esc']} label="Exit Zen Mode / Close Modals" />
                    </div>
                  </Section>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Nested Confirmations */}
        <AnimatePresence>
          {showResetConfirm && (
            <ConfirmModal 
              title="Reset Everything?"
              description="This will permanently delete all your notes and settings. All data currently stored in LocalStorage will be lost forever."
              confirmLabel="Reset All"
              onConfirm={() => { resetSettings(); localStorage.clear(); window.location.reload(); }}
              onCancel={() => setShowResetConfirm(false)}
              danger
            />
          )}

          {showZenConfirm && (
            <ConfirmModal 
              title="Enter Zen Mode?"
              description="Zen Mode will hide all UI clutter like the sidebar and headers to help you focus. You can press ESC anytime to exit."
              onConfirm={() => { updateSettings({ zenMode: true }); setShowZenConfirm(false); }}
              onCancel={() => setShowZenConfirm(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  );
};

// --- Sub-components ---

const TabButton = ({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: React.ComponentType<any>, label: string }) => (
  <button 
    onClick={onClick}
    className={cn(
      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
      active 
        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
        : "text-muted-foreground hover:bg-muted"
    )}
  >
    <Icon className="w-4 h-4" />
    {label}
  </button>
);

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="space-y-4">
    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 px-1">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const SettingToggle = ({ label, description, checked, onChange }: { label: string, description: string, checked: boolean, onChange: (val: boolean) => void }) => (
  <div className="flex items-center justify-between p-4 rounded-2xl hover:bg-muted/40 border border-border/10 transition-colors">
    <div>
      <p className="text-sm font-semibold">{label}</p>
      <p className="text-[11px] text-muted-foreground">{description}</p>
    </div>
    <Switch checked={checked} onChange={onChange} />
  </div>
);

const Switch = ({ checked, onChange }: { checked: boolean, onChange: (val: boolean) => void }) => (
  <button 
    onClick={() => onChange(!checked)}
    className={cn(
      "w-10 h-5 rounded-full transition-colors relative",
      checked ? "bg-primary" : "bg-muted-foreground/30"
    )}
  >
    <motion.div 
      initial={false}
      animate={{ x: checked ? 22 : 2 }}
      className="absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm"
    />
  </button>
);

const FontOption = ({ active, onClick, label, fontClass }: { active: boolean, onClick: () => void, label: string, fontClass: string }) => (
  <button 
    onClick={onClick}
    className={cn(
      "p-3 rounded-xl border flex flex-col items-center gap-2 transition-all",
      active ? "border-primary bg-primary/5 text-primary" : "border-border/50 hover:border-border text-muted-foreground"
    )}
  >
    <span className={cn("text-lg", fontClass)}>Aa</span>
    <span className="text-[10px] font-bold uppercase">{label}</span>
  </button>
);

const DataAction = ({ icon: Icon, title, description, onClick, highlight = false }: { icon: React.ComponentType<any>, title: string, description: string, onClick: () => void, highlight?: boolean }) => (
  <button 
    onClick={onClick}
    className={cn(
      "flex items-center gap-4 p-4 rounded-2xl border transition-all group",
      highlight ? "bg-primary/5 border-primary/20 hover:bg-primary/10" : "hover:bg-muted/50 border-border/50"
    )}
  >
    <div className={cn(
      "p-2.5 rounded-xl transition-colors",
      highlight ? "bg-primary text-primary" : "bg-muted text-muted-foreground group-hover:text-primary"
    )}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1 text-left">
      <p className="text-sm font-semibold">{title}</p>
      <p className="text-[11px] text-muted-foreground">{description}</p>
    </div>
  </button>
);

const ShortcutItem = ({ keys, label }: { keys: string[], label: string }) => (
  <div className="flex items-center justify-between p-3 px-4 rounded-xl bg-muted/20 border border-border/10">
    <span className="text-xs font-medium">{label}</span>
    <div className="flex items-center gap-1">
      {keys.map(k => (
        <kbd key={k} className="px-1.5 py-0.5 min-w-[1.5rem] text-center bg-card rounded border border-border shadow-sm text-[10px] font-mono text-muted-foreground">
          {k === 'Mod' ? (navigator.platform.includes('Mac') ? '⌘' : 'Ctrl') : k}
        </kbd>
      ))}
    </div>
  </div>
);


export default SettingsModal;

import { useEffect } from 'react';
import { type MarkdownAction } from '../components/Toolbar';

interface UseKeyboardShortcutsProps {
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isQuickOpenOpen: boolean;
  setIsQuickOpenOpen: (open: boolean) => void;
  zenMode: boolean;
  updateSettings: (updates: { zenMode: boolean }) => void;
  setIsSidebarOpen: (open: boolean | ((prev: boolean) => boolean)) => void;
  sidebarRef: React.RefObject<any>;
  editorViewRef: React.RefObject<any>;
  createNewDoc: () => void;
  deleteDoc: (id: string) => void;
  activeId: string;
  setViewMode: React.Dispatch<React.SetStateAction<'split' | 'edit' | 'view'>>;
  handleShare: () => void;
  handleToolbarAction: (action: MarkdownAction) => void;
}

export function useKeyboardShortcuts({
  isSettingsOpen,
  setIsSettingsOpen,
  isQuickOpenOpen,
  setIsQuickOpenOpen,
  zenMode,
  updateSettings,
  setIsSidebarOpen,
  sidebarRef,
  editorViewRef,
  createNewDoc,
  deleteDoc,
  activeId,
  setViewMode,
  handleShare,
  handleToolbarAction,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const isMod = (navigator.platform.includes('Mac') ? e.metaKey : e.ctrlKey);

      if (e.key === 'Escape') {
        if (isSettingsOpen) setIsSettingsOpen(false);
        if (isQuickOpenOpen) setIsQuickOpenOpen(false);
        if (zenMode) updateSettings({ zenMode: false });
      }

      // Mod+Shift+F: Focus Sidebar Search (Ctrl/⌘ + Shift + F)
      if (isMod && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsSidebarOpen(true);
        setTimeout(() => sidebarRef.current?.focusSearch(), 100);
      }

      // Mod+P: Quick Open Switcher
      if (isMod && !e.shiftKey && !e.altKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsQuickOpenOpen(true);
      }

      // Alt+Shift+N: Create New Note
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        createNewDoc();
      }

      // Alt+Shift+D: Delete Current Note
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        deleteDoc(activeId);
      }

      // Alt+Shift+Z: Toggle Zen Mode
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        updateSettings({ zenMode: !zenMode });
      }

      // Alt+Shift+V: Cycle View Mode
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'v') {
        e.preventDefault();
        setViewMode(current => {
          if (current === 'split') return 'edit';
          if (current === 'edit') return 'view';
          return 'split';
        });
      }

      // Mod+\: Toggle Sidebar
      if (isMod && e.key === '\\') {
        e.preventDefault();
        setIsSidebarOpen(current => !current);
      }

      // Mod+,: Open Settings Modal
      if (isMod && e.key === ',') {
        e.preventDefault();
        setIsSettingsOpen(true);
      }

      // Alt+Shift+C: Share / Copy Note
      if (e.altKey && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleShare();
      }

      // Editor Formatting Shortcuts (Only when editor has focus)
      const isEditorFocused = editorViewRef.current?.hasFocus;
      if (isEditorFocused) {
        // Heading 1: Alt+Shift+1
        if (e.altKey && e.shiftKey && (e.key === '1' || e.code === 'Digit1')) {
          e.preventDefault();
          handleToolbarAction('heading1');
        }

        // Heading 2: Alt+Shift+2
        if (e.altKey && e.shiftKey && (e.key === '2' || e.code === 'Digit2')) {
          e.preventDefault();
          handleToolbarAction('heading2');
        }

        // Bullet List: Alt+Shift+L
        if (e.altKey && e.shiftKey && (e.key.toLowerCase() === 'l' || e.code === 'KeyL')) {
          e.preventDefault();
          handleToolbarAction('list');
        }

        // Numbered List: Alt+Shift+O
        if (e.altKey && e.shiftKey && (e.key.toLowerCase() === 'o' || e.code === 'KeyO')) {
          e.preventDefault();
          handleToolbarAction('list-ordered');
        }

        // Table: Alt+Shift+T
        if (e.altKey && e.shiftKey && (e.key.toLowerCase() === 't' || e.code === 'KeyT')) {
          e.preventDefault();
          handleToolbarAction('table');
        }

        // Math: Alt+Shift+M
        if (e.altKey && e.shiftKey && (e.key.toLowerCase() === 'm' || e.code === 'KeyM')) {
          e.preventDefault();
          handleToolbarAction('math');
        }

        // Mermaid Graph: Alt+Shift+G
        if (e.altKey && e.shiftKey && (e.key.toLowerCase() === 'g' || e.code === 'KeyG')) {
          e.preventDefault();
          handleToolbarAction('mermaid-graph');
        }

        // Mermaid Sequence: Alt+Shift+S
        if (e.altKey && e.shiftKey && (e.key.toLowerCase() === 's' || e.code === 'KeyS')) {
          e.preventDefault();
          handleToolbarAction('mermaid-sequence');
        }

        // Code Block: Alt+Shift+K
        if (e.altKey && e.shiftKey && (e.key.toLowerCase() === 'k' || e.code === 'KeyK')) {
          e.preventDefault();
          handleToolbarAction('code');
        }

        // Image: Alt+Shift+I
        if (e.altKey && e.shiftKey && (e.key.toLowerCase() === 'i' || e.code === 'KeyI')) {
          e.preventDefault();
          handleToolbarAction('image');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isSettingsOpen, setIsSettingsOpen, isQuickOpenOpen, setIsQuickOpenOpen,
    zenMode, updateSettings, setIsSidebarOpen, sidebarRef, editorViewRef,
    createNewDoc, deleteDoc, activeId, setViewMode, handleShare, handleToolbarAction
  ]);
}

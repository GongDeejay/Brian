import React, { useCallback, useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

interface Options {
  isOpen: boolean;
  onClose: () => void;
  /** Set to false to disable Esc-to-close (e.g. a forced-choice dialog). */
  closeOnEsc?: boolean;
}

/**
 * Accessibility plumbing for modal dialogs:
 *  - Esc closes the dialog (optional)
 *  - Tab / Shift+Tab are trapped inside the dialog
 *  - focus moves into the dialog on open and is restored on close
 *  - body scroll is locked while the dialog is open
 *  - clicking the backdrop closes the dialog
 *
 * Returns the ref to attach to the dialog panel plus a backdrop click handler.
 */
export function useDialogA11y({ isOpen, onClose, closeOnEsc = true }: Options) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;

    restoreFocusRef.current = (document.activeElement as HTMLElement) ?? null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Move focus into the dialog (prefer an element marked data-autofocus).
    const focusFirst = () => {
      const panel = panelRef.current;
      if (!panel) return;
      const preferred = panel.querySelector<HTMLElement>('[data-autofocus]');
      const target = preferred ?? panel.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ?? panel;
      target.focus();
    };
    const raf = window.requestAnimationFrame(focusFirst);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEsc) {
        event.preventDefault();
        event.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;
      const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (focusables.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);

    return () => {
      window.cancelAnimationFrame(raf);
      document.removeEventListener('keydown', handleKeyDown, true);
      document.body.style.overflow = previousOverflow;
      const restoreTarget = restoreFocusRef.current;
      if (restoreTarget && typeof restoreTarget.focus === 'function' && document.contains(restoreTarget)) {
        restoreTarget.focus();
      }
    };
  }, [isOpen, closeOnEsc]);

  /** Backdrop click: only close when the click started on the backdrop itself. */
  const handleBackdropMouseDown = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onCloseRef.current();
  }, []);

  return { panelRef, handleBackdropMouseDown };
}

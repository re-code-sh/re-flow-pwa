/**
 * Unified cross-platform file download and web share helper.
 * Handles iOS Safari, Android Chrome, and Desktop browsers seamlessly.
 */
export async function downloadOrShareFile({
  filename,
  content,
  mimeType = 'application/json',
  title = 'تک‌نقطه / Flow Backup',
}: {
  filename: string;
  content: string;
  mimeType?: string;
  title?: string;
}): Promise<boolean> {
  const blob = new Blob([content], { type: mimeType });

  // 1. Check if Mobile Web Share API is available with File sharing support
  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
    try {
      const file = new File([blob], filename, { type: mimeType });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title,
        });
        return true;
      }
    } catch (err: any) {
      // User cancelled share dialog -> return true without error
      if (err?.name === 'AbortError') return true;
      // Otherwise fall through to direct browser download
    }
  }

  // 2. Direct Anchor Download Fallback
  try {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.style.display = 'none';
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();

    setTimeout(() => {
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    }, 1000);

    return true;
  } catch (err) {
    console.error('Download error:', err);
    return false;
  }
}

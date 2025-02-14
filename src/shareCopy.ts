/**
 * Checks if the device is running on a mobile operating system.
 *
 * @returns {boolean} True if the user agent matches a mobile OS.
 */
export function isMobileOS(): boolean {
    return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      navigator.userAgent
    );
  }
  
  /**
   * Parameters for sharing or copying text.
   */
  export interface ShareCopyParams {
    /** The text content to share or copy. */
    text: string;
    /** Optional title for the shared content. */
    title?: string;
    /** Optional URL for the shared content. */
    url?: string;
    /**
     * Callback triggered on success.
     * The action parameter indicates if it was a "share" or "copy" action.
     */
    onSuccess?: (action: 'share' | 'copy') => void;
    /**
     * Callback triggered on failure.
     * The error parameter contains the error, and the action parameter indicates the attempted action.
     */
    onFail?: (error: Error, action: 'share' | 'copy') => void;
  }
  
  /**
   * Attempts to share text using the Web Share API on mobile devices.
   * If the API is not available, falls back to copying the text to the clipboard.
   *
   * @param params An object of type ShareCopyParams.
   */
  export async function shareCopy(
    params: ShareCopyParams
  ): Promise<void> {
    const { text, title = '', url = '', onSuccess, onFail } = params;
  
    // Use Web Share API if available and device is mobile
    if (typeof navigator.share === 'function' && isMobileOS()) {
      try {
        await navigator.share({ title, text, url });
        onSuccess?.('share');
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        // If the share is aborted or not allowed, do nothing
        if (
          err.name === 'AbortError' ||
          err.name === 'NotAllowedError' ||
          /abort|cancelled|canceled|not allowed/i.test(err.message)
        ) {
          return;
        }
        onFail?.(err, 'share');
      }
      return;
    }
  
    // If Clipboard API is available, use it
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      try {
        await navigator.clipboard.writeText(text);
        onSuccess?.('copy');
      } catch (error: unknown) {
        onFail?.(error instanceof Error ? error : new Error(String(error)), 'copy');
      }
      return;
    }
  
    // Fallback: use a temporary textarea element to copy text
    fallbackCopyText(text, onSuccess, onFail);
  }
  
  /**
   * Fallback method to copy text using a temporary textarea element.
   *
   * @param text The text to be copied.
   * @param onSuccess Optional callback triggered on a successful copy.
   * @param onFail Optional callback triggered if copying fails.
   */
  function fallbackCopyText(
    text: string,
    onSuccess?: (action: 'copy') => void,
    onFail?: (error: Error, action: 'copy') => void
  ): void {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // Position off-screen to avoid disrupting the UI
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
  
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        onSuccess?.('copy');
      } else {
        throw new Error('Fallback: Copying text command was unsuccessful');
      }
    } catch (error: unknown) {
      onFail?.(error instanceof Error ? error : new Error(String(error)), 'copy');
    } finally {
      document.body.removeChild(textarea);
    }
  }
  
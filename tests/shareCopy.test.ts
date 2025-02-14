import { describe, it, expect, vi, beforeEach } from 'vitest';
import { canShare, shareCopy } from '../src/shareCopy';

const originalExecCommand = document.execCommand;

describe('shareCopy', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should use navigator.share on mobile and call onSuccess with "share"', async () => {
    // Simulate mobile environment by overriding navigator.userAgent.
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      configurable: true,
    });

    // Mock navigator.share.
    const shareMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', {
      value: shareMock,
      configurable: true,
    });

    const onSuccess = vi.fn();
    const onFail = vi.fn();

    await shareCopy({
      text: 'Hello world',
      title: 'Title',
      url: 'https://example.com',
      onSuccess,
      onFail,
    });

    expect(shareMock).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalledWith('share');
    expect(onFail).not.toHaveBeenCalled();
  });

  it('should call onFail when navigator.share throws a non-abort error on mobile', async () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      configurable: true,
    });

    // Simulate an error in navigator.share.
    const error = new Error('Some error');
    error.name = 'SomeError';
    const shareMock = vi.fn().mockRejectedValue(error);
    Object.defineProperty(navigator, 'share', {
      value: shareMock,
      configurable: true,
    });

    const onSuccess = vi.fn();
    const onFail = vi.fn();

    await shareCopy({
      text: 'Hello world',
      title: 'Title',
      url: 'https://example.com',
      onSuccess,
      onFail,
    });

    expect(shareMock).toHaveBeenCalled();
    expect(onFail).toHaveBeenCalledWith(error, 'share');
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('should not call onFail if navigator.share is aborted', async () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      configurable: true,
    });

    // Simulate an abort error.
    const abortError = new Error('User cancelled');
    abortError.name = 'AbortError';
    const shareMock = vi.fn().mockRejectedValue(abortError);
    Object.defineProperty(navigator, 'share', {
      value: shareMock,
      configurable: true,
    });

    const onSuccess = vi.fn();
    const onFail = vi.fn();

    await shareCopy({
      text: 'Hello world',
      title: 'Title',
      url: 'https://example.com',
      onSuccess,
      onFail,
    });

    expect(shareMock).toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
    expect(onFail).not.toHaveBeenCalled();
  });

  it('should use clipboard if navigator.share is not available', async () => {
    // Simulate non-mobile environment or absence of navigator.share.
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      configurable: true,
    });

    // Remove navigator.share.
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      configurable: true,
    });

    // Simulate clipboard availability.
    const clipboardWriteTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: clipboardWriteTextMock,
      },
      configurable: true,
    });

    const onSuccess = vi.fn();
    const onFail = vi.fn();

    await shareCopy({
      text: 'Clipboard text',
      onSuccess,
      onFail,
    });

    expect(clipboardWriteTextMock).toHaveBeenCalledWith('Clipboard text');
    expect(onSuccess).toHaveBeenCalledWith('copy');
    expect(onFail).not.toHaveBeenCalled();
  });

  it('should call onFail if clipboard.writeText fails', async () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      configurable: true,
    });

    // Remove navigator.share.
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      configurable: true,
    });

    // Simulate clipboard failure.
    const error = new Error('Clipboard failed');
    const clipboardWriteTextMock = vi.fn().mockRejectedValue(error);
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: clipboardWriteTextMock,
      },
      configurable: true,
    });

    const onSuccess = vi.fn();
    const onFail = vi.fn();

    await shareCopy({
      text: 'Clipboard text',
      onSuccess,
      onFail,
    });

    expect(clipboardWriteTextMock).toHaveBeenCalledWith('Clipboard text');
    expect(onFail).toHaveBeenCalledWith(error, 'copy');
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('should fallback to document.execCommand if clipboard is not available', async () => {
    // Simulate non-mobile environment with no navigator.share and no clipboard.
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      configurable: true,
    });
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    });

    // Mock document.execCommand.
    const execCommandMock = vi.fn().mockReturnValue(true);
    document.execCommand = execCommandMock;

    const onSuccess = vi.fn();
    const onFail = vi.fn();

    await shareCopy({
      text: 'Fallback text',
      onSuccess,
      onFail,
    });

    expect(execCommandMock).toHaveBeenCalledWith('copy');
    expect(onSuccess).toHaveBeenCalledWith('copy');
    expect(onFail).not.toHaveBeenCalled();

    // Restore document.execCommand.
    document.execCommand = originalExecCommand;
  });

  it('should call onFail if fallback execCommand fails', async () => {
    // Simulate non-mobile environment with no navigator.share and no clipboard.
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      configurable: true,
    });
    Object.defineProperty(navigator, 'share', {
      value: undefined,
      configurable: true,
    });
    Object.defineProperty(navigator, 'clipboard', {
      value: undefined,
      configurable: true,
    });

    // Mock document.execCommand to return false.
    const execCommandMock = vi.fn().mockReturnValue(false);
    document.execCommand = execCommandMock;

    const onSuccess = vi.fn();
    const onFail = vi.fn();

    await shareCopy({
      text: 'Fallback text',
      onSuccess,
      onFail,
    });

    expect(execCommandMock).toHaveBeenCalledWith('copy');
    expect(onFail).toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();

    // Restore document.execCommand.
    document.execCommand = originalExecCommand;
  });
});


describe('canShare', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should return true if navigator.share is available and device is mobile', () => {
    // Simulate mobile environment by overriding navigator.userAgent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
      configurable: true,
    });

    // Mock navigator.share to simulate availability
    Object.defineProperty(navigator, 'share', {
      value: vi.fn(),
      configurable: true,
    });

    expect(canShare()).toBe(true);
  });

  it('should return false if navigator.share is not available', () => {
    // Simulate non-mobile environment or no navigator.share
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      configurable: true,
    });

    Object.defineProperty(navigator, 'share', {
      value: undefined,
      configurable: true,
    });

    expect(canShare()).toBe(false);
  });

  it('should return false if device is not mobile even if navigator.share is available', () => {
    // Simulate desktop environment with navigator.share available
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      configurable: true,
    });

    Object.defineProperty(navigator, 'share', {
      value: vi.fn(),
      configurable: true,
    });

    expect(canShare()).toBe(false);
  });

  it('should return false if userAgent is undefined', () => {
    Object.defineProperty(navigator, 'userAgent', {
      value: undefined,
      configurable: true,
    });

    Object.defineProperty(navigator, 'share', {
      value: vi.fn(),
      configurable: true,
    });

    expect(canShare()).toBe(false);
  });
});

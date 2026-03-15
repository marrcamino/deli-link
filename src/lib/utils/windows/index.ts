import { currentMonitor, getCurrentWindow } from '@tauri-apps/api/window';

/**
 * Spatial Helper: Calculates a centered and clamped position for a child window.
 * Ensures the window stays within the visible monitor bounds.
 */
export const calculateSafeChildPosition = async (childWidth: number, childHeight: number) => {
  const parentWindow = getCurrentWindow();
  const monitor = await currentMonitor();

  // If no monitor is detected, we return 0,0 as a safe fallback
  if (!monitor) return { x: 0, y: 0 };

  // 1. Convert everything to Logical units (DPI awareness)
  const factor = await parentWindow.scaleFactor();
  const pPos = (await parentWindow.outerPosition()).toLogical(factor);
  const pSize = (await parentWindow.outerSize()).toLogical(factor);
  const mSize = monitor.size.toLogical(factor);
  const mPos = monitor.position.toLogical(factor);

  // 2. Initial Centering: Start at parent center
  let targetX = pPos.x + (pSize.width - childWidth) / 2;
  let targetY = pPos.y + (pSize.height - childHeight) / 2;

  // 3. Clamping: Prevent window from going off-screen (especially for dual monitors)

  // Right/Left bounds
  if (targetX + childWidth > mPos.x + mSize.width) {
    targetX = mPos.x + mSize.width - childWidth;
  }
  if (targetX < mPos.x) targetX = mPos.x;

  // Bottom/Top bounds (Ensures title bar/close buttons are always reachable)
  if (targetY + childHeight > mPos.y + mSize.height) {
    targetY = mPos.y + mSize.height - childHeight;
  }
  if (targetY < mPos.y) targetY = mPos.y;

  return { x: Math.round(targetX), y: Math.round(targetY) };
};

export function makeWindowTitle(title: string) {
  return `Deli Link - ${title}`
}

export * from "./print-leave";

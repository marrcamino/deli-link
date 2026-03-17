import { currentMonitor, type Window } from '@tauri-apps/api/window';

/**
 * Spatial Helper: Calculates a centered and clamped position for a child window.
 * Ensures the window stays within the visible monitor bounds.
 */
// windowUtils.ts

export const calculateSafeChildPosition = async (parentWindow: Window, childWidth: number, childHeight: number) => {
  const monitor = await currentMonitor();
  const factor = await parentWindow.scaleFactor();
  const pPos = (await parentWindow.outerPosition()).toLogical(factor);
  const pSize = (await parentWindow.outerSize()).toLogical(factor);

  // Default to parent center if monitor is not detected
  let mPos = { x: pPos.x, y: pPos.y };
  let mSize = { width: pSize.width, height: pSize.height };

  if (monitor) {
    mPos = monitor.position.toLogical(factor);
    mSize = monitor.size.toLogical(factor);
  }

  let targetX = pPos.x + (pSize.width - childWidth) / 2;
  let targetY = pPos.y + (pSize.height - childHeight) / 2;

  // Clamping
  if (targetX + childWidth > mPos.x + mSize.width) targetX = mPos.x + mSize.width - childWidth;
  if (targetX < mPos.x) targetX = mPos.x;
  if (targetY + childHeight > mPos.y + mSize.height) targetY = mPos.y + mSize.height - childHeight;
  if (targetY < mPos.y) targetY = mPos.y;

  return { x: Math.round(targetX), y: Math.round(targetY) };
};

export function makeWindowTitle(title: string) {
  return `Deli Link - ${title}`
}

export * from "./print-leave";
calculateSafeChildPosition
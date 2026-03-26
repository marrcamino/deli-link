import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { getCurrentWindow } from '@tauri-apps/api/window';

import { calculateSafeChildPosition } from '.';
import { formatDate } from "../date-utils";


/**
 * Opens a centered, clamped print preview window for a Leave Application.
 * Automatically closes the child window if the parent window is closed.
 */
export const openPrintWindow = async (leave?: LeaveApplication, leaveType: "wl" | "ol" = 'wl') => {
  const width = 900;
  const height = 700;
  const parentWindow = getCurrentWindow();

  // 1. Stable Label & Title
  const childLabel = `print_leave_${leave?.leave_pk ?? "empty"}`;

  // 2. Check for existing window
  const existingWindow = await WebviewWindow.getByLabel(childLabel);
  if (existingWindow) {
    await existingWindow.show();
    await existingWindow.unminimize();
    await existingWindow.setFocus();
    return;
  }

  // 3. Calculate position (Passing parentWindow directly)
  const { x, y } = await calculateSafeChildPosition(parentWindow, width, height);
console.log( `/leave/${leave?.leave_pk ?? 'empty'}?type=${leaveType}`)
  // 4. Create the Window
  const webview = new WebviewWindow(childLabel, {
    url: `/leave/${leave?.leave_pk ?? 'empty'}?yeah=${leaveType}`,
    title: "Leave Application",
    resizable: true,
    width,
    height,
    x,
    y,
    center: false,
    visible: false, // Keep hidden until ready
    parent: parentWindow.label,
  });

  // 5. Register "Show" immediately (No await before this!)
  webview.once("tauri://created", () => {
    webview.show();
  });

  // 6. Handle Lifecycle (Don't await this in a way that blocks step 5)
  parentWindow.onCloseRequested(async () => {
    const childWindow = await WebviewWindow.getByLabel(childLabel);
    if (childWindow) await childWindow.close();
  }).then((unlisten) => {
    // Optional: save unlisten if need to cleanup later
  });

  webview.once("tauri://error", (e) => {
    console.error("Failed to open print window:", e);
  });
};



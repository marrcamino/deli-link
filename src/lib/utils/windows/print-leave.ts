import { WebviewWindow } from '@tauri-apps/api/webviewWindow';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { calculateSafeChildPosition } from '.';
import { formatDate } from "../date-utils";


/**
 * Opens a centered, clamped print preview window for a Leave Application.
 * Automatically closes the child window if the parent window is closed.
 */
export const openPrintWindow = async (leave?: LeaveApplication) => {
  const width = 900;
  const height = 700;

  const parentWindow = getCurrentWindow();


  const childLabel = `print_leave_${leave ? leave.leave_pk : "empty"}`;
  const actualWindowTitle = leave ? `(${formatDate(leave.inclusive_from)} to ${formatDate(leave.inclusive_to)})` : "- Empty Form"
  const windowTitle = `Leave Application ${actualWindowTitle}`;


  const { x, y } = await calculateSafeChildPosition(width, height);

  const webview = new WebviewWindow(childLabel, {
    url: `/leave/${leave ? leave.leave_pk : 'empty'}`,
    title: windowTitle,
    resizable: true,
    width,
    height,
    x,
    y,
    center: false, // Set to false to honor our custom calculated x/y
    visible: false, // Hidden initially to prevent "flicker" during load
    parent: parentWindow.label, // Ties the window to the parent in the OS taskbar
  });

  // 6. Lifecycle Management: Close child if parent is closed
  const unlisten = await parentWindow.onCloseRequested(async () => {
    const childWindow = await WebviewWindow.getByLabel(childLabel);
    if (childWindow) {
      await childWindow.close();
    }
    // Cleanup the listener to prevent memory leaks
    unlisten();
  });

  // 7. Event Handlers
  webview.once("tauri://created", () => {
    webview.show(); // Reveal window only once Tauri has successfully spawned it
  });

  webview.once("tauri://error", (e) => {
    console.error("Failed to open print window:", e);
  });
};
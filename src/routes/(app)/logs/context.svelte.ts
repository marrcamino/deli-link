import { MONTHS_MAP } from "$lib/constants/months";
import { getDBConn } from "$lib/db";
import { setUserPref } from "$lib/helper";
import { isUserIsExistInDatabase } from "$lib/services";
import { NativeDateHelper } from "$lib/utils/date-utils";
import type { PhysicalPosition } from "@tauri-apps/api/dpi";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";
import Papa from 'papaparse';
import { getContext, setContext, tick, untrack } from "svelte";
import { toast } from "svelte-sonner";
import { invoke } from "@tauri-apps/api/core";

const CONTEXT_KEY = Symbol("logs-context");
type MonthIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
type MonthIndexString = `${MonthIndex}` | ''
type MachineUserLog = Omit<Log, "log_pk"> & { name: string }
interface DbResponse {
  success: boolean;
  message: string;
}

export type UserWithLog = User & Omit<Log, "user_fk">

interface ValidationResult {
  isValid: boolean
  message?: string
}

interface PayLoad {
  type: 'drop';
  paths: string[];
  position: PhysicalPosition;
}

class ParserAndDecoder {
  protected async decodeFile(filePath: string) {
    const bytes = await readFile(filePath);
    return new TextDecoder("utf-16le").decode(new Uint8Array(bytes));
  }

  protected parseLogsToArray(rawText: string, monthIndex?: number): MachineUserLog[] {
    const result = Papa.parse(rawText, {
      header: true,
      delimiter: '\t',
      skipEmptyLines: true,
    })

    const logs: MachineUserLog[] = result.data
      .map((row: any) => {
        const user_fk = Number(row.UserId)
        const dateTime = row.DateTime.trim() // "2026-01-12  19:16:39"
        const [date, time] = dateTime.split(/\s+/)

        return { user_fk, date, time, name: row.Name }
      })
      // filter by month if monthIndex is provided
      .filter(log => {
        if (monthIndex === undefined) return true
        const month = Number(log.date.split('-')[1]) - 1
        return month === monthIndex
      })
    return logs
  }
}

class FileValidator extends ParserAndDecoder {
  private EXPECTED_HEADERS = [
    "No", "DevNo", "UserId", "Name", "Mode", "DateTime"
  ];

  protected fileExtensionIsTextType(filePath: string) {
    return /\.TXT$/i.test(filePath)
  }

  protected isNumeric(value: string) {
    return !isNaN(Number(value));
  }

  protected isValidDateTime(value: string) {
    // Sample Expected: 2026-01-12 19:16:39
    const regex = /^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}$/;
    return regex.test(value.trim());
  }

  protected validateFileContent(text: string): ValidationResult {
    if (!text) return { isValid: false, message: "File is empty." };

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length < 2) return { isValid: false, message: "File does not contain enough logs." };

    // Validate Header
    const headerParts = lines[0].split("\t").map(h => h.trim());
    const headerMatch = headerParts.length === this.EXPECTED_HEADERS.length &&
      headerParts.every((h, i) => h === this.EXPECTED_HEADERS[i]);

    if (!headerMatch) {
      return { isValid: false, message: "Invalid file header. This is not a valid Deli S151 log file." };
    }

    // Validate sample data rows
    const rowsToCheck = Math.min(2, lines.length - 1);
    for (let i = 1; i <= rowsToCheck; i++) {
      const rowParts = lines[i].split("\t");
      if (rowParts.length !== 6) return { isValid: false, message: `Row ${i + 1} has invalid column count.` };

      const [no, devNo, userId, name, mode, dateTime] = rowParts;
      if (!this.isNumeric(no) || !this.isNumeric(devNo) || !this.isNumeric(userId) ||
        !name || !mode || !this.isValidDateTime(dateTime)) {
        return { isValid: false, message: `Row ${i + 1} format is invalid.` };
      }
    }

    return { isValid: true };
  }

}

class LogsContext extends FileValidator {
  pageContent: HTMLDivElement | undefined = $state(undefined);

  // ACTION VALUES
  sortDateVal: "latest" | "oldest" = $state('latest')
  sortNameVal: "none" | "az" | "za" = $state('none')
  groupVal = $state('none')
  selectedUser = $state("all")

  missingIdDialogState = $state(false)

  missingIds: MachineUserLog[] = $state([])
  rawUserLogs: UserWithLog[] = $state([])
  filteredUserLogs: UserWithLog[] = $state([])
  selectedMonth = $state(NativeDateHelper.currentMonth.toString()) as MonthIndexString;


  private async decodeValidateSetFileContentsSaveToDB(filePath: string): Promise<string> {

    if (!this.fileExtensionIsTextType(filePath)) {
      throw new Error("Invalid file type. Only .TXT files are allowed.");
    }

    const contents = await this.decodeFile(filePath);

    const validation = this.validateFileContent(contents);

    if (validation.message) {
      throw new Error(validation.message);
    }

    const result = await this.saveLogs(
      this.parseLogsToArray(contents, parseInt(this.selectedMonth))
    );

    if (!result.success) {
      throw new Error(result.message);
    }
    await this.fetchUserLog()
    return result.message;
  }

  private selectedMonthToTwoDigitString() {
    return (parseInt(this.selectedMonth) + 1).toString().padStart(2, "0");
  }

  private async saveLogs(logs: MachineUserLog[]) {
    if (!logs.length) return { success: false, message: "No logs found." };

    const logMap = new Map<number, MachineUserLog>();
    for (const log of logs) {
      if (!logMap.has(log.user_fk)) logMap.set(log.user_fk, log);
    }

    // --- 1. VALIDATION PHASE (No Transaction yet) ---
    const missingIds: MachineUserLog[] = [];
    for (const [user_fk, user] of logMap) {
      if (await isUserIsExistInDatabase(user_fk)) missingIds.push(user);
    }

    if (missingIds.length) {
      this.missingIds = missingIds;
      this.missingIdDialogState = true; // Safe to open dialog now
      return { success: false, message: 'Missing user IDs.' };
    }

    // --- 2. WRITE PHASE (Keep this as fast as possible) ---
    try {
      const response: DbResponse = await invoke("save_logs", {
        month: this.selectedMonthToTwoDigitString(),
        year: NativeDateHelper.currentYear,
        logs: logs
      });

      return response;
    } catch (e) {
      console.error("IPC Bridge Error:", e);
      return { success: false, message: "A system error occurred." };
    }
  }

  private runAllProcessWithTaost(path: string) {
    toast.promise(
      this.decodeValidateSetFileContentsSaveToDB(path),
      {
        loading: 'Processing...',
        success: (message) => {
          this.resetAllFilters()
          return message
        },
        error: (err) => {
          if (err instanceof Error) return err.message;
          return "Unknown error";
        }
      }
    )
  }

  scrollUpContent() {
    tick().then(() => {
      this.pageContent?.scroll({
        top: 0,
        behavior: "smooth",
      });
    })
  }


  async fetchUserLog() {
    const db = await getDBConn();
    this.rawUserLogs = await db.select<UserWithLog[]>(`
      SELECT 
        log.log_pk, 
        log.date, 
        log.time, 
        user.*
      FROM log
      JOIN user ON log.user_fk = user.user_pk
      WHERE strftime('%m', log.date) = ?
      AND strftime('%Y', log.date) = ?
      ORDER BY log.date DESC
    `, [
      this.selectedMonthToTwoDigitString(),
      NativeDateHelper.currentYear
    ]);

    this.filteredUserLogs = this.sortLogs(
      this.rawUserLogs,
      'none',
      'latest'
    )
    await tick()
    this.scrollUpContent()
  }

  async importLogFile() {
    // 1. Open the native dialog
    const filePath = await open({
      title: "Import Logs",
      multiple: false,
      directory: false,
      filters: [
        { name: "Text Files", extensions: ["txt"] },
      ],
    });

    if (filePath) this.runAllProcessWithTaost(filePath)
  }

  async handleFileDrop(dropEvent: PayLoad | string) {
    const path = (typeof dropEvent === 'object') ? dropEvent.paths[0] : dropEvent

    this.runAllProcessWithTaost(path)
  }

  // #region SORTERS
  sortByLastName(
    arr: UserWithLog[],
    order: "ASC" | "DESC" = "ASC"
  ): UserWithLog[] {
    return [...arr].sort((a, b) =>
      order === "ASC"
        ? a.last_name.localeCompare(b.last_name)
        : b.last_name.localeCompare(a.last_name)
    );
  }

  sortLogs(
    arr: UserWithLog[],
    sortNameVal: "none" | "az" | "za",
    sortDateVal: "latest" | "oldest"
  ): UserWithLog[] {
    return [...arr].sort((a, b) => {

      // NAME SORT
      if (sortNameVal !== "none") {
        const nameCompare =
          sortNameVal === "az"
            ? a.last_name.localeCompare(b.last_name)
            : b.last_name.localeCompare(a.last_name);

        if (nameCompare !== 0) return nameCompare;
      }

      // DATE + TIME SORT
      const aDT = `${a.date} ${a.time}`;
      const bDT = `${b.date} ${b.time}`;

      return sortDateVal === "latest"
        ? bDT.localeCompare(aDT)
        : aDT.localeCompare(bDT);
    });
  }
  // #endregion

  getDistinctUsers(userFromParam?: UserWithLog[], visibleOnly = false) {
    const map = new Map<number, UserWithLog>();

    for (const row of userFromParam ?? this.rawUserLogs) {
      if (!map.has(row.user_pk)) {
        map.set(row.user_pk, row);
      }
    }

    if (visibleOnly && this.selectedUser !== "all") {
      return Array.from(map.values()).filter(u => u.user_pk === parseInt(this.selectedUser))
    }

    return Array.from(map.values())
  }

  getDistinctDays() {
    const sets = new Set<string>()

    for (const day of this.filteredUserLogs) {
      if (!sets.has(day.date)) sets.add(day.date)
    }
    return [...sets]
  }

  applyFilters() {
    let newFilteredUserLogs = this.filteredUserLogs

    // FOR USER DROPDOWN 
    if (this.selectedUser === "all") {
      newFilteredUserLogs = this.rawUserLogs;
    } else {
      // Reset groupVal & sortNameVal if there a specific user to display
      if (this.groupVal === 'name') this.groupVal = "none"
      this.sortNameVal = "none";

      newFilteredUserLogs = this.rawUserLogs.filter(
        (u) => u.user_pk === parseInt(this.selectedUser),
      );
    }

    newFilteredUserLogs = this.sortLogs(
      newFilteredUserLogs,
      this.sortNameVal,
      this.sortDateVal
    );

    this.filteredUserLogs = newFilteredUserLogs
  }

  resetSortFilters() {
    this.sortDateVal = "latest";
    this.sortNameVal = "none";
  }

  resetAllFilters() {
    this.resetSortFilters()
    this.groupVal = "none";
    this.selectedUser = "all";
    this.filteredUserLogs = this.sortLogs(
      this.rawUserLogs,
      this.sortNameVal,
      this.sortDateVal
    );
  }

  getSpecificUserLogs(user_pk: number) {
    return this.filteredUserLogs.filter(u => u.user_pk === user_pk)
  }
}

export function setLogsContext() {
  return setContext(CONTEXT_KEY, new LogsContext)
}

export function getLogsContext() {
  return getContext(CONTEXT_KEY) as LogsContext
}
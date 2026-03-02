import { NativeDateHelper } from "$lib/utils/date-utils";
import type { PhysicalPosition } from "@tauri-apps/api/dpi";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";
import { getContext, setContext, untrack } from "svelte";
import { toast } from "svelte-sonner";
import Papa from 'papaparse'
import { getDBConn } from "$lib/db";
import { MONTHS_MAP } from "$lib/constants/months";


const CONTEXT_KEY = Symbol("dtr-context");
type MonthIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
type MonthIndexString = `${MonthIndex}` | ''
export type UserWithLog = User & Omit<Log, "user_pk">

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

  protected parseLogsToArray(rawText: string, monthIndex?: number): Omit<Log, "log_pk">[] {
    const result = Papa.parse(rawText, {
      header: true,
      delimiter: '\t',
      skipEmptyLines: true,
    })

    const logs: Omit<Log, "log_pk">[] = result.data
      .map((row: any) => {
        const user_fk = Number(row.UserId)
        const dateTime = row.DateTime.trim() // "2026-01-12  19:16:39"
        const [date, time] = dateTime.split(/\s+/)

        return { user_fk, date, time }
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

class DTRContext extends FileValidator {
  readonly current_month = NativeDateHelper.currentMonth as MonthIndex;
  // Only used when user DROP and the open tab is "users"
  private payload: PayLoad | null = null;
  // Only used when user IMPORT and the open tab is "users"
  private filePath: string | null = null;

  // ACTION VALUES
  sortDateVal = $state('latest')
  sortNameVal = $state('az')
  groupVal = $state('none')

  userLogs: UserWithLog[] = $state([])
  logPreviewDialog = $state(false);
  monthSelectDialog = $state(false)
  selectedMonth = $state(this.current_month.toString()) as MonthIndexString;

  constructor() {
    super()

    $effect(() => {
      this.monthSelectDialog;
      untrack(async () => {
        if (this.monthSelectDialog) return

        // When user used DROP feature
        if (this.payload) {
          await this.handleFileDrop(this.payload)
          this.payload = null
        }

        // When user used IMPORT button
        if (this.filePath) {

          await this.decodeValidateSetFileContentsSaveToDB(this.filePath);
          this.filePath = null
        }
      })
    });
  }

  private getCurrentTab() {
    const params = new URLSearchParams(window.location.search);

    return params.get("tab") as null | "users" | "logs";
  }

  private async decodeValidateSetFileContentsSaveToDB(filePath: string) {
    if (!this.fileExtensionIsTextType(filePath)) {
      toast.error("Invalid file type. Only .TXT files are allowed.")
      return
    }

    const contents = await this.decodeFile(filePath);

    const validation = this.validateFileContent(contents);

    if (validation.message) {
      toast.error(validation.message);
      return
    }

    this.saveLogs(this.parseLogsToArray(contents, parseInt(this.selectedMonth)))
  }

  private selectedMonthToTwoDigitString() {
    return (parseInt(this.selectedMonth) + 1).toString().padStart(2, "0");
  }

  private async saveLogs(logs: Omit<Log, "log_pk">[]) {
    const db = await getDBConn();
    let oldLogsAreDeleted = false
    try {
      await db.execute("BEGIN TRANSACTION")

      // DELETE OLD LOGS
      const deleteResult = await db.execute(
        `DELETE FROM log 
        WHERE strftime('%m', date) = ? 
        AND strftime('%Y', date) = ?`,
        [this.selectedMonthToTwoDigitString(), NativeDateHelper.currentYear]
      );


      // Set true if there is record deleted, false otherwise
      oldLogsAreDeleted = deleteResult.rowsAffected > 0

      // INSERT NEW LOGS
      for (const log of logs) {
        const res = await db.execute(
          "INSERT INTO log (user_fk, date, time) VALUES (?, ?, ?)",
          [log.user_fk, log.date, log.time]
        );

        if (!res.lastInsertId) {
          console.error("Naay error sa pag insert: ", log);
          throw new Error("Insert failed");
        }
      }


      toast.success(`${MONTHS_MAP[parseInt(this.selectedMonth)]} Logs Saved Successfully`, {
        description: oldLogsAreDeleted ? 'Old logs are overried' : undefined
      })

      await this.fetchUserLog()
      await db.execute('COMMIT');
    } catch (e) {
      console.error(e)
      await db.execute('ROLLBACK');
    }
  }

  async fetchUserLog() {
    const db = await getDBConn();
    this.userLogs = await db.select<UserWithLog[]>(`
      SELECT 
        log.log_pk, 
        log.date, 
        log.time, 
        user.*
      FROM log
      JOIN user ON log.user_fk = user.user_pk
      WHERE strftime('%m', log.date) = ?
      AND strftime('%Y', log.date) = ?
    `, [
      this.selectedMonthToTwoDigitString(),
      NativeDateHelper.currentYear
    ]);
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

    if (!filePath) return

    if (this.getCurrentTab() === 'users') {
      this.filePath = filePath
      this.monthSelectDialog = true
      return
    }

    await this.decodeValidateSetFileContentsSaveToDB(filePath);
  }

  async handleFileDrop(dropEvent: PayLoad | string) {
    const path = (typeof dropEvent === 'object') ? dropEvent.paths[0] : dropEvent
    await this.decodeValidateSetFileContentsSaveToDB(path);
  }

  openMonthSelector(payloadOrPath: PayLoad | string) {

    if (typeof payloadOrPath === 'object') {
      this.payload = payloadOrPath
    } else this.filePath = payloadOrPath

    this.monthSelectDialog = true
  }
}

export function setDTRContext() {
  return setContext(CONTEXT_KEY, new DTRContext)
}

export function getDTRContext() {
  return getContext(CONTEXT_KEY) as DTRContext
}
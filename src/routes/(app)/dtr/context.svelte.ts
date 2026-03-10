import { NativeDateHelper } from "$lib/utils/date-utils";
import type { PhysicalPosition } from "@tauri-apps/api/dpi";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";
import { getContext, setContext, tick, untrack } from "svelte";
import { toast } from "svelte-sonner";
import Papa from 'papaparse'
import { getDBConn } from "$lib/db";
import { MONTHS_MAP } from "$lib/constants/months";


const CONTEXT_KEY = Symbol("dtr-context");
type MonthIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
type MonthIndexString = `${MonthIndex}` | ''
type MachineUserLog = Omit<Log, "log_pk"> & { name: string }
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

class DTRContext extends FileValidator {
  readonly current_month = NativeDateHelper.currentMonth as MonthIndex;
  // Only used when user DROP and the open tab is "users"
  private payload: PayLoad | null = null;
  // Only used when user IMPORT and the open tab is "users"
  private filePath: string | null = null;

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

  private async saveLogs(logs: MachineUserLog[]) {

    if (!logs.length) {
      toast.error(`No logs found for the month of ${MONTHS_MAP[parseInt(this.selectedMonth)]}`)
      return
    }

    const logMap = new Map<number, MachineUserLog>()

    const db = await getDBConn();
    for (const log of logs) {
      if (!logMap.has(log.user_fk)) logMap.set(log.user_fk, log)
    }

    // Check if all of the user exist in the database
    for (const [user_fk, user] of logMap) {
      const res = await db.select("SELECT EXISTS(SELECT 1 FROM user WHERE user_pk = ?) AS user_exists", [user_fk]) as any

      if (!res[0]?.user_exists) {
        this.missingIds.push(user)
      }
    }
    // Open dialog if have missing IDs
    if (this.missingIds.length) {
      this.missingIdDialogState = true
      return
    }


    // ACTUAL INSERT PROCESS
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

  // #region SORTERS
  // sortByDate(
  //   arr: UserWithLog[],
  //   order: "ASC" | "DESC" = "ASC"
  // ): UserWithLog[] {
  //   return [...arr].sort((a, b) => {
  //     const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
  //     const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();

  //     return order === "ASC"
  //       ? dateTimeA - dateTimeB
  //       : dateTimeB - dateTimeA;
  //   });
  // }

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

  openMonthSelector(payloadOrPath: PayLoad | string) {
    if (typeof payloadOrPath === 'object') {
      this.payload = payloadOrPath
    } else this.filePath = payloadOrPath

    this.monthSelectDialog = true
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

export function setDTRContext() {
  return setContext(CONTEXT_KEY, new DTRContext)
}

export function getDTRContext() {
  return getContext(CONTEXT_KEY) as DTRContext
}
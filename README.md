# Deli-Link

Deli-Link is a desktop application for generating **Daily Time Records (DTR)** from CSV files exported by the Deli Fingerprint Attendance Machine (S151).

It parses raw biometric attendance data and converts it into structured, readable, and usable DTR records.

---

## Overview

Biometric machines export attendance logs in raw CSV format. These files are not immediately usable for reporting or payroll processing.

Deli-Link solves that problem by:

- Reading CSV exports from the Deli S151 device
- Cleaning and filtering unnecessary rows
- Extracting employee attendance records
- Mapping time-in and time-out entries
- Structuring the data into Daily Time Records

The goal is to simplify attendance processing and reduce manual computation.

---

## Tech Stack

- Tauri (Rust backend)
- SvelteKit (Svelte 5)
- TypeScript
- Papa Parse (CSV parsing library)
- npm

---

## Supported File Format

This system is designed specifically for CSV files exported from the Deli Fingerprint Attendance Machine (S151).

If the CSV structure changes or comes from a different device model, adjustments to the parser may be required.

---

## Core Functionality

- Import biometric attendance CSV file
- Parse and normalize attendance data
- Generate structured Daily Time Records
- Prepare data for reporting or further processing

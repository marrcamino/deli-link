interface MainNameParts {
  prefix?: string; // comma-separated, parsed internally
  lastname: string;
  firstname: string;
  middlename?: string | null;
  extension?: string | null; // no period stored
  suffix?: string | null; // comma-separated, parsed internally
}
interface NameParts {
  prefix?: string; // comma-separated, parsed internally
  last_name: string;
  first_name: string;
  middle_name?: string | null;
  extension?: string | null; // no period stored
  suffix?: string | null; // comma-separated, parsed internally
}

interface NameFormatOptions {
  order?: "normal" | "formal"; // default: 'normal'
  abbreviateMiddle?: boolean; // default: false
  includePrefix?: boolean; // default: true
  includeSuffix?: boolean; // default: true
}

function parseListString(value?: string | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

function formatPrefixes(prefix?: string | null): string {
  const list = parseListString(prefix);
  if (list.length === 0) return "";
  return list.join(" ");
}

function formatSuffixes(suffix?: string | null): string {
  const list = parseListString(suffix);
  if (list.length === 0) return "";
  return list.join(", ");
}

function formatExtension(extension?: string | null): string {
  if (!extension) return "";

  const clean = extension.replace(/\./g, "").trim(); // remove any accidental periods

  // Define which ones should have a period
  const withPeriod = ["JR", "SR"];

  // If extension is "JR" or "SR", add a period
  if (withPeriod.includes(clean.toUpperCase())) {
    return `${clean.charAt(0).toUpperCase()}${clean.slice(1).toLowerCase()}.`;
  }

  // Otherwise, just return as-is (like III, IV, V)
  return clean.toUpperCase();
}

function formatMiddleName(
  middleName?: string | null,
  abbreviate = false
): string {
  if (!middleName) return "";

  const clean = middleName.trim();

  if (abbreviate && clean.length > 0) {
    return clean.charAt(0).toUpperCase() + ".";
  }

  return clean;
}

function mainFormatFullName<T extends MainNameParts>(
  parts: T,
  options: NameFormatOptions = {}
) {
  const { prefix, firstname, middlename, lastname, extension, suffix } = parts;

  const {
    order = "formal",
    abbreviateMiddle = false,
    includePrefix = true,
    includeSuffix = true,
  } = options;

  // Format individual parts
  const prefixText = includePrefix ? formatPrefixes(prefix) : "";
  const middleText = formatMiddleName(middlename, abbreviateMiddle);
  const extensionText = formatExtension(extension);
  const suffixText = includeSuffix ? formatSuffixes(suffix) : "";

  let fullName = "";

  if (order === "formal") {
    // Example: Dela Cruz, Juan R., Jr., CPA
    fullName = `${lastname}, ${firstname}${middleText ? " " + middleText : ""}${extensionText ? ", " + extensionText : ""
      }${suffixText ? ", " + suffixText : ""}`;
  } else {
    // Example: Atty. Juan R. Dela Cruz, Jr., CPA
    fullName = `${prefixText ? prefixText + " " : ""}${firstname}${middleText ? " " + middleText : ""
      } ${lastname}${extensionText ? ", " + extensionText : ""}${suffixText ? ", " + suffixText : ""
      }`;
  }

  // Clean up double spaces and trim
  return fullName.replace(/\s+/g, " ").trim();
}


export function formatFullName<T extends NameParts>(parts: T,
  options: NameFormatOptions = {}) {

  return mainFormatFullName({
    prefix: parts.prefix,
    firstname: parts.first_name,
    middlename: parts.middle_name,
    lastname: parts.last_name,
    extension: parts.extension,
    suffix: parts.suffix,
  }, options)
}
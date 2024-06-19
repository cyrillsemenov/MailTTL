type GmailLabel = GoogleAppsScript.Gmail.GmailLabel;
type GmailThread = GoogleAppsScript.Gmail.GmailThread;

class TTLProcessor {
  allLabels: GmailLabel[];
  totalProcessed: number;

  constructor() {
    this.allLabels = GmailApp.getUserLabels();
    this.totalProcessed = 0;
  }

  /**
   * Processes labels that start with the given prefix and applies a callback to old threads.
   * @param {string} prefix - The prefix to filter labels.
   * @param {function} callback - The callback function to apply to each old thread.
   * @param {string} message - The message template for logging the processed count.
   */
  processLabel(
    prefix: string,
    callback: (thread: GmailThread) => void,
    message = '%s threads have been processed'
  ): void {
    const labelsWithPrefix = this.filterByPrefix(prefix);
    const oldThreads = labelsWithPrefix.flatMap(label => {
      const date_str = this.extractDateStr(label, prefix);
      const date = this.parseDate(date_str);
      if (date === null) {
        throw SyntaxError(`Date "${date_str}" cannot be parsed!`);
      }
      return this.filterByAge(label, date);
    });
    oldThreads.forEach(callback);
    this.totalProcessed += oldThreads.length;
    Logger.log(message, oldThreads.length);
  }

  /**
   * Filters labels that start with the given prefix.
   * @param {string} prefix - The prefix to filter labels.
   * @return {GmailLabel[]} - Array of filtered labels.
   */
  filterByPrefix(prefix: string): GmailLabel[] {
    return this.allLabels.filter(label => label.getName().startsWith(prefix));
  }

  /**
   * Filters threads by age based on the given date.
   * @param {GmailLabel} label - The label object.
   * @param {Date} date - The date to compare thread age.
   * @return {GmailThread[]} - Array of filtered threads.
   */
  filterByAge(label: GmailLabel, date: Date): GmailThread[] {
    return label
      .getThreads()
      .filter(thread => thread.getLastMessageDate() < date);
  }

  /**
   * Extracts the date string from the label name.
   * @param {GmailLabel} label - The label object.
   * @param {string} prefix - The prefix to remove from the label name.
   * @return {string} - The extracted date string.
   */
  extractDateStr(label: GmailLabel, prefix: string): string {
    return label.getName().substring(prefix.length).trim();
  }

  /**
   * Parses a TTL string into a Date object.
   * @param {string} ttlString - The TTL string to parse.
   * @return {Date} - The parsed Date object.
   */
  parseDate(ttlString: string): DateDelta | null {
    return DateDelta.parseLabel(ttlString);
  }
}

/**
 * DateDelta extends the JavaScript Date class to provide methods for manipulating dates.
 */
class DateDelta extends Date {
  /**
   * Returns the current date and time as a Date instance.
   * @returns {Date} A Date instance representing the current date and time.
   */
  static getNow(): Date {
    return new Date(Date.now());
  }

  /**
   * Returns a Date instance representing the date a specified number of years before the current date.
   * @param {number} value - The number of years to subtract from the current date.
   * @returns {Date} A Date instance representing the date.
   */
  static yearsBefore(value: number): Date {
    const now = this.getNow();
    const currentYear = now.getFullYear();
    now.setFullYear(currentYear - value);
    return now;
  }

  /**
   * Returns a Date instance representing the date a specified number of months before the current date.
   * @param {number} value - The number of months to subtract from the current date.
   * @returns {Date} A Date instance representing the date.
   */
  static monthsBefore(value: number): Date {
    const now = this.getNow();
    const currentMonth = now.getMonth();
    now.setMonth(currentMonth - value);
    return now;
  }

  /**
   * Returns a Date instance representing the date a specified number of weeks before the current date.
   * @param {number} value - The number of weeks to subtract from the current date.
   * @returns {Date} A Date instance representing the date.
   */
  static weeksBefore(value: number): Date {
    const now = this.getNow();
    const currentDate = now.getDate();
    now.setDate(currentDate - value * 7);
    return now;
  }

  /**
   * Returns a Date instance representing the date a specified number of days before the current date.
   * @param {number} value - The number of days to subtract from the current date.
   * @returns {Date} A Date instance representing the date.
   */
  static daysBefore(value: number): Date {
    const now = this.getNow();
    const currentDate = now.getDate();
    now.setDate(currentDate - value);
    return now;
  }

  /**
   * Parses a label text to create a Date instance representing the date a specified number of days, weeks, months, or years before the current date.
   * @param {string} text - The label text to parse (e.g., "2 years", "3 months").
   * @returns {Date|null} A Date instance representing the date, or null if the text could not be parsed.
   */
  static parseLabel(text: string): Date | null {
    const match = /(\d+)\s?(day|week|month|year)s?/i.exec(text);
    if (!match) {
      return null;
    }
    const [, numberString, unit] = match;
    const number = parseInt(numberString, 10);

    switch (unit.toLowerCase()) {
      case 'day':
        return this.daysBefore(number);
      case 'week':
        return this.weeksBefore(number);
      case 'month':
        return this.monthsBefore(number);
      case 'year':
        return this.yearsBefore(number);
      default:
        return null;
    }
  }
}

function main() {
  const p = new TTLProcessor();
  p.processLabel('TTL:', t => t.moveToTrash(), '%s threads has been deleted');
  p.processLabel('TTR:', t => t.markRead(), '%s threads have makerd read');
  Logger.log('%s threads have been processed in total', p.totalProcessed);
}

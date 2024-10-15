public formatDate(dateString: string | null | undefined): string {
  if (!dateString) {
    return this.getCurrentDate();
  }

  // Split the input date to avoid timezone conversion
  const [year, month, day] = dateString.split('-');

  if (!year || !month || !day) {
    return this.getCurrentDate();
  }

  return `${month.padStart(2, '0')}/${day.padStart(2, '0')}/${year}`;
}

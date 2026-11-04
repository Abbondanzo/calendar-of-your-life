const dateFormat = new Intl.DateTimeFormat(undefined, {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})
const numberFormat = new Intl.NumberFormat()

export const formatDate = (date: Date) => dateFormat.format(date)
export const formatNumber = (n: number) => numberFormat.format(n)

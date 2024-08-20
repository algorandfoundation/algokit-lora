import { format as dateFnsFormat } from 'date-fns'

export const dateFormatter = {
  asLongDateTime: (date: Date) => dateFnsFormat(date, 'EEE, dd MMMM yyyy HH:mm:ss'),
  asShortDateTime: (date: Date) => dateFnsFormat(date, 'dd MMM yyyy HH:mm:ss'),
  asShortDate: (date: Date) => dateFnsFormat(date, 'dd MMM yyyy'),
}

import { format as dateFnsFormat } from 'date-fns'

export const dateFormatter = {
  asLongDateTime: (date: Date) => dateFnsFormat(date, 'EEE, dd MMMM yyyy HH:mm:ss'),
}

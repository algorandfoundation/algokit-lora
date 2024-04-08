import { format as dateFnsFormat } from 'date-fns'

export const dateFormatter = {
  asLongDateTime: (date: Date) => dateFnsFormat(date, 'EEEE, dd MMMM yyyy HH:mm:ss'),
}

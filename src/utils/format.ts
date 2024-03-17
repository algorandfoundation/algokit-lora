import { format as dateFnsFormat } from 'date-fns'
import Decimal from 'decimal.js'

export const dateFormatter = {
  asLongDateTime: (date: Date) => dateFnsFormat(date, 'EEEE, dd MMMM yyyy HH:mm:ss'),
}

export const algoFormatter = {
  asAlgo: (microAlgo: number) => new Decimal(microAlgo).dividedBy(1_000_000).toFixed(),
}

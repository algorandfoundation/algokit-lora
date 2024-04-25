import { Group } from '../models'

type Props = {
  group: Group
}

export function GroupDetails({ group }: Props) {
  return (
    <div>
      <h1>Group {group.id}</h1>
      <p>Timestamp: {group.timestamp}</p>
      <h2>Transactions</h2>
      <ul>
        {group.transactions.map((transaction, index) => (
          <li key={index}>{transaction.id}</li>
        ))}
      </ul>
    </div>
  )
}

import { Struct as StructType } from '@/features/app-interfaces/data/types/arc-32/application'

export function Struct({ struct }: { struct: StructType }) {
  return (
    <div>
      <span>{struct.name}:</span>
      <ul className="pl-4">
        {struct.elements.map((element, index) => (
          <li key={index}>
            {element[0]}: {element[1]}
          </li>
        ))}
      </ul>
    </div>
  )
}

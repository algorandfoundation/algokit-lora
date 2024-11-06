import {
  StructDefinition as StructDefinitionModel,
  StructFieldDefinition as StructFieldDefinitionModel,
} from '@/features/applications/models'

export function StructDefinition({ struct }: { struct: StructDefinitionModel }) {
  return (
    <div>
      <span>{struct.name}:</span>
      <ul className="pl-4">
        {struct.fields.map((field, index) => (
          <li key={index}>
            <StructFieldDefinition structField={field} />
          </li>
        ))}
      </ul>
    </div>
  )
}

export function StructFieldDefinition({ structField }: { structField: StructFieldDefinitionModel }) {
  if (!Array.isArray(structField.type)) {
    return `${structField.name}: ${structField.type.toString()}`
  }

  return (
    <>
      <span>{structField.name}:</span>
      <ul className="pl-4">
        {structField.type.map((t, index) => (
          <li key={index}>
            <StructFieldDefinition structField={t} />
          </li>
        ))}
      </ul>
      <span></span>
    </>
  )
}

type Props = {
  legend: string
  children: React.ReactNode
}

export function Fieldset({ children, legend }: Props) {
  return (
    <fieldset className="mt-2 grid gap-4">
      <legend className="text-primary mb-2 font-bold">{legend}</legend>
      {children}
    </fieldset>
  )
}

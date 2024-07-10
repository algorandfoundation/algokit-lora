type Props = {
  legend: string
  children: React.ReactNode
}

export function Fieldset({ children, legend }: Props) {
  return (
    <fieldset className="mt-2 grid gap-2">
      <legend className={'font-bold text-primary'}>{legend}</legend>
      {children}
    </fieldset>
  )
}

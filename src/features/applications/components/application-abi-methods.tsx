import { Application } from '@/features/applications/models'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/features/common/components/accordion'

type Props = {
  application: Application
}

export function ApplicationAbiMethods({ application }: Props) {
  return (
    <Accordion type="single" collapsible defaultValue="0">
      {application.abiMethods.map((abiMethod, index) => (
        <AccordionItem value={index.toString()} key={index}>
          <AccordionTrigger>{abiMethod.name}</AccordionTrigger>
          <AccordionContent>{abiMethod.name}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}

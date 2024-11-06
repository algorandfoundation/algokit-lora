import { DescriptionList } from '@/features/common/components/description-list'
import { DefaultArgument as DefaultArgumentModel } from '@/features/applications/models'

export function DefaultArgument({ defaultArgument }: { defaultArgument: DefaultArgumentModel }) {
  return (
    <DescriptionList
      items={[
        {
          dt: 'Data',
          dd: defaultArgument.data,
        },
        {
          dt: 'Type',
          dd: defaultArgument.type,
        },
        {
          dt: 'Source',
          dd: defaultArgument.source,
        },
      ]}
    />
  )
}

import { DefaultArgument as DefaultArgumentType } from '@/features/app-interfaces/data/types/arc-32/application'
import { DescriptionList } from '@/features/common/components/description-list'

export function DefaultArgument({ defaultArgument }: { defaultArgument: DefaultArgumentType }) {
  return (
    <DescriptionList
      items={[
        {
          dt: 'Source',
          dd: defaultArgument.source,
        },
        {
          dt: 'Data',
          dd: defaultArgument.source === 'abi-method' ? defaultArgument.data.name : defaultArgument.data,
        },
      ]}
    />
  )
}

import { invariant } from '@/utils/invariant'
import { AppSpec, TemplateParam } from '../../data/types'
import { useMemo } from 'react'
import { asArc56AppSpec } from '@/features/applications/mappers'
import { asTealTemplateParams } from '../../mappers'

type Props = {
  appSpec: AppSpec
  version: string
  updateable?: boolean
  deleteable?: boolean
  templateParams: TemplateParam[]
}

export function DeployApp({ appSpec, version, updateable, deleteable, templateParams }: Props) {
  invariant(appSpec, 'AppSpec is not set')

  const arc56AppSpec = useMemo(() => {
    const arc56AppSpec = asArc56AppSpec(appSpec)

    invariant(arc56AppSpec.source?.approval, 'Approval program is not set')
    invariant(arc56AppSpec.source?.clear, 'Clear program is not set')

    return arc56AppSpec
  }, [appSpec])

  const tealTemplateParams = useMemo(() => asTealTemplateParams(templateParams), [templateParams])

  const {} = useMemo(async () => {
    const newCompiledApprovalProgram = await appManager.compileTealTemplate(
      Buffer.from(arc56AppSpec.source.approval, 'base64').toString('utf-8'),
      tealTemplateParams,
      {
        updatable: state.context.updatable,
        deletable: state.context.deletable,
      }
    )
    const newCompiledClearStateProgram = await appManager.compileTealTemplate(
      Buffer.from(arc56AppSpec.source.clear, 'base64').toString('utf-8'),
      tealTemplateParams
    )

    const existingApprovalBytes = context.current.application.params.approvalProgram
    const existingClearStateBytes = context.current.application.params.clearStateProgram
    const existingApproval = Buffer.from(existingApprovalBytes).toString('base64')
    const existingClear = Buffer.from(existingClearStateBytes).toString('base64')
    const existingExtraPages = calculateExtraProgramPages(existingApprovalBytes, existingClearStateBytes)

    const newApprovalBytes = newCompiledApprovalProgram.compiledBase64ToBytes
    const newClearBytes = newCompiledClearStateProgram.compiledBase64ToBytes
    const newExtraPages = calculateExtraProgramPages(newApprovalBytes, newClearBytes)

    const isUpdate = newCompiledApprovalProgram.compiled !== existingApproval || newCompiledClearStateProgram.compiled !== existingClear
    const isSchemaBreak =
      (context.current.application.params.globalStateSchema?.numUint ?? 0) < arc56AppSpec.state.schema.global.ints ||
      (context.current.application.params.localStateSchema?.numUint ?? 0) < arc56AppSpec.state.schema.local.ints ||
      (context.current.application.params.globalStateSchema?.numByteSlice ?? 0) < arc56AppSpec.state.schema.global.bytes ||
      (context.current.application.params.localStateSchema?.numByteSlice ?? 0) < arc56AppSpec.state.schema.local.bytes ||
      existingExtraPages < newExtraPages
  }, [])

  return <div>Hi</div>
}

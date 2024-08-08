import { useMemo } from 'react'
import { AbiMethod, AbiValueType } from '@/features/abi-methods/models'
import { RenderAbiValue } from '@/features/abi-methods/components/render-abi-value'
import { TransactionLink } from '@/features/transactions/components/transaction-link'
import { AccountLink } from '@/features/accounts/components/account-link'
import { ApplicationLink } from '@/features/applications/components/application-link'
import { AssetIdLink } from '@/features/assets/components/asset-link'
// import * as prettier from `@/features/prettier/standalone.mjs`
// import prettierPluginTypescript from '@/features/prettier/plugins/typescript.mjs'
// import prettierPluginEstree from '@/features/prettier/plugins/estree.mjs'
import init, { format } from '@wasm-fmt/ruff_fmt/vite'

export function DecodedAbiMethodArguments({ method }: { method: AbiMethod }) {
  const components = useMemo(
    () =>
      method.arguments.map((argument) => {
        if (argument.type === AbiValueType.Transaction) {
          return (
            <>
              <span>{argument.name}:</span> <TransactionLink transactionId={argument.value} />
            </>
          )
        }
        if (argument.type === AbiValueType.Account) {
          return (
            <>
              <span>{argument.name}:</span> <AccountLink address={argument.value} />
            </>
          )
        }
        if (argument.type === AbiValueType.Application) {
          return (
            <>
              <span>{argument.name}:</span> <ApplicationLink applicationId={argument.value} />
            </>
          )
        }
        if (argument.type === AbiValueType.Asset) {
          return (
            <>
              <span>{argument.name}:</span> <AssetIdLink assetId={argument.value} />
            </>
          )
        }
        return (
          <div className="inline">
            <span>{argument.name}: </span> <RenderAbiValue abiValue={argument} />
          </div>
        )
      }),
    [method.arguments]
  )
  // const formatted = prettier.format("opt_into_asset(705457144)", {
  //   parser: "typescript",
  //   plugins: [prettierPluginTypescript, prettierPluginEstree],
  // }).then((result: any) => console.log(result))

  init().then(() => {
    const input = `x = {  'a':37,'b':42,

'c':927}

y = 'hello ''world'
z = 'hello '+'world'
a = 'hello {}'.format('world')
class foo  (     object  ):
  def f    (self   ):
    return       37*-+2
  def g(self, x,y=42):
      return y
def f  (   a ) :
  return      37+-+a[42-x :  y**3]`

    const formatted = format(input)
    console.log(formatted)
  })
  return (
    <ul className={'pl-4'}>
      {components.map((component, index, arr) => (
        <li key={index}>
          <>
            {component}
            {index < arr.length - 1 ? <span>{', '}</span> : null}
          </>
        </li>
      ))}
    </ul>
  )
}

import { MultiSigModel, SignatureType } from '../models'

export const getSampleMultiSig = (): MultiSigModel => {
  return {
    type: SignatureType.multiSig,
    version: 1,
    threshold: 4,
    subsignatures: [
      'fDPiywtmtrpA2WOY+Mx9y6etNBCij1VKwZmGWW4PbKk=',
      'RjQ91+zvYumrPm9UOEMN+GnlHW+0gliRCCV2b6K',
      'hYkIN+Iyt2675q+XuYwoAzwR8B0P17WTUFGYn456E4o=',
      '5ChQFEXiHWTeXoJCRymNn8rmEAJAxpaigu4wIgcaODU=',
      'ETnffVmxyVfJtVgCWFuStLsPJna9G1SHA1yJrfIo6RU=',
      'k5F6WQJGyeiPHaN7fvmnBXz6YNq4NQ6BguE7yUmRWkI=',
    ],
  }
}

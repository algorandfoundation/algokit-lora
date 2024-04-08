import { PaymentTransactionModel, TransactionType } from '../models/models'

export const getSampleTransaction = (transactionId: string): PaymentTransactionModel => {
  return {
    id: transactionId,
    type: TransactionType.Payment,
    confirmedRound: 36570178,
    roundTime: new Date(1709189521),
    group: 'a7Qnfai3DEKS8JI5ZPl149O9P7RztrBqRvBwRebx/Ao=',
    fee: 1000,
    sender: 'IVCEEIH2Q32DZNRTS5XFVEFFAQGERNZHHQT6S4UPY7ORJMHIQDSTX7YM4E',
    amount: 2456000,
    closeAmount: 0,
    receiver: '3P3CHL4M5JTDJKEL3ARLUZRXY23BWWPX6SZDC2NIBALL3SKE7JBIFOVOAY',
    base64Note: 'base64Note',
    textNote: 'textNote',
    messagePackNote: 'messagePackNote',
    json: `{"close-rewards":0,"closing-amount":0,"confirmed-round":68203,"fee":1000,"first-valid":68200,"genesis-hash":"wGHE2Pwdvd7S12BL5FaOP20EGYesN73ktiC1qzkkit8=","genesis-id":"mainnet-v1.0","id":"LNJH2Q2BYMV7KMMFMEEUCKIW6C3HPBOL4ARZBPPE2OBVVDPNVN6A","intra-round-offset":0,"last-valid":69200,"payment-transaction":{"amount":1000000000,"close-amount":0,"receiver":"3P3CHL4M5JTDJKEL3ARLUZRXY23BWWPX6SZDC2NIBALL3SKE7JBIFOVOAY"},"receiver-rewards":0,"round-time":1560638479,"sender":"IVCEEIH2Q32DZNRTS5XFVEFFAQGERNZHHQT6S4UPY7ORJMHIQDSTX7YM4E","sender-rewards":0,"signature":{"multisig":{"subsignature":[{"public-key":"fDPiywtmtrpA2WOY+Mx9y6etNBCij1VKwZmGWW4PbKk="},{"public-key":"RjQ91+zvYumrPm9UOEMN+GnlHW+0gliRCCV2b6KOlwk=","signature":"OZIfWu/UeOM4TqNTM2zZopJ3qoc6OHsHktVR4HSrWMUSWofIAtPgKf8Uqxcjkmu7E0k0O7spKtvqIEt53qTxAA=="},{"public-key":"hYkIN+Iyt2675q+XuYwoAzwR8B0P17WTUFGYn456E4o=","signature":"kJ9eRUVplsmjPrtprSsZO/n5lG8Ff9YWhWKk3LQgtez9jGJ1EvQmxxh3nOWldYSkaDW+zUTGKHqDcsLleYqkAA=="},{"public-key":"5ChQFEXiHWTeXoJCRymNn8rmEAJAxpaigu4wIgcaODU=","signature":"tjnxB0mpxOlTEbrJpdq888yyvuKRL2WJith8TXpVJO9fN8QnDCDAEsP2yGPiSlfQYQaqzKLe60DSIYll7nZeAg=="},{"public-key":"ETnffVmxyVfJtVgCWFuStLsPJna9G1SHA1yJrfIo6RU="},{"public-key":"k5F6WQJGyeiPHaN7fvmnBXz6YNq4NQ6BguE7yUmRWkI=","signature":"2RlNv5MxP528Zwh5lGSaY/vsCl50qwoxZ1/Blcu+mXLlG0Sr+3J44qRSjhbDrkwsJL5YHFcdv3uy3NSAd5s3AQ=="}],"threshold":4,"version":1}},"tx-type":"pay"}`,
  }
}

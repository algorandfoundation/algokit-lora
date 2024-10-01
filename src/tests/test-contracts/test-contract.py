from algopy import (
    ARC4Contract,
    arc4,
    gtxn,
    Bytes,
)


class TestContract(ARC4Contract):
    @arc4.abimethod
    def add(self, a: arc4.UInt64, b: arc4.UInt64) -> arc4.UInt64:
        return arc4.UInt64(a.native + b.native)

    @arc4.abimethod
    def get_pay_txn_amount(self, pay_txn: gtxn.PaymentTransaction) -> arc4.UInt64:
        return arc4.UInt64(pay_txn.amount)

    @arc4.abimethod
    def echo_bytes(self, a: Bytes) -> Bytes:
        return a

import typing as t
from algopy import (
    ARC4Contract,
    arc4,
    gtxn,
    Bytes,
)

StaticInts: t.TypeAlias = arc4.StaticArray[arc4.UInt64, t.Literal[4]]
DynamicInts: t.TypeAlias = arc4.DynamicArray[arc4.UInt64]
DynamicNestedInts: t.TypeAlias = arc4.DynamicArray[DynamicInts]
ReturnType: t.TypeAlias = arc4.Tuple[
    DynamicNestedInts, arc4.Tuple[DynamicInts, arc4.String]
]


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

    @arc4.abimethod
    def echo_static_array(self, arr: StaticInts) -> StaticInts:
        return arr

    @arc4.abimethod
    def echo_dynamic_array(self, arr: DynamicInts) -> DynamicInts:
        return arr

    @arc4.abimethod
    def nest_array_and_tuple(
        self, arr: DynamicNestedInts, tuple: arc4.Tuple[DynamicInts, arc4.String]
    ) -> ReturnType:
        (child_array, str) = tuple.native

        return ReturnType(
            (
                arr.copy(),
                arc4.Tuple[DynamicInts, arc4.String]((child_array.copy(), str)),
            )
        )

    @arc4.abimethod
    def echo_boolean(self, bool: arc4.Bool) -> arc4.Bool:
        return bool

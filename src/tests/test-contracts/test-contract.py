import typing as t
from algopy import ARC4Contract, Txn, arc4, gtxn, Bytes, GlobalState, UInt64, itxn, LocalState

StaticInts: t.TypeAlias = arc4.StaticArray[arc4.UInt64, t.Literal[4]]
DynamicInts: t.TypeAlias = arc4.DynamicArray[arc4.UInt64]
DynamicNestedInts: t.TypeAlias = arc4.DynamicArray[DynamicInts]
ReturnType: t.TypeAlias = arc4.Tuple[
    DynamicNestedInts, arc4.Tuple[DynamicInts, arc4.String]
]

class TestContract(ARC4Contract):
    def __init__(self) -> None:
        self.global_state_big_int = GlobalState(UInt64(33399922244455501))
        self.local_state_big_int = LocalState(UInt64)

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

    @arc4.abimethod
    def inner_pay_appl(self, appId: arc4.UInt64) -> arc4.UInt64:
        payTxn = itxn.Payment(
            receiver = Txn.sender,
            amount = 100000,
        )

        result, _txn = arc4.abi_call[arc4.UInt64](
            "get_pay_txn_amount(pay)uint64", payTxn, app_id=appId.native
        )

        return result

    @arc4.abimethod(allow_actions=["OptIn"])
    def set_local(self) -> None:
        self.local_state_big_int[Txn.sender] = UInt64(33399922244455501)

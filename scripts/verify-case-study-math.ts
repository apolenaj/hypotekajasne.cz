import {
  CONTROL_MODEL_INPUTS,
  amortizeFirstMonths,
  computeMonthlyAnnuity,
  computeOperatingSurplusAfterReserve,
  otherAnnualCosts,
  runControlModel,
} from "../src/lib/property-rentgen/control-model";

const m = runControlModel();
const other = otherAnnualCosts(CONTROL_MODEL_INPUTS);
const a = amortizeFirstMonths(2_940_000, 4.8, 30, 60);
const bal = a.rows[59]!.closingBalanceCzk;
const pay68 = computeMonthlyAnnuity(bal, 6.8, 25);
const ops20 = computeOperatingSurplusAfterReserve({
  monthlyRentCzk: 20_000,
  vacancyRate: 0.05,
  managementFeeRate: 0.05,
  otherAnnualCostsCzk: other,
});
const rentY5 = 20_000 * Math.pow(1.02, 4);
const opsY5 = computeOperatingSurplusAfterReserve({
  monthlyRentCzk: rentY5,
  vacancyRate: 0.05,
  managementFeeRate: 0.05,
  otherAnnualCostsCzk: other,
});
const fixed = 2_000 + 300 + 200 + 1_000;
const stressOut = fixed + m.monthlyPaymentCzk;
const pay58 = computeMonthlyAnnuity(2_940_000, 5.8, 30);
const ops21 = computeOperatingSurplusAfterReserve({
  monthlyRentCzk: 21_000,
  vacancyRate: 0.05,
  managementFeeRate: 0.05,
  otherAnnualCostsCzk: other,
});

console.log(
  JSON.stringify(
    {
      payment: m.monthlyPaymentCzk,
      cf: m.monthlyCashFlowCzk,
      bal60: bal,
      pay68,
      cfRefixConstRent: ops20.operatingSurplusAfterReserveCzk / 12 - pay68,
      rentY5,
      cfRefixGrownRent: opsY5.operatingSurplusAfterReserveCzk / 12 - pay68,
      stressMonthlyOut: stressOut,
      combinedMinApprox: 150_000 - 3 * stressOut - 80_000,
      deltaRent1000:
        ops21.operatingSurplusAfterReserveCzk / 12 -
        m.monthlyPaymentCzk -
        m.monthlyCashFlowCzk,
      deltaPaymentRate1pp: pay58 - m.monthlyPaymentCzk,
    },
    null,
    2
  )
);

interface CommissionResult {
  totalCommission: number;
  platformFee: number;
  agentCommission: number;
}

/**
 * Calculates commission breakdown for property sales
 * Platform takes 5% of the agent's commission
 * Standard agent commission is 3% of sale amount
 * @param saleAmount - The total sale amount of the property
 * @returns CommissionResult object with breakdown of fees
 */
export function calculateCommission(saleAmount: number): CommissionResult {
  // Standard agent commission rate is 3%
  const COMMISSION_RATE = 0.03;
  // Platform fee is 5% of the agent's commission
  const PLATFORM_FEE_RATE = 0.05;

  // Calculate total commission (3% of sale amount)
  const totalCommission = saleAmount * COMMISSION_RATE;
  
  // Calculate platform fee (5% of total commission)
  const platformFee = totalCommission * PLATFORM_FEE_RATE;
  
  // Calculate final agent commission (total commission minus platform fee)
  const agentCommission = totalCommission - platformFee;

  return {
    totalCommission: Number(totalCommission.toFixed(2)),
    platformFee: Number(platformFee.toFixed(2)),
    agentCommission: Number(agentCommission.toFixed(2))
  };
}

/**
 * Validates if a commission amount is within acceptable range
 * @param amount - Commission amount to validate
 * @param saleAmount - Original property sale amount
 * @returns boolean indicating if commission is valid
 */
export function isValidCommission(amount: number, saleAmount: number): boolean {
  // Commission should not exceed 10% of sale amount
  const MAX_COMMISSION_RATE = 0.10;
  
  if (amount <= 0) return false;
  if (amount > (saleAmount * MAX_COMMISSION_RATE)) return false;
  
  return true;
}

/**
 * Formats commission amount to currency string
 * @param amount - Amount to format
 * @param currency - Currency code (default: GBP)
 * @returns Formatted currency string
 */
export function formatCommission(amount: number, currency: string = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currency
  }).format(amount);
}
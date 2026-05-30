export interface TrustFactors {
  paymentHistory: number; // 0-100: percentage of on-time payments
  leaseCompletions: number; // number of completed leases
  maintenanceReports: number; // number of maintenance issues reported
  documentVerification: boolean; // ID verified
  referenceChecks: boolean; // references checked
  employmentVerified: boolean; // employment verified
  bankVerified: boolean; // bank account verified
  monthsRented: number; // total months rented
}

export interface TrustScore {
  score: number; // 0-100
  grade: "A" | "B" | "C" | "D" | "F";
  label: string;
  factors: {
    name: string;
    value: number;
    weight: number;
    contribution: number;
  }[];
}

export function calculateTrustScore(factors: Partial<TrustFactors>): TrustScore {
  const weights = {
    paymentHistory: 0.35,
    leaseCompletions: 0.20,
    documentVerification: 0.15,
    referenceChecks: 0.10,
    employmentVerified: 0.10,
    bankVerified: 0.05,
    monthsRented: 0.05,
  };

  let totalScore = 0;
  const breakdown: TrustScore["factors"] = [];

  // Payment history (0-100%)
  const paymentScore = Math.min(100, factors.paymentHistory ?? 0);
  const paymentContrib = paymentScore * weights.paymentHistory;
  totalScore += paymentContrib;
  breakdown.push({
    name: "Payment History",
    value: paymentScore,
    weight: weights.paymentHistory,
    contribution: paymentContrib,
  });

  // Lease completions (0-5+ = 0-100)
  const leaseScore = Math.min(100, (factors.leaseCompletions ?? 0) * 20);
  const leaseContrib = leaseScore * weights.leaseCompletions;
  totalScore += leaseContrib;
  breakdown.push({
    name: "Lease Completions",
    value: leaseScore,
    weight: weights.leaseCompletions,
    contribution: leaseContrib,
  });

  // Document verification
  const docScore = factors.documentVerification ? 100 : 0;
  const docContrib = docScore * weights.documentVerification;
  totalScore += docContrib;
  breakdown.push({
    name: "Document Verification",
    value: docScore,
    weight: weights.documentVerification,
    contribution: docContrib,
  });

  // Reference checks
  const refScore = factors.referenceChecks ? 100 : 0;
  const refContrib = refScore * weights.referenceChecks;
  totalScore += refContrib;
  breakdown.push({
    name: "Reference Checks",
    value: refScore,
    weight: weights.referenceChecks,
    contribution: refContrib,
  });

  // Employment verification
  const empScore = factors.employmentVerified ? 100 : 0;
  const empContrib = empScore * weights.employmentVerified;
  totalScore += empContrib;
  breakdown.push({
    name: "Employment Verified",
    value: empScore,
    weight: weights.employmentVerified,
    contribution: empContrib,
  });

  // Bank verification
  const bankScore = factors.bankVerified ? 100 : 0;
  const bankContrib = bankScore * weights.bankVerified;
  totalScore += bankContrib;
  breakdown.push({
    name: "Bank Verified",
    value: bankScore,
    weight: weights.bankVerified,
    contribution: bankContrib,
  });

  // Months rented (0-24+ = 0-100)
  const monthsScore = Math.min(100, (factors.monthsRented ?? 0) * (100 / 24));
  const monthsContrib = monthsScore * weights.monthsRented;
  totalScore += monthsContrib;
  breakdown.push({
    name: "Rental History",
    value: monthsScore,
    weight: weights.monthsRented,
    contribution: monthsContrib,
  });

  const score = Math.round(totalScore);
  let grade: TrustScore["grade"] = "F";
  let label = "Very Low Trust";

  if (score >= 90) {
    grade = "A";
    label = "Excellent";
  } else if (score >= 75) {
    grade = "B";
    label = "Good";
  } else if (score >= 60) {
    grade = "C";
    label = "Fair";
  } else if (score >= 45) {
    grade = "D";
    label = "Poor";
  }

  return { score, grade, label, factors: breakdown };
}

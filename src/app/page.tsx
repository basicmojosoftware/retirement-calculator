'use client'
import { useState } from 'react';
import { Button } from "/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "/components/ui/card";
import { Input } from "/components/ui/input";
import { Label } from "/components/ui/label";
import { Checkbox } from "/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "/components/ui/table";
import { Toggle } from "/components/ui/toggle";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "/components/ui/tooltip";

interface FormData {
  startingAge: string;
  retirementAge: string;
  currentSavings: string;
  currentIncome: string;
  currentDeferral: string;
  autoEscalate: boolean;
  escalationRate: string;
  escalationCap: string;
  currentMatch: string;
  assetGrowthBefore: string;
  assetGrowthAfter: string;
  inflation: string;
  lifeExpectancy: string;
  retirementTaxRate: string;
  socialSecurity: string;
}

interface Results {
  totalSavingsAtRetirement: number;
  annualRetirementIncome: number;
  incomeReplacementPercent: number;
  finalWorkingIncome: number;
  socialSecurityAtRetirement: number;
  retirementYears: number;
  withdrawalRate: number;
  totalContributions: number;
  totalEmployerMatch: number;
  totalInvestmentGrowth: number;
  realRateOfReturn: number;
  savingsAtRetirementInTodayDollars: number;
  annualWithdrawal: number;
  annualWithdrawalInTodayDollars: number;
  monthlyRetirementIncome: number;
  monthlySocialSecurity: number;
  totalRetirementIncome: number;
  yearsUntilRetirement: number;
  totalWorkingContributions: number;
  endingPortfolioValue: number;
}

export default function RetirementCalculator() {
  const [formData, setFormData] = useState<FormData>({
    startingAge: '30',
    retirementAge: '65',
    currentSavings: '100000',
    currentIncome: '80000',
    currentDeferral: '10',
    autoEscalate: false,
    escalationRate: '1',
    escalationCap: '15',
    currentMatch: '5',
    assetGrowthBefore: '7',
    assetGrowthAfter: '4',
    inflation: '2',
    lifeExpectancy: '90',
    retirementTaxRate: '20',
    socialSecurity: '25000'
  });

  const [results, setResults] = useState<Results | null>(null);
  const [depletionMode, setDepletionMode] = useState(true); // Changed default to Depletion Mode

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, autoEscalate: checked }));
  };

  const parseValue = (value: string) => parseFloat(value) || 0;

  const calculateRetirement = () => {
    const startingAge = parseValue(formData.startingAge);
    const retirementAge = parseValue(formData.retirementAge);
    const currentSavings = parseValue(formData.currentSavings);
    const currentIncome = parseValue(formData.currentIncome);
    const currentDeferral = parseValue(formData.currentDeferral);
    const escalationRate = parseValue(formData.escalationRate);
    const escalationCap = parseValue(formData.escalationCap);
    const currentMatch = parseValue(formData.currentMatch);
    const assetGrowthBefore = parseValue(formData.assetGrowthBefore);
    const assetGrowthAfter = parseValue(formData.assetGrowthAfter);
    const inflation = parseValue(formData.inflation);
    const lifeExpectancy = parseValue(formData.lifeExpectancy);
    const retirementTaxRate = parseValue(formData.retirementTaxRate);
    const socialSecurity = parseValue(formData.socialSecurity);

    const workingYears = retirementAge - startingAge;
    const retirementYears = lifeExpectancy - retirementAge;

    const finalWorkingIncome = currentIncome * Math.pow(1 + inflation/100, workingYears);
    const socialSecurityAtRetirement = socialSecurity * Math.pow(1 + inflation/100, workingYears);
    const realRateOfReturn = (1 + assetGrowthAfter/100) / (1 + inflation/100) - 1;

    let retirementSavings = currentSavings;
    let currentDeferralRate = currentDeferral;
    let totalContributions = 0;
    let totalEmployerMatch = 0;

    for (let year = 1; year <= workingYears; year++) {
      const contribution = currentIncome * Math.pow(1 + inflation/100, year-1) * (currentDeferralRate/100);
      const match = currentIncome * Math.pow(1 + inflation/100, year-1) * (currentMatch/100);
      totalContributions += contribution;
      totalEmployerMatch += match;
      retirementSavings = retirementSavings * (1 + assetGrowthBefore/100) + contribution + match;

      if (formData.autoEscalate && currentDeferralRate < escalationCap) {
        currentDeferralRate = Math.min(currentDeferralRate + escalationRate, escalationCap);
      }
    }

    const totalInvestmentGrowth = retirementSavings - currentSavings - totalContributions - totalEmployerMatch;

    let annualWithdrawal = 0;
    let endingPortfolioValue = retirementSavings;
    let withdrawalRate = 0;

    if (depletionMode) {
      const numerator = retirementSavings * realRateOfReturn;
      const denominator = 1 - Math.pow(1 + realRateOfReturn, -retirementYears);
      annualWithdrawal = numerator / denominator;
      withdrawalRate = annualWithdrawal / retirementSavings;
      
      endingPortfolioValue = retirementSavings;
      for (let year = 1; year <= retirementYears; year++) {
        endingPortfolioValue = endingPortfolioValue * (1 + assetGrowthAfter/100) - annualWithdrawal;
        if (year === retirementYears) {
          endingPortfolioValue = 0;
        }
      }
    } else {
      withdrawalRate = 0.04;
      annualWithdrawal = retirementSavings * withdrawalRate;
      
      endingPortfolioValue = retirementSavings;
      for (let year = 1; year <= retirementYears; year++) {
        endingPortfolioValue = endingPortfolioValue * (1 + assetGrowthAfter/100) - annualWithdrawal;
      }
    }

    const annualWithdrawalAfterTax = annualWithdrawal * (1 - retirementTaxRate/100);
    const totalAnnualIncome = annualWithdrawalAfterTax + socialSecurityAtRetirement;
    const incomeReplacementPercent = (totalAnnualIncome / finalWorkingIncome) * 100;

    const savingsAtRetirementInTodayDollars = retirementSavings / Math.pow(1 + inflation/100, workingYears);
    const annualWithdrawalInTodayDollars = annualWithdrawal / Math.pow(1 + inflation/100, workingYears);

    setResults({
      totalSavingsAtRetirement: Math.round(retirementSavings),
      annualRetirementIncome: Math.round(totalAnnualIncome),
      incomeReplacementPercent: Math.round(incomeReplacementPercent),
      finalWorkingIncome: Math.round(finalWorkingIncome),
      socialSecurityAtRetirement: Math.round(socialSecurityAtRetirement),
      retirementYears,
      withdrawalRate: withdrawalRate * 100,
      totalContributions: Math.round(totalContributions),
      totalEmployerMatch: Math.round(totalEmployerMatch),
      totalInvestmentGrowth: Math.round(totalInvestmentGrowth),
      realRateOfReturn: realRateOfReturn * 100,
      savingsAtRetirementInTodayDollars: Math.round(savingsAtRetirementInTodayDollars),
      annualWithdrawal: Math.round(annualWithdrawal),
      annualWithdrawalInTodayDollars: Math.round(annualWithdrawalInTodayDollars),
      monthlyRetirementIncome: Math.round(totalAnnualIncome / 12),
      monthlySocialSecurity: Math.round(socialSecurityAtRetirement / 12),
      totalRetirementIncome: Math.round(totalAnnualIncome * retirementYears),
      yearsUntilRetirement: workingYears,
      totalWorkingContributions: Math.round(totalContributions + totalEmployerMatch),
      endingPortfolioValue: Math.round(Math.max(0, endingPortfolioValue))
    });
  };

  const numberInputProps = {
    type: "text",
    pattern: "[0-9]*\\.?[0-9]*",
    inputMode: "decimal" as const
  };

  return (
    <TooltipProvider>
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Retirement Calculator</CardTitle>
            <CardDescription>
              Plan your retirement with accurate projections including Social Security benefits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold">Personal Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="startingAge">Current Age</Label>
                  <Input
                    id="startingAge"
                    name="startingAge"
                    value={formData.startingAge}
                    onChange={handleInputChange}
                    {...numberInputProps}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retirementAge">Retirement Age</Label>
                  <Input
                    id="retirementAge"
                    name="retirementAge"
                    value={formData.retirementAge}
                    onChange={handleInputChange}
                    {...numberInputProps}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lifeExpectancy">Life Expectancy</Label>
                  <Input
                    id="lifeExpectancy"
                    name="lifeExpectancy"
                    value={formData.lifeExpectancy}
                    onChange={handleInputChange}
                    {...numberInputProps}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Financial Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="currentSavings">Current Savings ($)</Label>
                  <Input
                    id="currentSavings"
                    name="currentSavings"
                    value={formData.currentSavings}
                    onChange={handleInputChange}
                    {...numberInputProps}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentIncome">Annual Income ($)</Label>
                  <Input
                    id="currentIncome"
                    name="currentIncome"
                    value={formData.currentIncome}
                    onChange={handleInputChange}
                    {...numberInputProps}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentDeferral">Deferral Rate (%)</Label>
                  <Input
                    id="currentDeferral"
                    name="currentDeferral"
                    value={formData.currentDeferral}
                    onChange={handleInputChange}
                    {...numberInputProps}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentMatch">Employer Match (%)</Label>
                  <Input
                    id="currentMatch"
                    name="currentMatch"
                    value={formData.currentMatch}
                    onChange={handleInputChange}
                    {...numberInputProps}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Contribution Escalation</h3>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoEscalate"
                    checked={formData.autoEscalate}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="autoEscalate">Auto-Escalate Deferral Rate</Label>
                </div>
                {formData.autoEscalate && (
                  <>
                    <div className="space-y-2 pl-6">
                      <Label htmlFor="escalationRate">Annual Increase (%)</Label>
                      <Input
                        id="escalationRate"
                        name="escalationRate"
                        value={formData.escalationRate}
                        onChange={handleInputChange}
                        {...numberInputProps}
                      />
                    </div>
                    <div className="space-y-2 pl-6">
                      <Label htmlFor="escalationCap">Maximum Deferral (%)</Label>
                      <Input
                        id="escalationCap"
                        name="escalationCap"
                        value={formData.escalationCap}
                        onChange={handleInputChange}
                        {...numberInputProps}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Investment Assumptions</h3>
                <div className="space-y-2">
                  <Label htmlFor="assetGrowthBefore">Growth Before Retirement (%)</Label>
                  <Input
                    id="assetGrowthBefore"
                    name="assetGrowthBefore"
                    value={formData.assetGrowthBefore}
                    onChange={handleInputChange}
                    {...numberInputProps}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="assetGrowthAfter">Growth During Retirement (%)</Label>
                  <Input
                    id="assetGrowthAfter"
                    name="assetGrowthAfter"
                    value={formData.assetGrowthAfter}
                    onChange={handleInputChange}
                    {...numberInputProps}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inflation">Inflation Rate (%)</Label>
                  <Input
                    id="inflation"
                    name="inflation"
                    value={formData.inflation}
                    onChange={handleInputChange}
                    {...numberInputProps}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="socialSecurity">Social Security at Retirement ($)</Label>
                  <Input
                    id="socialSecurity"
                    name="socialSecurity"
                    value={formData.socialSecurity}
                    onChange={handleInputChange}
                    {...numberInputProps}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retirementTaxRate">Retirement Tax Rate (%)</Label>
                  <Input
                    id="retirementTaxRate"
                    name="retirementTaxRate"
                    value={formData.retirementTaxRate}
                    onChange={handleInputChange}
                    {...numberInputProps}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Label htmlFor="depletionMode">Withdrawal Strategy:</Label>
                <Toggle
                  id="depletionMode"
                  pressed={depletionMode}
                  onPressedChange={setDepletionMode}
                  className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                >
                  {depletionMode ? 'Depletion Mode' : 'Conservative Mode'}
                </Toggle>
              </div>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent>
                  {depletionMode 
                    ? "Calculates withdrawal rate that depletes portfolio by life expectancy" 
                    : "Uses conservative 4% withdrawal rule"}
                </TooltipContent>
              </Tooltip>
            </div>

            <Button onClick={calculateRetirement} className="w-full">
              Calculate Retirement Plan
            </Button>
          </CardContent>
        </Card>

        {results && (
          <Card>
            <CardHeader>
              <CardTitle>Retirement Projection Details</CardTitle>
              <CardDescription>
                {depletionMode 
                  ? "Depletion mode - portfolio will be fully depleted by life expectancy" 
                  : "Conservative mode - using 4% withdrawal rule"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Metric</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Years Until Retirement</TableCell>
                    <TableCell className="text-right">{results.yearsUntilRetirement}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Retirement Duration</TableCell>
                    <TableCell className="text-right">{results.retirementYears} years</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Current Savings</TableCell>
                    <TableCell className="text-right">${formData.currentSavings}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Current Income</TableCell>
                    <TableCell className="text-right">${formData.currentIncome}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Social Security at Retirement</TableCell>
                    <TableCell className="text-right">${results.socialSecurityAtRetirement.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Total Contributions</TableCell>
                    <TableCell className="text-right">${results.totalContributions.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Total Employer Match</TableCell>
                    <TableCell className="text-right">${results.totalEmployerMatch.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Total Investment Growth</TableCell>
                    <TableCell className="text-right">${results.totalInvestmentGrowth.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Savings at Retirement</TableCell>
                    <TableCell className="text-right">${results.totalSavingsAtRetirement.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Initial Withdrawal Rate</TableCell>
                    <TableCell className="text-right">{results.withdrawalRate.toFixed(2)}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Annual Retirement Income</TableCell>
                    <TableCell className="text-right">${results.annualRetirementIncome.toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Income Replacement Percentage</TableCell>
                    <TableCell className="text-right">{results.incomeReplacementPercent}%</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Projected Ending Portfolio Value</TableCell>
                    <TableCell className="text-right">
                      ${results.endingPortfolioValue.toLocaleString()}
                      <span className="text-sm text-muted-foreground ml-2">
                        (at age {parseValue(formData.lifeExpectancy)})
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}

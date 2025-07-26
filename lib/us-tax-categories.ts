// US Tax Categories for tax optimization
export const US_TAX_CATEGORIES = {
  business_expense: [
    { name: 'Advertising', description: 'Business advertising and marketing expenses', form: 'Schedule C' },
    { name: 'Car and Truck Expenses', description: 'Vehicle expenses for business use', form: 'Schedule C' },
    { name: 'Commissions and Fees', description: 'Commissions and professional fees paid', form: 'Schedule C' },
    { name: 'Contract Labor', description: 'Payments to independent contractors', form: 'Schedule C' },
    { name: 'Legal and Professional Services', description: 'Attorney, accountant, and consultant fees', form: 'Schedule C' },
    { name: 'Office Expenses', description: 'Office supplies and expenses', form: 'Schedule C' },
    { name: 'Rent or Lease (Vehicles)', description: 'Vehicle rental and lease payments', form: 'Schedule C' },
    { name: 'Rent or Lease (Other)', description: 'Equipment and property rental', form: 'Schedule C' },
    { name: 'Repairs and Maintenance', description: 'Business equipment and property repairs', form: 'Schedule C' },
    { name: 'Supplies', description: 'Business supplies and materials', form: 'Schedule C' },
    { name: 'Taxes and Licenses', description: 'Business taxes and license fees', form: 'Schedule C' },
    { name: 'Travel', description: 'Business travel expenses', form: 'Schedule C' },
    { name: 'Meals', description: 'Business meals (50% deductible)', form: 'Schedule C' },
    { name: 'Utilities', description: 'Business utilities and phone', form: 'Schedule C' },
    { name: 'Insurance (other than health)', description: 'Business insurance premiums', form: 'Schedule C' },
    { name: 'Interest (Business)', description: 'Business loan interest expenses', form: 'Schedule C' },
    { name: 'Employee Benefits', description: 'Employee benefits and insurance', form: 'Schedule C' },
    { name: 'Depreciation', description: 'Depreciation of business assets', form: 'Schedule C' },
    { name: 'Other Business Expenses', description: 'Other miscellaneous business expenses', form: 'Schedule C' }
  ],
  personal_deduction: [
    { name: 'Medical and Dental Expenses', description: 'Medical and dental expenses exceeding 7.5% of AGI', form: 'Schedule A' },
    { name: 'State and Local Taxes', description: 'State and local income, sales, and property taxes (up to $10,000)', form: 'Schedule A' },
    { name: 'Home Mortgage Interest', description: 'Mortgage interest on primary and secondary homes', form: 'Schedule A' },
    { name: 'Charitable Contributions', description: 'Charitable contributions and donations', form: 'Schedule A' },
    { name: 'Casualty and Theft Losses', description: 'Casualty and theft losses from federally declared disasters', form: 'Schedule A' },
    { name: 'Other Itemized Deductions', description: 'Other miscellaneous itemized deductions', form: 'Schedule A' }
  ],
  income: [
    { name: 'Business Income', description: 'Income from business operations', form: 'Schedule C' },
    { name: 'Interest Income', description: 'Interest earned from banks, bonds, etc.', form: 'Form 1040' },
    { name: 'Dividend Income', description: 'Dividends from stocks and mutual funds', form: 'Form 1040' },
    { name: 'Capital Gains', description: 'Gains from sale of investments or property', form: 'Schedule D' },
    { name: 'Rental Income', description: 'Income from rental properties', form: 'Schedule E' },
    { name: 'Retirement Income', description: 'Distributions from retirement accounts', form: 'Form 1040' },
    { name: 'Social Security Benefits', description: 'Social Security benefit payments', form: 'Form 1040' },
    { name: 'Unemployment Compensation', description: 'Unemployment benefits received', form: 'Form 1040' },
    { name: 'Other Income', description: 'Other miscellaneous income', form: 'Form 1040' }
  ]
};

// Helper function to get tax categories by type
export function getTaxCategoriesByType(type: 'business_expense' | 'personal_deduction' | 'income') {
  return US_TAX_CATEGORIES[type] || [];
}

// Helper function to check if a category is tax deductible
export function isTaxDeductibleCategory(categoryName: string): boolean {
  const allDeductibleCategories = [
    ...US_TAX_CATEGORIES.business_expense,
    ...US_TAX_CATEGORIES.personal_deduction
  ];
  
  return allDeductibleCategories.some(cat => cat.name === categoryName);
}

// Helper function to get tax category info
export function getTaxCategoryInfo(categoryName: string) {
  const allCategories = [
    ...US_TAX_CATEGORIES.business_expense.map(cat => ({ ...cat, type: 'business_expense' })),
    ...US_TAX_CATEGORIES.personal_deduction.map(cat => ({ ...cat, type: 'personal_deduction' })),
    ...US_TAX_CATEGORIES.income.map(cat => ({ ...cat, type: 'income' }))
  ];
  
  return allCategories.find(cat => cat.name === categoryName);
}
export const GENES = ['CYP2D6', 'CYP2C19', 'CYP2C9', 'CYP3A4', 'TPMT', 'DPYD']
 
export const VARIANTS = {
    CYP2D6:  ['rs3892097', 'rs35742686', 'rs5030655'],
    CYP2C19: ['rs4244285', 'rs4986893', 'rs28399504'],
    CYP2C9:  ['rs1799853', 'rs1057910'],
    CYP3A4:  ['rs2740574', 'rs35599367'],
    TPMT:    ['rs1800462', 'rs1800460'],
    DPYD:    ['rs3918290', 'rs55886062'],
}
 
export const MEDICATIONS = {
    CYP2D6:  ['Codeine', 'Tramadol', 'Tamoxifen', 'Metoprolol'],
    CYP2C19: ['Clopidogrel', 'Omeprazole', 'Escitalopram'],
    CYP2C9:  ['Warfarin', 'Phenytoin', 'Celecoxib'],
    CYP3A4:  ['Atorvastatin', 'Midazolam', 'Tacrolimus'],
    TPMT:    ['Azathioprine', '6-Mercaptopurine'],
    DPYD:    ['5-Fluorouracil', 'Capecitabine'],
}
 
export const ALLELE_OPTIONS = [
    { value: '*1', label: '*1 (normal)' },
    { value: '*2', label: '*2' },
    { value: '*33', label: '*33' },
    { value: '*35', label: '*35' }, 
    { value: '*39', label: '*39' },
]
 
// Sample data for the Load Samples button
export const SAMPLE = {
    gene:             'CYP2D6',
    geneManual:       '',
    variant:          'rs3892097',
    variantManual:    '',
    medication:       'Codeine',
    medicationManual: '',
    allele1:          '*2',
    allele1Manual:    '',
    allele2:          '*2',
    allele2Manual:    '',
}
 
export const EMPTY = {
    gene:             '',
    geneManual:       '',
    variant:          '',
    variantManual:    '',
    medication:       '',
    medicationManual: '',
    allele1:          '',
    allele1Manual:    '',
    allele2:          '',
    allele2Manual:    '',
}
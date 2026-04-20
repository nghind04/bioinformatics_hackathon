// Only CYP2D6 and CYP2C19 are supported by the ML model
export const GENES = ['CYP2D6', 'CYP2C19']


export const MEDICATIONS = {
    CYP2D6:  ['Codeine', 'Tramadol', 'Tamoxifen', 'Metoprolol'],
    CYP2C19: ['Clopidogrel', 'Omeprazole', 'Escitalopram'],
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
    medication:       '',
    medicationManual: '',
    allele1:          '',
    allele1Manual:    '',
    allele2:          '',
    allele2Manual:    '',
}
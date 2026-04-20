// Only CYP2D6 and CYP2C19 are supported by the ML model
export const GENES = ['CYP2D6', 'CYP2C19']


export const MEDICATIONS = {
    CYP2D6:  ['Codeine', 'Tramadol', 'o-desmethyltramadol', 'Aripiprazole',
        'Risperidone', 'Olanzapine', 'Fluoxetine', 'Paroxetine',
        'Tamoxifen', 'Endoxifen', 'Dextromethorphan', 'Methadone',
        'Imipramine', 'Trimipramine', 'Donepezil', 'Gefitinib',
        'Oxymorphone', 'Primaquine', 'Sparteine', 'Debrisoquine',
        'Methamphetamine', '4-hydroxytamoxifen'],
    CYP2C19: ['Lacosamide', 'Norclobazam', 'Mephenytoin', 'sertraline', 'Prasugrel', 'Voriconazole'],
}
 
export const ALLELE_OPTIONS = {
    CYP2D6: ['*1', '*2', '*3', '*4', '*5', '*6', '*7', '*8', '*9', '*10',
        '*11', '*12', '*13', '*14', '*15', '*17', '*18', '*21', '*29',
        '*35', '*36', '*38', '*39', '*40', '*41', '*42', '*45', '*59',
        '*1xn', '*2xn', '*4xn'],
    CYP2C19: ['*1', '*2', '*3', '*4', '*5', '*7', '*8', '*17'],
}
 
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
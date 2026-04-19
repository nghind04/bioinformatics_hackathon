export const MOCK_RESULT = {
    gene:       'CYP2D6',
    variant:    'rs3892097',
    allele:     '*2/*2',
    medication:     'Codeine',
    metabolizerType:    'Poor Metabolizer',
    metabolizerTypeShort:   'PM',
    recommendation:     'Avoid standard codeine dosing.',
    mechanism:          '',
    quiz: [
    {
        question:     'A patient with CYP2D6 *2/*2 genotype is prescribed Codeine. What is the most likely clinical outcome?',
        options: [
        'Therapeutic failure due to lack of morphine conversion',
        'Opioid toxicity from excessive morphine production',
        'Normal analgesic response with standard dosing',
        'Accelerated drug clearance requiring higher doses',
        ],
        correctIndex: 0,
        explanation:  'Poor metabolizers lack functional CYP2D6 enzyme and cannot convert codeine to morphine, resulting in therapeutic failure.',
    }],
}
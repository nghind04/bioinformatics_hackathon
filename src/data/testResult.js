import { getQuiz } from './quizBank'

export const MOCK_RESULT = {
    gene:                'CYP2D6',
    variant:             'rs3892097',
    allele:              '*2/*2',
    medication:          'Codeine',
    metabolizerType:     'Poor Metabolizer',
    metabolizerTypeShort:'PM',
    recommendation:      'Avoid standard codeine dosing.',
    mechanism:           '',
    quiz:                getQuiz('CYP2D6', 'poor', 'codeine'),
}
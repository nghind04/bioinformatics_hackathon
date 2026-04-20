/**
 * Quiz Bank — Pharmacogenomics Teaching Tool
 *
 * Structure: QUIZ_BANK[gene][metabolizerType] → array of quiz question objects
 *
 * Each question:
 *   question:     string
 *   options:      string[4]
 *   correctIndex: number (0–3)
 *   explanation:  string
 *
 * Usage:
 *   import { getQuiz } from './quizBank'
 *   const questions = getQuiz('CYP2D6', 'poor', 'codeine')
 *   // returns array of 2 question objects
 */

const QUIZ_BANK = {

    // ─────────────────────────────────────────────
    // CYP2D6
    // ─────────────────────────────────────────────
    CYP2D6: {

        poor: [
            {
                question: 'A patient is a CYP2D6 Poor Metabolizer prescribed Codeine. What is the most likely outcome?',
                options: [
                    'Therapeutic failure — codeine cannot be converted to active morphine',
                    'Opioid toxicity from excessive morphine production',
                    'Normal analgesic effect with standard dosing',
                    'Accelerated drug clearance requiring a higher dose',
                ],
                correctIndex: 0,
                explanation: 'Poor metabolizers have little or no CYP2D6 enzyme activity. Codeine must be converted to morphine by CYP2D6 to work. Without this conversion, the drug has no analgesic effect.',
            },
            {
                question: 'Why do Poor Metabolizers have reduced CYP2D6 enzyme activity?',
                options: [
                    'They produce too much of the enzyme',
                    'They carry two non-functional alleles (e.g. *4/*4), resulting in a loss-of-function diplotype',
                    'The enzyme works faster than normal',
                    'They have an extra copy of the CYP2D6 gene',
                ],
                correctIndex: 1,
                explanation: 'Two non-functional alleles (activity score 0 + 0 = 0) means no working enzyme is produced. This is the defining feature of a Poor Metabolizer.',
            },
        ],

        intermediate: [
            {
                question: 'A CYP2D6 Intermediate Metabolizer takes Tramadol. What is expected compared to a Normal Metabolizer?',
                options: [
                    'Faster drug clearance and reduced effect',
                    'Slower conversion to active metabolite, leading to reduced or delayed pain relief',
                    'Risk of life-threatening toxicity',
                    'No difference — dosing is identical',
                ],
                correctIndex: 1,
                explanation: 'Intermediate metabolizers have one reduced-function allele and one normal or non-functional allele. Drug conversion is slower than normal, so the active metabolite builds up more slowly.',
            },
            {
                question: 'Which diplotype is most consistent with a CYP2D6 Intermediate Metabolizer?',
                options: [
                    '*4/*4 (two non-functional alleles)',
                    '*1/*1 (two normal alleles)',
                    '*1/*4 (one normal + one non-functional allele)',
                    '*1xN/*1 (gene duplication)',
                ],
                correctIndex: 2,
                explanation: '*1/*4 gives an activity sum of 1.0 (1.0 + 0.0), which falls in the intermediate range. One allele functions normally while the other contributes nothing.',
            },
        ],

        normal: [
            {
                question: 'A CYP2D6 Normal Metabolizer is prescribed Metoprolol. What dosing approach is recommended?',
                options: [
                    'Reduce the dose to avoid toxicity',
                    'Avoid the drug entirely',
                    'Standard dosing — the drug is metabolized as expected',
                    'Double the dose because metabolism is too fast',
                ],
                correctIndex: 2,
                explanation: 'Normal metabolizers carry two fully functional alleles (e.g. *1/*1, activity sum = 2.0). Standard clinical dosing guidelines are designed for this phenotype.',
            },
            {
                question: 'What activity sum corresponds to a CYP2D6 Normal Metabolizer?',
                options: [
                    '0.0',
                    '0.5',
                    '1.25 – 2.25',
                    'Greater than 2.25',
                ],
                correctIndex: 2,
                explanation: 'An activity sum between 1.25 and 2.25 defines the Normal (Extensive) Metabolizer phenotype. Two functional alleles each contribute 1.0, giving a sum of 2.0.',
            },
        ],

        ultrarapid: [
            {
                question: 'A CYP2D6 Ultrarapid Metabolizer is prescribed Codeine. What is the primary safety concern?',
                options: [
                    'The drug will have no effect at all',
                    'Codeine is converted to morphine too quickly, risking opioid toxicity',
                    'The drug will accumulate and cause liver damage',
                    'Metabolism is slightly faster than normal — no clinical concern',
                ],
                correctIndex: 1,
                explanation: 'Gene duplication produces excess CYP2D6 enzyme. Codeine is rapidly converted to morphine, causing dangerously high morphine levels even at standard doses — a known cause of fatal opioid toxicity.',
            },
            {
                question: 'Which genotype causes a CYP2D6 Ultrarapid Metabolizer phenotype?',
                options: [
                    '*4/*4',
                    '*1/*4',
                    '*1/*1',
                    '*1xN/*1 (gene duplication)',
                ],
                correctIndex: 3,
                explanation: 'Gene duplication (*1xN) adds extra functional copies of CYP2D6. The activity sum exceeds 2.25, producing far more enzyme than normal and accelerating drug metabolism.',
            },
        ],
    },

    // ─────────────────────────────────────────────
    // CYP2C19
    // ─────────────────────────────────────────────
    CYP2C19: {

        poor: [
            {
                question: 'A CYP2C19 Poor Metabolizer is prescribed Clopidogrel. What is the clinical concern?',
                options: [
                    'Clopidogrel works faster and causes bleeding',
                    'Clopidogrel cannot be activated — the patient has reduced antiplatelet protection',
                    'The drug is toxic because it accumulates',
                    'No concern — Clopidogrel does not use CYP2C19',
                ],
                correctIndex: 1,
                explanation: 'Clopidogrel is a prodrug that must be activated by CYP2C19. Poor metabolizers (*2/*2) cannot activate it, leaving platelets unblocked and increasing the risk of cardiovascular events.',
            },
            {
                question: 'A CYP2C19 Poor Metabolizer takes Omeprazole (a PPI for acid reflux). What happens?',
                options: [
                    'Omeprazole is cleared faster, reducing its effect',
                    'Omeprazole accumulates, resulting in higher drug exposure and stronger acid suppression',
                    'No change — PPIs do not depend on CYP2C19',
                    'Omeprazole causes severe liver toxicity',
                ],
                correctIndex: 1,
                explanation: 'Unlike Clopidogrel, Omeprazole is directly inactivated by CYP2C19. In poor metabolizers, the drug is not broken down, so it stays in the body longer and acid suppression is enhanced.',
            },
        ],

        intermediate: [
            {
                question: 'A CYP2C19 Intermediate Metabolizer is given Escitalopram (an antidepressant). What is expected?',
                options: [
                    'The drug clears too fast and has no effect',
                    'The drug accumulates slightly more than in a Normal Metabolizer, requiring possible dose reduction',
                    'Normal drug levels — no adjustment needed',
                    'Severe toxicity requiring immediate discontinuation',
                ],
                correctIndex: 1,
                explanation: 'Intermediate metabolizers have reduced CYP2C19 activity. Escitalopram is metabolized more slowly, leading to higher plasma levels than in Normal Metabolizers. Dose reduction may be warranted.',
            },
            {
                question: 'Which allele pair defines a CYP2C19 Intermediate Metabolizer?',
                options: [
                    '*2/*2 (two loss-of-function alleles)',
                    '*1/*2 (one normal + one loss-of-function allele)',
                    '*1/*17 (one normal + one increased-function allele)',
                    '*17/*17 (two increased-function alleles)',
                ],
                correctIndex: 1,
                explanation: '*1/*2 gives an activity sum of 1.0 (1.0 + 0.0). One allele is functional and one is not, placing the patient in the intermediate range between poor and normal.',
            },
        ],

        normal: [
            {
                question: 'A CYP2C19 Normal Metabolizer is prescribed Clopidogrel after a heart procedure. What is expected?',
                options: [
                    'Clopidogrel cannot be activated — alternative therapy needed',
                    'Clopidogrel is activated normally — standard antiplatelet protection',
                    'Drug accumulates causing bleeding risk',
                    'The drug is cleared before it can have any effect',
                ],
                correctIndex: 1,
                explanation: 'Normal metabolizers (*1/*1, activity sum = 2.0) activate Clopidogrel at the expected rate. Standard dosing provides effective antiplatelet therapy.',
            },
            {
                question: 'What does a CYP2C19 activity sum of 2.0 indicate?',
                options: [
                    'The patient is an ultrarapid metabolizer',
                    'The patient has one non-functional allele',
                    'The patient has two fully functional alleles — normal enzyme activity',
                    'The patient cannot metabolize the drug at all',
                ],
                correctIndex: 2,
                explanation: 'Activity sum 2.0 = *1 (1.0) + *1 (1.0). Two fully functional alleles produce normal enzyme levels, placing the patient in the Normal Metabolizer phenotype.',
            },
        ],

        ultrarapid: [
            {
                question: 'A CYP2C19 Ultrarapid Metabolizer is prescribed Omeprazole for a stomach ulcer. What is the concern?',
                options: [
                    'Omeprazole accumulates and causes liver damage',
                    'Omeprazole is broken down too quickly, reducing acid suppression and potentially allowing the ulcer to persist',
                    'Omeprazole works exactly as expected',
                    'The drug converts to a toxic metabolite',
                ],
                correctIndex: 1,
                explanation: 'CYP2C19*17/*17 gives an activity sum above 2.5. Omeprazole is inactivated faster than normal, reducing drug exposure and potentially making acid suppression insufficient.',
            },
            {
                question: 'Which CYP2C19 allele is associated with increased enzyme activity (ultrarapid phenotype)?',
                options: [
                    '*2 — loss of function',
                    '*3 — loss of function',
                    '*1 — normal function',
                    '*17 — increased transcription and enzyme activity',
                ],
                correctIndex: 3,
                explanation: 'CYP2C19*17 has a promoter variant that increases gene transcription, producing more enzyme than normal. Two copies (*17/*17) leads to the Ultrarapid Metabolizer phenotype.',
            },
        ],
    },
}

// ─────────────────────────────────────────────────────────────────────────────
// getQuiz — pick the right questions based on ML prediction result
//
// Parameters:
//   gene        : "CYP2D6" or "CYP2C19"
//   prediction  : "poor" | "intermediate" | "normal" | "ultrarapid"
//   drug        : e.g. "codeine" (currently used for future drug-specific expansion)
//
// Returns:
//   Array of 2 quiz question objects, or a fallback question if no match found
// ─────────────────────────────────────────────────────────────────────────────
export function getQuiz(gene, prediction, drug) {
    const geneKey = (gene || '').toUpperCase()
    const predKey = (prediction || '').toLowerCase().replace(' metabolizer', '').trim()

    const questions = QUIZ_BANK[geneKey]?.[predKey]

    if (!questions) {
        // Fallback: generic question if gene/prediction combo not found
        return [{
            question: `What does it mean to be a ${prediction} metabolizer for ${gene}?`,
            options: [
                'The drug is broken down faster than normal',
                'The drug accumulates because the enzyme has reduced or no activity',
                'Drug metabolism is completely unaffected by genetics',
                'The patient produces twice the normal enzyme amount',
            ],
            correctIndex: 1,
            explanation: `Metabolizer phenotype is determined by the activity score sum of both alleles. A ${prediction} metabolizer has an activity pattern that affects how the body processes drugs metabolized by ${gene}.`,
        }]
    }

    return questions
}

export default QUIZ_BANK

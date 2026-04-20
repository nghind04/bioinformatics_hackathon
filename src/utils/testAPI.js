import { getQuiz } from '../data/quizBank'

const API_BASE = ''

const SHORT_LABEL = {
    poor:         'PM',
    intermediate: 'IM',
    normal:       'NM',
    ultrarapid:   'UM',
}

const RECOMMENDATION = {
    CYP2D6: {
        poor:
            'Avoid codeine and tramadol — these prodrugs require CYP2D6 to become active and will have little or no effect. Consider non-opioid analgesics or drugs not metabolized by CYP2D6. Consult CPIC guidelines for alternative therapy.',
        intermediate:
            'Use caution with CYP2D6-metabolized drugs. Drug conversion is slower than normal, which may reduce efficacy. A lower starting dose or closer monitoring may be appropriate.',
        normal:
            'Standard dosing applies. CYP2D6 enzyme activity is within the expected range and no dose adjustment is needed based on genotype alone.',
        ultrarapid:
            'Avoid codeine and tramadol — rapid conversion to active morphine can cause opioid toxicity even at standard doses. This is a known safety risk. Use non-opioid alternatives or drugs not dependent on CYP2D6 activation.',
    },
    CYP2C19: {
        poor:
            'For clopidogrel: consider alternative antiplatelet therapy such as prasugrel or ticagrelor, as clopidogrel cannot be activated without CYP2C19. For PPIs (omeprazole, etc.): drug accumulation may enhance acid suppression — reduced doses may be sufficient.',
        intermediate:
            'CYP2C19 activity is reduced. Drug levels may be higher than expected for drugs inactivated by CYP2C19. Monitor for increased drug effect and consider dose adjustment if needed.',
        normal:
            'Standard dosing applies. CYP2C19 activity is within the expected range and no dose adjustment is needed based on genotype alone.',
        ultrarapid:
            'Drugs inactivated by CYP2C19 (e.g., PPIs) may be cleared too quickly to reach therapeutic levels. Consider higher doses or switching to an alternative not dependent on CYP2C19 metabolism.',
    },
}

const MECHANISM = {
    CYP2D6: {
        poor:
            'Two non-functional CYP2D6 alleles (activity sum = 0.0) result in no working enzyme. Prodrugs that require CYP2D6 activation — such as codeine, which must be converted to morphine — remain inactive. Parent compounds that are normally cleared by CYP2D6 accumulate to higher-than-expected levels.',
        intermediate:
            'One reduced- or non-functional CYP2D6 allele lowers total enzyme output. Drug conversion and clearance proceed more slowly than in a Normal Metabolizer. Plasma levels of parent drugs may be elevated, and prodrug activation is partially impaired.',
        normal:
            'Two functional CYP2D6 alleles (activity sum ≈ 2.0) produce sufficient enzyme for standard drug metabolism. Prodrugs are converted to active metabolites at the expected rate, and parent drugs are cleared normally.',
        ultrarapid:
            'Gene duplication (*1xN or *2xN) produces excess CYP2D6 enzyme beyond what two normal alleles would provide (activity sum > 2.0). Prodrugs such as codeine are converted to active metabolites extremely rapidly, causing peak morphine levels that can lead to respiratory depression. Parent drugs are also cleared faster, potentially reducing their efficacy.',
    },
    CYP2C19: {
        poor:
            'Two loss-of-function CYP2C19 alleles (e.g., *2/*2, activity sum = 0.0) eliminate enzyme activity entirely. Prodrugs like clopidogrel that require CYP2C19 activation cannot be converted to their active form, leaving platelets uninhibited. Drugs normally inactivated by CYP2C19 (e.g., PPIs) accumulate, increasing drug exposure and effect.',
        intermediate:
            'One loss-of-function CYP2C19 allele reduces total enzyme activity below normal. Drug activation (for prodrugs) and inactivation (for direct drugs) both proceed more slowly. This can result in subtherapeutic levels of active clopidogrel or elevated levels of PPIs compared to Normal Metabolizers.',
        normal:
            'Two functional CYP2C19 alleles (*1/*1, activity sum = 2.0) provide standard enzyme activity. Prodrugs are activated and parent drugs are cleared at the rate on which standard dosing guidelines are based.',
        ultrarapid:
            'The CYP2C19*17 variant increases gene promoter activity, leading to higher enzyme production than normal (activity sum > 2.0). Drugs inactivated by CYP2C19 — such as PPIs — are broken down faster, reducing drug exposure. This can make standard doses insufficient for acid suppression or other CYP2C19-dependent therapies.',
    },
}

export async function analyzeGenotype(gene, variant, medication, alleles) {

    const diplotype = alleles.length >= 2 ? alleles.join('/') : '*1/*4'

    const response = await fetch(`${API_BASE}/predict`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            gene:    gene,
            variant: diplotype,
            drug:    medication,
        }),
    })

    if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        throw new Error(err.error || `Server error: ${response.status}`)
    }

    const data = await response.json()

    const pred    = data.prediction
    const geneKey = gene.toUpperCase()

    return {
        metabolizerType:      data.prediction_label,
        metabolizerTypeShort: SHORT_LABEL[pred] ?? pred.toUpperCase(),
        recommendation:       RECOMMENDATION[geneKey]?.[pred] ?? '',
        mechanism:            MECHANISM[geneKey]?.[pred] ?? '',
        quiz: getQuiz(gene, pred, medication),
        color:            data.color,
        confidence:       data.confidence,
        probabilities:    data.probabilities,
        activity_sum:     data.activity_sum,
        in_training_data: data.in_training_data,
    }
}

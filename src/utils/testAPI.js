import { MOCK_RESULT } from "../data/testResult";

export async function analyzeGenotype(gene, variant, medication, alleles) {
    await new Promise(resolve => setTimeout(resolve, 2500))

    return {
        ...MOCK_RESULT,
        gene, 
        variant, 
        allele: alleles.join('/'),
        medication, 
    }
}
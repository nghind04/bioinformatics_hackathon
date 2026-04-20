import { useCallback, useState } from "react";
import { analyzeGenotype } from "../utils/testAPI";

export function useAnalysis() {
    const[loading, setLoading] = useState(false)
    const[error, setError] = useState(null)
    const[result, setResult] = useState(null)

    const analyze = useCallback(async (gene, variant, alleles, medication) => {
        setLoading(true)
        setError(null)

        try {
            const data = await analyzeGenotype(gene, variant, alleles, medication)
            const fullResult = { gene, variant, allele: alleles.join('/'), medication, ...data}
            setResult(fullResult)
            return fullResult
        } catch (e) {
            setError(e.message)
            return null
        } finally {
            setLoading(false)
        }
    }, [])

    return { loading, error, result, analyze }
}
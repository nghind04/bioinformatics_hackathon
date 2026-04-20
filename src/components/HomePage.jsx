import { useState } from "react"
import { GENES } from "../data/testHomePage"
import { VARIANTS } from "../data/testHomePage"
import { MEDICATIONS } from "../data/testHomePage"
import { ALLELE_OPTIONS } from "../data/testHomePage"
import { SAMPLE } from "../data/testHomePage"
import { EMPTY } from "../data/testHomePage"

export default function HomePage({ onGenerate, showNoti}){

    const [form, setForm] = useState(EMPTY)

    function setField(field, value) {
        setForm(prev => ({ ...prev, [field]: value}))
    }

    function handleGeneChange(value) {
        setForm(prev => ({
            ...prev,
            gene: value,
            variant: '',
            medication: '',
            allele1: '',
            allele2: '',
        }))
    }

    const inputGene = form.geneManual.trim() || form.gene
    const inputVariant = form.variantManual.trim() || form.variant 
    const inputMedication = form.medicationManual.trim() || form.medication
    const inputAllele1 = form.allele1Manual.trim() || form.allele1
    const inputAllele2 = form.allele2Manual.trim() || form.allele2

    const variantOptions = VARIANTS[form.gene] || []
    const medicationOptions = MEDICATIONS[form.gene] || []
    const alleleOptions = ALLELE_OPTIONS.map(a => a.value)

    function handleSample(){
        setForm(SAMPLE)
        showNoti('Sample data loaded!')
    }

    function handleReset() {
        setForm(EMPTY)
        showNoti('Form cleared')
    }

    function handleGenerate() {
        if (!inputGene) {
            showNoti('Please select or enter a Gene!', 'error');
            return
        }

        if (!inputVariant) {
            showNoti('Please select or enter a Variant!', 'error');
            return
        }

        if (!inputMedication) {
            showNoti('Please select or enter a Medication!', 'error');
            return
        }

        if (!inputAllele1) {
            showNoti('Please select or enter Allele 1!', 'error');
            return
        }

        if (!inputAllele2) {
            showNoti('Please select or enter Allele 2!', 'error');
            return
        }

        onGenerate(inputGene, inputVariant, [inputAllele1, inputAllele2], inputMedication)
    }

    return (
        <div style={style.page}>
            <div style={style.content}>
                <div style={style.inputBox}>
                    {/* Load sample */}
                    <button style={style.loadSamples} onClick={handleSample}>
                        Load Samples
                    </button>

                    <div style={style.field}>
                        {/* Gene Input */}
                        <label style={style.label}>Gene:</label>
                        <select style={style.select} value={form.gene} onChange={e => handleGeneChange(e.target.value)}>
                            <option value="">-- Select a Gene --</option>
                            {GENES.map(g => (
                                <option key={g} value={g}>{g}</option>
                            ))}
                        </select>
                        
                        <div style={style.divider}>------or type manually------</div>

                        <input 
                            type="text" 
                            placeholder="Enter a Gene" 
                            style={style.inputField}
                            value={form.geneManual}
                            onChange={e => setField('geneManual', e.target.value)} />


                        {/* Variant input */}
                        <label style={style.label}>Variant:</label>
                        <select style={style.select} value={form.variant} onChange={e => setField('variant', e.target.value)}>
                            <option value="">-- Select a Variant --</option>
                            {variantOptions.map(v => (
                                <option key={v} value={v}>{v}</option>
                            ))}
                        </select>

                        <div style={style.divider}>------or type manually------</div>

                        <input 
                            type="text" 
                            placeholder="Enter a Variant" 
                            style={style.inputField}
                            value={form.variantManual}
                            onChange={e => setField('variantManual', e.target.value)} />


                        {/* Medicine Input */}
                        <label style={style.label}>Medicine Type:</label>
                        <select style={style.select} value={form.medication} onChange={e => setField('medication', e.target.value)}>
                            <option value="">-- Select a Medicine --</option>
                            {medicationOptions.map(m => (
                                    <option key={m} value={m}>{m}</option>
                                ))}
                        </select>
                        <div style={style.divider}>------or type manually------</div>
                        <input 
                            type="text" 
                            placeholder="Enter a Medicine" 
                            style={style.inputField}
                            value={form.medicationManual}
                            onChange={e => setField('medicationManual', e.target.value)}  />

                        {/* Allele selection */}
                        <label style={style.label}>Allele 1:</label>
                        <select style={style.select} value={form.allele1} onChange={e => setField('allele1', e.target.value)}>
                                <option value="">-- Select Allele 1 --</option>
                                {alleleOptions.map(a => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>

                            <div style={style.divider}>------or type manually------</div>

                            <input 
                                type="text" 
                                placeholder="Enter Allele 1" 
                                style={style.inputField}
                                value={form.allele1Manual}
                                onChange={e => setField('allele1Manual', e.target.value)} />

                        <label style={style.label}>Allele 2:</label>
                        <select style={style.select} value={form.allele2} onChange={e => setField('allele2', e.target.value)}>
                                <option value="">-- Select Allele 2 --</option>
                                {alleleOptions.map(a => (
                                    <option key={a} value={a}>{a}</option>
                                ))}
                            </select>

                            <div style={style.divider}>------or type manually------</div>

                            <input 
                                type="text" 
                                placeholder="Enter Allele 2" 
                                style={style.inputField}
                                value={form.allele2Manual}
                                onChange={e => setField('allele2Manual', e.target.value)} />
    
                    </div>

                    <div style={style.btnRow}> 
                        <button style={style.generateBtn} onClick={handleGenerate}>Generate</button> 
                        <button style={style.resetBtn} onClick={handleReset}>Reset</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

const style = {
    page: {
        position: "relative",
        backgroundColor: "var(--bg-color)",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        fontSize: 24,
        color: "var(--text-color)",
        fontFamily: "var(--font-mono)",
    },

    content: {
        flex: 1,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        padding: "36px 32px",
        position: "relative",
        fontFamily: "var(--font-display)",
        color: "var(--text-color)",
        zIndex: 10,
    },

    inputBox: {
        backgroundColor: "rgba(99, 100, 134, 0.5)",
        border: "1px solid var(--cyan)",
        borderRadius: "10px",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        width: "50%",
        padding: "28px 30px 32px",
        flexDirection: "column",
        display: "flex",
        alignItems: "flex-start",
        zIndex: 10,
    },

    loadSamples: {
        display: "block",
        margin: "0 0 20px",
        background: "transparent",
        border: "1px solid var(--cyan-light)",
        borderRadius: 10,
        fontSize: 20,
        padding: "8px 24px",
        cursor: "pointer",
        color: "var(--text-color)",
        fontFamily: "var(--font-mono)",
        fontWeight: 600,
        objectPosition: "right-center",
    },

    field: {
        marginBottom: 20,
        display: "flex",
        flexDirection: "column",
        width: "100%",
        alignItems: "flex-start",
    },

    label: {
        display: "block",
        fontSize: 24,
        color: "var(--text-color)",
        letterSpacing: 1, 
        fontWeight: 100,
        marginBottom: 10,
    },

    select: {
        width: "100%",
        boxSizing: "border-box",
        fontSize: 20,
        fontWeight: 100,
        padding: "6px 10px",
        color: "var(--text-input-color)",
        background: "var(--purple)",
        fontWeight: 50,
        border: "1px solid var(--magenta)",
        borderRadius: 10,
        marginBottom: 10,
        cursor: "pointer",
    },

    divider: {
        display: "block",
        fontSize: 18,
        color: "var(--text-color)",
        letterSpacing: 1, 
        fontWeight: 100,
        marginBottom: 10,
    },

    inputField: { 
        width: "100%",
        boxSizing: "border-box",
        fontSize: 20,
        fontWeight: 100,
        padding: "6px 10px",
        color: "var(--text-input-color)",
        background: "var(--purple)",
        fontWeight: 50,
        border: "1px solid var(--magenta)",
        borderRadius: 10,
        marginBottom: 10,        
    },

    alleleField: {
        display: "flex",
        flexWrap: "wrap",
        gap: "12px 24px",
    },

    alleleLabel: {
        display: "flex",
        alignItems: "center",
        gap: 5,
        fontSize: 22,
        userSelect: "none",
    },

    unchecked: {
        display: "inline-flex",
        alignItems: "center",
        width: "20px",
        height: "20px",
        background: "var(--purple)",
        border: "1px solid var(--magenta)",
        borderRadius: 2,
        flexShrink: 0,
        cursor: "pointer",
    },

    checked: {
        display: "inline-flex",
        alignItems: "center",
        width: "20px",
        height: "20px",
        background: "var(--magenta)",
        borderRadius: 2,
        flexShrink: 0,       
    },

    btnRow: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        gap: 10,
    },

    generateBtn: {
        background: "var(--cyan)",
        width: "70%",
        padding: "10px 10px",
        fontSize: 24,
        fontFamily: "var(--font-mono)",
        fontWeight: "bold",
        border: "1px solid var(--text-color)",
        borderRadius: 10,
        cursor: "pointer",
    },

    resetBtn: {
        background: "transparent",
        width: "30%",
        padding: "10px 10px",
        fontSize: 22,
        fontFamily: "var(--font-mono)",
        fontWeight: "bold",
        color: "var(--text-color)",
        border: "1px solid var(--cyan)",
        borderRadius: 10,
        cursor: "pointer",      
    }
}
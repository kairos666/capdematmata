import ExportAnalysis from './ExportAnalysis';
import ExportInputForm from './ExportInputForm';

export default function ExportAnalyzer() {
    return (
        <main>
            <h2>Analyseur d'export de téléservice</h2>
            <section>
                <header>
                    <h3>Export à analyser</h3>
                </header>
                <ExportInputForm />
            </section>
            <section>
                <header>
                    <h3>Résultats d'analyse</h3>
                </header>
                <ExportAnalysis />
            </section>
        </main>
    )
}

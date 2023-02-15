import parseCapDematExport, { ServiceAnalysis } from '@/app/service-export-analyzer/export-utils';
import { create } from 'zustand';

interface ExportAnalyzerState {
    exportJsonInput: string,
    analysisState: 'empty'|'invalid'|'ok',
    analysis: ServiceAnalysis,
    updateExportJsonString: (jsonString:string) => void
}

export default create<ExportAnalyzerState>()(
    (set) => ({
        exportJsonInput: "",
        analysisState: 'empty',
        analysis: {
            service:null, 
            workflow:null, 
            form:null
        },
        updateExportJsonString: (jsonString:string) => {
            let defaultAnalysis:ServiceAnalysis = { service:null, workflow:null, form:null };

            if(jsonString === "") {
                // leave early if empty data
                set({ 
                    exportJsonInput: "",
                    analysisState: 'empty',
                    analysis: defaultAnalysis
                })
            } else {
                // try to process, either ok or invalid
                try {
                    const jsonObj = JSON.parse(jsonString);
                    set({ 
                        exportJsonInput: jsonString,
                        analysisState: "ok",
                        analysis: parseCapDematExport(jsonObj)
                    });
                } catch (err) {
                    console.warn(err);

                    set({ 
                        exportJsonInput: jsonString,
                        analysisState: "invalid",
                        analysis: defaultAnalysis
                    });
                }
            }
        }
    })
);
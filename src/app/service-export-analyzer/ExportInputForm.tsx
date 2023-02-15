'use client';
import { FC, FormEvent, SyntheticEvent, useCallback, useState } from 'react';
import useExportAnalyzerStore from '../../scripts/useExportAnalyzerStore';

type ExportInputFormProps = {};

const ExportInputForm:FC<ExportInputFormProps> = () => {
    // store
    const updateStore = useExportAnalyzerStore(state => state.updateExportJsonString);

    // local state
    const [exportJsonString, setExportJsonString] = useState(("" as string));

    // handlers
    const submitHandler = useCallback((evt:SyntheticEvent) => {
        evt.preventDefault();
        updateStore(exportJsonString);
    }, [exportJsonString, updateStore]);

    const inputHandler = useCallback((evt:FormEvent) => {
        setExportJsonString((evt.currentTarget as HTMLTextAreaElement).value);
    }, [setExportJsonString]);

    const resetHandler = useCallback(() => {
        setExportJsonString("");
        updateStore("");
    }, [setExportJsonString, updateStore]);

    return (
        <form onSubmit={ submitHandler }>
            <label htmlFor="export-json">Contenu de l&apos;export</label>
            <textarea id="export-json" value={ exportJsonString } onChange={ inputHandler } />
            <button type="submit" disabled={ (exportJsonString === "") }>Analyser</button>
            <button type="reset" disabled={ (exportJsonString === "") } onClick={ resetHandler }>Purger</button>
        </form>
    );
};

export default ExportInputForm;
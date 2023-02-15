'use client';
import { FC } from 'react';
import useExportAnalyzerStore from '../../scripts/useExportAnalyzerStore';
import { Action, FormField, State, Step } from './export-utils';
import styles from './ExportAnalysis.module.scss';

// ID 2 OTHER PROPERTY resolvers
const findNameFromFormFieldId:(formFields:FormField[]) => (id:string) => string = (formFields:FormField[]) => (id:string) => {
    const match:FormField|null = formFields.find(ff => ff.id === id) ?? null;

    if(match === null) {
        console.info(`Form field ID: "${ id }" not found`);
        return id;
    } else {
        return match.cle;
    }
};

const findKeyFromStepId:(steps:Step[]) => (id:string) => string = (steps:Step[]) => (id:string) => {
    const match:Step|null = steps.find(step => step.id === id) ?? null;

    if(match === null) {
        console.info(`Step ID: "${ id }" not found`);
        return id;
    } else {
        return match.cle;
    }
}

const findNameFromStepId:(steps:Step[]) => (id:string) => string = (steps:Step[]) => (id:string) => {
    const match:Step|null = steps.find(step => step.id === id) ?? null;

    if(match === null) {
        console.info(`Step ID: "${ id }" not found`);
        return id;
    } else {
        return match.name;
    }
}

const findNameFromStatusId:(states:State[]) => (id:string) => string = (states:State[]) => (id:string) => {
    const match:State|null = states.find(state => state.id === id) ?? null;

    if(match === null) {
        console.info(`State ID: "${ id }" not found`);
        return id;
    } else {
        return match.labelGRU;
    }
}

type ExportAnalysisProps = {};

const ExportAnalysis:FC<ExportAnalysisProps> = () => {
    // store
    const { analysisState, analysis } = useExportAnalyzerStore(state => ({ analysisState: state.analysisState, analysis: state.analysis }));

    switch(analysisState) {
        case "empty":
            return (<figure className={ [styles.Msg, styles.Msg__Empty].join(' ') }><figcaption>Absence de données sur le téléservice. Il faut copier le contenu de l'export dans le champs "contenu de l'export" ci-dessus.</figcaption></figure>);

        case "invalid":
            return (<figure className={ [styles.Msg, styles.Msg__Error].join(' ') }><figcaption>Les données saisies ne sont pas au format JSON, ou ne correspondent pas au format attendu. Veuillez vérifier le contenu de l'export saisi dans le champs.</figcaption></figure>);

        case "ok":
            // give form field id, get form field key
            const fieldKeyFinder = findNameFromFormFieldId(analysis.form?.formFields ?? []);
            // give step id, get step name
            const stepNameFinder = findNameFromStepId(analysis.form?.steps ?? []);
            // give step id, get step key
            const stepKeyFinder = findKeyFromStepId(analysis.form?.steps ?? []);
            // give status id, get status label GRU
            const statusNameFinder = findNameFromStatusId(analysis.workflow?.states ?? []);

            return (
                <>
                    <h4 className={ styles.HeadHiglight }>Service</h4>
                    <dl className={ styles.DList }><dt>Clé</dt><dd>{ analysis.service?.cle }</dd></dl>
                    <dl className={ styles.DList }><dt>Nom</dt><dd dangerouslySetInnerHTML={ { __html: analysis.service?.nom ?? "" } }></dd></dl>
                    <dl className={ styles.DList }><dt>Description</dt><dd dangerouslySetInnerHTML={ { __html: analysis.service?.description ?? "" } }></dd></dl>
                    <dl className={ styles.DList }><dt>Bénéficiaire</dt><dd>{ analysis.service?.beneficiaire }</dd></dl>
                    <dl className={ styles.DList }><dt>Entité</dt><dd>{ analysis.service?.entite }</dd></dl>
                    <dl className={ styles.DList }><dt>actif GRU ?</dt><dd>{ (analysis.service?.gru) ? "Oui" : "Non" }</dd></dl>
                    <dl className={ styles.DList }><dt>actif Guichet ?</dt><dd>{ (analysis.service?.guichet) ? "Oui" : "Non" }</dd></dl>
                    <dl className={ styles.DList }><dt>actif Internet ?</dt><dd>{ (analysis.service?.internet) ? "Oui" : "Non" }</dd></dl>

                    <h4 className={ styles.HeadHiglight }>Workflow</h4>
                    <section>
                        <h5 className={ styles.HeadHiglightLite }>Statuts (x{ analysis.workflow?.nbStatuts })</h5>
                        <table className={ styles.TableDensify }>
                            <thead>
                                <tr>
                                    <th>libellé GRU</th>
                                    <th>libellé internet</th>
                                    <th>action GRU</th>
                                    <th>action internet</th>
                                    <th>divers</th>
                                </tr>
                            </thead>
                            <tbody>{ (analysis.workflow) && analysis.workflow?.states.map((state, index) => <tr key={ `state-${ index }` }><StateDescriptor {...state} utils={ { statusNameFinder } } /></tr>) }</tbody>
                        </table>
                    </section>
                    <section>
                        <h5 className={ styles.HeadHiglightLite }>Actions (x{ analysis.workflow?.nbActions })</h5>
                        <table className={ styles.TableDensify }>
                            <thead>
                                <tr>
                                    <th>statut d'origine</th>
                                    <th>libellé de l'action</th>
                                    <th>résultat de l'action</th>
                                    <th>différé</th>
                                </tr>
                            </thead>
                            <tbody>{ (analysis.workflow) && analysis.workflow?.actions.map((action, index) => <tr key={ `action-${ index }` }><ActionDescriptor {...action} /></tr>) }</tbody>
                        </table>
                    </section>
                    <h4 className={ styles.HeadHiglight }>Formulaire</h4>
                    <section>
                        <h5 className={ styles.HeadHiglightLite }>Etapes (x { analysis.form?.steps.length })</h5>
                        <table className={ styles.TableDensify }>
                            <thead>
                                <tr>
                                    <th>ordre</th>
                                    <th>nom de l'étape (clé, pourcentage)</th>
                                    <th>description</th>
                                    <th>étape parent</th>
                                    <th>visibilité</th>
                                    <th>conditions</th>
                                </tr>
                            </thead>
                            <tbody>{ (analysis.form?.steps) && analysis.form?.steps.map((step, index) => <tr key={ `step-${ index }` }><StepDescriptor {...step} utils={ { stepNameFinder } } /></tr>) }</tbody>
                        </table>
                    </section>
                    <section>
                        <h5 className={ styles.HeadHiglightLite }>Champs de formulaires (x{ analysis.form?.formFields.length })</h5>
                        <table className={ styles.TableDensify }>
                            <thead>
                                <tr>
                                    <th>#ordre<br/>clé</th>
                                    <th>nom du champs</th>
                                    <th>description</th>
                                    <th>étape parent</th>
                                    <th>groupe parent</th>
                                    <th>obligatoire</th>
                                </tr>
                            </thead>
                            <tbody>{ (analysis.form?.formFields) && analysis.form?.formFields.map((field, index) => <tr key={ `field-${ index }` }><FieldDescriptor {...field} utils={ { fieldKeyFinder, stepKeyFinder } } /></tr>) }</tbody>
                        </table>
                    </section>
                </>
            );

        default: return null;
    }
};

export default ExportAnalysis;

// entity descriptors
type FieldDescriptorProps = FormField & {
    utils: {
        fieldKeyFinder: (id:string) => string,
        stepKeyFinder: (id:string) => string
    }
};

const FieldDescriptor:FC<FieldDescriptorProps> = (props) => {
    return (
        <>
            <td>#{ props.ordre }<br/>{ props.cle }</td>
            <td><span dangerouslySetInnerHTML={ { __html: props.userName } }></span></td>
            <td>
                <span>{ props.type }</span><br />
                <small className={ styles.paragraphEllipsis } dangerouslySetInnerHTML={ { __html: props.description } }></small>
            </td>
            <td>{ props.utils.stepKeyFinder(props.parentStepId) }</td>
            <td>
                {(props.parentGrpId)
                    ? <span>{ props.utils.fieldKeyFinder(props.parentGrpId) }</span>
                    : <span>hors groupe</span>
                }
            </td>
            <td>{ (props.isMandatory ? "Oui" : "Non") }</td>
        </>
    );
}

type StepDescriptorProps = Step & {
    utils: {
        stepNameFinder: (id:string) => string
    }
};

const StepDescriptor:FC<StepDescriptorProps> = (props) => {
    return (
        <>
            <td>#{ props.ordre }</td>
            <td><span dangerouslySetInnerHTML={ { __html: props.name } }></span> ({ props.cle }, { props.pourcentage }%)</td>
            <td><span dangerouslySetInnerHTML={ { __html: props.description } }></span></td>
            <td><span dangerouslySetInnerHTML={ { __html: (props.parentStepId !== null) ? props.utils.stepNameFinder(props.parentStepId) : "" } }></span></td>
            <td>
                <small>visible GRU ? { (props.visibleGRU) ? "Oui" : "Non" }</small><br />
                <small>visible Guichet ? { (props.visibleGuichet) ? "Oui" : "Non" }</small><br />
                <small>visible Internet ? { (props.visibleInternet) ? "Oui" : "Non" }</small>
            </td>
            <td>
                {(props.conditions.length > 0)
                    ? props.conditions.map((cond, index) => <span key={ `step-${ props.id }-${index}` }><span dangerouslySetInnerHTML={ { __html: cond.name } }></span> <span dangerouslySetInnerHTML={ { __html: cond.description }}></span></span>)
                    : <span>sans conditions</span>
                }
            </td>
        </>
    );
}

type StateDescriptorProps = State & {
    utils: {
        statusNameFinder: (id:string) => string
    }
};

const StateDescriptor:FC<StateDescriptorProps> = (props) => {
    return (
        <>
            <td>
                {(props.visibleGRU)
                    ? <span dangerouslySetInnerHTML={ { __html: props.labelGRU } }></span>
                    : <span>non visible</span>
                }
            </td>
            <td>
                {(props.visibleInternet)
                    ? <span dangerouslySetInnerHTML={ { __html: props.labelInternet } }></span>
                    : <span>non visible</span>
                }
            </td>
            <td>
                {(props.editableGRU)
                    ? <span dangerouslySetInnerHTML={ { __html: props.actionGRU } }></span>
                    : <span>non éditable</span>
                }
            </td>
            <td>
                {(props.editableInternet)
                    ? <><span dangerouslySetInnerHTML={ { __html: props.actionInternet } }></span> <span dangerouslySetInnerHTML={ { __html: `(statut cible: ${ props.utils.statusNameFinder(props?.statutCibleApresRetourUsager ?? "inconnu") })` ?? "statut cible inconnu" } }></span></>
                    : <span>non éditable</span>
                }
            </td>
            <td>
                { (props.description) && <dl className={ styles.DList }><dt>description</dt><dd dangerouslySetInnerHTML={ { __html: props.description } }></dd></dl> }
                { (props.segment) && <dl className={ styles.DList }><dt>segment</dt><dd dangerouslySetInnerHTML={ { __html: props.segment } }></dd></dl> }
                { (props.pourcentage) && <dl className={ styles.DList }><dt>pourcentage</dt><dd dangerouslySetInnerHTML={ { __html: props.pourcentage } }></dd></dl> }
            </td>
        </>
    );
}

type ActionDescriptorProps = Action;

const ActionDescriptor:FC<ActionDescriptorProps> = (props) => {
    return (
        <>
            <td><span dangerouslySetInnerHTML={ { __html: props.fromState } }></span></td>
            <td><span dangerouslySetInnerHTML={ { __html: props.label } }></span></td>
            <td>
                { (props.actionType) && <span>{ props.actionType }</span> }
                { (props.result) && <p><small dangerouslySetInnerHTML={ { __html: props.result } }></small></p> }
            </td>
            <td>
                {(props.differe)
                    ? <><span>Différé de</span> <span dangerouslySetInnerHTML={ { __html: props.differe } }></span></>
                    : <span>exécution immédiate</span>
                }
            </td>
        </>
    );
}

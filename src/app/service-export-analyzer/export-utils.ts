type ServiceDescriptor = {
    cle: string,
    nom: string,
    description: string,
    beneficiaire: string,
    entite: string,
    gru: boolean,
    guichet: boolean,
    internet: boolean
}

export function extractServiceData(src:any):ServiceDescriptor {
    const { name, type_beneficiaire, type_entite, canal_gru, canal_guichet, canal_internet, description, cle } = src.service;

    return {
        cle: cle,
        nom: name,
        description: description,
        beneficiaire: type_beneficiaire,
        entite: type_entite,
        gru: (canal_gru === "1"),
        guichet: (canal_guichet === "1"),
        internet: (canal_internet === "1")
    };
}

type WorkflowDescriptor = {
    nom: string,
    nbStatuts: number,
    nbActions: number,
    states: State[],
    actions: Action[]
}

export type State = {
    id: string,
    labelGRU: string,
    actionGRU: string,
    labelInternet: string,
    actionInternet: string,
    description: string|null,
    segment: string|null,
    pourcentage: string,
    visibleGRU: boolean,
    visibleInternet: boolean,
    editableGRU: boolean,
    editableInternet: boolean,
    statutCibleApresRetourUsager: string|null
}

export type Action = {
    fromState: string,
    label: string,
    differe: string|null,
    actionType: string,
    result: string
}

function extractWorkflowData(src:any):WorkflowDescriptor|null {
    const targetSrcArr = Object.values(src.workflow);
    if(targetSrcArr.length !== 1) {
        console.log("no workflow or several workflow found - workflow section ignored"); 
        return null;
    }
    const targetSrc = (targetSrcArr[0] as any);
    const targetStatuts = Object.values(targetSrc.statuts);

    function parseState(state:any) {
        const visibleGRU = (state.visible_bo === "1");
        const visibleInternet = (state.visible_fo === "1");
        const editableGRU = (state.non_editable_bo === "0" && state.action_bo === "1");
        const editableInternet = (state.non_editable_fo === "0" && state.action_fo === "1");
        
        return {
            id: state.id,
            labelGRU: state.name,
            actionGRU: state.label_action,
            labelInternet: state.label_internet,
            actionInternet: state.label_action_internet,
            description: (state.description) ? state.description : null,
            segment: (state.segment) ? state.segment : null,
            pourcentage: state.pourcentage,
            visibleGRU,
            visibleInternet,
            editableGRU,
            editableInternet,
            statutCibleApresRetourUsager: (editableInternet && state.statut_cible_retour_fo) ? state.statut_cible_retour_fo : null
        }
    }

    const stateIdToLabelConverterter = (states:State[]) => (stateId:string) => {
        const match = states.find(state => (state.id === stateId));

        if(!match) console.warn('no match found for this state id');
        return (match) ? match.labelGRU : 'inconnu';
    }

    function parseAction(stateId:string, action:any, stateLabelFinder:(stateId:string) => string) {
        const result:any = {
            fromState: stateLabelFinder(stateId),
            label: action.name,
            differe: (action.differe === "1" && !action.differe_date) 
                ? `${ action.differe_duree } ${ action.differe_echelle }`
                : (action.differe === "1" && action.differe_date)
                ? action.differe_date
                : null
        }

        switch(action.action_fonction) {
            case "modifier_statut_demande":
                result.actionType = "changement de statut de la demande";
                result.result = `aller automatiquement vers statut "${ stateLabelFinder(action.ext_valeur_1) }"`;
            break;

            case "envoyer_email":
                result.actionType = "notification email à destination des usagers";
                result.result = `Envoi d'emails à ${ action.ext_valeur_1 }`;
            break;

            case "envoyer_email2":
                result.actionType = "notification email à destination des agents";
                result.result = `Envoi d'emails à ${ action.ext_valeur_text }`;
            break;

            default:
                console.warn(`type d'action inconnu : ${ action.action_fonction }`);
        }

        return result;
    }

    function parseActions(states:any[]):Action[] {
        return Object.values(states).reduce((acc:Action[], curr:any) => {
            // leave early if no actions
            if(!curr.actions || Object.values(curr.actions).length === 0) return acc;

            // parse actions
            const stateId = curr.id;
            const newActions = Object.values(curr.actions).map(action => parseAction(stateId, action, stateIdToLabelConverterter(formatedStates)));

            return [...acc, ...newActions];
        }, []);
    }

    const formatedStates = Object.values(targetSrc.statuts).map(parseState);
    const formatedActions = parseActions(targetSrc.statuts);

    return {
        nom: targetSrc.name,
        nbStatuts: targetStatuts.length,
        nbActions: formatedActions.length,
        states: formatedStates,
        actions: formatedActions
    }
}

type FormDescriptor = {
    steps: Step[],
    formFields: FormField[]
}

export type Step = {
    id: string,
    cle:string,
    ordre: number,
    name: string,
    parentStepId: string|null,
    pourcentage: number,
    description: string,
    visibleGRU:boolean,
    visibleGuichet:boolean,
    visibleInternet:boolean,
    conditions: {
        name: string,
        description: string
    }[]
}

export type FormField = {
    id: string,
    cle: string,
    techName: string,
    userName: string,
    description: string,
    isMandatory: boolean,
    type: string,
    ordre: number,
    parentStepId: string,
    parentGrpId: string|null
}

export function extractFormData(src:any):FormDescriptor {
    // STEPS
    const steps = Object.values(src?.etapes ?? []).map((etape:any) => {
        return {
            id: etape.id,
            cle: etape.cle,
            ordre: parseInt(etape.ordre),
            name: etape.name,
            parentStepId: (etape.cde_form_etapes_ida !== "") ? etape.cde_form_etapes_ida : null,
            pourcentage: etape.pourcentage,
            description: etape.description,
            visibleGRU: (etape.visible_gru === "1"),
            visibleGuichet: (etape.visible_guichet === "1"),
            visibleInternet: (etape.visible_internet === "1"),
            conditions: Object.values(etape?.conditions ?? {}).filter((etpCond:any) => (etpCond.actif === "1")).map((etpCond:any) => ({
                name: etpCond.name,
                description: `${ etpCond.condition_fonction } (${ etpCond.ext_valeur_1 }, ${ etpCond.ext_valeur_2 }, ${ etpCond.ext_valeur_3 }, ${ etpCond.ext_valeur_4 })`
            }))
        }
    }) ?? [];

    // FORMFIELDS
    const formFields:FormField[] = Object.values(src?.etapes ?? [])
        .sort((a:any, b:any) => (a.ordre < b.ordre) ? -1 : (a.ordre > b.ordre) ? 1 : 0)
        .reduce((acc:FormField[], etape:any) => {
            const fields:FormField[] = Object.values(etape?.fields ?? {})
                .map((champ:any) => ({
                    id: champ.id,
                    cle: champ.cle,
                    techName: champ.name,
                    userName: champ.label,
                    description: champ.description,
                    isMandatory: (champ.chp_obligatoire === "1"),
                    type: champ.champ_type,
                    ordre: parseInt(champ.ordre),
                    parentStepId: champ.cde_form_etapes_id,
                    parentGrpId: (champ.cde_form_fields_ida === "") ? null : champ.cde_form_fields_ida
                }))
                .sort((a:FormField, b:FormField) => (a.ordre < b.ordre) ? -1 : (a.ordre > b.ordre) ? 1 : 0);

            return [...acc, ...fields];
        }, ([] as FormField[]));

    return {
        steps: steps.sort((a:Step, b:Step) => (a.ordre < b.ordre) ? -1 : (a.ordre > b.ordre) ? 1 : 0),
        formFields
    }
}

export type ServiceAnalysis = {
    service:ServiceDescriptor|null, 
    workflow:WorkflowDescriptor|null, 
    form:FormDescriptor|null
}

export default function parseCapDematExport(exprtSrc:any):ServiceAnalysis {
    return {
        service: extractServiceData(exprtSrc),
        workflow: extractWorkflowData(exprtSrc),
        form: extractFormData(exprtSrc)
    };
}
/*
==========================================================
Cisco CCNA 200-301 Exam Simulator
StorageManager

Responsabilidade:
- Salvar automaticamente o exame
- Restaurar sessões
- Remover sessões
- Trabalhar com localStorage
- Validar dados armazenados
- Controlar versão dos dados

Este componente NÃO manipula DOM.
==========================================================
*/

class StorageManager {

    /*
    ======================================================
    CONSTRUCTOR
    ======================================================
    */

    constructor(options = {}) {

        this.storage =
            options.storage ||
            window.localStorage;


        this.prefix =
            options.prefix ||
            "ccna-simulator";


        this.version =
            options.version ||
            "1.0";


        this.keys = {

            activeExam:
                `${this.prefix}:active-exam`,

            lastResult:
                `${this.prefix}:last-result`,

            settings:
                `${this.prefix}:settings`

        };


        this.autoSaveInterval = null;

        this.autoSaveEngine = null;

        this.autoSaveListeners = [];

    }


    /*
    ======================================================
    DISPONIBILIDADE DO STORAGE
    ======================================================
    */

    isAvailable() {

        try {

            const testKey =
                `${this.prefix}:storage-test`;


            this.storage.setItem(
                testKey,
                "1"
            );


            this.storage.removeItem(
                testKey
            );


            return true;

        } catch (error) {

            console.warn(
                "Browser storage is not available.",
                error
            );


            return false;

        }

    }


    /*
    ======================================================
    EMPACOTAR DADOS
    ======================================================
    */

    createPayload(data) {

        return {

            version:
                this.version,

            savedAt:
                new Date()
                    .toISOString(),

            data:
                data

        };

    }


    /*
    ======================================================
    SALVAR JSON
    ======================================================
    */

    saveJSON(
        key,
        data
    ) {

        if (
            !key ||
            !this.isAvailable()
        ) {

            return false;

        }


        try {

            const payload =
                this.createPayload(
                    data
                );


            const serialized =
                JSON.stringify(
                    payload
                );


            this.storage.setItem(
                key,
                serialized
            );


            return true;

        } catch (error) {

            console.error(
                `Unable to save "${key}".`,
                error
            );


            return false;

        }

    }


    /*
    ======================================================
    LER JSON
    ======================================================
    */

    loadJSON(key) {

        if (
            !key ||
            !this.isAvailable()
        ) {

            return null;

        }


        try {

            const raw =
                this.storage.getItem(
                    key
                );


            if (!raw) {

                return null;

            }


            const payload =
                JSON.parse(raw);


            if (
                !payload ||
                typeof payload !==
                    "object"
            ) {

                return null;

            }


            if (
                !Object.prototype
                    .hasOwnProperty.call(
                        payload,
                        "data"
                    )
            ) {

                return null;

            }


            return payload;

        } catch (error) {

            console.error(
                `Unable to load "${key}".`,
                error
            );


            return null;

        }

    }


    /*
    ======================================================
    REMOVER ITEM
    ======================================================
    */

    remove(key) {

        if (
            !key ||
            !this.isAvailable()
        ) {

            return false;

        }


        try {

            this.storage.removeItem(
                key
            );


            return true;

        } catch (error) {

            console.error(
                `Unable to remove "${key}".`,
                error
            );


            return false;

        }

    }


    /*
    ======================================================
    ITEM EXISTE?
    ======================================================
    */

    has(key) {

        if (
            !key ||
            !this.isAvailable()
        ) {

            return false;

        }


        try {

            return (
                this.storage.getItem(
                    key
                ) !== null
            );

        } catch (error) {

            return false;

        }

    }


    /*
    ======================================================
    SALVAR EXAME ATIVO
    ======================================================
    */

    saveExam(exam) {

        if (!exam) {

            return false;

        }


        let data;


        if (
            exam instanceof Exam
        ) {

            data =
                exam.toJSON();

        } else if (
            typeof exam ===
            "object"
        ) {

            data = exam;

        } else {

            return false;

        }


        return this.saveJSON(
            this.keys.activeExam,
            data
        );

    }


    /*
    ======================================================
    CARREGAR EXAME ATIVO
    ======================================================
    */

    loadExam() {

        const payload =
            this.loadJSON(
                this.keys.activeExam
            );


        if (!payload) {

            return null;

        }


        try {

            return Exam.fromJSON(
                payload.data
            );

        } catch (error) {

            console.error(
                "Unable to restore saved exam.",
                error
            );


            return null;

        }

    }


    /*
    ======================================================
    CARREGAR DADOS BRUTOS DO EXAME
    ======================================================
    */

    loadExamData() {

        const payload =
            this.loadJSON(
                this.keys.activeExam
            );


        if (!payload) {

            return null;

        }


        return payload.data;

    }


    /*
    ======================================================
    EXISTE EXAME SALVO?
    ======================================================
    */

    hasSavedExam() {

        return this.has(
            this.keys.activeExam
        );

    }


    /*
    ======================================================
    REMOVER EXAME ATIVO
    ======================================================
    */

    clearExam() {

        return this.remove(
            this.keys.activeExam
        );

    }


    /*
    ======================================================
    INFORMAÇÕES DO SAVE
    ======================================================
    */

    getSavedExamInfo() {

        const payload =
            this.loadJSON(
                this.keys.activeExam
            );


        if (!payload) {

            return null;

        }


        const data =
            payload.data || {};


        return {

            version:
                payload.version ||
                null,

            savedAt:
                payload.savedAt ||
                null,

            examId:
                data.id ||
                null,

            title:
                data.title ||
                null,

            mode:
                data.mode ||
                null,

            domain:
                data.domain ||
                null,

            currentIndex:
                Number.isInteger(
                    data.currentIndex
                )
                    ? data.currentIndex
                    : 0,

            totalQuestions:
                Array.isArray(
                    data.questions
                )
                    ? data.questions.length
                    : 0,

            remainingTime:
                Number.isFinite(
                    data.remainingTime
                )
                    ? data.remainingTime
                    : 0,

            started:
                Boolean(
                    data.started
                ),

            finished:
                Boolean(
                    data.finished
                )

        };

    }


    /*
    ======================================================
    SALVAR RESULTADO FINAL
    ======================================================
    */

    saveResult(result) {

        if (
            !result ||
            typeof result !==
                "object"
        ) {

            return false;

        }


        return this.saveJSON(
            this.keys.lastResult,
            result
        );

    }


    /*
    ======================================================
    CARREGAR ÚLTIMO RESULTADO
    ======================================================
    */

    loadResult() {

        const payload =
            this.loadJSON(
                this.keys.lastResult
            );


        return payload
            ? payload.data
            : null;

    }


    /*
    ======================================================
    REMOVER RESULTADO
    ======================================================
    */

    clearResult() {

        return this.remove(
            this.keys.lastResult
        );

    }


    /*
    ======================================================
    CONFIGURAÇÕES
    ======================================================
    */

    saveSettings(
        settings = {}
    ) {

        if (
            !settings ||
            typeof settings !==
                "object"
        ) {

            return false;

        }


        return this.saveJSON(
            this.keys.settings,
            settings
        );

    }


    loadSettings() {

        const payload =
            this.loadJSON(
                this.keys.settings
            );


        return payload
            ? payload.data
            : {};

    }


    clearSettings() {

        return this.remove(
            this.keys.settings
        );

    }


    /*
    ======================================================
    SALVAR ENGINE
    ======================================================
    */

    saveEngine(engine) {

        if (
            !engine ||
            !(engine instanceof ExamEngine)
        ) {

            return false;

        }


        const exam =
            engine.getExam();


        if (!exam) {

            return false;

        }


        const saved =
            this.saveExam(exam);


        /*
        --------------------------------------------------
        Se o exame terminou, salva também
        o resultado final.
        --------------------------------------------------
        */

        if (
            saved &&
            exam.isFinished() &&
            exam.getResult()
        ) {

            this.saveResult(
                exam.getResult()
            );

        }


        return saved;

    }


    /*
    ======================================================
    RESTAURAR ENGINE
    ======================================================
    */

    restoreEngine(engine) {

        if (
            !engine ||
            !(engine instanceof ExamEngine)
        ) {

            return false;

        }


        const exam =
            this.loadExam();


        if (!exam) {

            return false;

        }


        engine.restoreExam(
            exam
        );


        return true;

    }


    /*
    ======================================================
    AUTOSAVE POR EVENTOS
    ======================================================
    */

    enableAutoSave(
        engine,
        interval = 5000
    ) {

        this.disableAutoSave();


        if (
            !engine ||
            !(engine instanceof ExamEngine)
        ) {

            return false;

        }


        this.autoSaveEngine =
            engine;


        /*
        --------------------------------------------------
        Eventos que alteram o estado da prova.
        --------------------------------------------------
        */

        const events = [

            "examStarted",
            "questionChanged",
            "answerChanged",
            "reviewChanged",
            "examPaused",
            "examResumed"

        ];


        events.forEach(
            eventName => {

                const unsubscribe =
                    engine.on(
                        eventName,
                        () => {

                            this.saveEngine(
                                engine
                            );

                        }
                    );


                this.autoSaveListeners
                    .push(
                        unsubscribe
                    );

            }
        );


        /*
        --------------------------------------------------
        Finalização

        Salva resultado e remove sessão ativa.
        --------------------------------------------------
        */

        const finishUnsubscribe =
            engine.on(
                "examFinished",
                payload => {

                    if (
                        payload &&
                        payload.result
                    ) {

                        this.saveResult(
                            payload.result
                        );

                    }


                    this.clearExam();

                }
            );


        this.autoSaveListeners.push(
            finishUnsubscribe
        );


        /*
        --------------------------------------------------
        Backup periódico

        Evita perda caso o navegador seja fechado
        sem disparar outro evento.
        --------------------------------------------------
        */

        interval =
            Number(interval);


        if (
            Number.isFinite(interval) &&
            interval >= 1000
        ) {

            this.autoSaveInterval =
                window.setInterval(
                    () => {

                        if (
                            this.autoSaveEngine &&
                            this.autoSaveEngine
                                .getExam() &&
                            !this.autoSaveEngine
                                .getExam()
                                .isFinished()
                        ) {

                            this.saveEngine(
                                this.autoSaveEngine
                            );

                        }

                    },
                    interval
                );

        }


        /*
        --------------------------------------------------
        beforeunload

        Salva imediatamente antes de fechar/recarregar.
        --------------------------------------------------
        */

        this.beforeUnloadHandler =
            () => {

                if (
                    this.autoSaveEngine &&
                    this.autoSaveEngine
                        .getExam() &&
                    !this.autoSaveEngine
                        .getExam()
                        .isFinished()
                ) {

                    this.saveEngine(
                        this.autoSaveEngine
                    );

                }

            };


        window.addEventListener(
            "beforeunload",
            this.beforeUnloadHandler
        );


        return true;

    }


    /*
    ======================================================
    DESABILITAR AUTOSAVE
    ======================================================
    */

    disableAutoSave() {

        /*
        Interval
        */

        if (
            this.autoSaveInterval !==
            null
        ) {

            window.clearInterval(
                this.autoSaveInterval
            );

        }


        this.autoSaveInterval = null;


        /*
        Listeners do ExamEngine
        */

        this.autoSaveListeners
            .forEach(
                unsubscribe => {

                    try {

                        if (
                            typeof unsubscribe ===
                            "function"
                        ) {

                            unsubscribe();

                        }

                    } catch (error) {

                        console.warn(
                            error
                        );

                    }

                }
            );


        this.autoSaveListeners = [];


        /*
        beforeunload
        */

        if (
            this.beforeUnloadHandler
        ) {

            window.removeEventListener(
                "beforeunload",
                this.beforeUnloadHandler
            );

        }


        this.beforeUnloadHandler =
            null;


        this.autoSaveEngine =
            null;

    }


    /*
    ======================================================
    EXPORTAR SESSÃO
    ======================================================

    Retorna string JSON.

    Poderá ser usada futuramente para
    download/exportação do progresso.
    ======================================================
    */

    exportExam() {

        const payload =
            this.loadJSON(
                this.keys.activeExam
            );


        if (!payload) {

            return null;

        }


        try {

            return JSON.stringify(
                payload,
                null,
                2
            );

        } catch (error) {

            return null;

        }

    }


    /*
    ======================================================
    IMPORTAR SESSÃO
    ======================================================
    */

    importExam(json) {

        if (!json) {

            return false;

        }


        try {

            const parsed =
                typeof json ===
                "string"
                    ? JSON.parse(json)
                    : json;


            /*
            ----------------------------------------------
            Aceita payload completo.
            ----------------------------------------------
            */

            if (
                parsed &&
                parsed.data &&
                typeof parsed.data ===
                    "object"
            ) {

                const exam =
                    Exam.fromJSON(
                        parsed.data
                    );


                return this.saveExam(
                    exam
                );

            }


            /*
            ----------------------------------------------
            Aceita apenas objeto do Exam.
            ----------------------------------------------
            */

            const exam =
                Exam.fromJSON(
                    parsed
                );


            return this.saveExam(
                exam
            );

        } catch (error) {

            console.error(
                "Unable to import exam.",
                error
            );


            return false;

        }

    }


    /*
    ======================================================
    TAMANHO APROXIMADO DO STORAGE
    ======================================================
    */

    getStorageSize() {

        if (!this.isAvailable()) {

            return 0;

        }


        let total = 0;


        try {

            for (
                let i = 0;
                i < this.storage.length;
                i++
            ) {

                const key =
                    this.storage.key(i);


                if (
                    !key ||
                    !key.startsWith(
                        this.prefix
                    )
                ) {

                    continue;

                }


                const value =
                    this.storage
                        .getItem(key) ||
                    "";


                total +=
                    key.length +
                    value.length;

            }

        } catch (error) {

            return 0;

        }


        /*
        Aproximação UTF-16:
        2 bytes por caractere.
        */

        return total * 2;

    }


    /*
    ======================================================
    LIMPAR TODOS OS DADOS DO SIMULADOR
    ======================================================
    */

    clearAll() {

        this.disableAutoSave();


        if (!this.isAvailable()) {

            return false;

        }


        try {

            const keysToRemove =
                [];


            for (
                let i = 0;
                i < this.storage.length;
                i++
            ) {

                const key =
                    this.storage.key(i);


                if (
                    key &&
                    key.startsWith(
                        this.prefix
                    )
                ) {

                    keysToRemove.push(
                        key
                    );

                }

            }


            keysToRemove.forEach(
                key => {

                    this.storage
                        .removeItem(key);

                }
            );


            return true;

        } catch (error) {

            console.error(
                "Unable to clear simulator storage.",
                error
            );


            return false;

        }

    }

}


/*
==========================================================
Disponibilização global
==========================================================
*/

window.StorageManager =
    StorageManager;

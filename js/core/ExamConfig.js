/*
==========================================================
CCNA Exam Simulator
Exam Configuration

Arquivo: js/core/ExamConfig.js
==========================================================
*/

class ExamConfig {

    /*
    ======================================================
    INFORMAÇÕES DO SIMULADOR
    ======================================================
    */

    static get simulator() {

        return {

            name:
                "Cisco CCNA 200-301",

            subtitle:
                "Exam Simulator",

            version:
                "1.0.0",

            language:
                "pt-BR"

        };

    }


    /*
    ======================================================
    DOMÍNIO ATUAL
    ======================================================

    Nesta primeira versão do projeto teremos somente:

    1.0 Network Fundamentals

    O banco terá 180 questões.
    ======================================================
    */

    static get domains() {

        return {

            networkFundamentals: {

                id:
                    "network-fundamentals",

                code:
                    "1.0",

                name:
                    "Network Fundamentals",

                namePT:
                    "Fundamentos de Redes",

                questionBank:
                    "data/network-fundamentals.json",

                bankSize:
                    180

            }

        };

    }


    /*
    ======================================================
    DOMÍNIO PADRÃO
    ======================================================
    */

    static get defaultDomain() {

        return (
            this.domains
                .networkFundamentals
        );

    }


    /*
    ======================================================
    MODOS DE PROVA
    ======================================================

    Mantemos os três modos definidos para o simulador.

    Quick Practice
    20 questões / 30 minutos

    Standard Exam
    45 questões / 60 minutos

    Full Exam
    90 questões / 120 minutos
    ======================================================
    */

    static get examModes() {

        return {

            quick: {

                id:
                    "quick",

                name:
                    "Quick Practice",

                questionCount:
                    20,

                durationMinutes:
                    30

            },


            standard: {

                id:
                    "standard",

                name:
                    "Standard Exam",

                questionCount:
                    45,

                durationMinutes:
                    60

            },


            full: {

                id:
                    "full",

                name:
                    "Full Exam",

                questionCount:
                    90,

                durationMinutes:
                    120

            }

        };

    }


    /*
    ======================================================
    MODO PADRÃO
    ======================================================
    */

    static get defaultMode() {

        return this.examModes.quick;

    }


    /*
    ======================================================
    TIPOS DE QUESTÃO
    ======================================================
    */

    static get questionTypes() {

        return {

            SINGLE:
                "single",

            MULTIPLE:
                "multiple",

            MATCHING:
                "matching",

            DRAGDROP:
                "dragdrop",

            ORDERING:
                "ordering",

            CLI:
                "cli",

            LAB:
                "lab"

        };

    }


    /*
    ======================================================
    ALIASES DE TIPOS
    ======================================================

    Permite compatibilidade entre diferentes nomes
    utilizados no banco.
    ======================================================
    */

    static get questionTypeAliases() {

        return {

            "single":
                "single",

            "multiple-choice":
                "single",

            "multiple":
                "multiple",

            "multiple-response":
                "multiple",

            "matching":
                "matching",

            "dragdrop":
                "matching",

            "drag-and-drop":
                "matching",

            "ordering":
                "ordering",

            "order":
                "ordering",

            "cli":
                "cli",

            "lab":
                "lab",

            "simulation":
                "lab"

        };

    }


    /*
    ======================================================
    NORMALIZAR TIPO
    ======================================================
    */

    static normalizeQuestionType(
        type
    ) {

        const normalized =
            String(
                type || "single"
            )
                .trim()
                .toLowerCase();


        return (
            this.questionTypeAliases[
                normalized
            ] ||
            normalized
        );

    }


    /*
    ======================================================
    OBTER MODO PELO ID
    ======================================================
    */

    static getMode(
        modeId
    ) {

        const id =
            String(
                modeId || ""
            )
                .trim()
                .toLowerCase();


        const modes =
            this.examModes;


        return (
            Object.values(modes)
                .find(
                    mode =>
                        mode.id === id
                ) ||
            this.defaultMode
        );

    }


    /*
    ======================================================
    OBTER MODO PELA QUANTIDADE DE QUESTÕES
    ======================================================

    Útil porque o HTML pode enviar:

    value="20"
    value="45"
    value="90"
    ======================================================
    */

    static getModeByQuestionCount(
        questionCount
    ) {

        const count =
            Number(
                questionCount
            );


        const mode =
            Object
                .values(
                    this.examModes
                )
                .find(
                    item =>
                        item.questionCount ===
                        count
                );


        return (
            mode ||
            this.defaultMode
        );

    }


    /*
    ======================================================
    OBTER DURAÇÃO
    ======================================================
    */

    static getDurationForQuestionCount(
        questionCount
    ) {

        return (
            this
                .getModeByQuestionCount(
                    questionCount
                )
                .durationMinutes
        );

    }


    /*
    ======================================================
    VALIDAR QUANTIDADE DE QUESTÕES
    ======================================================
    */

    static isValidQuestionCount(
        questionCount
    ) {

        const count =
            Number(
                questionCount
            );


        return Object
            .values(
                this.examModes
            )
            .some(
                mode =>
                    mode.questionCount ===
                    count
            );

    }


    /*
    ======================================================
    CONFIGURAÇÃO DO BANCO
    ======================================================
    */

    static getQuestionBankConfig() {

        const domain =
            this.defaultDomain;


        return {

            domainId:
                domain.id,

            domainCode:
                domain.code,

            domainName:
                domain.name,

            domainNamePT:
                domain.namePT,

            path:
                domain.questionBank,

            expectedSize:
                domain.bankSize

        };

    }


    /*
    ======================================================
    CONFIGURAÇÃO DE NAVEGAÇÃO
    ======================================================
    */

    static get navigation() {

        return {

            allowPrevious:
                true,

            allowNext:
                true,

            allowDirectNavigation:
                true,

            allowReviewMark:
                true

        };

    }


    /*
    ======================================================
    CONFIGURAÇÃO DE RESULTADOS
    ======================================================
    */

    static get results() {

        return {

            showCorrectAnswers:
                true,

            showIncorrectAnswers:
                true,

            showUnanswered:
                true,

            showReviewCount:
                true,

            allowQuestionReview:
                true,

            showExplanations:
                true

        };

    }


    /*
    ======================================================
    CONFIGURAÇÃO DO TIMER
    ======================================================
    */

    static get timer() {

        return {

            enabled:
                true,

            warningSeconds:
                600,

            criticalSeconds:
                300,

            autoFinish:
                true

        };

    }


    /*
    ======================================================
    CONFIGURAÇÃO DE STORAGE
    ======================================================
    */

    static get storage() {

        return {

            enabled:
                true,

            key:
                "ccna_exam_simulator",

            autoSave:
                true

        };

    }


    /*
    ======================================================
    CONFIGURAÇÃO COMPLETA
    ======================================================
    */

    static getAll() {

        return {

            simulator:
                this.simulator,

            domain:
                this.defaultDomain,

            modes:
                this.examModes,

            questionTypes:
                this.questionTypes,

            navigation:
                this.navigation,

            results:
                this.results,

            timer:
                this.timer,

            storage:
                this.storage

        };

    }

}


/*
==========================================================
Disponibilizar globalmente
==========================================================
*/

window.ExamConfig =
    ExamConfig;

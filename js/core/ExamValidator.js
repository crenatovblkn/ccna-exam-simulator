/*
==========================================================
CCNA Exam Simulator
Exam Validator

Arquivo: js/core/ExamValidator.js
==========================================================
*/

class ExamValidator {

    constructor() {

        this.errors = [];
        this.warnings = [];

        /*
        Tipos de questão aceitos pelo simulador.
        */

        this.allowedTypes = [

            "single",
            "multiple-choice",

            "multiple",
            "multiple-response",

            "matching",
            "dragdrop",
            "drag-and-drop",

            "ordering",
            "order",

            "cli",

            "lab",
            "simulation"

        ];

    }


    /*
    ======================================================
    VALIDAR BANCO COMPLETO
    ======================================================
    */

    validateBank(questions = []) {

        this.reset();


        if (!Array.isArray(questions)) {

            this.addError(
                "BANK_NOT_ARRAY",
                "O banco de questões não é um array."
            );


            return this.getReport();

        }


        if (questions.length === 0) {

            this.addError(
                "BANK_EMPTY",
                "O banco de questões está vazio."
            );


            return this.getReport();

        }


        /*
        IDs encontrados.
        */

        const ids = new Set();


        questions.forEach(
            (question, index) => {

                this.validateQuestion(
                    question,
                    index,
                    ids
                );

            }
        );


        return this.getReport();

    }


    /*
    ======================================================
    VALIDAR QUESTÃO
    ======================================================
    */

    validateQuestion(
        question,
        index,
        ids
    ) {

        const number =
            index + 1;


        if (
            !question ||
            typeof question !== "object"
        ) {

            this.addError(
                "INVALID_QUESTION",
                `Questão ${number}: estrutura inválida.`,
                {
                    index
                }
            );


            return;

        }


        /*
        ==================================================
        ID
        ==================================================
        */

        const id =
            this.getQuestionId(
                question
            );


        if (!id) {

            this.addError(
                "MISSING_ID",
                `Questão ${number}: ID não informado.`,
                {
                    index
                }
            );

        } else {

            if (ids.has(id)) {

                this.addError(
                    "DUPLICATE_ID",
                    `Questão ${number}: ID duplicado "${id}".`,
                    {
                        index,
                        questionId: id
                    }
                );

            }


            ids.add(id);

        }


        /*
        ==================================================
        ENUNCIADO
        ==================================================
        */

        const text =
            this.getQuestionText(
                question
            );


        if (!text) {

            this.addError(
                "MISSING_QUESTION_TEXT",
                `Questão ${number}: enunciado não informado.`,
                {
                    index,
                    questionId: id
                }
            );

        }


        /*
        ==================================================
        TIPO
        ==================================================
        */

        const type =
            this.getQuestionType(
                question
            );


        if (
            !this.allowedTypes.includes(
                type
            )
        ) {

            this.addError(
                "INVALID_TYPE",
                `Questão ${number}: tipo "${type}" não reconhecido.`,
                {
                    index,
                    questionId: id,
                    type
                }
            );


            return;

        }


        /*
        ==================================================
        VALIDAÇÃO POR TIPO
        ==================================================
        */

        switch (type) {

            case "single":
            case "multiple-choice":

                this.validateSingleChoice(
                    question,
                    index
                );

                break;


            case "multiple":
            case "multiple-response":

                this.validateMultipleResponse(
                    question,
                    index
                );

                break;


            case "matching":
            case "dragdrop":
            case "drag-and-drop":

                this.validateMatching(
                    question,
                    index
                );

                break;


            case "ordering":
            case "order":

                this.validateOrdering(
                    question,
                    index
                );

                break;


            case "cli":

                this.validateCLI(
                    question,
                    index
                );

                break;


            case "lab":
            case "simulation":

                this.validateLab(
                    question,
                    index
                );

                break;

        }


        /*
        ==================================================
        EXPLICAÇÃO
        ==================================================
        */

        const explanation =
            this.getExplanation(
                question
            );


        if (!explanation) {

            this.addWarning(
                "MISSING_EXPLANATION",
                `Questão ${number}: não possui explicação.`,
                {
                    index,
                    questionId: id
                }
            );

        }

    }


    /*
    ======================================================
    SINGLE CHOICE
    ======================================================
    */

    validateSingleChoice(
        question,
        index
    ) {

        const answers =
            this.getAnswers(
                question
            );


        const number =
            index + 1;


        if (answers.length < 2) {

            this.addError(
                "INSUFFICIENT_ANSWERS",
                `Questão ${number}: uma questão de resposta única precisa possuir pelo menos duas alternativas.`,
                {
                    index
                }
            );


            return;

        }


        this.validateAnswerIds(
            answers,
            index
        );


        const correct =
            this.getCorrectAnswers(
                question
            );


        if (
            correct.length !== 1
        ) {

            this.addError(
                "INVALID_SINGLE_CORRECT_COUNT",
                `Questão ${number}: uma questão de resposta única deve possuir exatamente uma resposta correta.`,
                {
                    index
                }
            );

        }


        this.validateCorrectAnswersExist(
            question,
            index
        );

    }


    /*
    ======================================================
    MULTIPLE RESPONSE
    ======================================================
    */

    validateMultipleResponse(
        question,
        index
    ) {

        const answers =
            this.getAnswers(
                question
            );


        const number =
            index + 1;


        if (answers.length < 2) {

            this.addError(
                "INSUFFICIENT_ANSWERS",
                `Questão ${number}: uma questão de múltiplas respostas precisa possuir pelo menos duas alternativas.`,
                {
                    index
                }
            );


            return;

        }


        this.validateAnswerIds(
            answers,
            index
        );


        const correct =
            this.getCorrectAnswers(
                question
            );


        if (
            correct.length < 2
        ) {

            this.addError(
                "INVALID_MULTIPLE_CORRECT_COUNT",
                `Questão ${number}: uma questão de múltiplas respostas deve possuir pelo menos duas respostas corretas.`,
                {
                    index
                }
            );

        }


        this.validateCorrectAnswersExist(
            question,
            index
        );

    }


    /*
    ======================================================
    IDs DAS ALTERNATIVAS
    ======================================================
    */

    validateAnswerIds(
        answers,
        questionIndex
    ) {

        const ids =
            new Set();


        answers.forEach(
            (answer, answerIndex) => {

                const id =
                    this.getAnswerId(
                        answer,
                        answerIndex
                    );


                if (!id) {

                    this.addError(
                        "MISSING_ANSWER_ID",
                        `Questão ${questionIndex + 1}: alternativa ${answerIndex + 1} não possui ID.`,
                        {
                            index:
                                questionIndex,

                            answerIndex
                        }
                    );


                    return;

                }


                if (ids.has(id)) {

                    this.addError(
                        "DUPLICATE_ANSWER_ID",
                        `Questão ${questionIndex + 1}: ID de alternativa duplicado "${id}".`,
                        {
                            index:
                                questionIndex,

                            answerIndex
                        }
                    );

                }


                ids.add(id);


                const text =
                    this.getAnswerText(
                        answer
                    );


                if (!text) {

                    this.addError(
                        "MISSING_ANSWER_TEXT",
                        `Questão ${questionIndex + 1}: alternativa ${answerIndex + 1} não possui texto.`,
                        {
                            index:
                                questionIndex,

                            answerIndex
                        }
                    );

                }

            }
        );

    }


    /*
    ======================================================
    VERIFICAR RESPOSTAS CORRETAS
    ======================================================
    */

    validateCorrectAnswersExist(
        question,
        index
    ) {

        const answerIds =
            this.getAnswers(question)
                .map(
                    (answer, answerIndex) =>
                        this.getAnswerId(
                            answer,
                            answerIndex
                        )
                );


        const correctAnswers =
            this.getCorrectAnswers(
                question
            );


        correctAnswers.forEach(
            correctId => {

                if (
                    !answerIds.includes(
                        String(correctId)
                    )
                ) {

                    this.addError(
                        "CORRECT_ANSWER_NOT_FOUND",
                        `Questão ${index + 1}: a resposta correta "${correctId}" não existe entre as alternativas.`,
                        {
                            index,
                            correctId
                        }
                    );

                }

            }
        );

    }


    /*
    ======================================================
    MATCHING / DRAG AND DROP
    ======================================================
    */

    validateMatching(
        question,
        index
    ) {

        const data =
            question.dragdrop ||
            question.matching;


        if (!data) {

            this.addError(
                "MISSING_MATCHING_DATA",
                `Questão ${index + 1}: dados de matching/drag-and-drop não encontrados.`,
                {
                    index
                }
            );


            return;

        }


        const items =
            data.items ||
            data.sources ||
            [];


        const targets =
            data.targets ||
            [];


        if (
            !Array.isArray(items) ||
            items.length === 0
        ) {

            this.addError(
                "MISSING_MATCHING_ITEMS",
                `Questão ${index + 1}: nenhum item de origem foi definido.`,
                {
                    index
                }
            );

        }


        if (
            !Array.isArray(targets) ||
            targets.length === 0
        ) {

            this.addError(
                "MISSING_MATCHING_TARGETS",
                `Questão ${index + 1}: nenhum destino foi definido.`,
                {
                    index
                }
            );

        }


        const correct =
            this.getCorrectAnswers(
                question
            );


        if (
            correct.length === 0
        ) {

            this.addError(
                "MISSING_MATCHING_SOLUTION",
                `Questão ${index + 1}: solução correta do matching não definida.`,
                {
                    index
                }
            );

        }

    }


    /*
    ======================================================
    ORDERING
    ======================================================
    */

    validateOrdering(
        question,
        index
    ) {

        const data =
            question.ordering ||
            question.order ||
            question.dragdrop;


        if (!data) {

            this.addError(
                "MISSING_ORDERING_DATA",
                `Questão ${index + 1}: dados da questão de ordenação não encontrados.`,
                {
                    index
                }
            );


            return;

        }


        const items =
            data.items || [];


        if (
            !Array.isArray(items) ||
            items.length < 2
        ) {

            this.addError(
                "INVALID_ORDERING_ITEMS",
                `Questão ${index + 1}: a questão de ordenação precisa possuir pelo menos dois itens.`,
                {
                    index
                }
            );

        }


        const correct =
            this.getCorrectAnswers(
                question
            );


        if (
            correct.length === 0
        ) {

            this.addError(
                "MISSING_ORDERING_SOLUTION",
                `Questão ${index + 1}: sequência correta não definida.`,
                {
                    index
                }
            );

        }

    }


    /*
    ======================================================
    CLI
    ======================================================
    */

    validateCLI(
        question,
        index
    ) {

        const cli =
            question.cli;


        if (
            !cli ||
            typeof cli !== "object"
        ) {

            this.addError(
                "MISSING_CLI_DATA",
                `Questão ${index + 1}: configuração CLI não encontrada.`,
                {
                    index
                }
            );


            return;

        }


        if (
            !cli.commands ||
            typeof cli.commands !== "object"
        ) {

            this.addWarning(
                "CLI_WITHOUT_COMMANDS",
                `Questão ${index + 1}: nenhum comando CLI foi definido.`,
                {
                    index
                }
            );

        }

    }


    /*
    ======================================================
    LAB
    ======================================================
    */

    validateLab(
        question,
        index
    ) {

        const lab =
            question.lab;


        if (
            !lab ||
            typeof lab !== "object"
        ) {

            this.addError(
                "MISSING_LAB_DATA",
                `Questão ${index + 1}: configuração do laboratório não encontrada.`,
                {
                    index
                }
            );


            return;

        }


        if (
            !lab.instructions
        ) {

            this.addWarning(
                "LAB_WITHOUT_INSTRUCTIONS",
                `Questão ${index + 1}: laboratório sem instruções.`,
                {
                    index
                }
            );

        }

    }


    /*
    ======================================================
    HELPERS - QUESTION
    ======================================================
    */

    getQuestionId(question) {

        if (
            typeof question.getId ===
            "function"
        ) {

            return String(
                question.getId() || ""
            );

        }


        return String(
            question.id || ""
        );

    }


    getQuestionText(question) {

        if (
            typeof question.getQuestion ===
            "function"
        ) {

            return String(
                question.getQuestion() || ""
            ).trim();

        }


        return String(
            question.question ||
            question.text ||
            ""
        ).trim();

    }


    getQuestionType(question) {

        let type;


        if (
            typeof question.getType ===
            "function"
        ) {

            type =
                question.getType();

        } else {

            type =
                question.type;

        }


        return String(
            type || "single"
        )
            .trim()
            .toLowerCase();

    }


    getExplanation(question) {

        if (
            typeof question.getExplanation ===
            "function"
        ) {

            return String(
                question.getExplanation() || ""
            ).trim();

        }


        return String(
            question.explanation || ""
        ).trim();

    }


    /*
    ======================================================
    HELPERS - ANSWERS
    ======================================================
    */

    getAnswers(question) {

        if (
            typeof question.getAnswers ===
            "function"
        ) {

            const answers =
                question.getAnswers();


            return Array.isArray(answers)
                ? answers
                : [];

        }


        return Array.isArray(
            question.answers
        )
            ? question.answers
            : [];

    }


    getAnswerId(
        answer,
        fallback = ""
    ) {

        if (
            answer &&
            typeof answer.getId ===
            "function"
        ) {

            return String(
                answer.getId() ?? ""
            );

        }


        /*
        Não usamos o fallback como ID real.

        Se o banco não possui ID,
        queremos que o validator detecte.
        */

        return String(
            answer?.id ?? ""
        );

    }


    getAnswerText(answer) {

        if (
            answer &&
            typeof answer.getText ===
            "function"
        ) {

            return String(
                answer.getText() || ""
            ).trim();

        }


        return String(
            answer?.text ??
            answer?.answer ??
            answer?.label ??
            ""
        ).trim();

    }


    /*
    ======================================================
    RESPOSTAS CORRETAS
    ======================================================
    */

    getCorrectAnswers(question) {

        if (
            typeof question.getCorrectAnswers ===
            "function"
        ) {

            const correct =
                question.getCorrectAnswers();


            return Array.isArray(correct)
                ? correct.map(String)
                : [];

        }


        if (
            Array.isArray(
                question.correctAnswers
            )
        ) {

            return question
                .correctAnswers
                .map(String);

        }


        /*
        Compatibilidade com:
        answers[].correct = true
        */

        return this
            .getAnswers(question)
            .filter(answer => {

                if (
                    typeof answer.isCorrect ===
                    "function"
                ) {

                    return answer.isCorrect();

                }


                return Boolean(
                    answer.correct
                );

            })
            .map(answer => {

                if (
                    typeof answer.getId ===
                    "function"
                ) {

                    return String(
                        answer.getId()
                    );

                }


                return String(
                    answer.id ?? ""
                );

            })
            .filter(Boolean);

    }


    /*
    ======================================================
    ERROS
    ======================================================
    */

    addError(
        code,
        message,
        data = {}
    ) {

        this.errors.push({

            code,
            message,
            ...data

        });

    }


    /*
    ======================================================
    AVISOS
    ======================================================
    */

    addWarning(
        code,
        message,
        data = {}
    ) {

        this.warnings.push({

            code,
            message,
            ...data

        });

    }


    /*
    ======================================================
    RELATÓRIO
    ======================================================
    */

    getReport() {

        return {

            valid:
                this.errors.length === 0,

            errorCount:
                this.errors.length,

            warningCount:
                this.warnings.length,

            errors:
                [...this.errors],

            warnings:
                [...this.warnings]

        };

    }


    /*
    ======================================================
    VERIFICAÇÃO RÁPIDA
    ======================================================
    */

    isValid(questions = []) {

        return this
            .validateBank(questions)
            .valid;

    }


    /*
    ======================================================
    LOG DO RELATÓRIO
    ======================================================
    */

    printReport(report = null) {

        const data =
            report ||
            this.getReport();


        console.group(
            "[ExamValidator] Validação do banco"
        );


        console.log(
            "Status:",
            data.valid
                ? "VÁLIDO"
                : "INVÁLIDO"
        );


        console.log(
            "Erros:",
            data.errorCount
        );


        console.log(
            "Avisos:",
            data.warningCount
        );


        if (
            data.errors.length > 0
        ) {

            console.group(
                "Erros"
            );


            data.errors.forEach(
                error => {

                    console.error(
                        `[${error.code}] ${error.message}`
                    );

                }
            );


            console.groupEnd();

        }


        if (
            data.warnings.length > 0
        ) {

            console.group(
                "Avisos"
            );


            data.warnings.forEach(
                warning => {

                    console.warn(
                        `[${warning.code}] ${warning.message}`
                    );

                }
            );


            console.groupEnd();

        }


        console.groupEnd();

    }


    /*
    ======================================================
    RESET
    ======================================================
    */

    reset() {

        this.errors = [];
        this.warnings = [];

    }

}


/*
==========================================================
Disponibilizar globalmente
==========================================================
*/

window.ExamValidator =
    ExamValidator;

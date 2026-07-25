/*
==========================================================
Cisco CCNA 200-301 Exam Simulator
Question Model

Responsabilidade:
- Representar uma questão do exame
- Suportar diferentes tipos de questões
- Armazenar respostas do usuário
- Controlar estado de revisão e visita
- Validar respostas
- Serializar/restaurar estado

Tipos previstos:
- single
- multiple
- dragdrop
- matching
- ordering
- exhibit
- lab
- cli

Este modelo NÃO manipula DOM.
Este modelo NÃO controla navegação.
Este modelo NÃO calcula a pontuação global da prova.
==========================================================
*/

class Question {

    /*
    ======================================================
    CONSTRUCTOR
    ======================================================
    */

    constructor(data = {}) {

        /*
        --------------------------------------------------
        Identificação
        --------------------------------------------------
        */

        this.id =
            data.id !== undefined &&
            data.id !== null
                ? String(data.id)
                : "";


        /*
        --------------------------------------------------
        Classificação
        --------------------------------------------------
        */

        this.domain =
            data.domain || "Network Fundamentals";

        this.type =
            data.type || "single";

        this.difficulty =
            data.difficulty || "medium";


        /*
        --------------------------------------------------
        Conteúdo principal
        --------------------------------------------------
        */

        this.question =
            data.question || "";

        this.instruction =
            data.instruction || "";

        this.explanation =
            data.explanation || "";

        this.image =
            data.image || null;


        /*
        --------------------------------------------------
        Exhibit / cenário
        --------------------------------------------------
        */

        this.exhibit =
            data.exhibit || null;

        this.scenario =
            data.scenario || null;


        /*
        --------------------------------------------------
        Alternativas
        --------------------------------------------------
        */

        this.answers =
            Array.isArray(data.answers)
                ? data.answers.map(answer => {

                    if (answer instanceof Answer) {

                        return answer;

                    }

                    return new Answer(answer);

                })
                : [];


        /*
        --------------------------------------------------
        Respostas corretas

        Prioridade:

        1. correctAnswers informado explicitamente
        2. answers[].correct
        --------------------------------------------------
        */

        if (
            Array.isArray(data.correctAnswers) &&
            data.correctAnswers.length > 0
        ) {

            this.correctAnswers =
                data.correctAnswers.map(String);

        } else {

            this.correctAnswers =
                this.answers
                    .filter(answer =>
                        answer.isCorrect()
                    )
                    .map(answer =>
                        String(answer.getId())
                    );

        }


        /*
        --------------------------------------------------
        Respostas do usuário

        Usado principalmente por:
        single
        multiple
        --------------------------------------------------
        */

        this.userAnswers =
            Array.isArray(data.userAnswers)
                ? data.userAnswers.map(String)
                : [];


        /*
        --------------------------------------------------
        Drag and Drop
        --------------------------------------------------
        */

        this.dragdrop =
            data.dragdrop || null;

        this.userDragdrop =
            data.userDragdrop &&
            typeof data.userDragdrop === "object"
                ? { ...data.userDragdrop }
                : {};


        /*
        --------------------------------------------------
        Matching
        --------------------------------------------------
        */

        this.matching =
            data.matching || null;

        this.userMatching =
            data.userMatching &&
            typeof data.userMatching === "object"
                ? { ...data.userMatching }
                : {};


        /*
        --------------------------------------------------
        Ordering
        --------------------------------------------------
        */

        this.ordering =
            data.ordering || null;

        this.userOrder =
            Array.isArray(data.userOrder)
                ? data.userOrder.map(String)
                : [];


        /*
        --------------------------------------------------
        LAB
        --------------------------------------------------
        */

        this.lab =
            data.lab || null;

        this.userLab =
            data.userLab &&
            typeof data.userLab === "object"
                ? this.cloneObject(data.userLab)
                : {};


        /*
        --------------------------------------------------
        CLI

        Pode existir como exhibit ou como parte de LAB.
        --------------------------------------------------
        */

        this.cli =
            data.cli || null;


        /*
        --------------------------------------------------
        Estado da questão
        --------------------------------------------------
        */

        this.review =
            Boolean(data.review);

        this.visited =
            Boolean(data.visited);

        this.answered =
            Boolean(data.answered);


        /*
        --------------------------------------------------
        Restaura seleção visual dos Answers
        --------------------------------------------------
        */

        this.restoreAnswerSelection();


        /*
        --------------------------------------------------
        Sincroniza estado answered
        --------------------------------------------------
        */

        this.updateAnsweredState();

    }


    /*
    ======================================================
    GETTERS
    ======================================================
    */

    getId() {

        return this.id;

    }


    getDomain() {

        return this.domain;

    }


    getType() {

        return this.type;

    }


    getDifficulty() {

        return this.difficulty;

    }


    getQuestion() {

        return this.question;

    }


    getInstruction() {

        return this.instruction;

    }


    getExplanation() {

        return this.explanation;

    }


    getImage() {

        return this.image;

    }


    getExhibit() {

        return this.exhibit;

    }


    getScenario() {

        return this.scenario;

    }


    getAnswers() {

        return this.answers;

    }


    getCorrectAnswers() {

        return [...this.correctAnswers];

    }


    getUserAnswers() {

        return [...this.userAnswers];

    }


    getDragdrop() {

        return this.dragdrop;

    }


    getUserDragdrop() {

        return { ...this.userDragdrop };

    }


    getMatching() {

        return this.matching;

    }


    getUserMatching() {

        return { ...this.userMatching };

    }


    getOrdering() {

        return this.ordering;

    }


    getUserOrder() {

        return [...this.userOrder];

    }


    getLab() {

        return this.lab;

    }


    getUserLab() {

        return this.cloneObject(
            this.userLab
        );

    }


    getCli() {

        return this.cli;

    }


    /*
    ======================================================
    TIPO DA QUESTÃO
    ======================================================
    */

    isSingleChoice() {

        return this.type === "single";

    }


    isMultipleChoice() {

        return this.type === "multiple";

    }


    isDragDrop() {

        return this.type === "dragdrop";

    }


    isMatching() {

        return this.type === "matching";

    }


    isOrdering() {

        return this.type === "ordering";

    }


    isLab() {

        return this.type === "lab";

    }


    isCli() {

        return this.type === "cli";

    }


    isExhibit() {

        return this.type === "exhibit";

    }


    /*
    ======================================================
    SINGLE / MULTIPLE CHOICE
    ======================================================
    */

    answer(answerId) {

        answerId = String(answerId);


        /*
        --------------------------------------------------
        Validação

        Não permite registrar um ID que não existe.
        --------------------------------------------------
        */

        const answerExists =
            this.answers.some(answer =>
                String(answer.getId()) === answerId
            );


        if (!answerExists) {

            return false;

        }


        /*
        --------------------------------------------------
        SINGLE CHOICE

        Sempre mantém apenas uma resposta.
        --------------------------------------------------
        */

        if (this.isSingleChoice()) {

            this.userAnswers = [answerId];

            this.answers.forEach(answer => {

                if (
                    String(answer.getId()) ===
                    answerId
                ) {

                    answer.select();

                } else {

                    answer.deselect();

                }

            });

            this.updateAnsweredState();

            return true;

        }


        /*
        --------------------------------------------------
        MULTIPLE CHOICE

        Funciona como toggle:
        - não marcada -> marca
        - marcada -> desmarca
        --------------------------------------------------
        */

        if (this.isMultipleChoice()) {

            if (
                this.userAnswers.includes(answerId)
            ) {

                this.userAnswers =
                    this.userAnswers.filter(
                        id => id !== answerId
                    );

                this.answers.forEach(answer => {

                    if (
                        String(answer.getId()) ===
                        answerId
                    ) {

                        answer.deselect();

                    }

                });

            } else {

                this.userAnswers.push(answerId);

                this.answers.forEach(answer => {

                    if (
                        String(answer.getId()) ===
                        answerId
                    ) {

                        answer.select();

                    }

                });

            }

            this.updateAnsweredState();

            return true;

        }


        return false;

    }


    /*
    ======================================================
    DEFINE RESPOSTAS DIRETAMENTE
    ======================================================
    */

    setAnswers(answerIds = []) {

        if (!Array.isArray(answerIds)) {

            return false;

        }


        const normalized =
            answerIds.map(String);


        /*
        --------------------------------------------------
        SINGLE

        Usa somente a primeira resposta válida.
        --------------------------------------------------
        */

        if (this.isSingleChoice()) {

            this.clearAnswers();


            if (normalized.length === 0) {

                return true;

            }


            return this.answer(
                normalized[0]
            );

        }


        /*
        --------------------------------------------------
        MULTIPLE
        --------------------------------------------------
        */

        if (this.isMultipleChoice()) {

            this.clearAnswers();


            normalized.forEach(id => {

                if (
                    !this.userAnswers.includes(id)
                ) {

                    const answer =
                        this.answers.find(item =>
                            String(item.getId()) === id
                        );


                    if (answer) {

                        this.userAnswers.push(id);

                        answer.select();

                    }

                }

            });


            this.updateAnsweredState();

            return true;

        }


        return false;

    }


    /*
    ======================================================
    LIMPA SINGLE / MULTIPLE
    ======================================================
    */

    clearAnswers() {

        this.userAnswers = [];


        this.answers.forEach(answer => {

            answer.deselect();

        });


        this.updateAnsweredState();

    }


    /*
    ======================================================
    DRAG AND DROP
    ======================================================
    */

    setDragdropAnswer(
        targetId,
        itemId
    ) {

        if (!this.isDragDrop()) {

            return false;

        }


        targetId = String(targetId);

        itemId = String(itemId);


        /*
        --------------------------------------------------
        Um item não pode ocupar dois destinos.

        Remove o item de qualquer destino anterior.
        --------------------------------------------------
        */

        Object.keys(
            this.userDragdrop
        ).forEach(target => {

            if (
                String(
                    this.userDragdrop[target]
                ) === itemId
            ) {

                delete this.userDragdrop[target];

            }

        });


        this.userDragdrop[targetId] =
            itemId;


        this.updateAnsweredState();

        return true;

    }


    removeDragdropAnswer(targetId) {

        targetId = String(targetId);


        if (
            Object.prototype.hasOwnProperty.call(
                this.userDragdrop,
                targetId
            )
        ) {

            delete this.userDragdrop[targetId];

        }


        this.updateAnsweredState();

    }


    clearDragdrop() {

        this.userDragdrop = {};

        this.updateAnsweredState();

    }


    /*
    ======================================================
    MATCHING
    ======================================================
    */

    setMatchingAnswer(
        leftId,
        rightId
    ) {

        if (!this.isMatching()) {

            return false;

        }


        leftId = String(leftId);

        rightId = String(rightId);


        /*
        --------------------------------------------------
        Evita que o mesmo item da direita seja utilizado
        em mais de uma associação.
        --------------------------------------------------
        */

        Object.keys(
            this.userMatching
        ).forEach(key => {

            if (
                String(
                    this.userMatching[key]
                ) === rightId
            ) {

                delete this.userMatching[key];

            }

        });


        this.userMatching[leftId] =
            rightId;


        this.updateAnsweredState();

        return true;

    }


    removeMatchingAnswer(leftId) {

        leftId = String(leftId);


        if (
            Object.prototype.hasOwnProperty.call(
                this.userMatching,
                leftId
            )
        ) {

            delete this.userMatching[leftId];

        }


        this.updateAnsweredState();

    }


    clearMatching() {

        this.userMatching = {};

        this.updateAnsweredState();

    }


    /*
    ======================================================
    ORDERING
    ======================================================
    */

    setOrder(order = []) {

        if (!this.isOrdering()) {

            return false;

        }


        if (!Array.isArray(order)) {

            return false;

        }


        this.userOrder =
            order.map(String);


        this.updateAnsweredState();

        return true;

    }


    moveOrderItem(
        fromIndex,
        toIndex
    ) {

        if (!this.isOrdering()) {

            return false;

        }


        if (
            fromIndex < 0 ||
            toIndex < 0 ||
            fromIndex >=
                this.userOrder.length ||
            toIndex >=
                this.userOrder.length
        ) {

            return false;

        }


        const updated =
            [...this.userOrder];


        const [item] =
            updated.splice(
                fromIndex,
                1
            );


        updated.splice(
            toIndex,
            0,
            item
        );


        this.userOrder =
            updated;


        this.updateAnsweredState();

        return true;

    }


    clearOrder() {

        this.userOrder = [];

        this.updateAnsweredState();

    }


    /*
    ======================================================
    LAB
    ======================================================
    */

    setLabState(state = {}) {

        if (!this.isLab()) {

            return false;

        }


        if (
            !state ||
            typeof state !== "object"
        ) {

            return false;

        }


        this.userLab =
            this.cloneObject(state);


        this.updateAnsweredState();

        return true;

    }


    updateLabState(
        key,
        value
    ) {

        if (!this.isLab()) {

            return false;

        }


        this.userLab[key] = value;

        this.updateAnsweredState();

        return true;

    }


    clearLabState() {

        this.userLab = {};

        this.updateAnsweredState();

    }


    /*
    ======================================================
    REVIEW
    ======================================================
    */

    setReview(value = true) {

        this.review =
            Boolean(value);

        return this.review;

    }


    toggleReview() {

        this.review =
            !this.review;

        return this.review;

    }


    isMarkedForReview() {

        return this.review;

    }


    /*
    ======================================================
    VISITA
    ======================================================
    */

    visit() {

        this.visited = true;

    }


    wasVisited() {

        return this.visited;

    }


    /*
    ======================================================
    ESTADO
    ======================================================
    */

    isAnswered() {

        return this.answered;

    }


    /*
    ======================================================
    ATUALIZA ESTADO ANSWERED
    ======================================================
    */

    updateAnsweredState() {

        switch (this.type) {

            case "single":

            case "multiple":

                this.answered =
                    this.userAnswers.length > 0;

                break;


            case "dragdrop":

                this.answered =
                    Object.keys(
                        this.userDragdrop
                    ).length > 0;

                break;


            case "matching":

                this.answered =
                    Object.keys(
                        this.userMatching
                    ).length > 0;

                break;


            case "ordering":

                this.answered =
                    this.userOrder.length > 0;

                break;


            case "lab":

                this.answered =
                    Object.keys(
                        this.userLab
                    ).length > 0;

                break;


            case "cli":

            case "exhibit":

                /*
                Exhibit/CLI podem utilizar answers
                quando forem questões objetivas.
                */

                this.answered =
                    this.userAnswers.length > 0;

                break;


            default:

                this.answered = false;

        }


        return this.answered;

    }


    /*
    ======================================================
    CORREÇÃO
    ======================================================
    */

    isCorrect() {

        switch (this.type) {

            case "single":

            case "multiple":

            case "cli":

            case "exhibit":

                return this
                    .isChoiceAnswerCorrect();


            case "dragdrop":

                return this
                    .isDragdropCorrect();


            case "matching":

                return this
                    .isMatchingCorrect();


            case "ordering":

                return this
                    .isOrderingCorrect();


            case "lab":

                return this
                    .isLabCorrect();


            default:

                return false;

        }

    }


    /*
    ======================================================
    CORREÇÃO - SINGLE / MULTIPLE
    ======================================================
    */

    isChoiceAnswerCorrect() {

        if (
            this.userAnswers.length === 0
        ) {

            return false;

        }


        if (
            this.userAnswers.length !==
            this.correctAnswers.length
        ) {

            return false;

        }


        const user =
            [...this.userAnswers]
                .map(String)
                .sort();


        const correct =
            [...this.correctAnswers]
                .map(String)
                .sort();


        return correct.every(
            (id, index) =>
                id === user[index]
        );

    }


    /*
    ======================================================
    CORREÇÃO - DRAG AND DROP
    ======================================================
    */

    isDragdropCorrect() {

        if (
            !this.dragdrop ||
            !this.dragdrop.correct
        ) {

            return false;

        }


        return this.compareObjectMaps(
            this.userDragdrop,
            this.dragdrop.correct
        );

    }


    /*
    ======================================================
    CORREÇÃO - MATCHING
    ======================================================
    */

    isMatchingCorrect() {

        if (
            !this.matching ||
            !this.matching.correct
        ) {

            return false;

        }


        return this.compareObjectMaps(
            this.userMatching,
            this.matching.correct
        );

    }


    /*
    ======================================================
    CORREÇÃO - ORDERING
    ======================================================
    */

    isOrderingCorrect() {

        if (
            !this.ordering ||
            !Array.isArray(
                this.ordering.correctOrder
            )
        ) {

            return false;

        }


        const correct =
            this.ordering.correctOrder
                .map(String);


        const user =
            this.userOrder
                .map(String);


        if (
            correct.length !==
            user.length
        ) {

            return false;

        }


        return correct.every(
            (id, index) =>
                id === user[index]
        );

    }


    /*
    ======================================================
    CORREÇÃO - LAB

    O LAB trabalha com critérios.

    Exemplo:

    lab: {
        criteria: {
            "R1.hostname": "R1",
            "R1.interface.g0/0.ip": "192.168.1.1"
        }
    }

    O LabRenderer / motor de CLI construirá userLab
    com o estado produzido pelo aluno.
    ======================================================
    */

    isLabCorrect() {

        if (
            !this.lab ||
            !this.lab.criteria ||
            typeof this.lab.criteria !==
                "object"
        ) {

            return false;

        }


        const criteria =
            this.lab.criteria;


        const keys =
            Object.keys(criteria);


        if (keys.length === 0) {

            return false;

        }


        return keys.every(key => {

            const expected =
                criteria[key];


            const actual =
                this.getNestedValue(
                    this.userLab,
                    key
                );


            return this.normalizeValue(actual) ===
                   this.normalizeValue(expected);

        });

    }


    /*
    ======================================================
    RESTAURA SELEÇÃO DAS ALTERNATIVAS
    ======================================================
    */

    restoreAnswerSelection() {

        this.answers.forEach(answer => {

            const id =
                String(answer.getId());


            if (
                this.userAnswers.includes(id)
            ) {

                answer.select();

            } else {

                answer.deselect();

            }

        });

    }


    /*
    ======================================================
    RESET
    ======================================================
    */

    reset() {

        this.clearAnswers();

        this.userDragdrop = {};

        this.userMatching = {};

        this.userOrder = [];

        this.userLab = {};

        this.review = false;

        this.visited = false;

        this.answered = false;


        this.answers.forEach(answer => {

            answer.reset();

        });

    }


    /*
    ======================================================
    UTILIDADE - COMPARAÇÃO DE MAPAS
    ======================================================
    */

    compareObjectMaps(
        userMap = {},
        correctMap = {}
    ) {

        const userKeys =
            Object.keys(userMap)
                .sort();


        const correctKeys =
            Object.keys(correctMap)
                .sort();


        if (
            userKeys.length !==
            correctKeys.length
        ) {

            return false;

        }


        return correctKeys.every(key => {

            if (
                !Object.prototype
                    .hasOwnProperty.call(
                        userMap,
                        key
                    )
            ) {

                return false;

            }


            return (
                String(userMap[key]) ===
                String(correctMap[key])
            );

        });

    }


    /*
    ======================================================
    UTILIDADE - OBJETO ANINHADO
    ======================================================
    */

    getNestedValue(
        object,
        path
    ) {

        if (
            !object ||
            !path
        ) {

            return undefined;

        }


        return String(path)
            .split(".")
            .reduce(
                (current, key) => {

                    if (
                        current === undefined ||
                        current === null
                    ) {

                        return undefined;

                    }


                    return current[key];

                },
                object
            );

    }


    /*
    ======================================================
    NORMALIZAÇÃO PARA LAB
    ======================================================
    */

    normalizeValue(value) {

        if (
            value === undefined ||
            value === null
        ) {

            return "";

        }


        if (
            typeof value === "boolean"
        ) {

            return value;

        }


        if (
            typeof value === "number"
        ) {

            return value;

        }


        return String(value)
            .trim()
            .toLowerCase();

    }


    /*
    ======================================================
    CLONE DE OBJETO
    ======================================================
    */

    cloneObject(object) {

        if (
            object === undefined ||
            object === null
        ) {

            return {};

        }


        try {

            return JSON.parse(
                JSON.stringify(object)
            );

        } catch (error) {

            return {};

        }

    }


    /*
    ======================================================
    CLONE
    ======================================================
    */

    clone() {

        return new Question(
            this.toJSON()
        );

    }


    /*
    ======================================================
    SERIALIZAÇÃO
    ======================================================
    */

    toJSON() {

        return {

            id: this.id,

            domain: this.domain,

            type: this.type,

            difficulty: this.difficulty,

            question: this.question,

            instruction: this.instruction,

            explanation: this.explanation,

            image: this.image,

            exhibit:
                this.exhibit,

            scenario:
                this.scenario,

            answers:
                this.answers.map(
                    answer =>
                        answer.toJSON()
                ),

            correctAnswers:
                [...this.correctAnswers],

            userAnswers:
                [...this.userAnswers],

            dragdrop:
                this.dragdrop,

            userDragdrop:
                { ...this.userDragdrop },

            matching:
                this.matching,

            userMatching:
                { ...this.userMatching },

            ordering:
                this.ordering,

            userOrder:
                [...this.userOrder],

            lab:
                this.lab,

            userLab:
                this.cloneObject(
                    this.userLab
                ),

            cli:
                this.cli,

            review:
                this.review,

            visited:
                this.visited,

            answered:
                this.answered

        };

    }


    /*
    ======================================================
    RESTAURAÇÃO
    ======================================================
    */

    static fromJSON(data = {}) {

        return new Question(data);

    }

}


/*
==========================================================
Disponibilização global
==========================================================
*/

window.Question = Question;

/*
==========================================================
CCNA Exam Simulator
Question Renderer

Arquivo: js/QuestionRenderer.js
==========================================================
*/

class QuestionRenderer {

    constructor(container, examSession) {

        if (!container) {
            throw new Error(
                "QuestionRenderer precisa de um container."
            );
        }

        if (!examSession) {
            throw new Error(
                "QuestionRenderer precisa de uma ExamSession."
            );
        }

        this.container = container;
        this.examSession = examSession;

    }


    /*
    ======================================================
    RENDERIZAR QUESTÃO ATUAL
    ======================================================
    */

    renderCurrentQuestion() {

        const question =
            this.examSession.getCurrentQuestion();

        if (!question) {

            this.container.innerHTML = `
                <div class="question-error">
                    Nenhuma questão disponível.
                </div>
            `;

            return;
        }

        this.render(question);

    }


    /*
    ======================================================
    RENDER PRINCIPAL
    ======================================================
    */

    render(question) {

        this.container.innerHTML = "";

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "question-wrapper";


        /*
        Cabeçalho
        */

        wrapper.appendChild(
            this.createHeader(question)
        );


        /*
        Enunciado
        */

        wrapper.appendChild(
            this.createQuestionText(question)
        );


        /*
        Instrução
        */

        if (question.instruction) {

            wrapper.appendChild(
                this.createInstruction(
                    question.instruction
                )
            );

        }


        /*
        Imagem
        */

        if (question.image) {

            wrapper.appendChild(
                this.createImage(question)
            );

        }


        /*
        CLI
        */

        if (
            question.type === "cli" &&
            question.cli
        ) {

            wrapper.appendChild(
                this.createCLI(question.cli)
            );

        }


        /*
        Área de resposta
        */

        const answerArea =
            document.createElement("div");

        answerArea.className =
            "answer-area";


        switch (question.type) {

            case "single":

                this.renderSingle(
                    question,
                    answerArea
                );

                break;


            case "multiple":

                this.renderMultiple(
                    question,
                    answerArea
                );

                break;


            case "cli":

                this.renderSingle(
                    question,
                    answerArea
                );

                break;


            case "matching":

                this.renderMatching(
                    question,
                    answerArea
                );

                break;


            case "ordering":

                this.renderOrdering(
                    question,
                    answerArea
                );

                break;


            default:

                answerArea.innerHTML = `
                    <div class="question-error">
                        Tipo de questão não suportado:
                        ${this.escapeHTML(question.type)}
                    </div>
                `;

        }


        wrapper.appendChild(answerArea);

        this.container.appendChild(wrapper);

    }


    /*
    ======================================================
    CABEÇALHO
    ======================================================
    */

    createHeader(question) {

        const header =
            document.createElement("div");

        header.className =
            "question-header";


        const number =
            this.examSession.getCurrentNumber();

        const total =
            this.examSession.getTotalQuestions();


        const numberElement =
            document.createElement("div");

        numberElement.className =
            "question-number";

        numberElement.textContent =
            `Questão ${number} de ${total}`;


        const meta =
            document.createElement("div");

        meta.className =
            "question-meta";


        if (question.domain) {

            const domain =
                document.createElement("span");

            domain.className =
                "question-domain";

            domain.textContent =
                question.domain;

            meta.appendChild(domain);

        }


        if (question.difficulty) {

            const difficulty =
                document.createElement("span");

            difficulty.className =
                `question-difficulty difficulty-${question.difficulty}`;

            difficulty.textContent =
                this.translateDifficulty(
                    question.difficulty
                );

            meta.appendChild(difficulty);

        }


        header.appendChild(
            numberElement
        );

        header.appendChild(meta);

        return header;

    }


    /*
    ======================================================
    ENUNCIADO
    ======================================================
    */

    createQuestionText(question) {

        const element =
            document.createElement("div");

        element.className =
            "question-text";

        element.textContent =
            question.question;

        return element;

    }


    /*
    ======================================================
    INSTRUÇÃO
    ======================================================
    */

    createInstruction(text) {

        const element =
            document.createElement("div");

        element.className =
            "question-instruction";

        element.textContent = text;

        return element;

    }


    /*
    ======================================================
    IMAGEM
    ======================================================
    */

    createImage(question) {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "question-image-wrapper";


        const image =
            document.createElement("img");

        image.className =
            "question-image";

        image.src =
            question.image;

        image.alt =
            `Imagem da questão ${question.id}`;

        image.loading =
            "lazy";


        image.addEventListener(
            "error",
            () => {

                wrapper.innerHTML = `
                    <div class="image-error">
                        Não foi possível carregar a imagem.
                    </div>
                `;

            }
        );


        wrapper.appendChild(image);

        return wrapper;

    }


    /*
    ======================================================
    CLI
    ======================================================
    */

    createCLI(cli) {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "cli-wrapper";


        if (cli.title) {

            const title =
                document.createElement("div");

            title.className =
                "cli-title";

            title.textContent =
                cli.title;

            wrapper.appendChild(title);

        }


        const terminal =
            document.createElement("pre");

        terminal.className =
            "cli-terminal";


        const code =
            document.createElement("code");

        code.textContent =
            cli.output || "";

        terminal.appendChild(code);

        wrapper.appendChild(terminal);

        return wrapper;

    }


    /*
    ======================================================
    SINGLE
    ======================================================
    */

    renderSingle(question, container) {

        const currentAnswer =
            this.examSession.getAnswer(
                question.id
            ) || [];


        question.answers.forEach(answer => {

            const label =
                document.createElement("label");

            label.className =
                "answer-option";


            const input =
                document.createElement("input");

            input.type =
                "radio";

            input.name =
                `question-${question.id}`;

            input.value =
                answer.id;


            input.checked =
                currentAnswer.includes(
                    String(answer.id)
                );


            /*
            Ao selecionar uma alternativa,
            substitui a resposta anterior.
            */

            input.addEventListener(
                "change",
                () => {

                    this.examSession.setAnswer(
                        question.id,
                        answer.id
                    );

                    this.updateOptionStates(
                        container
                    );

                    this.dispatchAnswerEvent(
                        question.id
                    );

                }
            );


            const marker =
                document.createElement("span");

            marker.className =
                "answer-marker";

            marker.textContent =
                answer.id;


            const text =
                document.createElement("span");

            text.className =
                "answer-text";

            text.textContent =
                answer.text;


            label.appendChild(input);
            label.appendChild(marker);
            label.appendChild(text);

            container.appendChild(label);

        });


        this.updateOptionStates(container);

    }


    /*
    ======================================================
    MULTIPLE
    ======================================================
    */

    renderMultiple(
        question,
        container
    ) {

        const currentAnswer =
            this.examSession.getAnswer(
                question.id
            ) || [];


        question.answers.forEach(answer => {

            const label =
                document.createElement("label");

            label.className =
                "answer-option";


            const input =
                document.createElement("input");

            input.type =
                "checkbox";

            input.name =
                `question-${question.id}`;

            input.value =
                answer.id;


            input.checked =
                currentAnswer.includes(
                    String(answer.id)
                );


            /*
            Checkbox permite marcar
            e desmarcar livremente.
            */

            input.addEventListener(
                "change",
                () => {

                    const selected =
                        Array.from(
                            container.querySelectorAll(
                                'input[type="checkbox"]:checked'
                            )
                        ).map(
                            item =>
                                item.value
                        );


                    this.examSession.setAnswer(
                        question.id,
                        selected
                    );


                    this.updateOptionStates(
                        container
                    );


                    this.dispatchAnswerEvent(
                        question.id
                    );

                }
            );


            const marker =
                document.createElement("span");

            marker.className =
                "answer-marker";

            marker.textContent =
                answer.id;


            const text =
                document.createElement("span");

            text.className =
                "answer-text";

            text.textContent =
                answer.text;


            label.appendChild(input);
            label.appendChild(marker);
            label.appendChild(text);

            container.appendChild(label);

        });


        this.updateOptionStates(container);

    }


    /*
    ======================================================
    MATCHING
    ======================================================
    */

    renderMatching(
        question,
        container
    ) {

        const matching =
            question.matching;

        const currentAnswer =
            this.examSession.getAnswer(
                question.id
            ) || {};


        const wrapper =
            document.createElement("div");

        wrapper.className =
            "matching-container";


        matching.left.forEach(leftItem => {

            const row =
                document.createElement("div");

            row.className =
                "matching-row";


            const left =
                document.createElement("div");

            left.className =
                "matching-left";

            left.textContent =
                leftItem.text;


            const select =
                document.createElement("select");

            select.className =
                "matching-select";

            select.dataset.leftId =
                leftItem.id;


            const defaultOption =
                document.createElement("option");

            defaultOption.value = "";

            defaultOption.textContent =
                "Selecione...";

            select.appendChild(
                defaultOption
            );


            matching.right.forEach(
                rightItem => {

                    const option =
                        document.createElement(
                            "option"
                        );

                    option.value =
                        rightItem.id;

                    option.textContent =
                        rightItem.text;


                    if (
                        currentAnswer[
                            leftItem.id
                        ] === rightItem.id
                    ) {

                        option.selected =
                            true;

                    }


                    select.appendChild(
                        option
                    );

                }
            );


            select.addEventListener(
                "change",
                () => {

                    const result = {};


                    wrapper
                        .querySelectorAll(
                            ".matching-select"
                        )
                        .forEach(
                            element => {

                                if (
                                    element.value
                                ) {

                                    result[
                                        element.dataset.leftId
                                    ] =
                                        element.value;

                                }

                            }
                        );


                    this.examSession.setAnswer(
                        question.id,
                        result
                    );


                    this.dispatchAnswerEvent(
                        question.id
                    );

                }
            );


            row.appendChild(left);
            row.appendChild(select);

            wrapper.appendChild(row);

        });


        container.appendChild(wrapper);

    }


    /*
    ======================================================
    ORDERING
    ======================================================
    */

    renderOrdering(
        question,
        container
    ) {

        const ordering =
            question.ordering;


        let currentOrder =
            this.examSession.getAnswer(
                question.id
            );


        /*
        Se ainda não existe resposta,
        mostramos os itens na ordem
        definida no JSON.
        */

        if (
            !Array.isArray(currentOrder) ||
            currentOrder.length === 0
        ) {

            currentOrder =
                ordering.items.map(
                    item => item.id
                );

        }


        const itemMap =
            new Map(
                ordering.items.map(
                    item => [
                        String(item.id),
                        item
                    ]
                )
            );


        const wrapper =
            document.createElement("div");

        wrapper.className =
            "ordering-container";


        currentOrder.forEach(
            (itemId, index) => {

                const item =
                    itemMap.get(
                        String(itemId)
                    );

                if (!item) {
                    return;
                }


                const row =
                    document.createElement("div");

                row.className =
                    "ordering-item";

                row.dataset.itemId =
                    item.id;


                const position =
                    document.createElement("span");

                position.className =
                    "ordering-position";

                position.textContent =
                    index + 1;


                const text =
                    document.createElement("span");

                text.className =
                    "ordering-text";

                text.textContent =
                    item.text;


                const controls =
                    document.createElement("div");

                controls.className =
                    "ordering-controls";


                /*
                SUBIR
                */

                const upButton =
                    document.createElement(
                        "button"
                    );

                upButton.type =
                    "button";

                upButton.className =
                    "ordering-button";

                upButton.textContent =
                    "↑";

                upButton.title =
                    "Mover para cima";

                upButton.disabled =
                    index === 0;


                upButton.addEventListener(
                    "click",
                    () => {

                        this.moveOrderingItem(
                            question,
                            item.id,
                            -1
                        );

                    }
                );


                /*
                DESCER
                */

                const downButton =
                    document.createElement(
                        "button"
                    );

                downButton.type =
                    "button";

                downButton.className =
                    "ordering-button";

                downButton.textContent =
                    "↓";

                downButton.title =
                    "Mover para baixo";

                downButton.disabled =
                    index ===
                    currentOrder.length - 1;


                downButton.addEventListener(
                    "click",
                    () => {

                        this.moveOrderingItem(
                            question,
                            item.id,
                            1
                        );

                    }
                );


                controls.appendChild(
                    upButton
                );

                controls.appendChild(
                    downButton
                );


                row.appendChild(position);
                row.appendChild(text);
                row.appendChild(controls);

                wrapper.appendChild(row);

            }
        );


        container.appendChild(wrapper);

    }


    /*
    ======================================================
    MOVER ITEM DO ORDERING
    ======================================================
    */

    moveOrderingItem(
        question,
        itemId,
        direction
    ) {

        let order =
            this.examSession.getAnswer(
                question.id
            );


        /*
        Primeira interação.
        */

        if (
            !Array.isArray(order) ||
            order.length === 0
        ) {

            order =
                question.ordering.items.map(
                    item => item.id
                );

        }


        const currentIndex =
            order.findIndex(
                id =>
                    String(id) ===
                    String(itemId)
            );


        if (currentIndex === -1) {

            return;

        }


        const newIndex =
            currentIndex + direction;


        if (
            newIndex < 0 ||
            newIndex >= order.length
        ) {

            return;

        }


        [
            order[currentIndex],
            order[newIndex]
        ] = [
            order[newIndex],
            order[currentIndex]
        ];


        this.examSession.setAnswer(
            question.id,
            order
        );


        this.renderCurrentQuestion();


        this.dispatchAnswerEvent(
            question.id
        );

    }


    /*
    ======================================================
    ESTADO VISUAL DAS ALTERNATIVAS
    ======================================================
    */

    updateOptionStates(container) {

        const options =
            container.querySelectorAll(
                ".answer-option"
            );


        options.forEach(option => {

            const input =
                option.querySelector(
                    "input"
                );


            if (!input) {
                return;
            }


            option.classList.toggle(
                "selected",
                input.checked
            );

        });

    }


    /*
    ======================================================
    EVENTO DE RESPOSTA ALTERADA
    ======================================================
    */

    dispatchAnswerEvent(questionId) {

        const event =
            new CustomEvent(
                "exam:answerChanged",
                {
                    detail: {

                        questionId,

                        progress:
                            this.examSession
                                .getProgress()

                    }
                }
            );


        document.dispatchEvent(event);

    }


    /*
    ======================================================
    TRADUÇÃO DA DIFICULDADE
    ======================================================
    */

    translateDifficulty(
        difficulty
    ) {

        const translations = {

            easy: "Fácil",
            medium: "Média",
            hard: "Difícil"

        };


        return (
            translations[difficulty] ||
            difficulty
        );

    }


    /*
    ======================================================
    ESCAPE HTML
    ======================================================
    */

    escapeHTML(value) {

        return String(value)
            .replaceAll(
                "&",
                "&amp;"
            )
            .replaceAll(
                "<",
                "&lt;"
            )
            .replaceAll(
                ">",
                "&gt;"
            )
            .replaceAll(
                '"',
                "&quot;"
            )
            .replaceAll(
                "'",
                "&#039;"
            );

    }

}


/*
==========================================================
Disponibilizar globalmente
==========================================================
*/

window.QuestionRenderer =
    QuestionRenderer;

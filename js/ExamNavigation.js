/*
==========================================================
CCNA Exam Simulator
Exam Navigation

Arquivo: js/ExamNavigation.js
==========================================================
*/

class ExamNavigation {

    constructor(
        container,
        examSession,
        questionRenderer
    ) {

        if (!container) {
            throw new Error(
                "ExamNavigation precisa de um container."
            );
        }

        if (!examSession) {
            throw new Error(
                "ExamNavigation precisa de uma ExamSession."
            );
        }

        if (!questionRenderer) {
            throw new Error(
                "ExamNavigation precisa de um QuestionRenderer."
            );
        }

        this.container =
            container;

        this.examSession =
            examSession;

        this.questionRenderer =
            questionRenderer;


        /*
        Referências internas
        */

        this.grid = null;

        this.answeredElement = null;
        this.unansweredElement = null;
        this.reviewElement = null;


        /*
        Listener para atualização
        automática do painel.
        */

        this.handleAnswerChanged =
            this.handleAnswerChanged.bind(this);


        document.addEventListener(
            "exam:answerChanged",
            this.handleAnswerChanged
        );

    }


    /*
    ======================================================
    RENDER PRINCIPAL
    ======================================================
    */

    render() {

        this.container.innerHTML = "";


        const wrapper =
            document.createElement("div");

        wrapper.className =
            "exam-navigation";


        /*
        --------------------------------------------------
        TÍTULO
        --------------------------------------------------
        */

        const title =
            document.createElement("div");

        title.className =
            "navigation-title";

        title.textContent =
            "Navegação da Prova";


        wrapper.appendChild(title);


        /*
        --------------------------------------------------
        RESUMO
        --------------------------------------------------
        */

        wrapper.appendChild(
            this.createSummary()
        );


        /*
        --------------------------------------------------
        GRID DE QUESTÕES
        --------------------------------------------------
        */

        const gridTitle =
            document.createElement("div");

        gridTitle.className =
            "navigation-section-title";

        gridTitle.textContent =
            "Questões";


        wrapper.appendChild(
            gridTitle
        );


        this.grid =
            document.createElement("div");

        this.grid.className =
            "question-navigation-grid";


        wrapper.appendChild(
            this.grid
        );


        /*
        --------------------------------------------------
        LEGENDA
        --------------------------------------------------
        */

        wrapper.appendChild(
            this.createLegend()
        );


        this.container.appendChild(
            wrapper
        );


        this.renderQuestionButtons();

        this.update();

    }


    /*
    ======================================================
    RESUMO
    ======================================================
    */

    createSummary() {

        const summary =
            document.createElement("div");

        summary.className =
            "navigation-summary";


        /*
        RESPONDIDAS
        */

        const answered =
            this.createSummaryItem(
                "Respondidas",
                "answered"
            );

        this.answeredElement =
            answered.value;


        /*
        NÃO RESPONDIDAS
        */

        const unanswered =
            this.createSummaryItem(
                "Não respondidas",
                "unanswered"
            );

        this.unansweredElement =
            unanswered.value;


        /*
        REVISÃO
        */

        const review =
            this.createSummaryItem(
                "Para revisão",
                "review"
            );

        this.reviewElement =
            review.value;


        summary.appendChild(
            answered.element
        );

        summary.appendChild(
            unanswered.element
        );

        summary.appendChild(
            review.element
        );


        return summary;

    }


    /*
    ======================================================
    ITEM DO RESUMO
    ======================================================
    */

    createSummaryItem(
        label,
        type
    ) {

        const element =
            document.createElement("div");

        element.className =
            `navigation-summary-item summary-${type}`;


        const value =
            document.createElement("strong");

        value.className =
            "navigation-summary-value";

        value.textContent =
            "0";


        const text =
            document.createElement("span");

        text.className =
            "navigation-summary-label";

        text.textContent =
            label;


        element.appendChild(
            value
        );

        element.appendChild(
            text
        );


        return {
            element,
            value
        };

    }


    /*
    ======================================================
    CRIAR BOTÕES DAS QUESTÕES
    ======================================================
    */

    renderQuestionButtons() {

        if (!this.grid) {
            return;
        }


        this.grid.innerHTML = "";


        const total =
            this.examSession
                .getTotalQuestions();


        for (
            let index = 0;
            index < total;
            index++
        ) {

            const question =
                this.examSession
                    .getQuestion(index);


            if (!question) {
                continue;
            }


            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.className =
                "question-nav-button";

            button.textContent =
                index + 1;

            button.dataset.index =
                index;

            button.dataset.questionId =
                question.id;


            button.setAttribute(
                "aria-label",
                `Ir para a questão ${index + 1}`
            );


            button.addEventListener(
                "click",
                () => {

                    this.goToQuestion(
                        index
                    );

                }
            );


            this.grid.appendChild(
                button
            );

        }

    }


    /*
    ======================================================
    IR PARA UMA QUESTÃO
    ======================================================
    */

    goToQuestion(index) {

        const success =
            this.examSession.goTo(
                index
            );


        if (!success) {
            return false;
        }


        /*
        Renderiza a nova questão.
        */

        this.questionRenderer
            .renderCurrentQuestion();


        /*
        Atualiza navegação.
        */

        this.update();


        /*
        Informa aos demais componentes
        que a questão mudou.
        */

        this.dispatchNavigationEvent();


        return true;

    }


    /*
    ======================================================
    PRÓXIMA QUESTÃO
    ======================================================
    */

    next() {

        const success =
            this.examSession.next();


        if (!success) {
            return false;
        }


        this.questionRenderer
            .renderCurrentQuestion();


        this.update();

        this.dispatchNavigationEvent();

        return true;

    }


    /*
    ======================================================
    QUESTÃO ANTERIOR
    ======================================================
    */

    previous() {

        const success =
            this.examSession.previous();


        if (!success) {
            return false;
        }


        this.questionRenderer
            .renderCurrentQuestion();


        this.update();

        this.dispatchNavigationEvent();

        return true;

    }


    /*
    ======================================================
    MARCAR QUESTÃO ATUAL PARA REVISÃO
    ======================================================
    */

    toggleCurrentReview() {

        const question =
            this.examSession
                .getCurrentQuestion();


        if (!question) {
            return false;
        }


        const marked =
            this.examSession
                .toggleReview(
                    question.id
                );


        this.update();


        /*
        Dispara evento para que outros
        componentes possam atualizar
        botões/textos.
        */

        const event =
            new CustomEvent(
                "exam:reviewChanged",
                {
                    detail: {

                        questionId:
                            question.id,

                        review:
                            marked,

                        progress:
                            this.examSession
                                .getProgress()

                    }
                }
            );


        document.dispatchEvent(
            event
        );


        return marked;

    }


    /*
    ======================================================
    ATUALIZAR PAINEL
    ======================================================
    */

    update() {

        this.updateSummary();

        this.updateQuestionButtons();

    }


    /*
    ======================================================
    ATUALIZAR RESUMO
    ======================================================
    */

    updateSummary() {

        const progress =
            this.examSession
                .getProgress();


        if (
            this.answeredElement
        ) {

            this.answeredElement.textContent =
                progress.answered;

        }


        if (
            this.unansweredElement
        ) {

            this.unansweredElement.textContent =
                progress.unanswered;

        }


        if (
            this.reviewElement
        ) {

            this.reviewElement.textContent =
                progress.review;

        }

    }


    /*
    ======================================================
    ATUALIZAR BOTÕES
    ======================================================
    */

    updateQuestionButtons() {

        if (!this.grid) {
            return;
        }


        const currentIndex =
            this.examSession
                .getCurrentIndex();


        const buttons =
            this.grid.querySelectorAll(
                ".question-nav-button"
            );


        buttons.forEach(
            button => {

                const index =
                    Number(
                        button.dataset.index
                    );

                const questionId =
                    button.dataset.questionId;


                const answered =
                    this.examSession
                        .isAnswered(
                            questionId
                        );


                const review =
                    this.examSession
                        .isMarkedForReview(
                            questionId
                        );


                /*
                Limpa estados anteriores.
                */

                button.classList.remove(
                    "current",
                    "answered",
                    "unanswered",
                    "review"
                );


                /*
                Respondida / não respondida.
                */

                if (answered) {

                    button.classList.add(
                        "answered"
                    );

                } else {

                    button.classList.add(
                        "unanswered"
                    );

                }


                /*
                Revisão pode coexistir
                com respondida.
                */

                if (review) {

                    button.classList.add(
                        "review"
                    );

                }


                /*
                Questão atual.
                */

                if (
                    index ===
                    currentIndex
                ) {

                    button.classList.add(
                        "current"
                    );

                    button.setAttribute(
                        "aria-current",
                        "true"
                    );

                } else {

                    button.removeAttribute(
                        "aria-current"
                    );

                }


                /*
                Tooltip.
                */

                const status = [];

                if (answered) {

                    status.push(
                        "Respondida"
                    );

                } else {

                    status.push(
                        "Não respondida"
                    );

                }


                if (review) {

                    status.push(
                        "Marcada para revisão"
                    );

                }


                if (
                    index ===
                    currentIndex
                ) {

                    status.push(
                        "Questão atual"
                    );

                }


                button.title =
                    `Questão ${index + 1} — ${status.join(", ")}`;

            }
        );

    }


    /*
    ======================================================
    LEGENDA
    ======================================================
    */

    createLegend() {

        const legend =
            document.createElement("div");

        legend.className =
            "navigation-legend";


        const title =
            document.createElement("div");

        title.className =
            "navigation-section-title";

        title.textContent =
            "Legenda";


        legend.appendChild(
            title
        );


        const items = [

            {
                className:
                    "legend-current",

                label:
                    "Questão atual"
            },

            {
                className:
                    "legend-answered",

                label:
                    "Respondida"
            },

            {
                className:
                    "legend-unanswered",

                label:
                    "Não respondida"
            },

            {
                className:
                    "legend-review",

                label:
                    "Para revisão"
            }

        ];


        items.forEach(item => {

            const row =
                document.createElement(
                    "div"
                );

            row.className =
                "legend-item";


            const indicator =
                document.createElement(
                    "span"
                );

            indicator.className =
                `legend-indicator ${item.className}`;


            const label =
                document.createElement(
                    "span"
                );

            label.textContent =
                item.label;


            row.appendChild(
                indicator
            );

            row.appendChild(
                label
            );


            legend.appendChild(
                row
            );

        });


        return legend;

    }


    /*
    ======================================================
    EVENTO DE RESPOSTA ALTERADA
    ======================================================
    */

    handleAnswerChanged() {

        this.update();

    }


    /*
    ======================================================
    EVENTO DE NAVEGAÇÃO
    ======================================================
    */

    dispatchNavigationEvent() {

        const question =
            this.examSession
                .getCurrentQuestion();


        const event =
            new CustomEvent(
                "exam:questionChanged",
                {
                    detail: {

                        question,

                        index:
                            this.examSession
                                .getCurrentIndex(),

                        number:
                            this.examSession
                                .getCurrentNumber(),

                        total:
                            this.examSession
                                .getTotalQuestions(),

                        first:
                            this.examSession
                                .isFirstQuestion(),

                        last:
                            this.examSession
                                .isLastQuestion()

                    }
                }
            );


        document.dispatchEvent(
            event
        );

    }


    /*
    ======================================================
    DESTRUIR LISTENER
    ======================================================
    */

    destroy() {

        document.removeEventListener(
            "exam:answerChanged",
            this.handleAnswerChanged
        );

    }

}


/*
==========================================================
Disponibilizar globalmente
==========================================================
*/

window.ExamNavigation =
    ExamNavigation;

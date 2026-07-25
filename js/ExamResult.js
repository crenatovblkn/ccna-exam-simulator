/*
==========================================================
CCNA Exam Simulator
Exam Result

Arquivo: js/ExamResult.js
==========================================================
*/

class ExamResult {

    constructor(container, examSession) {

        if (!container) {
            throw new Error(
                "ExamResult precisa de um container."
            );
        }

        if (!examSession) {
            throw new Error(
                "ExamResult precisa de uma ExamSession."
            );
        }

        this.container = container;
        this.examSession = examSession;

    }


    /*
    ======================================================
    EXIBIR RESULTADO
    ======================================================
    */

    show() {

        const result =
            this.examSession.getResult();

        if (!result) {
            return false;
        }

        this.container.innerHTML = "";

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "exam-result";


        /*
        Cabeçalho
        */

        wrapper.appendChild(
            this.createHeader(result)
        );


        /*
        Pontuação principal
        */

        wrapper.appendChild(
            this.createScore(result)
        );


        /*
        Estatísticas
        */

        wrapper.appendChild(
            this.createStatistics(result)
        );


        /*
        Tempo
        */

        wrapper.appendChild(
            this.createTime(result)
        );


        /*
        Revisão das questões
        */

        wrapper.appendChild(
            this.createQuestionReview(result)
        );


        /*
        Botões finais
        */

        wrapper.appendChild(
            this.createActions()
        );


        this.container.appendChild(
            wrapper
        );


        this.container.classList.remove(
            "hidden"
        );


        this.dispatchResultEvent(
            result
        );


        return true;

    }


    /*
    ======================================================
    CABEÇALHO
    ======================================================
    */

    createHeader(result) {

        const header =
            document.createElement("div");

        header.className =
            "result-header";


        const title =
            document.createElement("h1");

        title.className =
            "result-title";

        title.textContent =
            "Resultado da Prova";


        const subtitle =
            document.createElement("p");

        subtitle.className =
            "result-subtitle";

        subtitle.textContent =
            `Você concluiu ${result.total} questões.`;


        header.appendChild(title);
        header.appendChild(subtitle);


        return header;

    }


    /*
    ======================================================
    PONTUAÇÃO PRINCIPAL
    ======================================================
    */

    createScore(result) {

        const section =
            document.createElement("div");

        section.className =
            "result-score-section";


        const circle =
            document.createElement("div");

        circle.className =
            "result-score-circle";


        const percentage =
            document.createElement("strong");

        percentage.className =
            "result-score-percentage";

        percentage.textContent =
            `${result.percentage}%`;


        const label =
            document.createElement("span");

        label.className =
            "result-score-label";

        label.textContent =
            "Aproveitamento";


        circle.appendChild(
            percentage
        );

        circle.appendChild(
            label
        );


        section.appendChild(
            circle
        );


        return section;

    }


    /*
    ======================================================
    ESTATÍSTICAS
    ======================================================
    */

    createStatistics(result) {

        const section =
            document.createElement("div");

        section.className =
            "result-statistics";


        section.appendChild(
            this.createStatisticCard(
                result.correct,
                "Corretas",
                "correct"
            )
        );


        section.appendChild(
            this.createStatisticCard(
                result.incorrect,
                "Incorretas",
                "incorrect"
            )
        );


        section.appendChild(
            this.createStatisticCard(
                result.unanswered,
                "Não respondidas",
                "unanswered"
            )
        );


        section.appendChild(
            this.createStatisticCard(
                result.review,
                "Marcadas para revisão",
                "review"
            )
        );


        return section;

    }


    /*
    ======================================================
    CARD DE ESTATÍSTICA
    ======================================================
    */

    createStatisticCard(
        value,
        label,
        type
    ) {

        const card =
            document.createElement("div");

        card.className =
            `result-stat-card result-${type}`;


        const number =
            document.createElement("strong");

        number.className =
            "result-stat-number";

        number.textContent =
            value;


        const text =
            document.createElement("span");

        text.className =
            "result-stat-label";

        text.textContent =
            label;


        card.appendChild(number);
        card.appendChild(text);


        return card;

    }


    /*
    ======================================================
    TEMPO DE PROVA
    ======================================================
    */

    createTime(result) {

        const section =
            document.createElement("div");

        section.className =
            "result-time";


        const label =
            document.createElement("span");

        label.className =
            "result-time-label";

        label.textContent =
            "Tempo utilizado";


        const value =
            document.createElement("strong");

        value.className =
            "result-time-value";

        value.textContent =
            this.formatTime(
                result.elapsedSeconds
            );


        section.appendChild(label);
        section.appendChild(value);


        return section;

    }


    /*
    ======================================================
    REVISÃO DAS QUESTÕES
    ======================================================
    */

    createQuestionReview(result) {

        const section =
            document.createElement("div");

        section.className =
            "result-review-section";


        const title =
            document.createElement("h2");

        title.className =
            "result-review-title";

        title.textContent =
            "Resumo das Questões";


        section.appendChild(title);


        const grid =
            document.createElement("div");

        grid.className =
            "result-question-grid";


        result.questions.forEach(
            questionResult => {

                const button =
                    document.createElement(
                        "button"
                    );

                button.type =
                    "button";

                button.className =
                    "result-question-button";

                button.textContent =
                    questionResult.number;


                /*
                Estado da questão.
                */

                if (
                    !questionResult.answered
                ) {

                    button.classList.add(
                        "unanswered"
                    );

                    button.title =
                        `Questão ${questionResult.number}: Não respondida`;

                }

                else if (
                    questionResult.correct
                ) {

                    button.classList.add(
                        "correct"
                    );

                    button.title =
                        `Questão ${questionResult.number}: Correta`;

                }

                else {

                    button.classList.add(
                        "incorrect"
                    );

                    button.title =
                        `Questão ${questionResult.number}: Incorreta`;

                }


                /*
                Marcada para revisão.
                */

                if (
                    questionResult.review
                ) {

                    button.classList.add(
                        "review"
                    );

                }


                /*
                Clique para visualizar
                detalhes da questão.
                */

                button.addEventListener(
                    "click",
                    () => {

                        this.showQuestionDetails(
                            questionResult.id
                        );

                    }
                );


                grid.appendChild(
                    button
                );

            }
        );


        section.appendChild(grid);


        /*
        Legenda
        */

        section.appendChild(
            this.createResultLegend()
        );


        return section;

    }


    /*
    ======================================================
    LEGENDA DO RESULTADO
    ======================================================
    */

    createResultLegend() {

        const legend =
            document.createElement("div");

        legend.className =
            "result-legend";


        const items = [

            {
                className:
                    "correct",

                text:
                    "Correta"
            },

            {
                className:
                    "incorrect",

                text:
                    "Incorreta"
            },

            {
                className:
                    "unanswered",

                text:
                    "Não respondida"
            },

            {
                className:
                    "review",

                text:
                    "Marcada para revisão"
            }

        ];


        items.forEach(item => {

            const row =
                document.createElement("div");

            row.className =
                "result-legend-item";


            const indicator =
                document.createElement("span");

            indicator.className =
                `result-legend-indicator ${item.className}`;


            const text =
                document.createElement("span");

            text.textContent =
                item.text;


            row.appendChild(
                indicator
            );

            row.appendChild(
                text
            );


            legend.appendChild(
                row
            );

        });


        return legend;

    }


    /*
    ======================================================
    DETALHES DE UMA QUESTÃO
    ======================================================
    */

    showQuestionDetails(questionId) {

        const question =
            this.examSession
                .getQuestionById(
                    questionId
                );


        if (!question) {
            return;
        }


        const userAnswer =
            this.examSession
                .getAnswer(
                    questionId
                );


        const correct =
            this.examSession
                .isCorrect(
                    questionId
                );


        const answered =
            this.examSession
                .isAnswered(
                    questionId
                );


        const event =
            new CustomEvent(
                "exam:resultQuestionSelected",
                {
                    detail: {

                        question,

                        userAnswer,

                        correct,

                        answered

                    }
                }
            );


        document.dispatchEvent(
            event
        );

    }


    /*
    ======================================================
    BOTÕES FINAIS
    ======================================================
    */

    createActions() {

        const actions =
            document.createElement("div");

        actions.className =
            "result-actions";


        /*
        REVISAR RESULTADO
        */

        const reviewButton =
            document.createElement("button");

        reviewButton.type =
            "button";

        reviewButton.className =
            "btn btn-secondary";

        reviewButton.textContent =
            "REVISAR QUESTÕES";


        reviewButton.addEventListener(
            "click",
            () => {

                const event =
                    new CustomEvent(
                        "exam:reviewResults"
                    );

                document.dispatchEvent(
                    event
                );

            }
        );


        /*
        NOVA PROVA
        */

        const newExamButton =
            document.createElement("button");

        newExamButton.type =
            "button";

        newExamButton.className =
            "btn btn-primary";

        newExamButton.textContent =
            "NOVA PROVA";


        newExamButton.addEventListener(
            "click",
            () => {

                const event =
                    new CustomEvent(
                        "exam:newExam"
                    );

                document.dispatchEvent(
                    event
                );

            }
        );


        actions.appendChild(
            reviewButton
        );

        actions.appendChild(
            newExamButton
        );


        return actions;

    }


    /*
    ======================================================
    FORMATAR TEMPO
    ======================================================
    */

    formatTime(totalSeconds) {

        const seconds =
            Math.max(
                0,
                Math.floor(
                    Number(totalSeconds) || 0
                )
            );


        const hours =
            Math.floor(
                seconds / 3600
            );


        const minutes =
            Math.floor(
                (seconds % 3600) / 60
            );


        const remainingSeconds =
            seconds % 60;


        return (
            String(hours).padStart(2, "0") +
            ":" +
            String(minutes).padStart(2, "0") +
            ":" +
            String(remainingSeconds).padStart(2, "0")
        );

    }


    /*
    ======================================================
    EVENTO RESULTADO EXIBIDO
    ======================================================
    */

    dispatchResultEvent(result) {

        const event =
            new CustomEvent(
                "exam:resultDisplayed",
                {
                    detail: {
                        result
                    }
                }
            );


        document.dispatchEvent(
            event
        );

    }


    /*
    ======================================================
    OCULTAR RESULTADO
    ======================================================
    */

    hide() {

        this.container.classList.add(
            "hidden"
        );

    }


    /*
    ======================================================
    LIMPAR
    ======================================================
    */

    clear() {

        this.container.innerHTML = "";

    }

}


/*
==========================================================
Disponibilizar globalmente
==========================================================
*/

window.ExamResult =
    ExamResult;

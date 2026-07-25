/*
==========================================================
CCNA Exam Simulator
Review Renderer

Arquivo: js/ui/ReviewRenderer.js
==========================================================
*/

class ReviewRenderer {

    constructor(container = null) {

        this.container = container;

        this.questions = [];

        this.currentIndex = 0;

        this.onClose = null;

    }


    /*
    ======================================================
    DEFINIR CONTAINER
    ======================================================
    */

    setContainer(container) {

        this.container = container;

    }


    /*
    ======================================================
    ABRIR REVISÃO
    ======================================================
    */

    open(
        questions = [],
        startIndex = 0,
        onClose = null
    ) {

        if (!this.container) {

            console.error(
                "[ReviewRenderer] Container não definido."
            );

            return;

        }


        this.questions =
            Array.isArray(questions)
                ? questions
                : [];


        if (this.questions.length === 0) {

            this.renderEmpty();

            return;

        }


        this.currentIndex =
            Math.max(
                0,
                Math.min(
                    Number(startIndex) || 0,
                    this.questions.length - 1
                )
            );


        this.onClose =
            typeof onClose === "function"
                ? onClose
                : null;


        this.render();

    }


    /*
    ======================================================
    RENDER PRINCIPAL
    ======================================================
    */

    render() {

        if (!this.container) {
            return;
        }


        const question =
            this.questions[
                this.currentIndex
            ];


        if (!question) {

            this.renderEmpty();

            return;

        }


        this.container.innerHTML = "";


        const wrapper =
            document.createElement("div");

        wrapper.className =
            "review-container";


        /*
        ==================================================
        CABEÇALHO
        ==================================================
        */

        const header =
            this.createHeader(
                question
            );


        /*
        ==================================================
        CONTEÚDO
        ==================================================
        */

        const content =
            document.createElement("div");

        content.className =
            "review-content";


        /*
        Enunciado
        */

        const questionText =
            document.createElement("h2");

        questionText.className =
            "review-question-text";

        questionText.textContent =
            this.getQuestionText(
                question
            );


        content.appendChild(
            questionText
        );


        /*
        Imagem
        */

        const image =
            this.getQuestionImage(
                question
            );


        if (image) {

            const imageWrapper =
                document.createElement(
                    "div"
                );

            imageWrapper.className =
                "question-image-container";


            const img =
                document.createElement(
                    "img"
                );

            img.className =
                "question-image";

            img.src =
                image;

            img.alt =
                "Imagem relacionada à questão";

            img.loading =
                "lazy";


            imageWrapper.appendChild(
                img
            );


            content.appendChild(
                imageWrapper
            );

        }


        /*
        Resultado da questão
        */

        content.appendChild(
            this.createQuestionStatus(
                question
            )
        );


        /*
        Respostas
        */

        content.appendChild(
            this.createAnswers(
                question
            )
        );


        /*
        Explicação
        */

        const explanation =
            this.getExplanation(
                question
            );


        if (explanation) {

            content.appendChild(
                this.createExplanation(
                    explanation
                )
            );

        }


        /*
        ==================================================
        NAVEGAÇÃO
        ==================================================
        */

        const footer =
            this.createNavigation();


        wrapper.appendChild(
            header
        );

        wrapper.appendChild(
            content
        );

        wrapper.appendChild(
            footer
        );


        this.container.appendChild(
            wrapper
        );

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
            "review-header";


        const left =
            document.createElement("div");

        left.className =
            "review-header-info";


        const title =
            document.createElement("h1");

        title.className =
            "review-title";

        title.textContent =
            "Revisão da Prova";


        const counter =
            document.createElement("span");

        counter.className =
            "review-counter";

        counter.textContent =
            `Questão ${this.currentIndex + 1} de ${this.questions.length}`;


        left.appendChild(
            title
        );

        left.appendChild(
            counter
        );


        const closeButton =
            document.createElement(
                "button"
            );

        closeButton.type =
            "button";

        closeButton.className =
            "btn review-close-button";

        closeButton.textContent =
            "Fechar revisão";


        closeButton.addEventListener(
            "click",
            () => {

                this.close();

            }
        );


        header.appendChild(
            left
        );

        header.appendChild(
            closeButton
        );


        return header;

    }


    /*
    ======================================================
    STATUS DA QUESTÃO
    ======================================================
    */

    createQuestionStatus(question) {

        const status =
            document.createElement("div");


        const answered =
            this.isAnswered(
                question
            );


        const correct =
            this.isCorrect(
                question
            );


        if (!answered) {

            status.className =
                "review-status unanswered";

            status.textContent =
                "Não respondida";


        } else if (correct) {

            status.className =
                "review-status correct";

            status.textContent =
                "Resposta correta";


        } else {

            status.className =
                "review-status incorrect";

            status.textContent =
                "Resposta incorreta";

        }


        return status;

    }


    /*
    ======================================================
    RESPOSTAS
    ======================================================
    */

    createAnswers(question) {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "review-answers";


        const answers =
            this.getAnswers(
                question
            );


        const userAnswers =
            this.getUserAnswers(
                question
            );


        const correctAnswers =
            this.getCorrectAnswers(
                question
            );


        answers.forEach(
            (answer, index) => {

                const answerId =
                    this.getAnswerId(
                        answer,
                        index
                    );


                const selected =
                    userAnswers.includes(
                        String(answerId)
                    );


                const correct =
                    correctAnswers.includes(
                        String(answerId)
                    );


                const row =
                    document.createElement(
                        "div"
                    );

                row.className =
                    "review-answer";


                /*
                ------------------------------------------------
                CLASSIFICAÇÃO VISUAL
                ------------------------------------------------
                */

                if (correct) {

                    row.classList.add(
                        "correct"
                    );

                }


                if (
                    selected &&
                    !correct
                ) {

                    row.classList.add(
                        "incorrect"
                    );

                }


                if (selected) {

                    row.classList.add(
                        "selected"
                    );

                }


                /*
                Marcador
                */

                const marker =
                    document.createElement(
                        "span"
                    );

                marker.className =
                    "review-answer-marker";


                if (
                    correct &&
                    selected
                ) {

                    marker.textContent =
                        "✓";

                    marker.title =
                        "Resposta correta selecionada";


                } else if (
                    correct
                ) {

                    marker.textContent =
                        "✓";

                    marker.title =
                        "Resposta correta";


                } else if (
                    selected
                ) {

                    marker.textContent =
                        "✕";

                    marker.title =
                        "Resposta selecionada incorretamente";


                } else {

                    marker.textContent =
                        "";

                }


                /*
                Texto
                */

                const text =
                    document.createElement(
                        "span"
                    );

                text.className =
                    "review-answer-text";

                text.textContent =
                    this.getAnswerText(
                        answer
                    );


                /*
                Identificação
                */

                const badge =
                    document.createElement(
                        "span"
                    );

                badge.className =
                    "review-answer-badge";


                if (
                    correct &&
                    selected
                ) {

                    badge.textContent =
                        "Sua resposta • Correta";


                } else if (
                    correct
                ) {

                    badge.textContent =
                        "Resposta correta";


                } else if (
                    selected
                ) {

                    badge.textContent =
                        "Sua resposta";

                }


                row.appendChild(
                    marker
                );

                row.appendChild(
                    text
                );


                if (
                    badge.textContent
                ) {

                    row.appendChild(
                        badge
                    );

                }


                wrapper.appendChild(
                    row
                );

            }
        );


        /*
        Questões especiais podem não possuir
        answers[] tradicional.
        */

        if (
            answers.length === 0
        ) {

            wrapper.appendChild(
                this.createSpecialAnswerSummary(
                    question
                )
            );

        }


        return wrapper;

    }


    /*
    ======================================================
    QUESTÕES ESPECIAIS
    ======================================================
    */

    createSpecialAnswerSummary(
        question
    ) {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "review-special-answer";


        const user =
            this.getUserAnswers(
                question
            );


        const correct =
            this.getCorrectAnswers(
                question
            );


        const userTitle =
            document.createElement("strong");

        userTitle.textContent =
            "Sua resposta:";


        const userText =
            document.createElement("div");

        userText.className =
            "review-special-value";

        userText.textContent =
            user.length > 0
                ? user.join(" → ")
                : "Não respondida";


        const correctTitle =
            document.createElement("strong");

        correctTitle.textContent =
            "Resposta correta:";


        const correctText =
            document.createElement("div");

        correctText.className =
            "review-special-value";

        correctText.textContent =
            correct.length > 0
                ? correct.join(" → ")
                : "Não disponível";


        wrapper.appendChild(
            userTitle
        );

        wrapper.appendChild(
            userText
        );

        wrapper.appendChild(
            correctTitle
        );

        wrapper.appendChild(
            correctText
        );


        return wrapper;

    }


    /*
    ======================================================
    EXPLICAÇÃO
    ======================================================
    */

    createExplanation(
        explanation
    ) {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "review-explanation";


        const title =
            document.createElement("h3");

        title.textContent =
            "Explicação";


        const text =
            document.createElement("p");

        text.textContent =
            explanation;


        wrapper.appendChild(
            title
        );

        wrapper.appendChild(
            text
        );


        return wrapper;

    }


    /*
    ======================================================
    NAVEGAÇÃO
    ======================================================
    */

    createNavigation() {

        const footer =
            document.createElement("div");

        footer.className =
            "review-navigation";


        /*
        ANTERIOR
        */

        const previous =
            document.createElement("button");

        previous.type =
            "button";

        previous.className =
            "btn review-previous";

        previous.textContent =
            "Anterior";


        previous.disabled =
            this.currentIndex === 0;


        previous.addEventListener(
            "click",
            () => {

                this.previous();

            }
        );


        /*
        NAVEGADOR NUMÉRICO
        */

        const numbers =
            document.createElement("div");

        numbers.className =
            "review-question-navigation";


        this.questions.forEach(
            (question, index) => {

                const button =
                    document.createElement(
                        "button"
                    );

                button.type =
                    "button";

                button.className =
                    "review-question-number";

                button.textContent =
                    index + 1;


                if (
                    index ===
                    this.currentIndex
                ) {

                    button.classList.add(
                        "active"
                    );

                }


                if (
                    !this.isAnswered(
                        question
                    )
                ) {

                    button.classList.add(
                        "unanswered"
                    );


                } else if (
                    this.isCorrect(
                        question
                    )
                ) {

                    button.classList.add(
                        "correct"
                    );


                } else {

                    button.classList.add(
                        "incorrect"
                    );

                }


                button.addEventListener(
                    "click",
                    () => {

                        this.goTo(
                            index
                        );

                    }
                );


                numbers.appendChild(
                    button
                );

            }
        );


        /*
        PRÓXIMA
        */

        const next =
            document.createElement("button");

        next.type =
            "button";

        next.className =
            "btn review-next";

        next.textContent =
            "Próxima";


        next.disabled =
            this.currentIndex ===
            this.questions.length - 1;


        next.addEventListener(
            "click",
            () => {

                this.next();

            }
        );


        footer.appendChild(
            previous
        );

        footer.appendChild(
            numbers
        );

        footer.appendChild(
            next
        );


        return footer;

    }


    /*
    ======================================================
    NAVEGAÇÃO
    ======================================================
    */

    previous() {

        if (
            this.currentIndex <= 0
        ) {

            return;

        }


        this.currentIndex--;

        this.render();

        this.scrollTop();

    }


    next() {

        if (
            this.currentIndex >=
            this.questions.length - 1
        ) {

            return;

        }


        this.currentIndex++;

        this.render();

        this.scrollTop();

    }


    goTo(index) {

        index =
            Number(index);


        if (
            !Number.isInteger(index) ||
            index < 0 ||
            index >= this.questions.length
        ) {

            return;

        }


        this.currentIndex =
            index;


        this.render();

        this.scrollTop();

    }


    /*
    ======================================================
    FECHAR
    ======================================================
    */

    close() {

        if (this.onClose) {

            this.onClose();

        }


        document.dispatchEvent(
            new CustomEvent(
                "exam:reviewClosed"
            )
        );

    }


    /*
    ======================================================
    VAZIO
    ======================================================
    */

    renderEmpty() {

        if (!this.container) {
            return;
        }


        this.container.innerHTML =
            '<div class="review-empty">Nenhuma questão disponível para revisão.</div>';

    }


    /*
    ======================================================
    HELPERS - QUESTION
    ======================================================
    */

    getQuestionText(question) {

        if (
            typeof question.getQuestion ===
            "function"
        ) {

            return question.getQuestion();

        }


        return (
            question.question ||
            question.text ||
            ""
        );

    }


    getQuestionImage(question) {

        if (
            typeof question.getImage ===
            "function"
        ) {

            return question.getImage();

        }


        return question.image || null;

    }


    getExplanation(question) {

        if (
            typeof question.getExplanation ===
            "function"
        ) {

            return question.getExplanation();

        }


        return question.explanation || "";

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

            return question.getAnswers();

        }


        return Array.isArray(
            question.answers
        )
            ? question.answers
            : [];

    }


    getAnswerId(
        answer,
        fallback
    ) {

        if (
            typeof answer.getId ===
            "function"
        ) {

            return String(
                answer.getId()
            );

        }


        return String(
            answer.id ??
            fallback
        );

    }


    getAnswerText(answer) {

        if (
            typeof answer.getText ===
            "function"
        ) {

            return answer.getText();

        }


        return (
            answer.text ??
            answer.answer ??
            answer.label ??
            ""
        );

    }


    getUserAnswers(question) {

        if (
            typeof question.getUserAnswers ===
            "function"
        ) {

            return question
                .getUserAnswers()
                .map(String);

        }


        return Array.isArray(
            question.userAnswers
        )
            ? question.userAnswers.map(String)
            : [];

    }


    getCorrectAnswers(question) {

        if (
            typeof question.getCorrectAnswers ===
            "function"
        ) {

            return question
                .getCorrectAnswers()
                .map(String);

        }


        if (
            Array.isArray(
                question.correctAnswers
            )
        ) {

            return question.correctAnswers
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
            .map(
                (answer, index) =>
                    this.getAnswerId(
                        answer,
                        index
                    )
            );

    }


    /*
    ======================================================
    ESTADO
    ======================================================
    */

    isAnswered(question) {

        if (
            typeof question.isAnswered ===
            "function"
        ) {

            return question.isAnswered();

        }


        return (
            this.getUserAnswers(
                question
            ).length > 0
        );

    }


    isCorrect(question) {

        if (
            typeof question.isCorrect ===
            "function"
        ) {

            return question.isCorrect();

        }


        const user =
            this.getUserAnswers(
                question
            );


        const correct =
            this.getCorrectAnswers(
                question
            );


        if (
            user.length !==
            correct.length
        ) {

            return false;

        }


        return correct.every(
            id =>
                user.includes(
                    String(id)
                )
        );

    }


    /*
    ======================================================
    SCROLL
    ======================================================
    */

    scrollTop() {

        if (!this.container) {
            return;
        }


        this.container.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }

}


/*
==========================================================
Disponibilizar globalmente
==========================================================
*/

window.ReviewRenderer =
    ReviewRenderer;

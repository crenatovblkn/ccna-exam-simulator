/*
==========================================================
CCNA Exam Simulator
Question Model
==========================================================
*/

class Question {

    constructor(data = {}) {

        this.id = data.id || "";
        this.domain = data.domain || "";
        this.type = data.type || "single";
        this.difficulty = data.difficulty || "easy";

        this.question = data.question || "";
        this.explanation = data.explanation || "";
        this.image = data.image || null;

        this.answers = Array.isArray(data.answers)
            ? data.answers.map(answer =>
                answer instanceof Answer
                    ? answer
                    : new Answer(answer)
              )
            : [];

        /*
        Compatível com os dois formatos:

        Antigo:
        correctAnswers: ["1"]

        Novo:
        answers[].correct = true
        */

        if (
            Array.isArray(data.correctAnswers) &&
            data.correctAnswers.length > 0
        ) {

            this.correctAnswers =
                data.correctAnswers.map(String);

        } else {

            this.correctAnswers = this.answers
                .filter(answer => answer.isCorrect())
                .map(answer => String(answer.getId()));

        }

        this.lab = data.lab || null;
        this.cli = data.cli || null;
        this.dragdrop = data.dragdrop || null;

        this.userAnswers = Array.isArray(data.userAnswers)
            ? data.userAnswers.map(String)
            : [];

        this.review = Boolean(data.review);
        this.answered = Boolean(data.answered);
        this.visited = Boolean(data.visited);

    }

    /*
    ======================================================
    Getters
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

    getQuestion() {
        return this.question;
    }

    getExplanation() {
        return this.explanation;
    }

    getImage() {
        return this.image;
    }

    getAnswers() {
        return this.answers;
    }

    getCorrectAnswers() {
        return this.correctAnswers;
    }

    getScenario() {

        if (this.cli) {

            return {
                type: "cli",
                content: this.cli
            };

        }

        if (this.lab) {

            return {
                type: "lab",
                content: this.lab
            };

        }

        if (this.dragdrop) {

            return {
                type: "dragdrop",
                content: this.dragdrop
            };

        }

        return null;

    }

    /*
    ======================================================
    Usuário
    ======================================================
    */

    answer(answerId) {

    answerId = String(answerId);

    /*
    ======================================================
    QUESTÃO DE RESPOSTA ÚNICA
    ======================================================
    */

    if (this.type === "single") {

        // Remove qualquer resposta anterior
        this.userAnswers = [];

        this.answers.forEach(answer => {

            answer.reset();

        });

        // Registra somente a nova resposta
        this.userAnswers.push(answerId);

        this.answers.forEach(answer => {

            if (String(answer.getId()) === answerId) {

                answer.select();

            }

        });

    }

    /*
    ======================================================
    QUESTÃO DE MÚLTIPLAS RESPOSTAS
    ======================================================
    */

    else {

        const alreadySelected =
            this.userAnswers.includes(answerId);

        if (alreadySelected) {

            // Desmarca
            this.userAnswers =
                this.userAnswers.filter(
                    id => id !== answerId
                );

            this.answers.forEach(answer => {

                if (String(answer.getId()) === answerId) {

                    answer.reset();

                }

            });

        } else {

            // Marca
            this.userAnswers.push(answerId);

            this.answers.forEach(answer => {

                if (String(answer.getId()) === answerId) {

                    answer.select();

                }

            });

        }

    }

    this.answered =
        this.userAnswers.length > 0;

}
    setAnswers(answerIds = []) {

        this.clearAnswers();

        answerIds.forEach(id => this.answer(id));

    }

    clearAnswers() {

        this.userAnswers = [];

        this.answers.forEach(answer => answer.reset());

        this.answered = false;

    }

    getUserAnswers() {

        return this.userAnswers;

    }

    /*
    ======================================================
    Revisão
    ======================================================
    */

    setReview(value = true) {

        this.review = Boolean(value);

    }

    toggleReview() {

        this.review = !this.review;

        return this.review;

    }

    isMarkedForReview() {

        return this.review;

    }

    /*
    ======================================================
    Visita
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
    Estado
    ======================================================
    */

    isAnswered() {

        return this.answered;

    }

    reset() {

        this.clearAnswers();

        this.review = false;
        this.visited = false;

    }

    /*
    ======================================================
    Correção
    ======================================================
    */

    isCorrect() {

        if (
            this.userAnswers.length !==
            this.correctAnswers.length
        ) {

            return false;

        }

        return this.correctAnswers.every(id =>
            this.userAnswers.includes(String(id))
        );

    }

    /*
    ======================================================
    Clone
    ======================================================
    */

    clone() {

        return new Question(this.toJSON());

    }

    /*
    ======================================================
    Serialização
    ======================================================
    */

    toJSON() {

        return {

            id: this.id,
            domain: this.domain,
            type: this.type,
            difficulty: this.difficulty,

            question: this.question,
            explanation: this.explanation,
            image: this.image,

            answers: this.answers.map(
                answer => answer.toJSON()
            ),

            correctAnswers: [...this.correctAnswers],

            lab: this.lab,
            cli: this.cli,
            dragdrop: this.dragdrop,

            userAnswers: [...this.userAnswers],

            review: this.review,
            answered: this.answered,
            visited: this.visited

        };

    }

    static fromJSON(data) {

        return new Question(data);

    }

}

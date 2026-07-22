/*
==========================================================
CCNA Exam Simulator
Question Model
==========================================================

Representa uma questão individual durante a execução
do exame.

==========================================================
*/

class Question {

    constructor(data = {}) {

        /*
        ==================================================
        Dados da Questão
        ==================================================
        */

        this.id = data.id || "";

        this.domain = data.domain || "";

        this.type = data.type || "single";

        this.difficulty = data.difficulty || "easy";

        this.question = data.question || "";

        this.explanation = data.explanation || "";

        this.image = data.image || null;

        /*
        ==================================================
        Alternativas
        ==================================================
        */

        this.answers = data.answers || [];

        this.correctAnswers = data.correctAnswers || [];

        /*
        ==================================================
        Laboratórios
        ==================================================
        */

        this.lab = data.lab || null;

        this.cli = data.cli || null;

        this.dragdrop = data.dragdrop || null;

        /*
        ==================================================
        Estado da Questão
        ==================================================
        */

        this.userAnswers = [];

        this.review = false;

        this.answered = false;

        this.visited = false;

    }

    /*
    ======================================================
    Getters
    ======================================================
    */

    getId() {

        return this.id;

    }

    getType() {

        return this.type;

    }

    getQuestion() {

        return this.question;

    }

    getAnswers() {

        return this.answers;

    }

    getCorrectAnswers() {

        return this.correctAnswers;

    }

    getImage() {

        return this.image;

    }

    /*
    ======================================================
    Usuário
    ======================================================
    */

    answer(answer) {

        if (!this.userAnswers.includes(answer)) {

            this.userAnswers.push(answer);

        }

        this.answered = true;

    }

    setAnswers(answers) {

        this.userAnswers = [...answers];

        this.answered = answers.length > 0;

    }

    clearAnswers() {

        this.userAnswers = [];

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

        this.review = value;

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

        return this.correctAnswers.every(answer =>

            this.userAnswers.includes(answer)

        );

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

            answers: this.answers,

            correctAnswers: this.correctAnswers,

            lab: this.lab,

            cli: this.cli,

            dragdrop: this.dragdrop,

            userAnswers: this.userAnswers,

            review: this.review,

            answered: this.answered,

            visited: this.visited

        };

    }

}
/*
==========================================================
CCNA Exam Simulator
Exam Engine
==========================================================

Responsabilidades

• Controlar o estado da prova
• Coordenar a navegação
• Gerenciar respostas
• Calcular resultados

O ExamEngine NÃO conhece:

• HTML
• CSS
• Renderer
• UI
• Timer

Toda comunicação ocorre através do App.

==========================================================
*/

class ExamEngine {

    constructor(app) {

        if (!app) {
            throw new Error("App instance is required.");
        }

        this.app = app;

        this._exam = null;

        this._currentIndex = 0;

        this._finished = false;

        this._initialized = false;

    }

    /*
    ======================================================
    Inicialização
    ======================================================
    */

    initialize(exam) {

        if (this._initialized) {
            return;
        }

        if (!exam) {
            throw new Error("Exam instance is required.");
        }

        this._exam = exam;

        this._currentIndex = 0;

        this._finished = false;

        this._initialized = true;

    }

    /*
    ======================================================
    Encerramento
    ======================================================
    */

    destroy() {

        this._exam = null;

        this._currentIndex = 0;

        this._finished = false;

        this._initialized = false;

    }

    /*
    ======================================================
    Estado
    ======================================================
    */

    isInitialized() {

        return this._initialized;

    }

    isFinished() {

        return this._finished;

    }

    getExam() {

        return this._exam;

    }

    getCurrentIndex() {

        return this._currentIndex;

    }

    getTotalQuestions() {

        if (!this._exam) {
            return 0;
        }

        return this._exam.getTotalQuestions();

    }

    getCurrentQuestionNumber() {

        return this._currentIndex + 1;

    }

    /*
    ======================================================
    Validações
    ======================================================
    */

    ensureInitialized() {

        if (!this._initialized) {

            throw new Error(
                "ExamEngine has not been initialized."
            );

        }

    }


/*
======================================================
Questão Atual
======================================================
*/

getCurrentQuestion() {

    this.ensureInitialized();

    return this._exam.getQuestion(this._currentIndex);

}

/*
======================================================
Navegação
======================================================
*/

goTo(index) {

    this.ensureInitialized();

    if (!Number.isInteger(index)) {
        return false;
    }

    if (index < 0 || index >= this.getTotalQuestions()) {
        return false;
    }

    this._currentIndex = index;

    const question = this.getCurrentQuestion();

    if (question && typeof question.visit === "function") {
        question.visit();
    }

    return true;

}

next() {

    if (!this.hasNext()) {
        return false;
    }

    return this.goTo(this._currentIndex + 1);

}

previous() {

    if (!this.hasPrevious()) {
        return false;
    }

    return this.goTo(this._currentIndex - 1);

}

/*
======================================================
Estado da Navegação
======================================================
*/

hasNext() {

    this.ensureInitialized();

    return this._currentIndex < this.getTotalQuestions() - 1;

}

hasPrevious() {

    this.ensureInitialized();

    return this._currentIndex > 0;

}

isFirstQuestion() {

    this.ensureInitialized();

    return this._currentIndex === 0;

}

isLastQuestion() {

    this.ensureInitialized();

    return this._currentIndex === this.getTotalQuestions() - 1;

}

/*
======================================================
Respostas
======================================================
*/

answer(answerId) {

    this.ensureInitialized();

    const question = this.getCurrentQuestion();

    if (!question) {
        return false;
    }

    question.answer(answerId);

    return true;

}

clearAnswer() {

    this.ensureInitialized();

    const question = this.getCurrentQuestion();

    if (!question) {
        return false;
    }

    question.clearAnswers();

    return true;

}

/*
======================================================
Revisão
======================================================
*/

toggleReview() {

    this.ensureInitialized();

    const question = this.getCurrentQuestion();

    if (!question) {
        return false;
    }

    if (typeof question.toggleReview === "function") {

        return question.toggleReview();

    }

    // Compatibilidade temporária

    question.review = !question.review;

    return question.review;

}

/*
======================================================
Estado da Questão Atual
======================================================
*/

hasAnsweredCurrentQuestion() {

    this.ensureInitialized();

    const question = this.getCurrentQuestion();

    return question
        ? question.isAnswered()
        : false;

}

isCurrentQuestionMarkedForReview() {

    this.ensureInitialized();

    const question = this.getCurrentQuestion();

    if (!question) {
        return false;
    }

    if (typeof question.isMarkedForReview === "function") {
        return question.isMarkedForReview();
    }

    // Compatibilidade temporária

    return question.review === true;

}

/*
======================================================
Coleções de Questões
======================================================
*/

getQuestions(predicate = null) {

    this.ensureInitialized();

    const questions = this._exam.getQuestions();

    if (typeof predicate !== "function") {
        return questions;
    }

    return questions.filter(predicate);

}

getQuestion(index) {

    this.ensureInitialized();

    return this._exam.getQuestion(index);

}

/*
======================================================
Consultas
======================================================
*/

getAnsweredQuestions() {

    return this.getQuestions(

        question => question.isAnswered()

    );

}

getUnansweredQuestions() {

    return this.getQuestions(

        question => !question.isAnswered()

    );

}

getReviewQuestions() {

    return this.getQuestions(

        question => {

            if (typeof question.isMarkedForReview === "function") {
                return question.isMarkedForReview();
            }

            return question.review === true;

        }

    );

}

getVisitedQuestions() {

    return this.getQuestions(

        question => question.wasVisited()

    );

}

getCorrectQuestions() {

    return this.getQuestions(

        question => question.isCorrect()

    );

}

getIncorrectQuestions() {

    return this.getQuestions(

        question =>

            question.isAnswered() &&

            !question.isCorrect()

    );

}

/*
======================================================
Contadores
======================================================
*/

getAnsweredCount() {

    return this.getAnsweredQuestions().length;

}

getRemainingCount() {

    return this.getTotalQuestions()

        - this.getAnsweredCount();

}

getReviewCount() {

    return this.getReviewQuestions().length;

}

getVisitedCount() {

    return this.getVisitedQuestions().length;

}

/*
======================================================
Progresso
======================================================
*/

getProgress() {

    const total = this.getTotalQuestions();

    const current = this.getCurrentQuestionNumber();

    const answered = this.getAnsweredCount();

    const remaining = total - answered;

    return {

        current,

        total,

        answered,

        remaining,

        percent: total === 0
            ? 0
            : Math.round((current / total) * 100)

    };

}

/*
======================================================
Score
======================================================
*/

calculateScore() {

    this.ensureInitialized();

    const total = this.getTotalQuestions();

    const correct = this.getCorrectQuestions().length;

    const incorrect = total - correct;

    const percentage =

        total === 0

            ? 0

            : Math.round((correct / total) * 100);

    const passingScore =

        this._exam.getPassingScore();

    return {

        total,

        correct,

        incorrect,

        percentage,

        passingScore,

        approved: percentage >= passingScore

    };

}

/*
======================================================
Resumo do Exame
======================================================
*/

getResults() {

    this.ensureInitialized();

    return {

        finished: this._finished,

        progress: this.getProgress(),

        score: this.calculateScore(),

        answered: this.getAnsweredCount(),

        unanswered: this.getRemainingCount(),

        review: this.getReviewCount(),

        visited: this.getVisitedCount()

    };

}

/*
======================================================
Finalização
======================================================
*/

finish() {

    this.ensureInitialized();

    if (this._finished) {
        return false;
    }

    this._finished = true;

    return true;

}

/*
======================================================
Reiniciar Exame
======================================================
*/

reset() {

    this.ensureInitialized();

    this._currentIndex = 0;

    this._finished = false;

    this.getQuestions().forEach(question => {

        if (typeof question.reset === "function") {

            question.reset();

        } else {

            // Compatibilidade temporária

            if (typeof question.clearAnswers === "function") {
                question.clearAnswers();
            }

            question.review = false;
            question.visited = false;

        }

    });

    // Marca a primeira questão como visitada

    this.goTo(0);

}

/*
======================================================
Estado Geral
======================================================
*/

getState() {

    this.ensureInitialized();

    return {

        initialized: this._initialized,

        finished: this._finished,

        currentIndex: this._currentIndex,

        totalQuestions: this.getTotalQuestions(),

        progress: this.getProgress(),

        score: this.calculateScore()

    };
}
}
/*
==========================================================
CCNA Exam Simulator
Exam Model
==========================================================

Representa uma prova pronta para execução.

O QuestionManager cria este objeto.

O ExamEngine apenas o utiliza.

==========================================================
*/

class Exam {

    constructor(config, questions) {

        this.config = config || {};

        this.questions = questions || [];

    }

    /*
    ======================================================
    Configurações
    ======================================================
    */

    getConfig() {

        return this.config;

    }

    getTitle() {

        return this.config.title;

    }

    getVersion() {

        return this.config.version;

    }

    getDuration() {

        return this.config.duration;

    }

    getPassingScore() {

        return this.config.passingScore;

    }

    /*
    ======================================================
    Questões
    ======================================================
    */

    getQuestions() {

        return this.questions;

    }

    getQuestion(index) {

        return this.questions[index];

    }

    getTotalQuestions() {

        return this.questions.length;

    }

    /*
    ======================================================
    Estatísticas
    ======================================================
    */

    isEmpty() {

        return this.questions.length === 0;

    }

    hasQuestions() {

        return this.questions.length > 0;

    }

    /*
    ======================================================
    Informações
    ======================================================
    */

    toJSON() {

        return {

            config: this.config,

            questions: this.questions

        };

    }

}
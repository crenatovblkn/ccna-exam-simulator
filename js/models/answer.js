/*
==========================================================
CCNA Exam Simulator
Answer
==========================================================

Responsabilidades

• Representar uma alternativa
• Controlar seu estado de seleção
• Permitir serialização

==========================================================
*/

class Answer {

    constructor(data) {

        this.validate(data);

        this.id = String(data.id);

        this.text = data.text;

        this.correct = data.correct;

        /*
        O banco de questões nunca define
        uma alternativa como selecionada.

        Esse estado pertence ao exame.
        */

        this.selected = false;

    }

    /*
    ======================================================
    Validação
    ======================================================
    */

validate(data) {

    if (!data) {

        throw new Error(
            "Answer: dados obrigatórios."
        );

    }

    if (

        typeof data.id !== "string" &&
        typeof data.id !== "number"

    ) {

        throw new Error(
            "Answer: id inválido."
        );

    }

    if (typeof data.text !== "string") {

        throw new Error(
            "Answer: texto inválido."
        );

    }

    if (typeof data.correct !== "boolean") {

        throw new Error(
            "Answer: 'correct' deve ser boolean."
        );

    }

}

    /*
    ======================================================
    Getters
    ======================================================
    */

    getId() {

        return this.id;

    }

    getText() {

        return this.text;

    }

    isCorrect() {

        return this.correct;

    }

    isSelected() {

        return this.selected;

    }

    /*
    ======================================================
    Seleção
    ======================================================
    */

    select() {

        this.selected = true;

    }

    unselect() {

        this.selected = false;

    }

    /*
    ======================================================
    Estado
    ======================================================
    */

    reset() {

        this.selected = false;

    }

    /*
    ======================================================
    Serialização
    ======================================================
    */

    toJSON() {

        return {

            id: this.id,

            text: this.text,

            correct: this.correct,

            selected: this.selected

        };

    }

    /*
    ======================================================
    Desserialização
    ======================================================
    */

    static fromJSON(data) {

        const answer = new Answer(data);

        answer.selected = Boolean(data.selected);

        return answer;

    }

}


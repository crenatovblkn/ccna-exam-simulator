/*
==========================================================
Cisco CCNA 200-301 Exam Simulator
Answer Model

Responsabilidade:
- Representar uma alternativa de resposta
- Controlar estado de seleção
- Informar se a alternativa é correta
- Serializar/restaurar o estado

Este modelo NÃO manipula DOM.
Este modelo NÃO calcula a pontuação da prova.
==========================================================
*/

class Answer {

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

        this.id = data.id !== undefined &&
                  data.id !== null
            ? String(data.id)
            : "";


        /*
        --------------------------------------------------
        Conteúdo
        --------------------------------------------------
        */

        this.text = data.text || "";

        this.image = data.image || null;

        this.code = data.code || null;


        /*
        --------------------------------------------------
        Correção
        --------------------------------------------------
        */

        this.correct = Boolean(data.correct);


        /*
        --------------------------------------------------
        Estado do usuário
        --------------------------------------------------
        */

        this.selected = Boolean(data.selected);


        /*
        --------------------------------------------------
        Metadados opcionais

        Utilizados por questões mais complexas:
        - drag and drop
        - matching
        - ordering
        - labs
        --------------------------------------------------
        */

        this.value =
            data.value !== undefined
                ? data.value
                : null;

        this.group =
            data.group !== undefined
                ? data.group
                : null;

        this.position =
            Number.isInteger(data.position)
                ? data.position
                : null;

        this.target =
            data.target !== undefined
                ? data.target
                : null;

    }


    /*
    ======================================================
    GETTERS
    ======================================================
    */

    getId() {

        return this.id;

    }


    getText() {

        return this.text;

    }


    getImage() {

        return this.image;

    }


    getCode() {

        return this.code;

    }


    getValue() {

        return this.value;

    }


    getGroup() {

        return this.group;

    }


    getPosition() {

        return this.position;

    }


    getTarget() {

        return this.target;

    }


    /*
    ======================================================
    CORREÇÃO
    ======================================================
    */

    isCorrect() {

        return this.correct;

    }


    /*
    ======================================================
    SELEÇÃO
    ======================================================
    */

    select() {

        this.selected = true;

        return this.selected;

    }


    deselect() {

        this.selected = false;

        return this.selected;

    }


    toggle() {

        this.selected = !this.selected;

        return this.selected;

    }


    isSelected() {

        return this.selected;

    }


    /*
    ======================================================
    RESET
    ======================================================
    */

    reset() {

        this.selected = false;

    }


    /*
    ======================================================
    SETTERS AUXILIARES
    ======================================================
    */

    setValue(value) {

        this.value = value;

    }


    setGroup(group) {

        this.group = group;

    }


    setPosition(position) {

        this.position =
            Number.isInteger(position)
                ? position
                : null;

    }


    setTarget(target) {

        this.target = target;

    }


    /*
    ======================================================
    CLONE
    ======================================================
    */

    clone() {

        return new Answer(
            this.toJSON()
        );

    }


    /*
    ======================================================
    SERIALIZAÇÃO
    ======================================================

    Utilizado pelo StorageManager para salvar
    o andamento do exame.
    ======================================================
    */

    toJSON() {

        return {

            id: this.id,

            text: this.text,

            image: this.image,

            code: this.code,

            correct: this.correct,

            selected: this.selected,

            value: this.value,

            group: this.group,

            position: this.position,

            target: this.target

        };

    }


    /*
    ======================================================
    RESTAURAÇÃO
    ======================================================
    */

    static fromJSON(data = {}) {

        return new Answer(data);

    }

}


/*
==========================================================
Disponibilização global

Como o projeto utiliza scripts tradicionais no index.html,
a classe fica disponível globalmente no navegador.
==========================================================
*/

window.Answer = Answer;

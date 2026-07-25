/*
==========================================================
CCNA Exam Simulator
Score Calculator

Arquivo: js/core/ScoreCalculator.js
==========================================================
*/

class ScoreCalculator {

    /*
    ======================================================
    CALCULAR RESULTADO COMPLETO
    ======================================================
    */

    calculate(questions = []) {

        if (!Array.isArray(questions)) {

            return this.emptyResult();

        }


        const total =
            questions.length;


        let correct = 0;
        let incorrect = 0;
        let unanswered = 0;
        let review = 0;


        const details = [];


        questions.forEach(
            (question, index) => {

                const answered =
                    this.isAnswered(
                        question
                    );


                const markedForReview =
                    this.isMarkedForReview(
                        question
                    );


                let isCorrect = false;


                if (!answered) {

                    unanswered++;

                } else {

                    isCorrect =
                        this.isCorrect(
                            question
                        );


                    if (isCorrect) {

                        correct++;

                    } else {

                        incorrect++;

                    }

                }


                if (markedForReview) {

                    review++;

                }


                details.push({

                    index,

                    number:
                        index + 1,

                    id:
                        this.getQuestionId(
                            question
                        ),

                    domain:
                        this.getDomain(
                            question
                        ),

                    type:
                        this.getType(
                            question
                        ),

                    answered,

                    correct:
                        isCorrect,

                    review:
                        markedForReview

                });

            }
        );


        const answered =
            correct +
            incorrect;


        const percentage =
            total > 0
                ? (
                    correct /
                    total
                ) * 100
                : 0;


        const answeredPercentage =
            total > 0
                ? (
                    answered /
                    total
                ) * 100
                : 0;


        return {

            total,

            answered,

            correct,

            incorrect,

            unanswered,

            review,

            percentage:
                this.round(
                    percentage,
                    2
                ),

            answeredPercentage:
                this.round(
                    answeredPercentage,
                    2
                ),

            details

        };

    }


    /*
    ======================================================
    RESULTADO VAZIO
    ======================================================
    */

    emptyResult() {

        return {

            total: 0,

            answered: 0,

            correct: 0,

            incorrect: 0,

            unanswered: 0,

            review: 0,

            percentage: 0,

            answeredPercentage: 0,

            details: []

        };

    }


    /*
    ======================================================
    QUESTÃO RESPONDIDA
    ======================================================
    */

    isAnswered(question) {

        if (!question) {

            return false;

        }


        if (
            typeof question.isAnswered ===
            "function"
        ) {

            return Boolean(
                question.isAnswered()
            );

        }


        /*
        Compatibilidade com objetos simples.
        */

        if (
            Array.isArray(
                question.userAnswers
            )
        ) {

            return (
                question.userAnswers.length >
                0
            );

        }


        return Boolean(
            question.answered
        );

    }


    /*
    ======================================================
    QUESTÃO CORRETA
    ======================================================
    */

    isCorrect(question) {

        if (!question) {

            return false;

        }


        /*
        Prioridade para o método do
        modelo Question.
        */

        if (
            typeof question.isCorrect ===
            "function"
        ) {

            return Boolean(
                question.isCorrect()
            );

        }


        const userAnswers =
            this.getUserAnswers(
                question
            );


        const correctAnswers =
            this.getCorrectAnswers(
                question
            );


        /*
        Quantidade diferente significa
        resposta incorreta.
        */

        if (
            userAnswers.length !==
            correctAnswers.length
        ) {

            return false;

        }


        /*
        Não respondida nunca é correta.
        */

        if (
            userAnswers.length === 0
        ) {

            return false;

        }


        /*
        A ordem não importa para questões
        single/multiple.

        Para ordering, fazemos comparação
        posicional.
        */

        if (
            this.isOrderingQuestion(
                question
            )
        ) {

            return this.compareOrdered(
                userAnswers,
                correctAnswers
            );

        }


        return this.compareUnordered(
            userAnswers,
            correctAnswers
        );

    }


    /*
    ======================================================
    COMPARAÇÃO SEM ORDEM
    ======================================================
    */

    compareUnordered(
        userAnswers,
        correctAnswers
    ) {

        const user =
            userAnswers
                .map(String)
                .sort();


        const correct =
            correctAnswers
                .map(String)
                .sort();


        if (
            user.length !==
            correct.length
        ) {

            return false;

        }


        return user.every(
            (answer, index) =>
                answer ===
                correct[index]
        );

    }


    /*
    ======================================================
    COMPARAÇÃO COM ORDEM
    ======================================================
    */

    compareOrdered(
        userAnswers,
        correctAnswers
    ) {

        if (
            userAnswers.length !==
            correctAnswers.length
        ) {

            return false;

        }


        return userAnswers.every(
            (answer, index) => {

                return (
                    String(answer) ===
                    String(
                        correctAnswers[index]
                    )
                );

            }
        );

    }


    /*
    ======================================================
    IDENTIFICAR ORDERING
    ======================================================
    */

    isOrderingQuestion(question) {

        const type =
            this.getType(
                question
            );


        return (
            type === "ordering" ||
            type === "order"
        );

    }


    /*
    ======================================================
    RESPOSTAS DO USUÁRIO
    ======================================================
    */

    getUserAnswers(question) {

        if (
            typeof question.getUserAnswers ===
            "function"
        ) {

            const answers =
                question.getUserAnswers();


            return Array.isArray(answers)
                ? answers.map(String)
                : [];

        }


        return Array.isArray(
            question.userAnswers
        )
            ? question.userAnswers.map(String)
            : [];

    }


    /*
    ======================================================
    RESPOSTAS CORRETAS
    ======================================================
    */

    getCorrectAnswers(question) {

        if (
            typeof question.getCorrectAnswers ===
            "function"
        ) {

            const answers =
                question.getCorrectAnswers();


            return Array.isArray(answers)
                ? answers.map(String)
                : [];

        }


        /*
        Formato:
        correctAnswers: ["1", "3"]
        */

        if (
            Array.isArray(
                question.correctAnswers
            )
        ) {

            return question
                .correctAnswers
                .map(String);

        }


        /*
        Formato:
        answers[].correct = true
        */

        const answers =
            Array.isArray(
                question.answers
            )
                ? question.answers
                : [];


        return answers
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
                (answer, index) => {

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
                        index
                    );

                }
            );

    }


    /*
    ======================================================
    MARCADA PARA REVISÃO
    ======================================================
    */

    isMarkedForReview(question) {

        if (!question) {

            return false;

        }


        if (
            typeof question.isMarkedForReview ===
            "function"
        ) {

            return Boolean(
                question.isMarkedForReview()
            );

        }


        return Boolean(
            question.review
        );

    }


    /*
    ======================================================
    ID
    ======================================================
    */

    getQuestionId(question) {

        if (!question) {

            return "";

        }


        if (
            typeof question.getId ===
            "function"
        ) {

            return String(
                question.getId() ||
                ""
            );

        }


        return String(
            question.id ||
            ""
        );

    }


    /*
    ======================================================
    DOMÍNIO
    ======================================================
    */

    getDomain(question) {

        if (!question) {

            return "";

        }


        if (
            typeof question.getDomain ===
            "function"
        ) {

            return String(
                question.getDomain() ||
                ""
            );

        }


        return String(
            question.domain ||
            ""
        );

    }


    /*
    ======================================================
    TIPO
    ======================================================
    */

    getType(question) {

        if (!question) {

            return "single";

        }


        let type;


        if (
            typeof question.getType ===
            "function"
        ) {

            type =
                question.getType();

        } else {

            type =
                question.type;

        }


        return String(
            type ||
            "single"
        )
            .trim()
            .toLowerCase();

    }


    /*
    ======================================================
    ARREDONDAMENTO
    ======================================================
    */

    round(
        value,
        decimals = 2
    ) {

        const factor =
            Math.pow(
                10,
                decimals
            );


        return (
            Math.round(
                (
                    Number(value) +
                    Number.EPSILON
                ) *
                factor
            ) /
            factor
        );

    }


    /*
    ======================================================
    ESTATÍSTICAS POR DOMÍNIO
    ======================================================
    */

    calculateByDomain(
        questions = []
    ) {

        const domains = {};


        if (
            !Array.isArray(
                questions
            )
        ) {

            return domains;

        }


        questions.forEach(
            question => {

                const domain =
                    this.getDomain(
                        question
                    ) ||
                    "Sem domínio";


                if (!domains[domain]) {

                    domains[domain] = {

                        total: 0,
                        answered: 0,
                        correct: 0,
                        incorrect: 0,
                        unanswered: 0

                    };

                }


                const data =
                    domains[domain];


                data.total++;


                if (
                    !this.isAnswered(
                        question
                    )
                ) {

                    data.unanswered++;

                    return;

                }


                data.answered++;


                if (
                    this.isCorrect(
                        question
                    )
                ) {

                    data.correct++;

                } else {

                    data.incorrect++;

                }

            }
        );


        /*
        Percentual de cada domínio.
        */

        Object.keys(domains)
            .forEach(domain => {

                const data =
                    domains[domain];


                data.percentage =
                    data.total > 0
                        ? this.round(
                            (
                                data.correct /
                                data.total
                            ) * 100,
                            2
                        )
                        : 0;

            });


        return domains;

    }

}


/*
==========================================================
Disponibilizar globalmente
==========================================================
*/

window.ScoreCalculator =
    ScoreCalculator;

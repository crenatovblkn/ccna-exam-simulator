/*
==========================================================
CCNA Exam Simulator
Question Bank Manager

Arquivo: js/QuestionBank.js
==========================================================
*/

class QuestionBank {

    constructor() {

        this.questions = [];
        this.metadata = {};

        this.loaded = false;

    }


    /*
    ======================================================
    CARREGAR BANCO
    ======================================================
    */

    async load(filePath) {

        try {

            const response = await fetch(filePath);

            if (!response.ok) {

                throw new Error(
                    `Não foi possível carregar o banco: ${response.status}`
                );

            }

            const data = await response.json();

            this.validateBank(data);

            this.metadata = data.metadata || {};

            this.questions = data.questions.map(question => {

                return this.normalizeQuestion(question);

            });

            this.loaded = true;

            console.log(
                `[QuestionBank] ${this.questions.length} questões carregadas.`
            );

            return true;

        } catch (error) {

            console.error(
                "[QuestionBank] Erro ao carregar banco:",
                error
            );

            this.questions = [];
            this.loaded = false;

            throw error;

        }

    }


    /*
    ======================================================
    VALIDAR ESTRUTURA DO BANCO
    ======================================================
    */

    validateBank(data) {

        if (!data) {

            throw new Error(
                "O arquivo do banco está vazio."
            );

        }

        if (!Array.isArray(data.questions)) {

            throw new Error(
                'O banco precisa possuir uma propriedade "questions".'
            );

        }

        if (data.questions.length === 0) {

            throw new Error(
                "O banco não contém questões."
            );

        }

        const ids = new Set();

        data.questions.forEach((question, index) => {

            if (!question.id) {

                throw new Error(
                    `Questão na posição ${index} não possui ID.`
                );

            }

            if (ids.has(question.id)) {

                throw new Error(
                    `ID duplicado encontrado: ${question.id}`
                );

            }

            ids.add(question.id);

            if (!question.question) {

                throw new Error(
                    `A questão ${question.id} não possui enunciado.`
                );

            }

            if (!question.type) {

                throw new Error(
                    `A questão ${question.id} não possui tipo.`
                );

            }

            this.validateQuestionType(question);

        });

        return true;

    }


    /*
    ======================================================
    VALIDAR TIPO DE QUESTÃO
    ======================================================
    */

    validateQuestionType(question) {

        const supportedTypes = [
            "single",
            "multiple",
            "cli",
            "matching",
            "ordering"
        ];

        if (!supportedTypes.includes(question.type)) {

            throw new Error(
                `Tipo não suportado em ${question.id}: ${question.type}`
            );

        }


        /*
        --------------------------------------------------
        SINGLE / MULTIPLE / CLI
        --------------------------------------------------
        */

        if (
            question.type === "single" ||
            question.type === "multiple" ||
            question.type === "cli"
        ) {

            if (
                !Array.isArray(question.answers) ||
                question.answers.length < 2
            ) {

                throw new Error(
                    `${question.id} precisa possuir pelo menos duas respostas.`
                );

            }

            const correctAnswers =
                question.answers.filter(
                    answer => answer.correct === true
                );

            if (correctAnswers.length === 0) {

                throw new Error(
                    `${question.id} não possui resposta correta.`
                );

            }

            if (
                question.type === "single" &&
                correctAnswers.length !== 1
            ) {

                throw new Error(
                    `${question.id} é single e deve possuir exatamente uma resposta correta.`
                );

            }

        }


        /*
        --------------------------------------------------
        MATCHING
        --------------------------------------------------
        */

        if (question.type === "matching") {

            if (!question.matching) {

                throw new Error(
                    `${question.id} não possui estrutura matching.`
                );

            }

            if (
                !Array.isArray(question.matching.left) ||
                !Array.isArray(question.matching.right)
            ) {

                throw new Error(
                    `${question.id} possui matching inválido.`
                );

            }

            if (!question.matching.correct) {

                throw new Error(
                    `${question.id} não possui o mapa de respostas do matching.`
                );

            }

        }


        /*
        --------------------------------------------------
        ORDERING
        --------------------------------------------------
        */

        if (question.type === "ordering") {

            if (!question.ordering) {

                throw new Error(
                    `${question.id} não possui estrutura ordering.`
                );

            }

            if (
                !Array.isArray(question.ordering.items) ||
                !Array.isArray(question.ordering.correctOrder)
            ) {

                throw new Error(
                    `${question.id} possui ordering inválido.`
                );

            }

        }

        return true;

    }


    /*
    ======================================================
    NORMALIZAR QUESTÃO
    ======================================================
    */

    normalizeQuestion(question) {

        /*
        Fazemos uma cópia para que o simulador nunca
        modifique diretamente o banco original.
        */

        return JSON.parse(
            JSON.stringify(question)
        );

    }


    /*
    ======================================================
    VERIFICAR SE O BANCO FOI CARREGADO
    ======================================================
    */

    isLoaded() {

        return this.loaded;

    }


    /*
    ======================================================
    TOTAL DE QUESTÕES
    ======================================================
    */

    getTotalQuestions() {

        return this.questions.length;

    }


    /*
    ======================================================
    METADATA
    ======================================================
    */

    getMetadata() {

        return {
            ...this.metadata
        };

    }


    /*
    ======================================================
    RETORNAR TODAS AS QUESTÕES
    ======================================================
    */

    getAllQuestions() {

        return this.cloneQuestions(
            this.questions
        );

    }


    /*
    ======================================================
    LOCALIZAR QUESTÃO POR ID
    ======================================================
    */

    getQuestionById(questionId) {

        const question = this.questions.find(
            item => item.id === questionId
        );

        if (!question) {

            return null;

        }

        return this.cloneQuestion(question);

    }


    /*
    ======================================================
    FILTRAR POR DOMÍNIO
    ======================================================
    */

    getByDomain(domain) {

        const filtered = this.questions.filter(
            question => question.domain === domain
        );

        return this.cloneQuestions(filtered);

    }


    /*
    ======================================================
    FILTRAR POR TIPO
    ======================================================
    */

    getByType(type) {

        const filtered = this.questions.filter(
            question => question.type === type
        );

        return this.cloneQuestions(filtered);

    }


    /*
    ======================================================
    FILTRAR POR DIFICULDADE
    ======================================================
    */

    getByDifficulty(difficulty) {

        const filtered = this.questions.filter(
            question => question.difficulty === difficulty
        );

        return this.cloneQuestions(filtered);

    }


    /*
    ======================================================
    SELECIONAR QUESTÕES ALEATÓRIAS
    ======================================================
    */

    getRandomQuestions(amount) {

        if (!this.loaded) {

            throw new Error(
                "O banco de questões ainda não foi carregado."
            );

        }

        const requestedAmount =
            Number(amount);

        if (
            !Number.isInteger(requestedAmount) ||
            requestedAmount <= 0
        ) {

            throw new Error(
                "Quantidade de questões inválida."
            );

        }

        if (
            requestedAmount >
            this.questions.length
        ) {

            throw new Error(
                `Foram solicitadas ${requestedAmount} questões, mas o banco possui apenas ${this.questions.length}.`
            );

        }

        const shuffled =
            this.shuffle(this.questions);

        return this.cloneQuestions(
            shuffled.slice(
                0,
                requestedAmount
            )
        );

    }


    /*
    ======================================================
    SELEÇÃO COM FILTROS
    ======================================================
    */

    getRandomQuestionsByFilter(
        amount,
        filters = {}
    ) {

        let pool = [...this.questions];


        /*
        --------------------------------------------------
        DOMÍNIO
        --------------------------------------------------
        */

        if (filters.domain) {

            pool = pool.filter(
                question =>
                    question.domain === filters.domain
            );

        }


        /*
        --------------------------------------------------
        DIFICULDADE
        --------------------------------------------------
        */

        if (filters.difficulty) {

            pool = pool.filter(
                question =>
                    question.difficulty ===
                    filters.difficulty
            );

        }


        /*
        --------------------------------------------------
        TIPO
        --------------------------------------------------
        */

        if (filters.type) {

            pool = pool.filter(
                question =>
                    question.type === filters.type
            );

        }


        const requestedAmount =
            Number(amount);

        if (
            requestedAmount >
            pool.length
        ) {

            throw new Error(
                `O filtro encontrou apenas ${pool.length} questões, mas foram solicitadas ${requestedAmount}.`
            );

        }

        const shuffled =
            this.shuffle(pool);

        return this.cloneQuestions(
            shuffled.slice(
                0,
                requestedAmount
            )
        );

    }


    /*
    ======================================================
    EMBARALHAR QUESTÕES
    Fisher-Yates
    ======================================================
    */

    shuffle(items) {

        const shuffled = [...items];

        for (
            let i = shuffled.length - 1;
            i > 0;
            i--
        ) {

            const j =
                Math.floor(
                    Math.random() * (i + 1)
                );

            [
                shuffled[i],
                shuffled[j]
            ] = [
                shuffled[j],
                shuffled[i]
            ];

        }

        return shuffled;

    }


    /*
    ======================================================
    CLONAR UMA QUESTÃO
    ======================================================
    */

    cloneQuestion(question) {

        return JSON.parse(
            JSON.stringify(question)
        );

    }


    /*
    ======================================================
    CLONAR LISTA DE QUESTÕES
    ======================================================
    */

    cloneQuestions(questions) {

        return questions.map(
            question =>
                this.cloneQuestion(question)
        );

    }


    /*
    ======================================================
    ESTATÍSTICAS DO BANCO
    ======================================================
    */

    getStatistics() {

        const statistics = {

            total: this.questions.length,

            types: {},

            difficulties: {},

            domains: {}

        };


        this.questions.forEach(question => {


            /*
            Tipo
            */

            statistics.types[question.type] =
                (
                    statistics.types[
                        question.type
                    ] || 0
                ) + 1;


            /*
            Dificuldade
            */

            const difficulty =
                question.difficulty || "undefined";

            statistics.difficulties[difficulty] =
                (
                    statistics.difficulties[
                        difficulty
                    ] || 0
                ) + 1;


            /*
            Domínio
            */

            const domain =
                question.domain || "undefined";

            statistics.domains[domain] =
                (
                    statistics.domains[
                        domain
                    ] || 0
                ) + 1;

        });


        return statistics;

    }

}


/*
==========================================================
Disponibilizar globalmente
==========================================================
*/

window.QuestionBank = QuestionBank;

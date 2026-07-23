/*
==========================================================
CCNA Exam Simulator
Question Manager
==========================================================

Responsabilidades

• Carregar exam.json
• Carregar todos os bancos de questões
• Validar os dados carregados
• Construir um objeto Exam

Este módulo NÃO controla:

• Interface
• Timer
• Navegação
• Correção
• Score
• Armazenamento

==========================================================
*/

class QuestionManager {

    constructor(app) {

        this.app = app;

        this.config = null;

        this.questionBank = [];

    }

    /*
    ======================================================
    Inicialização
    ======================================================
    */

    async load() {

        this.clear();

        await this.loadConfig();

        await this.loadDomains();

        this.validate();

    }

    /*
    ======================================================
    Carrega exam.json
    ======================================================
    */

    async loadConfig() {

        const response = await fetch(
            "data/exam.json"
        );

        if (!response.ok) {

            throw new Error(
                "Unable to load data/exam.json"
            );

        }

        this.config = await response.json();

    }

    /*
    ======================================================
    Carrega todos os domínios definidos em exam.json
    ======================================================
    */

    async loadDomains() {

        if (!Array.isArray(this.config.domains)) {

            throw new Error(
                "Invalid exam configuration."
            );

        }

        for (const domain of this.config.domains) {

            await this.loadDomain(domain);

        }

    }

    /*
    ======================================================
    Carrega um domínio
    ======================================================
    */

    async loadDomain(domain) {

        if (!domain.file) {

            throw new Error(
                "Domain file not informed."
            );

        }

        const response = await fetch(domain.file);

console.log("URL:", domain.file);
console.log("Status:", response.status);
console.log("OK:", response.ok);

if (!response.ok) {
    throw new Error(`Unable to load ${domain.file}`);
}

        const data = await response.json();

        if (!Array.isArray(data)) {

            throw new Error(

                `${domain.file} is not a valid question array.`

            );

        }

        for (const questionData of data) {

            this.questionBank.push(

                new Question(questionData)

            );

        }

    }

    /*
    ======================================================
    Validação Geral
    ======================================================
    */

    validate() {

        this.validateConfig();

        this.validateQuestionBank();

        this.validateDuplicateIds();

        this.questionBank.forEach(question => {

            this.validateQuestion(question);

        });

    }

    /*
    ======================================================
    exam.json
    ======================================================
    */

    validateConfig() {

        if (!this.config) {

            throw new Error(
                "Exam configuration not loaded."
            );

        }

        if (!Array.isArray(this.config.domains)) {

            throw new Error(
                "Invalid domains section."
            );

        }

    }

    /*
    ======================================================
    Banco
    ======================================================
    */

    validateQuestionBank() {

        if (this.questionBank.length === 0) {

            throw new Error(
                "Question bank is empty."
            );

        }

    }

    /*
    ======================================================
    IDs duplicados
    ======================================================
    */

    validateDuplicateIds() {

        const ids = new Set();

        for (const question of this.questionBank) {

            const id = question.getId();

            if (ids.has(id)) {

                throw new Error(

                    `Duplicate question id: ${id}`

                );

            }

            ids.add(id);

        }

    }

    /*
    ======================================================
    Questão
    ======================================================
    */

    validateQuestion(question) {

        if (!question.getId()) {

            throw new Error(
                "Question without id."
            );

        }

        if (!question.getQuestion()) {

            throw new Error(

                `Question ${question.getId()} has no statement.`

            );

        }

        if (!question.getType()) {

            throw new Error(

                `Question ${question.getId()} has no type.`

            );

        }

        if (question.getAnswers().length === 0) {

            throw new Error(

                `Question ${question.getId()} has no answers.`

            );

        }

        if (question.getCorrectAnswers().length === 0) {

            throw new Error(

                `Question ${question.getId()} has no correct answers.`

            );

        }

        this.validateQuestionType(question);

    }

    /*
    ======================================================
    Tipo
    ======================================================
    */

    validateQuestionType(question) {

        const validTypes = [

            "single",
            "multiple",
            "dragdrop",
            "cli",
            "lab"

        ];

        if (!validTypes.includes(question.getType())) {

            throw new Error(

                `Invalid question type: ${question.getType()}`

            );

        }

    }
	
	    /*
    ======================================================
    Construção do Exame
    ======================================================
    */

    buildExam() {

        const questions = this.selectQuestions();

        return new Exam(

            this.config,

            questions

        );

    }

    /*
    ======================================================
    Seleção das Questões
    ======================================================
    */

    selectQuestions() {

        const selected = [];

        /*
        ----------------------------------------------
        Seleção por domínio (quando definida)
        ----------------------------------------------
        */

        if (this.hasDomainSelection()) {

            for (const domain of this.config.domains) {

                const questions = this.questionBank.filter(

                    question =>

                        question.getDomain() === domain.id

                );

                if (this.config.shuffleQuestions) {

                    this.shuffle(questions);

                }

                const quantity = Math.min(

                    domain.questionsPerExam,

                    questions.length

                );

                for (let i = 0; i < quantity; i++) {

                    selected.push(

                        questions[i].clone()

                    );

                }

            }

        }

        /*
        ----------------------------------------------
        Seleção global
        ----------------------------------------------
        */

        else {

            const questions = [

                ...this.questionBank

            ];

            if (this.config.shuffleQuestions) {

                this.shuffle(questions);

            }

            const total = Math.min(

                this.config.totalQuestions,

                questions.length

            );

            for (let i = 0; i < total; i++) {

                selected.push(

                    questions[i].clone()

                );

            }

        }

        /*
        ----------------------------------------------
        Embaralhamento final da prova
        ----------------------------------------------
        */

        if (this.config.shuffleQuestions) {

            this.shuffle(selected);

        }

        return selected;

    }

    /*
    ======================================================
    Verifica se exam.json possui quantidade
    de questões por domínio.
    ======================================================
    */

    hasDomainSelection() {

        if (!Array.isArray(this.config.domains)) {

            return false;

        }

        return this.config.domains.every(

            domain =>

                Number.isInteger(domain.questionsPerExam)

        );

    }

    /*
    ======================================================
    Fisher-Yates Shuffle
    ======================================================
    */

    shuffle(array) {

        for (

            let i = array.length - 1;

            i > 0;

            i--

        ) {

            const j = Math.floor(

                Math.random() * (i + 1)

            );

            [

                array[i],

                array[j]

            ] = [

                array[j],

                array[i]

            ];

        }

        return array;

    }

    /*
    ======================================================
    Limpeza
    ======================================================
    */

    clear() {

        this.config = null;

        this.questionBank = [];

    }
	
	    /*
    ======================================================
    API Pública
    ======================================================
    */

    getConfig() {

        return this.config;

    }

    getQuestionBank() {

        return this.questionBank;

    }

    getQuestionById(id) {

        return this.questionBank.find(

            question => question.getId() === id

        ) || null;

    }

    getQuestionsByDomain(domainId) {

        return this.questionBank.filter(

            question =>

                question.getDomain() === domainId

        );

    }

    getDomains() {

        return this.config?.domains || [];

    }

    getTotalQuestions() {

        return this.questionBank.length;

    }

    isLoaded() {

        return (

            this.config !== null &&

            this.questionBank.length > 0

        );

    }

    isEmpty() {

        return this.questionBank.length === 0;

    }

}
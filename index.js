// modulos externos
const inquirer = require("inquirer");
const chalk = require("chalk")

// modulos internos
const fs = require("fs");

operation();

function operation() {
    inquirer.prompt([
        {
            type: "list",
            name: "action",
            message: "O que você deseja fazer?",
            choices: [
                "Criar Conta",
                "Consultar Saldo",
                "Depositar",
                "Sacar",
                "Sair"
            ],
        },
    ]).then((answer) =>{
        const action = answer["action"]
        
        if(action === "Criar Conta") {
            createAccount();
        }else if(action === "Depositar") {
            deposit();

        }else if(action === "Consultar Saldo") {
            getAccountBalance();
        }else if(action === "Sacar") {
            withdraw();

        }else if(action === "Sair") {
            console.log(chalk.bgBlue.black("Obrigado por usar a conta!"));
            process.exit();
        }
    })
      .catch(err => {
    })
}

// create an account
function createAccount() {
    console.log(chalk.bgGreen.black("Parabéns por escolher o nosso banco!"));
    console.log(chalk.green("Defina as opções da sua conta a seguir"));

    buildAccount();
}

function buildAccount() {
    inquirer.prompt([
        {
            name: "accountName",
            message: "Digite um nome para a sua conta"
        }
    ]).then(answer => {
        const accountName = answer["accountName"]

        console.info(accountName);
        //caso não existir criar
        if(!fs.existsSync("account")) {
            fs.mkdirSync("account")
        }
        //verifica se o nome da conta já existe
        if(fs.existsSync(`account/${accountName}.json`)) {
            console.log(chalk.bgRed.black("Esta conta já existe, escolha outro nome"));
            buildAccount();
            return
        }
        fs.writeFileSync(`account/${accountName}.json`, '{"balance": 0}', (err =>{
            console.log(err);
        }))
        
        console.log(chalk.green("Parabéns, a sua conta foi criada!"));
        operation();
    }).catch(err => {

      });
}

// Depositar
function deposit() {
    inquirer.prompt([
        {
            name: "accountName",
            message: "Qual o nome da sua conta?"
        }
    ]).then((answer) =>{
        const accountName = answer["accountName"]
        //verifica se a conta existes
        if(!checkAccount(accountName)) {
            return deposit()
        }

        inquirer.prompt([
            {
                name: "amount",
                message: "Quanto você deseja depositar?"
            },
        ]).then((answer) => {

            const amount = answer["amount"]
            //adiciar saldo
            addAmount(accountName, amount)
            operation()

        }).catch(err => {
            console.log(err);   
        });

    }).catch(err => {
        console.log(err);
    })
}
function checkAccount(accountName) {
    if(!fs.existsSync(`account/${accountName}.json`)) {
        console.log(chalk.bgRed.black("Esta conta não existe, escolha outro nome!"));
        return false;
    }
    return true;
}

//function adiciar saldo
function addAmount(accountName, amount) {
    const accountData = getAccount(accountName);

    if(!amount) {
        console.log(chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde!"));
        return deposit();
    }

    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);
    fs.writeFileSync(
        `account/${accountName}.json`,
        JSON.stringify(accountData),
        (err) => {
            console.log(err)
        },
    )
    console.log(chalk.green(`Foi depositado o valor de R$${amount} na sua conta!`))
    

}
function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`account/${accountName}.json`, {
        encoding: "utf8",
        flag: "r"
    })
    return JSON.parse(accountJSON);
}

//Consultar Saldo
function getAccountBalance() {
    inquirer.prompt([
        {
            name: "accountName",
            message: "Qual o nome da sua conta?"
            
        }
    ]).then((answer) => {
        const accountName = answer["accountName"]

        //verifica se a conta existe
        if(!checkAccount(accountName)) {
            return getAccountBalance()
        }
        const accountData = getAccount(accountName);
        console.log(chalk.bgBlue.black(
            `Olá, o saldo da sua conta é de R$${accountData.balance}`,
        ))
        operation()

        

    }).catch(err => {
        console.log(err);
    })
}
// function sacar
function withdraw() {
    inquirer.prompt([
        {
            name: "accountName",
            message: "Qual o nome da sua conta?"
        }
    ]).then((answer) => {
        const accountName = answer["accountName"]

        if(!checkAccount(accountName)) {
            return withdraw();
        }

        inquirer.prompt([
            {
                name: "amount",
                message: "Quanto você deseja sacar?"
            }
        ]).then((answer) => {

            const amount = answer["amount"]
            removeAmount(accountName, amount);
        

        }).catch(err => {

        });
        
    }).catch(err => {

    })
}

function removeAmount(accountName, amount) {
    const accountData  = getAccount(accountName);

    if(!amount) {
        console.log(chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde!"));
        return withdraw();
    }
    if(accountData.balance < amount) {
        console.log(chalk.bgRed.black("Valor indisponivel!"));
        return withdraw(); 
    }
    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)
    fs.writeFileSync(
        `accounts/${accountName}.json`,
        JSON.stringify(accountData),
        (err) => {
            console.log(err);
        }
    )
    console.log(chalk.green(`Foi realizado um saque de R$${amount} da sua conta`));
    operation();
}

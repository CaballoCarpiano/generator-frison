module.exports = {
    general: [
        {
            type    : 'input',
            name    : 'url',
            message : 'Production URL:',
            default : 'http://localhost/',
            filter  : function(value) {
                value = value.replace(/\/+$/g, '');
                if (!/^http[s]?:\/\//.test(value)) {
                    value = 'http://' + value;
                }
                return value;
            }
        },
        {
            type    : 'confirm',
            name    : 'useGit',
            message : 'Create repository?'
        },
        {
            type    : 'list',
            name    : 'dbChoice',
            message : 'Mysql options:',
            choices : [
                {name: 'Don\'t use Database', value: 'no'},
                {name: 'Create database', value: 'create'},
                {name: 'Connect to database', value: 'connect'}
            ]
        }
    ],
    dbConfig: [
        {
            type    : 'input',
            name    : 'dbHost',
            message : 'Database host:',
            default : 'localhost'
        },
        {
            type    : 'input',
            name    : 'dbName',
            message : 'Database name:',
            validate: function(val) {
                if (val=="") return "Database name is required"
                return true;
            }
        },
        {
            type    : 'input',
            name    : 'dbUser',
            message : 'Database user:',
            default : 'root'
        },
        {
            type    : 'password',
            name    : 'dbPass',
            message : 'Database password:'
        }
    ]
};
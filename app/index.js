'use strict';
var fs           = require('fs'),
    path         = require('path'),
    chalk        = require('chalk'),
    yeoman       = require('yeoman-generator'),
    git          = require('./util/git'),
    laravel      = require('./util/laravel'),
    spawn        = require('./util/spawn'),
    art          = require('./util/art'),
    exec         = require('child_process').exec,
    prompts      = require('./prompts');

module.exports = yeoman.Base.extend({
//var FrisonGenerator = module.exports = function FrisonGenerator(args, options, config) {
    constructor: function() {
        //Super constructor
        yeoman.Base.apply(this, arguments);

    },

    initializing: function() {
        this.composer = false;
        // this.secretKey = this._makeSecretKey();
    },

    prompting: function() {
        // Display gen laravel ascii art
        this.log(art.logo);
        this._prompGeneral();
    },
/*
    //gitignore configure
    gitIgnore: function() {

        if (this.userInput.useGit) {
            this.copy('gitignore.tmpl', '.gitignore');
        }

    },

    //check if the database already exists otherwise create it
    createDataBase: function() {

        var done = this.async();

             laravel.createDBifNotExists(done).on('error', function(err) {
                this.log('Database does not exist, or crendetials are wrong!'.red);
                this.log('Make sure you create the database and update the credentials in the /app/database.php');
                done();
            });

    },

    //in order to get the laravel from git repo
    checkoutLaravel: function() {

        var done = this.async(),
            me   = this;

        if (this.userInput.submodule) {

            git.submoduleAdd(laravel.repo, this.userInput.larDir, function() {
                var cwd = process.cwd();
                process.chdir(this.userInput.larDir);
                git.checkout([this.userInput.larVer], function() {
                    process.chdir(cwd);
                    done();
                });
            });

        } else {

            this.remote('laravel', 'laravel', function(err, remote) {
                remote.directory('.', this.userInput.larDir);
                done();
            });

        }

    },

    installComposer: function(){
        var done = this.async(),
            child,
            me = this;
        this.log("Started Downloading composer");
        var cwd = process.cwd();
        process.chdir(this.userInput.larDir);
      
        
             
            laravel.getComposer().on('done',function(){
                var composer    = spawn('php', ['composer.phar','install']);

                composer.stdout.on('data', function (data) {
                    this.log('stdout: ' + data);
                    done();
                });
                composer.stderr.on('data', function (data) {
                    this.log('stderr: ' + data);
                });


                composer.on('close', function (code) {
                    this.log('child process exited with code ' + code);
                });

            }).on('error',function(){
               this.log("Unable to find cURL on System");
            });

      
     },

     configDB: function(){
          var done = this.async();
          this.log("copying the config file");
          this.copy('database.php.tmpl','app/config/database.php');
          done();
     },

     _makeSecretKey: function(){
          //var done = this.async();
          var mask = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789~`!@#$%^&*()_+-={}[]:";<>?,./|\\';
          var result = '';
          for (var i = 32; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))];
          return result;
          
         //done();

     },

     initialiseGit: function() {

         // Intiate Git
         if (this.userInput.useGit) {

             var done = this.async();

             git.init(function() {
                 git.addAllAndCommit('Initial Commit', function() {
                     done();
                 });
             });
         }

     },

     allDone: function() {
         this.log('All Done!!'.green);
     },*/

     _prompGeneral: function() {
        var me = this;
        return this.prompt(prompts.general).then(me._prompDatabase.bind(me));
     },

    _prompDatabase: function(answers) {
        var me = this;
        me.answers = {general: answers};
        if (answers.dbChoice!="no")
            return this.prompt(prompts.dbConfig).then(function (answers) {
                me.answers.dbConfig = answers;
                me._prompConfirm.call(me);
            });
        else{
            me._prompConfirm.call(me);
        }
     },


     _prompConfirm: function(answers) {
         var me = this;

         me.log(chalk.red('\n----------------------------'));

         me._logConfirmation('production URL', me.answers.general.url);
         me._logConfirmation('Create repo', me.answers.general.useGit ? "Yes" : "No");
         me._logConfirmation('Database', me.answers.general.dbChoice);
         if (me.answers.general.dbChoice!="no"){
             me._logConfirmation('Database host', me.answers.dbConfig.dbHost);
             me._logConfirmation('Database name', me.answers.dbConfig.dbName);
             me._logConfirmation('Database user', me.answers.dbConfig.dbUser);
             me._logConfirmation('Database password', me.answers.dbConfig.dbPass);
         }

         me.log(chalk.red('----------------------------'));


        return this.prompt({
            type    : 'confirm',
            name    : 'okAll',
            message : 'Is this Correct?'
        }).then(function (inp) {
            if (!inp.okAll){
              me._prompGeneral();
            }
        });

     },

     _logConfirmation: function(msg, val) {
         this.log(chalk.bold.gray(msg + ': ') + chalk.cyan(val));
     }

});

/*
FrisonGenerator.prototype.checkComposer = function checkComposer() {
    var done = this.async();
    laravel.defaultComposer().on('done',function(){
       this.log("Composer found in Default path");
       done();
    });
    laravel.defaultComposer().on('error',function(){
       this.log("composer not found in default path");
    });
    
};


FrisonGenerator.prototype.checkComposer = function checkComposer() {
    var cb = this.async();

    this.info('Check composer install'.cyan);
    var composer = spawn('composer'),
        self = this;

    composer.stdout.on('data', function () {
        self.info('Composer has been found'.green);
        self.composer = true;
        cb();
    });

    composer.stderr.on('data', function () {
        self.conflict('Composer is missing'.red, true);
        // Composer doesn't exist
    });
    return false;
};
*/

function startSrever(){
    this.log("Staring Server");
    var child = exec("php artisan serve",function(error,stdout,stderr){
        if(stdout!==null)
        {
            this.log("stdout :"+stdout);
        }
    });
}

function startServer(me) {

    var input = {};
    prompt([prompts.startServer],input,function(me) {
        this.log(me);
    });
    if(this.startServer) {
        this.info('trying to start server'.cyan);
        var artisan = spawn('php', ['artisan','serve']);
        var me = this; 
        artisan.stdout.on('data', function (data) {
            this.log('stdout: ' + data);
            //this.copy('database.php.tmpl','app/config/database.php');
       });

        artisan.stderr.on('data', function (data) {
            this.log('stderr: ' + data);
        });

        artisan.on('close', function (code) {
            this.log('child process exited with code ' + code);
        });
    }

    return false;

}
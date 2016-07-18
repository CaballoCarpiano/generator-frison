'use strict';
var chalk        = require('chalk'),
    yeoman       = require('yeoman-generator'),
    git          = require('simple-git')(),
    art          = require('./art'),
    prompts      = require('./prompts');

module.exports = yeoman.Base.extend({
    constructor: function() {
        //Super constructor
        yeoman.Base.apply(this, arguments);

    },

    initializing: function() {
        this.composer = false;
        this.pckInfo = {
            name: this.appname,
            desc: ''
        };
    },

    prompting: function() {
        this.log(art.logo);
        return this._prompGeneral();
    },

    writing: function() {

        this.fs.copy(this.templatePath('gitignore'), this.destinationPath('.gitignore'));

        this.fs.copyTpl(this.templatePath('_bower.json'), this.destinationPath('bower.json'), this.pckInfo);

    },

    install: function() {


        this._installLaravel();

        this.fs.copyTpl(this.templatePath('_package.json'), this.destinationPath('package.json'), this.pckInfo);

        // starting a new repo 
        git.init()
         .add('./*')
         .commit("first commit!");
         // .addRemote('origin', 'https://github.com/user/repo.git')
         // .push('origin', 'master');

        this.installDependencies();

    },

     _prompGeneral: function() {
        var me = this;
        return this.prompt(prompts.general).then(me._prompConfirm.bind(me)); //_prompDatabase
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
            return me._prompConfirm.call(me);
        }
     },


     _prompConfirm: function(answers) {
         var me = this;

         me.log(chalk.red('\n----------------------------'));

         me._logConfirmation('production URL', me.answers.general.url);
         me._logConfirmation('Create repo', me.answers.general.useGit ? "Yes" : "No");
         me._logConfirmation('Database', me.answers.general.dbChoice);
         if (me.answers.general.dbChoice!="no" && false){
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
              return me._prompGeneral();
            }
        });

     },

     _logConfirmation: function(msg, val) {
         this.log(chalk.bold.gray(msg + ': ') + chalk.cyan(val));
     },

     _installLaravel: function() {
        var me = this;
        var lar = me.spawnCommandSync('laravel', ["new"]);

        if (lar.error){
            if (lar.error.code=="ENOENT"){
                me.log(chalk.yellow("Laravel installer not Installed.\nInstalling via composer..."));
                var compo = me.spawnCommandSync('composer', ["global require laravel/installer"]);
                if (compo.status==0){
                    me._installLaravel();
                }else if (compo.error){
                    if (err.code=="ENOENT"){
                        me.env.error(chalk.red("Composer not Installed. Aborting..."));
                    }else{
                        me.env.error(err);
                    }
                }
            }
        }
     }
/*
    //check if the database already exists otherwise create it
    createDataBase: function() {

        var done = this.async();

             laravel.createDBifNotExists(done).on('error', function(err) {
                this.log('Database does not exist, or crendetials are wrong!'.red);
                this.log('Make sure you create the database and update the credentials in the /app/database.php');
                done();
            });

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



});



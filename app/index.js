'use strict';
var fs           = require('fs'),
    path         = require('path'),
    yeoman       = require('yeoman-generator'),
    wrench       = require('wrench'),
    git          = require('../util/git'),
    laravel    = require('../util/laravel'),
    spawn        = require('../util/spawn'),
    art          = require('../util/art'),
    exec         = require('child_process').exec,
    prompts      = require('./prompts');

module.exports = yeoman.Base.extend({
    var me = this;
//var FrisonGenerator = module.exports = function FrisonGenerator(args, options, config) {
    constructor: function() {
        //Super constructor
        yeoman.Base.apply(this, arguments);

        this.composer = false;

        this.secretKey = this.makeSecretKey();
    },

    AskUser: function() {

        // Display gen laravel ascii art
        me.log(art.lar);

        // Get the input  from the user
        getInput.call(this, this.async());

    },
    
    //saving the database details into dbconfig.php
    gitIgnore: function() {

       this.copy('dbconfig.php.tmpl', 'dbconfig.php');
        
    },

    //saving the application configuration into app.php
    gitIgnore: function() {

       this.copy('app.php.tmpl', 'app.php');
        
    },

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
                console.log('Database does not exist, or crendetials are wrong!'.red);
                console.log('Make sure you create the database and update the credentials in the /app/database.php');
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
                process.chdir(me.userInput.larDir);
                git.checkout([me.userInput.larVer], function() {
                    process.chdir(cwd);
                    done();
                });
            });

        } else {

            this.remote('laravel', 'laravel', function(err, remote) {
                remote.directory('.', me.userInput.larDir);
                done();
            });

        }

    },

    installComposer: function(){
        var done = this.async(),
            child,
            me = this;
        console.log("Started Downloading composer");
        var cwd = process.cwd();
        process.chdir(me.userInput.larDir);
      
        
             
            laravel.getComposer().on('done',function(){
                var composer    = spawn('php', ['composer.phar','install']);

                composer.stdout.on('data', function (data) {
                    console.log('stdout: ' + data);
                    done();
                });
                composer.stderr.on('data', function (data) {
                    console.log('stderr: ' + data);
                });


                composer.on('close', function (code) {
                    console.log('child process exited with code ' + code);
                });

            }).on('error',function(){
               console.log("Unable to find cURL on System");
            });

      
     },

     configDB: function(){
          var done = this.async();
          console.log("copying the config file");
          this.copy('database.php.tmpl','app/config/database.php');
          done();
     },

     makeSecretKey: function(){
          this.copy('app.php.tmpl','app/config/app.php');
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

     }

};

/*
FrisonGenerator.prototype.checkComposer = function checkComposer() {
    var done = this.async();
    laravel.defaultComposer().on('done',function(){
       console.log("Composer found in Default path");
       done();
    });
    laravel.defaultComposer().on('error',function(){
       console.log("composer not found in default path");
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

FrisonGenerator.prototype.allDone = function() {
    console.log('All Done!!'.green);
};


function getInput(done) {
    var me = this;
    promptForData.call(me, function(input) {
        me.userInput = input;
        confirmInput.call(me, done);
    });
};

function startSrever(){
    console.log("Staring Server");
    var child = exec("php artisan serve",function(error,stdout,stderr){
        if(stdout!==null)
        {
            console.log("stdout :"+stdout);
        }
    });
}

function startServer(me) {

    var input = {};
    prompt([prompts.startServer],input,function(me) {
        console.log(me);
    });
    if(me.startServer) {
        this.info('trying to start server'.cyan);
        var artisan = spawn('php', ['artisan','serve']);
        var me = this; 
        artisan.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
            //me.copy('database.php.tmpl','app/config/database.php');
       });

        artisan.stderr.on('data', function (data) {
            console.log('stderr: ' + data);
        });

        artisan.on('close', function (code) {
            console.log('child process exited with code ' + code);
        });
    }

    return false;

}

var promptForData = function(done) {

    // All the data will be attached to this object
    var input = {},
        me = this;
    input.larVer = '4';
    input.larDir = "laravel";

    prompt([
        prompts.url,
        prompts.secretKey,
        prompts.dbHost,
        prompts.dbName,
        prompts.dbUser,
        prompts.dbPass,
        prompts.larVer,
        prompts.useGit,
        prompts.larDir,
        prompts.enableVagrant
    ], input, function(i) {
        var port = i.url.match(/:[\d]+$/);
        if (port !== null) {
            input.port = port[0];
        } else {
            input.port = '';
        }
        done(input);
    });
}




function confirmInput(done) {

    var me  = this;

    console.log('\n----------------------------'.red);

    logConfirmation('Laravel URL', this.userInput.url);
    logConfirmation('Secret key', this.secretKey);
    logConfirmation('Database host', this.userInput.dbHost);
    logConfirmation('Database name', this.userInput.dbName);
    logConfirmation('Database user', this.userInput.dbUser);
    logConfirmation('Database password', this.userInput.dbPass);
    logConfirmation('Laravel version', this.userInput.larVer);
    logConfirmation('Laravel install directory', this.userInput.larDir);

    console.log('----------------------------'.red);

    prompt([prompts.correct], null, function(input) {
        if (!input.correct) {
            console.log(art.oops);
            getInput.call(me, done);
        } else {
            console.log(art.go);
            done();
        }
    });

};

function logConfirmation(msg, val) {
    console.log(msg.bold.grey + ': '.bold.grey + val+"".cyan);
}

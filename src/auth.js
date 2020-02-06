const bcrypt = require('bcryptjs');
const md5 = require('md5');
const LocalStrategy = require('passport-local').Strategy;
const connection = require('./connectionUser');

module.exports = function (passport) {
    async function findUser(username, callback) {
        
        const conexao = await connection;
        const sql = `SELECT * FROM USERS WHERE USERNAME = '${username}'`;

        await conexao.execute(sql, [], { autoCommit: true }, function (err, result) {
            if (typeof(result.rows[0]) === 'undefined') {
                callback(err, { username: 'a', password: 'b' });
            } else {
                
                const user = {
                    id: result.rows[0][0],
                    username: result.rows[0][1],
                    password: result.rows[0][2],
                    email: result.rows[0][3],
                };
                callback(err, user);
            }
        });
    }

    async function findUserById(id, callback) {
        const conexao = await connection;
        const sql = `SELECT * FROM users WHERE ID = ${id}`;

        conexao.execute(sql, [], { autoCommit: true }, function (err, result) {
            if (typeof (result.rows[0]) === 'undefined') {
                callback(err, { username: 'a', password: 'b' });
            } else {
                const user = {
                    id: result.rows[0][0],
                    username: result.rows[0][1],
                    password: result.rows[0][2],
                    email: result.rows[0][3]
                };
                callback(err, user);
            }
        });
    }

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        findUserById(id, function (err, user) {
            done(err, user);
        });
    });

    passport.use(new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        filial : 'filial'
    },
        (username, password, done) => {
            findUser(username, (err, user) => {
                if (err) { return done(err) }
                
                // usuário inexistente
                if (!user) { return done(null, false) }
                
                // comparando as senhas
                if(md5(password) === user.password){
                    return done(null,user);
                }else{
                    return done(null, false)
                }
                
            })
        }
    ));
}
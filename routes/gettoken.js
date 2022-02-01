
const key = require('../key/key');

const passport = require("passport");
const jwt = require("jwt-simple");
//----------------------------------------
const ExtractJwt = require("passport-jwt").ExtractJwt;
//ใช้ในการประกาศ Strategy
const JwtStrategy = require("passport-jwt").Strategy;
const SECRET = key.SECRET;
const sup = key.sub

//สร้าง Strategy
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader("authorization"),
    secretOrKey: SECRET
};
const jwtAuth = new JwtStrategy(jwtOptions, (payload, done) => {
    if (sup.includes(payload.sub)) done(null, true);
    else done(null, false);
});

//เสียบ Strategy เข้า Passport
passport.use(jwtAuth);

//ทำ Passport Middleware
const requireJWTAuth = passport.authenticate("jwt", { session: false });

module.exports = function (app) {
  
  const loginMiddleWare = (req, res, next) => {
    if (req.body.username === "API"
        && req.body.password === "projectapi") next();
    else res.send("Wrong username and password");
  };
  app.post("/gettoken", loginMiddleWare, (req, res) => {
      const payload = {
          sub: req.body.username,
          iat: new Date().getTime()
      };
      res.send(jwt.encode(payload, SECRET));
  });
}
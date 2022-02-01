
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('newproject.db');
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
  app.get('/get_product',requireJWTAuth, (req, res) => {
    db.all("SELECT * FROM product", function(err, row) {
      console.log(row)
      res.json(row)
    });
  })

  app.post('/add_new_product',(req,res)=>{
    getnextnum()
    function getnextnum(){
      db.each("select *from product_num", function(err, row) {
        console.log()
        var num= row.num
        var nextnum=num+1
        var text = num.toString()
        var n='0000'
        var d = n.substring(0,n.length-text.length)
        //console.log(d+nextnum)
        req.session.nextnum=d+nextnum
        req.session.num=nextnum
        getdpname()
      });
    }
    function getdpname(){
      db.each("select *from department where dp_code=?",req.body.dpcode, function(err, row) {
        //console.log(row.num+':'+row.code);
        req.session.dpname=row.dp_name
        insertprocut()
      });
    }
    function insertprocut(){
    db.run('INSERT INTO product(dp_code,dp_name,pr_code,pr_name,pr_price) VALUES(?,?,?,?,?)',
    req.body.dpcode,req.session.dpname,req.session.nextnum,req.body.prname,req.body.pr_price,function(err) {
      if (err) {
        return console.log(err.message);
      }
      // get the last insert id
      updateprcode()
    });
    function updateprcode(){
      db.run('update product_num set num=?',req.session.num,function(err) {
        if (err) {
          res.json({"statscode":"404","message":err.message})
          return console.log(err.message);

        }
        // get the last insert id
        res.json({"statuscode":"200",
          "detail":{"dp_code":req.body.dpcode,"dp_name":req.session.dpname,"pr_code":req.session.nextnum,
          "pr_name":req.body.prname,"num":req.session.num},
          "message":"Successfully"
        })
      });
      
    }
    }
  })

  app.post('/update_product',(req,res)=>{
    
    db.run('update product  set pr_name=?,pr_price=? where pr_code=?',req.body.prname,req.body.pr_price,req.body.pr_code ,function(err) {
      if (err) {
        res.json({"statscode":"404","message":err.message})
        return console.log(err.message);

      }
      db.all("SELECT * FROM product where pr_code=?",req.body.pr_code, function(err, row) {
        console.log(row)
        res.json({"detail":row[0]})
      });
      // get the last insert id
    });
    
  })

  app.post('/delete_product',(req,res)=>{
    
    db.run('delete from product  where pr_code=?',req.body.pr_code ,function(err) {
      if (err) {
        res.json({"statscode":"404","message":err.message})
        return console.log(err.message);

      }
      res.json({"statscode":"200","message":"Delete product "+req.body.pr_code+" Successfully"})
    });
    
  })
}
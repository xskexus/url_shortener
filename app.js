const express = require('express');
const mongoose = require('mongoose');
const base64 = require('js-base64');
const app = express();
const multer = require('multer');
const upload = multer();
require("dotenv/config");
mongoose.connect(process.env.db_connection, {useNewUrlParser: true, useUnifiedTopology: true
}, () => console.log('connected to mongo'));

const postSchema = mongoose.Schema({
    shortHash: String,
    hash: String,
    url: String,
    date: {
        type: Date,
        default: Date.now
    }
})
const url = module.exports = mongoose.model('urls', postSchema)
function hashCode(str) {
    var hash = 0, i, chr;
    for (i = 0; i < str.length; i++) {
      chr   = str.charCodeAt(i);
      hash  = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
}
  
app.get('/*', (req,res) => {
    var short = req.url.replace('/', '')
    url.findOne({shortHash: short}).select("url").exec().then(data => {
        res.redirect(data["url"])
    })
    .catch(error => res.send("not found"))
})

app.post('/*',upload.none() , (req,res) => {
    var req_api_key = req.body["api_key"]
    var req_url = req.body["url"]
    var hash = base64.btoa(req_url)
    var shortHash = hash.substring(0,7).replace("=", "")
    if (req_api_key != process.env.api_key) {
        res.send("invalid api key")
    } else {
        const post = new url({
            shortHash: shortHash,
            hash: hash,
            url: req_url
        })
        post.save()
        .then(() => {
            res.send(shortHash)
        })
    }
})


app.listen(6246);
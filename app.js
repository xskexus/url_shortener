const express = require('express');
const mongoose = require('mongoose');
const app = express();
const multer = require('multer');
const upload = multer();
const uniqueHash = require('unique-hash');
require("dotenv/config");
mongoose.connect(process.env.db_connection, {
    useNewUrlParser: true, useUnifiedTopology: true
}, () => console.log('connected to mongo'));

const postSchema = mongoose.Schema({
    shortHash: String,
    url: String,
    date: {
        type: Date,
        default: Date.now
    }
})
const url = module.exports = mongoose.model('urls', postSchema)


function getReq(req, res) {
    var short = req.url.replace('/', '')
    if (short.length < 1) {
        res.send("error")
    } else {
        url.findOne({ shortHash: short }).select("url").exec().then(data => {
            console.log(data["url"])
            res.redirect(data["url"])
        }
        ).catch(error => res.send("not found"))
    }
}
function apiReq(req, res) {
    var req_api_key = req.body["api_key"]
    var req_url = req.body["url"]
    var shortHash = uniqueHash.default(req_url)
    if (req_api_key != process.env.api_key) {
        res.send("invalid api key")
    } else {
        const post = new url({
            shortHash: shortHash,
            url: req_url
        })
        post.save()
            .then(() => {
                res.send(shortHash)
            })
    }
}
app.post('/api', upload.none(), apiReq);
app.get('/*', getReq);





app.listen(6246);

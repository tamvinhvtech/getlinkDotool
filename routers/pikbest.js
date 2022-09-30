const express = require('express');
const path = require('path');
const router = express.Router();
const APIpikbest = require(__dirname + '/../api/APIpikbest');
const config = require(path.normalize(__dirname + '/../configs/config'));
const request = require('request');
var http = require('https');
var fs = require('fs');
const {uploadFileUrl}=require(__dirname + '/../api/upload');


router.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Server OK'
    });
  });
router.get('/upload', async(req, res) => {
    try {
        try {
            if (config.detect_ip == false || config.access_ip.includes(req.ipInfo.ip)) {
                //const { account, password, download_url } = req.query; console.log(account);
                const download_url = req.query.download_url;

                const upload = await uploadFileUrl(download_url); //console.log(upload,"b");
        
                res.status(200).json({
                    success: true,
                    message: `Success`,
                    link: upload
                });
            } else {
                console.log('Denied access from:', req.ipInfo);
                res.status(200).json({
                success: false,
                message: `Access Denied from: ${req.ipInfo.ip}`,
                ipInfo: req.ipInfo
                });
            }
        
        } catch (e) {
        res.status(200).json({
            success: false,
            message: `Error: ${e.message}`
        });
        }
    } catch (e) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});
router.get("/download", async (req, res) => {
    try {
        try {
            if (config.detect_ip == false || config.access_ip.includes(req.ipInfo.ip)) {
                //const { account, password, download_url } = req.query; console.log(account);
                const download_url = req.query.download_url;
                const account = req.query.account;
                const password = req.query.password;

                const pikbest = new APIpikbest({
                    account, password, download_url
                });
        
               await pikbest.start();
        
                const downl = await pikbest.downloadFile();

                //const upload = await uploadFileUrl(downl.url); //console.log(upload,"b");
        
                res.status(200).json({
                success: true,
                message: `Success`,
                data: downl,
                //link: upload
                });
            } else {
                console.log('Denied access from:', req.ipInfo);
                res.status(200).json({
                success: false,
                message: `Access Denied from: ${req.ipInfo.ip}`,
                ipInfo: req.ipInfo
                });
            }
        
        } catch (e) {
        res.status(200).json({
            success: false,
            message: `Error: ${e.message}`
        });
        }
    } catch (e) {
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
})
router.post('/download', async (req, res) => {
    console.log(req);
})


module.exports = router
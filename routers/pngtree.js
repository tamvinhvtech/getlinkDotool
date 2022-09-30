const express = require('express');
const path = require('path');
const router = express.Router();
const APIpngtree = require(__dirname + '/../api/APIpngtree');
const config = require(path.normalize(__dirname + '/../configs/config'));
const {uploadFileUrl}=require(__dirname + '/../api/upload');

const proxy="user49023:UQyIzFDwBf@140.82.25.50:49023";
// const proxyConfig = {
//     host: (proxy.split('@')[1]).split(':')[0],
//     port: (proxy.split('@')[1]).split(':')[1],
//     username: (proxy.split('@')[0]).split(':')[0],
//     password: (proxy.split('@')[0]).split(':')[1]
// };
const proxyConfig = {
    protocol: 'http',
    host: (proxy.split('@')[1]).split(':')[0],
    port: (proxy.split('@')[1]).split(':')[1],
    auth: {
      username: (proxy.split('@')[0]).split(':')[0],
      password: (proxy.split('@')[0]).split(':')[1]
    }
}

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
router.get("/file", async (req, res) => {
    try {
        try {
            if (config.detect_ip == false || config.access_ip.includes(req.ipInfo.ip)) {
                const download_url = req.query.download_url;
                const account = req.query.account;
                const password = req.query.password;

                const pngtree = new APIpngtree({
                    account, password, download_url,proxyConfig
                });
        
               await pngtree.start();
        
                const allFile = await pngtree.getFile();
                
                res.status(200).json({
                success: true,
                message: `Success`,
                data: allFile
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
router.get("/download", async (req, res) => {
    try {
        try {
            if (config.detect_ip == false || config.access_ip.includes(req.ipInfo.ip)) {
                //const { account, password, download_url } = req.query; console.log(account);
                const download_url = req.query.download_url;
                const account = req.query.account;
                const password = req.query.password;
                const href = req.query.href;
                // const account = "daithinh.uit@gmail.com";
                // const password = "quocdai1230";
                // const download_url = "https://pngtree.com/freepng/multilayer---background-blue-hexagons_1663565.html";
                // const href = "/element/down?id=MTY2MzU2NQ==&type=2&time=1661754043&token=ZWVjODUxMTM0Y2QwNTkyN2M3NjUxNWQ2ZWE5MzIyYjU=";

                const pngtree = new APIpngtree({
                    account, password, download_url, href
                });
        
               await pngtree.start();
        
                const downl = await pngtree.downloadFile(); console.log(downl,"downl");
                if(downl.status==3){
                    const downl1 = await pngtree.giaicaptcha();
                    console.log(downl1,"downl1");
                    res.status(200).json({
                        success: true,
                        message: `Success`,
                        ...downl1
                    });
                }else{
                    res.status(200).json({
                        success: true,
                        message: `Success`,
                        ...downl
                        });
                }
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
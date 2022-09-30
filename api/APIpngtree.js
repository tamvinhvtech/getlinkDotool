const BPromise = require('bluebird');
const { resolve, reject } = require('bluebird');
const axios = require('axios');
const md5 = require('md5');
const fs = require('fs').promises;
const path = require('path');
const db = require(path.normalize(__dirname + '/./database'));
const stream = require('stream');
const puppeteer = require('puppeteer-extra');
const HttpsProxyAgent = require("https-proxy-agent");
require('dotenv').config();
const cheerio = require('cheerio');
const request= require("request-promise-native");
const poll= require("promise-poller").default;

const convertCookieArrayToRaw = (array) => {
    var final = '';
  
    array.forEach(element => {
        final += `${element['name']}=${element['value']}; `
    });
  
    return final;
  }
class APIpikbest {
    constructor(extra_options = {}) {
        try {
            let { account, password, download_url, href } = extra_options;
            this.account = account || '';
            this.password = password || '';
            this.href = href || '';
            this.currentCookie = '';
            this.Stream = new stream.Stream();
            this.db = db;
            this.download_url = download_url || '';
        } catch (e) {
            throw e;
        }
    }
    addAccount2db() {
        return new Promise((resolve, reject) => {
            let query = 'INSERT INTO account(account, password, type) VALUES(?, ?, ?)';
            let queryData = [this.account, '','pngtree'];
            this.db.query(query, queryData, (err, insertResults) => {
              if (err) {
                reject(err);
              } else {
                if (insertResults.affectedRows == 1) {
                  resolve();
                } else {
                  reject(new Error('Can not insert account'));
                }
              }
            });
        });
    }
    init() {
        return new Promise((resolve, reject) => {
            this.Stream.emit('log', `${this.account} | Dang khoi tao`);
            if (this.account.length == 0 || this.password.length == 0) {
                reject(new Error('Mat khau hoac ten dang nhap khong de trong'));
            } else {
                this.db.query('SELECT cookies FROM account WHERE account = ? and type = "pngtree"', [this.account], async (err, itemAccount) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (itemAccount == undefined || (itemAccount || []).length == 0) {
                            // reject(new Error('Can not find bank in database'));
                            try {
                                await this.addAccount2db();
                            } catch (e) {
                                reject(e);
                            }
                        } else {
                            this.lastinfo = itemAccount[0].cookies;
                        }

                        let need2_init_new = false;
                        try {
                            if (this.lastinfo.length > 1) {
                                this.currentCookie = this.lastinfo;
                                this.Stream.emit('log', `${this.account} | Loaded last data`);
                            } else {
                                need2_init_new = true;
                            }
                        } catch (e) {
                            need2_init_new = true;
                        } finally {
                            
                            if (need2_init_new) {
                                this.socket_connected = true;
                                this.mySocket = {id: ""};
                                this.Stream.emit('log', `${this.account} | pikbest inited successful`);
                                resolve();
                            } else {
                                this.Stream.emit('log', `${this.accout} | pikbest inited successful`);
                                resolve();
                            }
                        }
                    }
                });   
            }
        });
    }
    is_logged() {
        return new Promise(async (resolve, reject) => {
            try {
                if(this.currentCookie=="" || this.currentCookie==undefined){
                    console.log("Session da het han, dang login lai");
                    await this.login();
                    resolve(true);
                }else{
                    const have_cookie = await this.checkCookie();
                    if (have_cookie) { console.log("Session ok");
                        resolve(true);
                    } else {
                        console.log("Session da het han, dang login lai");
                        await this.login();
                        resolve(true);
                    }
                }
            } catch (e) {
                reject(e);
            }
        });
    }
    start() {
        return new Promise(async (resolve, reject) => {
            try {
                await this.init();
                
                const have_logged = await this.is_logged();
                if (have_logged) {
                    resolve();
                } else {
                    reject(new Error('Login loi...'));
                }
            } catch (e) {
                reject(e);
            }
        });
    }
    checkCookie(){
        return new Promise(async (resolve, reject) => {
            try {
                this.db.query('SELECT update_at FROM account WHERE account = ? and type = "pngtree"', [this.account], async (err, itemAccount) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (itemAccount != undefined || (itemAccount || []).length > 0) {
                            var today = new Date();
                            var ONE_DAY = 60 * 60 * 1000;
                            var date2_ms = today.getTime();
                            var date1_ms = new Date(itemAccount[0].update_at).getTime();
                            var difference_ms = Math.abs(date1_ms - date2_ms);
                            var d=Math.round(difference_ms/ONE_DAY);
                            //console.log(d);
                            if(d>=2){
                                resolve(false);
                            }else{
                                resolve(true);
                            }
                        }
                    }
                });
                
            }catch (e) {
                reject(e);
            }
        })
        // return new Promise(async (resolve, reject) => {
        //     try {
        //         //const id = (this.download_url.split('_')[1]).split('.html')[0];
        //         var FormData = require('form-data');
        //         var data = new FormData();

        //         var configUrlId = {
        //         method: 'get',
        //         url: this.download_url,
        //         headers: { 
        //             'authority': 'pngtree.com', 
        //             'accept': 'application/json, text/javascript, */*; q=0.01', 
        //             'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5', 
        //             'cookie': (this.currentCookie), 
        //             'referer': 'https://pngtree', 
        //             'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"', 
        //             'sec-ch-ua-mobile': '?0', 
        //             'sec-ch-ua-platform': '"Windows"', 
        //             'sec-fetch-dest': 'empty', 
        //             'sec-fetch-mode': 'cors', 
        //             'sec-fetch-site': 'same-origin', 
        //             'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.84 Safari/537.36', 
        //             'x-requested-with': 'XMLHttpRequest',
        //             ...data.getHeaders()
        //         },
        //         httpsAgent: new HttpsProxyAgent(process.env.HTTPPROXY),
        //         data : data
        //         };
        //         axios(configUrlId)
        //         .then(function (response) {

        //             const html = response.data; 
        //             const $ = cheerio.load(html);
        //             let button = [];
        //             $('.detail-down-btn-wrap').each((i, elem) => {
        //                 button.push({
        //                     href: $(elem).find('a.Button').attr('href')
        //                 })
        //             });
        //             console.log(button);
        //             if(button.length==0){
        //                 resolve(false);
        //             }else resolve(button);
        //         })
        //         .catch(function (error) {reject(error);
        //         });
                
        //     }catch (e) {
        //         reject(e);
        //     }
        // })
    }
    login() {
        return new Promise(async (resolve, reject) => {
            try {
                const browser = await puppeteer.launch({headless: false});
                const page = await browser.newPage();
                await page.setViewport({width: 1300, height: 720});
                await page.goto('https://pngtree.com/'); // wait until page load

                let textContent = await page.$('#base-public-login');
                await textContent.evaluate((el) => el.style.display = 'block');
                // click and wait for navigation
                await page.type('#base-public-login-email-text', "daithinh.uit@gmail.com");
                await page.type('#base-public-login-password-text', "quocdai1230");
                await Promise.all([
                page.click('#base-sub-Login-Btn'),
                page.waitForNavigation({ waitUntil: 'networkidle0' }),
                ]);
                var cookies = await (page.cookies());
                this.currentCookie = convertCookieArrayToRaw(cookies);
                fs.writeFile('cookiePngtree.json', (JSON.stringify(cookies, null, 2)));
                
                resolve(this.currentCookie);
                await this.close_socket();
                await this.updateCookies2DB();
                await this.updateLoginStatus(1);

                // const have_cookie = await this.checkCookie(); console.log(have_cookie,"have_cookie");
                // if (have_cookie) {console.log("login");
                //     resolve(this.currentCookie);
                //     await this.close_socket();
                //     await this.updateCookies2DB();
                //     await this.updateLoginStatus(1);
                // } else {console.log("login fail");
                //     await this.updateLoginStatus(6);
                //     reject(new Error(`Login fail`));
                // }

            } catch (e) {
                reject(e);
            }
            
        });
    }
    updateCookies2DB() {
        return new Promise((resolve, reject) => {
            this.Stream.emit('log', `${this.account} | Updaing cookies`);
            let query = 'UPDATE account SET update_at = CURRENT_TIMESTAMP, cookies = ? WHERE account = ? and type="pngtree"';
            // let now_logged_data = {
            //     pair: this.DigitalSCryptor.pair,
            //     mySocket: {id: this.mySocket.id},
            //     currentCookie: this.currentCookie
            // }
            let queryData = [this.currentCookie, this.account];
            this.db.query(query, queryData, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.changedRows == 1) {
                        this.Stream.emit('log', `${this.account} | Cookies has been updated`);
                        resolve(true);
                    } else {
                        reject(new Error(`Upate cookies faild: account: ${this.account}`));
                    }
                }
            });
        });
    }
    updateLoginStatus(loginStt) {
        return new Promise((resolve, reject) => {
            this.loginStt = loginStt;
            // "0": "Chưa login",
            // "1": "Login thành công",
            // "2": "Login thất bại",
            // "3": "Sai mật khẩu",
            // "4": "Sai tên đăng nhập",
            // "5": "Sai captcha",
            // "6": "Lỗi chưa xác định"
            this.Stream.emit('log', `${this.account} | Updating login status`);
            let query = 'UPDATE account SET update_at = CURRENT_TIMESTAMP, loginStatus = ? WHERE account = ? and type="pngtree"';
            const lastLoginInfomation = this.password;
            let queryData = [loginStt.toString(), this.account]
            this.db.query(query, queryData, (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.changedRows == 1) {
                        this.Stream.emit('log', `${this.account} | Login status has been updated`);
                        resolve(true);
                    } else {
                        if (loginStt == 1) {
                            resolve(true);
                        } else {
                            reject(new Error(`Upate account faild: username: ${this.account} `));
                        }
                    }
                }
            });

        });
    }
    close_socket() {
        return new Promise((resolve, reject) => {
            try {
                if (this.mySocket != undefined && this.mySocket['disconnect'] != undefined) {
                    const mysocket_id = (this.mySocket || {}).id;
                    this.mySocket.disconnect();
                    this.mySocket = {id:mysocket_id};
                    resolve();
                } else {
                    resolve();
                }
            } catch (e) {
                reject(e);
            }
        });
    }
    getFile(){
        return new Promise(async (resolve, reject) => {
            try {
                const id = (this.download_url.split('_')[1]).split('.html')[0];

                var configUrlId = {
                method: 'get',
                url: this.download_url,
                headers: { 
                    'authority': 'pngtree.com', 
                    'accept': 'application/json, text/javascript, */*; q=0.01', 
                    'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5', 
                    'cookie': (this.currentCookie), 
                    'referer': 'https://pngtree', 
                    'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"', 
                    'sec-ch-ua-mobile': '?0', 
                    'sec-ch-ua-platform': '"Windows"', 
                    'sec-fetch-dest': 'empty', 
                    'sec-fetch-mode': 'cors', 
                    'sec-fetch-site': 'same-origin', 
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.84 Safari/537.36', 
                    'x-requested-with': 'XMLHttpRequest'
                },
                httpsAgent: new HttpsProxyAgent(process.env.HTTPPROXY),
                };

                const responseToken = await axios(configUrlId).then((response) => response)
                .catch(function (error) {
                    reject(error);
                });
                if(responseToken.status==200){
                    const html = responseToken.data;
                    const $ = cheerio.load(html);
                    let data = [];

                    $('.detail-down-btn-wrap').each((i, elem) => {
                        data.push({
                          href: $(elem).find('a.Button').attr('href'),
                          text: $(elem).find('a.Button').text()
                        })
                    });
                    if(data.length>0){
                        resolve(data);
                    }else reject("error");
                }else{
                    reject(new Error(`Get token fail`));
                }
            } catch (e) {
                reject(e);
            }
        });
    }
    giaicaptcha(){
        const config={
            sitekey: '6Lc79XgUAAAAAEL_OgTHFi2ImESMTRFD-T_veRIV',
            pageurl : 'https://pngtree.com'+this.href,
            apikey: 'a6d6d074798780a8fbd672d00a1b1e3e',
            apiSubmitUrl: 'http://2captcha.com/in.php',
            apiRetrieveUrl: 'http://2captcha.com/res.php',
        }
        return new Promise(async (resolve, reject) => {
            const loadCookie = async (page) => {
                const cookieJson = await fs.readFile('cookiePngtree.json');
                const cookies = JSON.parse(cookieJson);
                await page.setCookie(...cookies);
            }
            const chromeOptions = {
                headless:false,
                defaultViewport: null,
                slowMo:10,
            };
            const browser = await puppeteer.launch(chromeOptions);
            const page = await browser.newPage();
            await loadCookie(page); //load cookie
            await page.goto(config.pageurl);

            const requestId = await initiateCaptchaRequest(config.apikey);    

            const response = await pollForRequestResults(config.apikey, requestId);
            console.log(`Entering reacptcha response ${response}`);
            if(response!=""){
                const result= await this.downloadFileGcaptcha(response);
                resolve(result);
            }

            // try {
            //     const id = (this.download_url.split('_')[1]).split('.html')[0];
            //     const type = (this.href.split('&type=')[1]).split('&time=')[0];
            //     const time = (this.href.split('&time=')[1]).split('&token=')[0];
            //     const token = this.href.split('&token=')[1];
            //     var data = `_csrf=${md5(Math.random())}&id=${id}&type=2&t=1&cp=0&token=${token}&time=${time}&down_file_code=${response}&code_version=v2`;
        
            //     const urlGet='https://ajax.pngtree.com/api/down/down-file?r=' + Math.random();
            //     var configDownload = {
            //     method: 'post',
            //     url: urlGet,
            //     headers: { 
            //         'authority': 'ajax.pngtree.com', 
            //         'accept': 'application/json, text/javascript, */*; q=0.01', 
            //         'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5', 
            //         'content-type': 'application/x-www-form-urlencoded; charset=UTF-8', 
            //         'cookie': this.currentCookie, 
            //         'origin': 'https://pngtree.com', 
            //         'referer': 'https://pngtree.com/', 
            //         'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"', 
            //         'sec-ch-ua-mobile': '?0', 
            //         'sec-ch-ua-platform': '"Windows"', 
            //         'sec-fetch-dest': 'empty', 
            //         'sec-fetch-mode': 'cors', 
            //         'sec-fetch-site': 'same-site', 
            //         'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.84 Safari/537.36'
            //     },
            //     httpsAgent: new HttpsProxyAgent(process.env.HTTPPROXY),
            //     data : data
            //     };
            //     //console.log(configDownload);
            //     await axios(configDownload)
            //         .then(function (response) {
            //             if(response.data.status==200){
            //                 resolve(response.data);
            //             }else if(response.data.status==404){
            //                 resolve(response.data);
            //             }else
            //             resolve(response.data);
                        
            //             console.log(response.data);
            //         })
            //         .catch(function (error) {
            //             reject(error);
            //         });
            // } catch (e) {
            //     reject(e);
            // }
        
        });

        async function initiateCaptchaRequest(apikey){
            const formData = {
                method: 'userrecaptcha',
                googlekey: config.sitekey,
                key: apikey,
                pageurl: config.pageurl,
                json: 1
            }
            console.log(`submitting solution request to 2captcha for ${config.pageurl}`);
            const response = await request.post(config.apiSubmitUrl,{form: formData});
            return JSON.parse(response).request;
        }
        const timeout = millis => new Promise(resolve => setTimeout(resolve, millis));
        async function pollForRequestResults(
            key, 
            id, 
            retries = 30, 
            interval = 1500, 
            delay = 15000
          ) {
            //await timeout(delay);
            await new Promise(resolve => setTimeout(resolve, delay));
            return poll({
              taskFn: requestCaptchaResults(key, id),
              interval,
              retries
            });
          }
          function requestCaptchaResults(apiKey, requestId) {
            const url = `http://2captcha.com/res.php?key=${apiKey}&action=get&id=${requestId}&json=1`;
            return async function() {
              return new Promise(async function(resolve, reject){
                const rawResponse = await request.get(url);
                const resp = JSON.parse(rawResponse);
                if (resp.status === 0) return reject(resp.request);
                resolve(resp.request);
              });
            }
          }
    }
    captcharUnlock(){
        return new Promise(async (resolve, reject) => {
            var data = JSON.stringify({
                "clientKey": "48a787d641a147089f05a0851b66aec9",
                "task": {
                  "type": "RecaptchaV3TaskProxyless",
                  "websiteURL": this.href,
                  "websiteKey": "6LfJlHwUAAAAAM_ntRNed0h50UGsaT4RsWa4Q7ds",
                  "minScore": 0.3,
                  "pageAction": "verify",
                  "isEnterprise": false
                }
              });
              
              var config = {
                method: 'post',
                url: 'https://api.anycaptcha.com/createTask',
                headers: { 
                  'Content-Type': 'application/json'
                },
                data : data
              };
              
              const taskID = await this.getTaskId(config);
              console.log(taskID);
              var data1 = JSON.stringify({
                "clientKey": "48a787d641a147089f05a0851b66aec9",
                "taskId": `${taskID}`
              }); console.log(data1,"data");
              
              var config1 = {
                method: 'post',
                url: 'https://api.anycaptcha.com/getTaskResult',
                headers: { 
                  'Content-Type': 'application/json'
                },
                data : data1
              };
              const gRecaptchaResponse = await this.getgRecaptchaResponse(config1);
              
              if(gRecaptchaResponse!=null){
                this.downloadFileGcaptcha(gRecaptchaResponse);
              }
        })
    }
    getTaskId(config){
        return new Promise(async (resolve, reject) => {
            await axios(config)
            .then(async function (response) {
                  console.log(JSON.stringify(response.data.taskId));
                  resolve(response.data.taskId);
            }).catch(function (error) {
                reject(error);
            });
        })
    }
    getgRecaptchaResponse(config1){
        return new Promise(async (resolve, reject) => {
            await axios(config1)
              .then(function (response) {
                console.log(JSON.stringify(response.data));
                if(response.data.solution!=null){
                    resolve(response.data.solution.gRecaptchaResponse);
                }else{
                    //this.getgRecaptchaResponse(config1);
                }
              })
              .catch(function (error) {
                console.log(error);
              });
        })
    }
    downloadFile(){
        return new Promise(async (resolve, reject) => {
            try {
                //const giaicaptcha=this.giaicaptcha();
                const id = (this.download_url.split('_')[1]).split('.html')[0];
                const type = (this.href.split('&type=')[1]).split('&time=')[0];
                const time = (this.href.split('&time=')[1]).split('&token=')[0];
                const token = this.href.split('&token=')[1];
                var data = `_csrf=${md5(Math.random())}&id=${id}&type=${type}&t=1&cp=0&token=${token}&time=${time}`;

                const urlGet='https://ajax.pngtree.com/api/down/down-file?r=' + Math.random();
                var configDownload = {
                method: 'post',
                url: urlGet,
                headers: { 
                    'authority': 'ajax.pngtree.com', 
                    'accept': 'application/json, text/javascript, */*; q=0.01', 
                    'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5', 
                    'cookie': (this.currentCookie), 
                    'origin': 'https://pngtree.com', 
                    'referer': 'https://pngtree.com/', 
                    'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"', 
                    'sec-ch-ua-mobile': '?0', 
                    'sec-ch-ua-platform': '"Windows"', 
                    'sec-fetch-dest': 'empty', 
                    'sec-fetch-mode': 'cors', 
                    'sec-fetch-site': 'same-site', 
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.84 Safari/537.36', 
                    'x-requested-with': 'XMLHttpRequest'
                },
                httpsAgent: new HttpsProxyAgent(process.env.HTTPPROXY),
                data : data
                };
                await axios(configDownload)
                    .then(async function (response) {
                        
                        if(response.data.status==200){
                            resolve(response.data);console.log(JSON.stringify(response.data),"A");
                        }else if(response.data.status==3){
                            resolve(response.data);
                        }else if(response.data.status==404){
                            resolve(response.data);
                        }else
                        reject(response.data);
                    })
                    .catch(function (error) {
                        reject(error);
                    });
            } catch (e) {
                reject(e);
            }
        });
    }
    downloadFileGcaptcha(captcha){
        return new Promise(async (resolve, reject) => {
            try {
                //const giaicaptcha=this.giaicaptcha();
                const id = (this.download_url.split('_')[1]).split('.html')[0];
                const type = (this.href.split('&type=')[1]).split('&time=')[0];
                const time = (this.href.split('&time=')[1]).split('&token=')[0];
                const token = this.href.split('&token=')[1];
                var data = `_csrf=${md5(Math.random())}&id=${id}&type=${type}&t=1&cp=0&token=${token}&time=${time}&down_file_code=${captcha}&code_version=v2`;

                const urlGet='https://ajax.pngtree.com/api/down/down-file?r=' + Math.random();
                var configDownload = {
                method: 'post',
                url: urlGet,
                headers: { 
                    'authority': 'ajax.pngtree.com', 
                    'accept': 'application/json, text/javascript, */*; q=0.01', 
                    'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5', 
                    'cookie': (this.currentCookie), 
                    'origin': 'https://pngtree.com', 
                    'referer': 'https://pngtree.com/', 
                    'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"', 
                    'sec-ch-ua-mobile': '?0', 
                    'sec-ch-ua-platform': '"Windows"', 
                    'sec-fetch-dest': 'empty', 
                    'sec-fetch-mode': 'cors', 
                    'sec-fetch-site': 'same-site', 
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.84 Safari/537.36', 
                    'x-requested-with': 'XMLHttpRequest'
                },
                httpsAgent: new HttpsProxyAgent(process.env.HTTPPROXY),
                data : data
                };
                await axios(configDownload)
                    .then(async function (response) {
                        console.log(JSON.stringify(response.data),"A");
                        if(response.data.status==200){
                            resolve(response.data);
                        }else if(response.data.status==3){
                            resolve(response.data);
                        }else if(response.data.status==404){
                            resolve(response.data);
                        }else
                        reject(response.data);
                    })
                    .catch(function (error) {
                        reject(error);
                    });
            } catch (e) {
                reject(e);
            }
        });
    }
    
}
module.exports = APIpikbest;
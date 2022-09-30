const BPromise = require('bluebird');
const { resolve, reject } = require('bluebird');
const axios = require('axios');
const md5 = require('md5');
var fs = require('fs');
const path = require('path');
const db = require(path.normalize(__dirname + '/./database'));
const stream = require('stream');
const cheerio = require('cheerio');

class APIpikbest {
    constructor(extra_options = {}) {
        try {
            let { account, password, download_url } = extra_options;
            this.account = account || '';
            this.password = password || '';
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
            let queryData = [this.account, '','pikbest'];
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
                this.db.query('SELECT cookies FROM account WHERE account = ? and type = "pikbest"', [this.account], async (err, itemAccount) => {
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
                if(this.currentCookie!="" && this.currentCookie!=undefined){
                    const have_cookie = await this.checkCookie(); //console.log(have_cookie);
                    if (have_cookie) {
                        resolve(true);
                    } else {
                        await this.login();
                        resolve(true);
                    }
                   
                }else{console.log("B");
                    //this.Stream.emit('log', `${this.account} | Session da het han, dang login lai`);
                    resolve(true);
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
                const id = (this.download_url.split('_')[1]).split('.html')[0];
                var FormData = require('form-data');
                var data = new FormData();

                var configUrlId = {
                method: 'get',
                url: 'https://pikbest.com/?m=download&id='+id+'&flag=1&free_zone=0',
                headers: { 
                    'authority': 'pikbest.com', 
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9', 
                    'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5', 
                    'cache-control': 'max-age=0', 
                    'cookie': (this.currentCookie)+' affiliate_id_7794675=0; bind_account_7794675=EMAIL; bt_guid=e212c7812ad3398567ad7957f8bc0c45; country=29eeb04d53afd13c6b7e3e41dbbfe1f1; create_time_7794675=1621312690; head_7794675=https%3A%2F%2Flh3.googleusercontent.com%2F-XdUIqdMkCWA%2FAAAAAAAAAAI%2FAAAAAAAAAAA%2F4252rscbv5M%2Fphoto.jpg; last_login_channel=email; pv:login:user:7794675:20220825=26; sign=email; user_basic_info_cookie=%7B%22traffic_source%22%3A%22SEO%22%2C%22traffic_source_specific%22%3A%22%22%2C%22country%22%3A%22%5Cu8d8a%5Cu5357%22%2C%22created_at%22%3A%222021-05-18+13%3A38%3A10%22%7D; user_source_remark=%7B%22traffic_source%22%3A%22MEDIA%22%2C%22country%22%3A%22%5Cu8d8a%5Cu5357%22%2C%22device%22%3A0%2C%22traffic_source_specific%22%3A%22pikbest.com%22%7D; user_time_7794675=ecyxJpjhcpmVhdGVfdGltZSI6IjE2MjEzMTI2OTAifQO0O0OO0O0O', 
                    'referer': this.download_url, 
                    'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"', 
                    'sec-ch-ua-mobile': '?0', 
                    'sec-ch-ua-platform': '"Windows"', 
                    'sec-fetch-dest': 'document', 
                    'sec-fetch-mode': 'navigate', 
                    'sec-fetch-site': 'same-origin', 
                    'sec-fetch-user': '?1', 
                    'upgrade-insecure-requests': '1', 
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.84 Safari/537.36', 
                    ...data.getHeaders()
                },
                data : data
                };

                axios(configUrlId)
                .then(function (response) {
                    const html = response.data;
                    const $ = cheerio.load(html);
                    //var result = $('script').map(&:text).select{ |s| s['var token'] };
                    var scripts = $('script').filter(function() {
                        return ($(this).html().indexOf('var token =') > -1);
                    });
                    const token = $(scripts[0]).html();
                    // const restoken = response.data.split("var token = '")[1];
                    // const token=restoken.split("';")[0];
                    if(token=="" || token==undefined){
                        resolve(false);
                    }else{
                        resolve(token);
                    }
                })
                .catch(function (error) {reject(error);
                });
            }catch (e) {
                reject(e);
            }
        })
    }
    login() {
        return new Promise(async (resolve, reject) => {
            try {
                var data = 'email='+this.account+'&password='+this.password+'&recaptcha=03ANYolqswS_RrkE407Kicj099uqjBhNlDJmN7e7SEmGx4aXuhv1kG-YITbJNjb_K5KumHfweYQEgDn9gmrqnLtRH2EFS3AaBDCXrFqk02YtX2xz313M3j5-Boqk_WG5o-Y0FEjWA9V-WRzpnDCkokCC6EhDVX_vrabOv_iRnmecz4s0okugNh3Ybg7JUXVzT-WEQyTOgeyWkbDBxxfonc7_Bz5X3YDp3kSemDIbiSRw3X0cu7VZ1rHm0pYTziNzHfKkUSWIm4OD_cG4eFIRU-eUYWCXuxdcL_qJ0GhlXvyvNbukdTiIE9cDFspyi32LiDrnpTIr7iUBqoKJbeRJnm2FFjnxRjPZmU_5gzEvxkjhuFKq3PY0ln0sbBp_zcmbRSj_voje2Y9rE-Drdox3idiO0QnjdZUFp24EX6uVbgRaXuZgtJv-xYbxuj9ZR2k7Lxlf5D7CxYN4vYXY1gdiqoX-bwaSiBOsug1Wl_jUSabzlpsUgirAYBCru7BY8ENxLj-QuBckjFrV3vphD1xhZW8i50VA_My2pW3BynXNb9LJVo8kRY-b8sLoD2amf710WFBAyZlR4NrFR8';

                var config = {
                    method: 'post',
                    url: 'https://pikbest.com/?m=login&a=login',
                    headers: { 
                        'authority': 'pikbest.com', 
                        'accept': 'application/json, text/javascript, */*; q=0.01', 
                        'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5', 
                        'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'origin': 'https://pikbest.com', 
                        'referer': 'https://pikbest.com/', 
                        'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"', 
                        'sec-ch-ua-mobile': '?0', 
                        'sec-ch-ua-platform': '"Windows"', 
                        'sec-fetch-dest': 'empty', 
                        'sec-fetch-mode': 'cors', 
                        'sec-fetch-site': 'same-origin', 
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.84 Safari/537.36', 
                        'x-requested-with': 'XMLHttpRequest'
                    },
                    data : data
                };

                const loginPikbbest = await axios(config).then((response) => response)
                .catch(function (error) {
                    reject(error);
                });
                if(loginPikbbest.status==200){
                    this.currentCookie = (loginPikbbest.headers['set-cookie'] || ['ssid=;']).map(item=>item.split(';')[0]).join('; ');
                    //console.log(this.currentCookie,"cookie");
                    resolve(loginPikbbest.data);
                    fs.writeFileSync('cookiePickbest.json', this.currentCookie);
                    await this.close_socket();
                    await this.updateCookies2DB();
                    await this.updateLoginStatus(1);
                }else{
                    this.Stream.emit('log', `${this.account} | Login fail response: ${JSON.stringify(loginPikbbest.data)}`);
                    await this.updateLoginStatus(6);
                    reject(new Error(`Login fail: ${loginPikbbest.data.message}`));
                }

            } catch (e) {
                reject(e);
            }
            
        });
    }
    updateCookies2DB() {
        return new Promise((resolve, reject) => {
            this.Stream.emit('log', `${this.account} | Updaing cookies`);
            let query = 'UPDATE account SET update_at = CURRENT_TIMESTAMP, cookies = ? WHERE account = ? and type="pikbest"';
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
                        reject(new Error(`Upate cookies faild: account: ${this.account} | accountNumber: ${this.accountNumber}`));
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
            let query = 'UPDATE account SET update_at = CURRENT_TIMESTAMP, loginStatus = ? WHERE account = ? and type="pikbest"';
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
                            reject(new Error(`Upate account faild: username: ${this.account}`));
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
                resolve();
            }
        });
    }
    downloadFile(){
        return new Promise(async (resolve, reject) => {
            try {
                var FormData = require('form-data');
                var data = new FormData();

                const id = (this.download_url.split('_')[1]).split('.html')[0];

                var configUrlId = {
                method: 'get',
                url: 'https://pikbest.com/?m=download&id='+id+'&flag=1&free_zone=0',
                headers: { 
                    'authority': 'pikbest.com', 
                    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9', 
                    'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5', 
                    'cache-control': 'max-age=0', 
                    'cookie': (this.currentCookie)+' affiliate_id_7794675=0; bind_account_7794675=EMAIL; bt_guid=e212c7812ad3398567ad7957f8bc0c45; country=29eeb04d53afd13c6b7e3e41dbbfe1f1; create_time_7794675=1621312690; head_7794675=https%3A%2F%2Flh3.googleusercontent.com%2F-XdUIqdMkCWA%2FAAAAAAAAAAI%2FAAAAAAAAAAA%2F4252rscbv5M%2Fphoto.jpg; last_login_channel=email; pv:login:user:7794675:20220825=26; sign=email; user_basic_info_cookie=%7B%22traffic_source%22%3A%22SEO%22%2C%22traffic_source_specific%22%3A%22%22%2C%22country%22%3A%22%5Cu8d8a%5Cu5357%22%2C%22created_at%22%3A%222021-05-18+13%3A38%3A10%22%7D; user_source_remark=%7B%22traffic_source%22%3A%22MEDIA%22%2C%22country%22%3A%22%5Cu8d8a%5Cu5357%22%2C%22device%22%3A0%2C%22traffic_source_specific%22%3A%22pikbest.com%22%7D; user_time_7794675=ecyxJpjhcpmVhdGVfdGltZSI6IjE2MjEzMTI2OTAifQO0O0OO0O0O', 
                    'referer': this.download_url, 
                    'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"', 
                    'sec-ch-ua-mobile': '?0', 
                    'sec-ch-ua-platform': '"Windows"', 
                    'sec-fetch-dest': 'document', 
                    'sec-fetch-mode': 'navigate', 
                    'sec-fetch-site': 'same-origin', 
                    'sec-fetch-user': '?1', 
                    'upgrade-insecure-requests': '1', 
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.84 Safari/537.36', 
                    ...data.getHeaders()
                },
                data : data
                };

                const responseToken = await axios(configUrlId).then((response) => response)
                .catch(function (error) {
                    reject(error);
                });
                if(responseToken.status==200){
                    const restoken = responseToken.data.split("var token = '")[1];
                    const token=restoken.split("';")[0];
                    console.log("token",token);
                    if(token=="" || token==undefined){
                        token=this.start();
                    }
                    var configDownload = {
                    method: 'get',
                    url: 'https://pikbest.com/?m=AjaxDownload&a=open&id='+id+'&__hash__='+token+'&flag=1&free_zone=0',
                    headers: { 
                        'authority': 'pikbest.com', 
                        'accept': 'application/json, text/javascript, */*; q=0.01', 
                        'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5', 
                        'cookie': (this.currentCookie)+' affiliate_id_7794675=0; bind_account_7794675=EMAIL; bt_guid=e212c7812ad3398567ad7957f8bc0c45; country=29eeb04d53afd13c6b7e3e41dbbfe1f1; create_time_7794675=1621312690; head_7794675=https%3A%2F%2Flh3.googleusercontent.com%2F-XdUIqdMkCWA%2FAAAAAAAAAAI%2FAAAAAAAAAAA%2F4252rscbv5M%2Fphoto.jpg; last_login_channel=email; pv:login:user:7794675:20220825=26; sign=email; user_basic_info_cookie=%7B%22traffic_source%22%3A%22SEO%22%2C%22traffic_source_specific%22%3A%22%22%2C%22country%22%3A%22%5Cu8d8a%5Cu5357%22%2C%22created_at%22%3A%222021-05-18+13%3A38%3A10%22%7D; user_source_remark=%7B%22traffic_source%22%3A%22MEDIA%22%2C%22country%22%3A%22%5Cu8d8a%5Cu5357%22%2C%22device%22%3A0%2C%22traffic_source_specific%22%3A%22pikbest.com%22%7D; user_time_7794675=ecyxJpjhcpmVhdGVfdGltZSI6IjE2MjEzMTI2OTAifQO0O0OO0O0O', 
                        'referer': 'https://pikbest.com/?m=download&id='+id+'&flag=1&free_zone=0', 
                        'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"', 
                        'sec-ch-ua-mobile': '?0', 
                        'sec-ch-ua-platform': '"Windows"', 
                        'sec-fetch-dest': 'empty', 
                        'sec-fetch-mode': 'cors', 
                        'sec-fetch-site': 'same-origin', 
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.84 Safari/537.36', 
                        'x-requested-with': 'XMLHttpRequest'
                    }
                    };
                    
                    await axios(configDownload)
                    .then(function (response) {
                        //console.log(JSON.stringify(response.data));
                        if(response.data.status==0){
                            this.pass_captcha();
                        }else
                        resolve(response.data);
                    })
                    .catch(function (error) {
                        reject(error);
                    });
                }else{
                    reject(new Error(`Get token fail`));
                }
            } catch (e) {
                reject(e);
            }
        });
    }
    pass_captcha(){
        return new Promise(async (resolve, reject) => {
            try {
                const id = (this.download_url.split('_')[1]).split('.html')[0];
                var config = {
                    method: 'get',
                    url: 'https://pikbest.com/?m=downVarify&a=verifyCaptcha&callback='+id,
                    headers: { 
                        'authority': 'pikbest.com', 
                        'accept': 'application/json, text/javascript, */*; q=0.01', 
                        'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5', 
                        'cookie': (this.currentCookie)+' affiliate_id_7794675=0; bind_account_7794675=EMAIL; bt_guid=e212c7812ad3398567ad7957f8bc0c45; country=29eeb04d53afd13c6b7e3e41dbbfe1f1; create_time_7794675=1621312690; head_7794675=https%3A%2F%2Flh3.googleusercontent.com%2F-XdUIqdMkCWA%2FAAAAAAAAAAI%2FAAAAAAAAAAA%2F4252rscbv5M%2Fphoto.jpg; last_login_channel=email; pv:login:user:7794675:20220825=26; sign=email; user_basic_info_cookie=%7B%22traffic_source%22%3A%22SEO%22%2C%22traffic_source_specific%22%3A%22%22%2C%22country%22%3A%22%5Cu8d8a%5Cu5357%22%2C%22created_at%22%3A%222021-05-18+13%3A38%3A10%22%7D; user_source_remark=%7B%22traffic_source%22%3A%22MEDIA%22%2C%22country%22%3A%22%5Cu8d8a%5Cu5357%22%2C%22device%22%3A0%2C%22traffic_source_specific%22%3A%22pikbest.com%22%7D; user_time_7794675=ecyxJpjhcpmVhdGVfdGltZSI6IjE2MjEzMTI2OTAifQO0O0OO0O0O',
                        'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"', 
                        'sec-ch-ua-mobile': '?0', 
                        'sec-ch-ua-platform': '"Windows"', 
                        'sec-fetch-dest': 'empty', 
                        'sec-fetch-mode': 'cors', 
                        'sec-fetch-site': 'same-origin', 
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.84 Safari/537.36', 
                        'x-requested-with': 'XMLHttpRequest'
                    }
                };
                await axios(config)
                .then((response) => response)
                .catch(function (error) {
                    reject(error);
                });

                var config1 = {
                    method: 'get',
                    url: 'https://pikbest.com/?m=AjaxDownload&a=verify&id='+id+'&flag=1&sp=0&free_zone=0',
                    headers: { 
                        'authority': 'pikbest.com', 
                        'accept': 'application/json, text/javascript, */*; q=0.01', 
                        'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5', 
                        'cookie': (this.currentCookie)+' affiliate_id_7794675=0; bind_account_7794675=EMAIL; bt_guid=e212c7812ad3398567ad7957f8bc0c45; country=29eeb04d53afd13c6b7e3e41dbbfe1f1; create_time_7794675=1621312690; head_7794675=https%3A%2F%2Flh3.googleusercontent.com%2F-XdUIqdMkCWA%2FAAAAAAAAAAI%2FAAAAAAAAAAA%2F4252rscbv5M%2Fphoto.jpg; last_login_channel=email; pv:login:user:7794675:20220825=26; sign=email; user_basic_info_cookie=%7B%22traffic_source%22%3A%22SEO%22%2C%22traffic_source_specific%22%3A%22%22%2C%22country%22%3A%22%5Cu8d8a%5Cu5357%22%2C%22created_at%22%3A%222021-05-18+13%3A38%3A10%22%7D; user_source_remark=%7B%22traffic_source%22%3A%22MEDIA%22%2C%22country%22%3A%22%5Cu8d8a%5Cu5357%22%2C%22device%22%3A0%2C%22traffic_source_specific%22%3A%22pikbest.com%22%7D; user_time_7794675=ecyxJpjhcpmVhdGVfdGltZSI6IjE2MjEzMTI2OTAifQO0O0OO0O0O', 
                        'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"', 
                        'sec-ch-ua-mobile': '?0', 
                        'sec-ch-ua-platform': '"Windows"', 
                        'sec-fetch-dest': 'empty', 
                        'sec-fetch-mode': 'cors', 
                        'sec-fetch-site': 'same-origin', 
                        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.5112.84 Safari/537.36', 
                        'x-requested-with': 'XMLHttpRequest'
                    }
                };
                const responseCheck = await axios(config1).then((response) => response)
                .catch(function (error) {
                    reject(error);
                });
                if(responseCheck.status==200){
                    this.downloadFile;
                }else{
                    reject(new Error(`Get token fail`));
                }
            }catch (e) {
                reject(e);
            }
        })
    }
}

module.exports = APIpikbest;
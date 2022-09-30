const express = require('express');
const app = express();
const axios = require('axios');
const md5 = require('md5');
const puppeteer = require('puppeteer');
const request = require('request');
var fs = require('fs');

const convertCookieArrayToRaw = (array) => {
    var final = '';

    array.forEach(element => {
        final += `${element}; `
    });

    return final;
}

app.get('/', async(req, res) => {
    var url='https://proxy-tc.58pic.com/58picrar/32/70/45/5bf7f1cebe974.zip?uid=1001&st=lJ1SwXo08Tii1jvMtrSvSg&e=1662948480&n=%E5%8D%83%E5%9B%BE%E7%BD%91-%E5%94%AF%E7%BE%8E%E7%BA%A2%E8%89%B2%E4%B8%AD%E7%A7%8B%E8%8A%82%E5%B1%95%E6%9D%BF%E8%83%8C%E6%99%AF.zip';
    request(url, function (error, response, body) {
    console.error('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
    console.log('body:', body); // Print the HTML for the Google homepage.
    });
})
app.get("/pikbest", async (res, req) =>{
    //const download_url = req.query.download_url;
    const download_url = "https://pikbest.com/templates/golden-and-luxury-wedding-invitation-card-design-with-bokeh_6296954.html";
    const account = 'daithinh.uit@gmail.com';
    const password = 'quocdai1230';

    const id = (download_url.split('_')[1]).split('.html')[0];
    
    var data = 'email='+account+'&password='+password+'&recaptcha=03ANYolqswS_RrkE407Kicj099uqjBhNlDJmN7e7SEmGx4aXuhv1kG-YITbJNjb_K5KumHfweYQEgDn9gmrqnLtRH2EFS3AaBDCXrFqk02YtX2xz313M3j5-Boqk_WG5o-Y0FEjWA9V-WRzpnDCkokCC6EhDVX_vrabOv_iRnmecz4s0okugNh3Ybg7JUXVzT-WEQyTOgeyWkbDBxxfonc7_Bz5X3YDp3kSemDIbiSRw3X0cu7VZ1rHm0pYTziNzHfKkUSWIm4OD_cG4eFIRU-eUYWCXuxdcL_qJ0GhlXvyvNbukdTiIE9cDFspyi32LiDrnpTIr7iUBqoKJbeRJnm2FFjnxRjPZmU_5gzEvxkjhuFKq3PY0ln0sbBp_zcmbRSj_voje2Y9rE-Drdox3idiO0QnjdZUFp24EX6uVbgRaXuZgtJv-xYbxuj9ZR2k7Lxlf5D7CxYN4vYXY1gdiqoX-bwaSiBOsug1Wl_jUSabzlpsUgirAYBCru7BY8ENxLj-QuBckjFrV3vphD1xhZW8i50VA_My2pW3BynXNb9LJVo8kRY-b8sLoD2amf710WFBAyZlR4NrFR8';

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

    const loginPikbbest = await axios(config)
    .then((response) => response)
    .catch(function (error) {
        return res.json({
            success: false,
            message: 'SERVER_ERROR',
            details: error.toString()
        })
    });
    if(loginPikbbest.status==200){
        //const cookieHeaders = loginPikbbest.headers['set-cookie']; 
        const cookieHeaders = (loginPikbbest.headers['set-cookie'] || ['ssid=;']).map(item=>item.split(';')[0]).join('; ');
        fs.writeFileSync('cookiePickbest.json', cookieHeaders);
        console.log((cookieHeaders));
        
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
            'cookie': (cookieHeaders)+' affiliate_id_7794675=0; bind_account_7794675=EMAIL; bt_guid=e212c7812ad3398567ad7957f8bc0c45; country=29eeb04d53afd13c6b7e3e41dbbfe1f1; create_time_7794675=1621312690; head_7794675=https%3A%2F%2Flh3.googleusercontent.com%2F-XdUIqdMkCWA%2FAAAAAAAAAAI%2FAAAAAAAAAAA%2F4252rscbv5M%2Fphoto.jpg; last_login_channel=email; pv:login:user:7794675:20220825=26; sign=email; user_basic_info_cookie=%7B%22traffic_source%22%3A%22SEO%22%2C%22traffic_source_specific%22%3A%22%22%2C%22country%22%3A%22%5Cu8d8a%5Cu5357%22%2C%22created_at%22%3A%222021-05-18+13%3A38%3A10%22%7D; user_source_remark=%7B%22traffic_source%22%3A%22MEDIA%22%2C%22country%22%3A%22%5Cu8d8a%5Cu5357%22%2C%22device%22%3A0%2C%22traffic_source_specific%22%3A%22pikbest.com%22%7D; user_time_7794675=ecyxJpjhcpmVhdGVfdGltZSI6IjE2MjEzMTI2OTAifQO0O0OO0O0O', 
            'referer': download_url, 
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
            const restoken = response.data.split("var token = '")[1];
            const token=restoken.split("';")[0];
            console.log(token);

            var configDownload = {
            method: 'get',
            url: 'https://pikbest.com/?m=AjaxDownload&a=open&id='+id+'&__hash__='+token+'&flag=1&free_zone=0',
            headers: { 
                'authority': 'pikbest.com', 
                'accept': 'application/json, text/javascript, */*; q=0.01', 
                'accept-language': 'vi-VN,vi;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5', 
                'cookie': (cookieHeaders)+' affiliate_id_7794675=0; bind_account_7794675=EMAIL; bt_guid=e212c7812ad3398567ad7957f8bc0c45; country=29eeb04d53afd13c6b7e3e41dbbfe1f1; create_time_7794675=1621312690; head_7794675=https%3A%2F%2Flh3.googleusercontent.com%2F-XdUIqdMkCWA%2FAAAAAAAAAAI%2FAAAAAAAAAAA%2F4252rscbv5M%2Fphoto.jpg; last_login_channel=email; pv:login:user:7794675:20220825=26; sign=email; user_basic_info_cookie=%7B%22traffic_source%22%3A%22SEO%22%2C%22traffic_source_specific%22%3A%22%22%2C%22country%22%3A%22%5Cu8d8a%5Cu5357%22%2C%22created_at%22%3A%222021-05-18+13%3A38%3A10%22%7D; user_source_remark=%7B%22traffic_source%22%3A%22MEDIA%22%2C%22country%22%3A%22%5Cu8d8a%5Cu5357%22%2C%22device%22%3A0%2C%22traffic_source_specific%22%3A%22pikbest.com%22%7D; user_time_7794675=ecyxJpjhcpmVhdGVfdGltZSI6IjE2MjEzMTI2OTAifQO0O0OO0O0O', 
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
            
            axios(configDownload)
            .then(function (response) {
            console.log(JSON.stringify(response.data));
            })
            .catch(function (error) {
            console.log(error);
            });
        })
        .catch(function (error) {
        console.log(error);
        });
    }else{
        return res.json({
            success: true,
            message: 'GETLINK_SUCCESS',
            data: loginPikbbest.amp_redirect_url
        })
    }
})
app.get("/pikbest-request", async (res, req) =>{
    //const download_url = req.query.download_url;
    const download_url = "https://pikbest.com/templates/wedding-invitation-card_6435868.html";
    const account = 'daithinh.uit@gmail.com';
    const password = 'quocdai1230';

    //const id = (download_url.split('_')[1]).split('.html')[0];
    const id='6253133';

    const headers = {
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
    };
    var options = {
        'method': 'POST',
        'url': 'https://pikbest.com/?m=login&a=login',
        'headers': headers,
        body: 'email='+account+'&password='+password+'&recaptcha=03ANYolqsWD81CPMYJxMgfdKz3zuIa3sJs1cYadLSFrHzXfmJpSax9o6f0yQwJjl8zjXbO8lkV5SJa8mg6B3iIToYnjD3eNIyFA0iAqh8JpMfn9jw0ovdsMtZs5OTMDhnWJ1kPlQ-NVRzmp4B-AaoXYbFzj1VQ4UdyOrsiVCqB1JeY2Mc7wx8CVcuaVCXbk4iAgiFN9K3QttSW-RU4Y0klsclWjC0px6KYUsh7gn9lZuSZlmLANwVweXsHlN2ynbQglpaBmomEdF4dYGLc4jPS1ivalwPrSjotz1XVijxEG7bkeh4jBV4La0o8EKVx9_8gg04nsyIkS0YaxjiWheBy56lMWQfOmABABDyPLO8udTsnz6sxHxqATKOug77N7-vKgQLnkEOPCplyKvq4GyxWtRojAk1lNchP-qFDospZTYuLqkLnz7gdMCCzADtTPbngHaauE4kBKBE1R5QtHH-nu-ye4boakdy0fQRNt19NtWTD5eUEWXiR-hXB6t38p45fE_iw53cmnRONuOh3LVPpw9F6ZL8-O1X6mBRejpEd_9vgy58SDBqyKcn0KOY6w2qPG_pUgowBHMSg'
    };
    await request(options, async function (error, response) {
        if (error) throw new Error(error);
        const res_data = JSON.parse(response.body);
        if(res_data.status==200){
            const cookiestr = (response.headers['set-cookie'] || ['ssid=;']).map(item=>item.split(';')[0]).join('; ');
            fs.writeFileSync('cookiePickbest.json', cookiestr);
            const headers1 = {
                'authority': 'pikbest.com',
                'accept': 'application/json, text/javascript, */*; q=0.01',
                'accept-language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
                'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
                'sec-ch-ua-mobile': '?0',
                'sec-ch-ua-platform': '"Windows"',
                'sec-fetch-dest': 'empty',
                'sec-fetch-mode': 'cors',
                'sec-fetch-site': 'same-origin',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'x-requested-with': 'XMLHttpRequest',
                'Cookie': (cookiestr)+' affiliate_id_7794675=0; bind_account_7794675=EMAIL; bt_guid=e212c7812ad3398567ad7957f8bc0c45; country=29eeb04d53afd13c6b7e3e41dbbfe1f1; create_time_7794675=1621312690; head_7794675=https%3A%2F%2Flh3.googleusercontent.com%2F-XdUIqdMkCWA%2FAAAAAAAAAAI%2FAAAAAAAAAAA%2F4252rscbv5M%2Fphoto.jpg; last_login_channel=email; pv:login:user:7794675:20220825=26; sign=email; user_basic_info_cookie=%7B%22traffic_source%22%3A%22SEO%22%2C%22traffic_source_specific%22%3A%22%22%2C%22country%22%3A%22%5Cu8d8a%5Cu5357%22%2C%22created_at%22%3A%222021-05-18+13%3A38%3A10%22%7D; user_source_remark=%7B%22traffic_source%22%3A%22MEDIA%22%2C%22country%22%3A%22%5Cu8d8a%5Cu5357%22%2C%22device%22%3A0%2C%22traffic_source_specific%22%3A%22pikbest.com%22%7D; user_time_7794675=ecyxJpjhcpmVhdGVfdGltZSI6IjE2MjEzMTI2OTAifQO0O0OO0O0O'
            };
            var options1 = {
                'method': 'GET',
                'url': 'https://pikbest.com/?m=download&id='+id+'&flag=1&free_zone=0',
                'headers': headers1
            };
            await request(options1, async function (error, response) {
                if (error) throw new Error(error);
                const restoken = response.body.split("var token = '")[1];
                const token=restoken.split("';")[0];
                console.log(token);

                const headers2={
                    'authority': 'pikbest.com',
                    'accept': 'application/json, text/javascript, */*; q=0.01',
                    'accept-language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
                    'referer': 'https://pikbest.com/?m=download&id='+id+'&flag=1',
                    'sec-ch-ua': '"Chromium";v="104", " Not A;Brand";v="99", "Google Chrome";v="104"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-origin',
                    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                    'x-requested-with': 'XMLHttpRequest',
                    'Cookie': (cookiestr)+' affiliate_id_7794675=0; bind_account_7794675=EMAIL; bt_guid=e212c7812ad3398567ad7957f8bc0c45; country=29eeb04d53afd13c6b7e3e41dbbfe1f1; create_time_7794675=1621312690; head_7794675=https%3A%2F%2Flh3.googleusercontent.com%2F-XdUIqdMkCWA%2FAAAAAAAAAAI%2FAAAAAAAAAAA%2F4252rscbv5M%2Fphoto.jpg; last_login_channel=email; pv:login:user:7794675:20220825=26; sign=email; user_basic_info_cookie=%7B%22traffic_source%22%3A%22SEO%22%2C%22traffic_source_specific%22%3A%22%22%2C%22country%22%3A%22%5Cu8d8a%5Cu5357%22%2C%22created_at%22%3A%222021-05-18+13%3A38%3A10%22%7D; user_source_remark=%7B%22traffic_source%22%3A%22MEDIA%22%2C%22country%22%3A%22%5Cu8d8a%5Cu5357%22%2C%22device%22%3A0%2C%22traffic_source_specific%22%3A%22pikbest.com%22%7D; user_time_7794675=ecyxJpjhcpmVhdGVfdGltZSI6IjE2MjEzMTI2OTAifQO0O0OO0O0O'
                }
                var options2 = {
                    'method': 'GET',
                    'url': 'https://pikbest.com/?m=AjaxDownload&a=open&id='+id+'&__hash__='+token+'&flag=1&free_zone=0',
                    'headers': headers2
                };

                await request(options2, async function (error, response) {
                    //console.log(options2);
                    console.log(response.body);
                    const res_data = JSON.parse(response.body);
                    if(res_data.status==0){
                        //pass_captcha(id, cookiestr);
                    }else{
                        console.log(res_data);
                    }
                })
            })
        }
    });
})
function pass_captcha(id,cookiestr){
    const file_download=''; console.log("cookie: "+cookiestr)
    const headers = {
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
        'x-requested-with': 'XMLHttpRequest',
        'Cookie': cookiestr+' affiliate_id_7794675=0; bind_account_7794675=EMAIL; bt_guid=e212c7812ad3398567ad7957f8bc0c45; country=29eeb04d53afd13c6b7e3e41dbbfe1f1; create_time_7794675=1621312690; head_7794675=https%3A%2F%2Flh3.googleusercontent.com%2F-XdUIqdMkCWA%2FAAAAAAAAAAI%2FAAAAAAAAAAA%2F4252rscbv5M%2Fphoto.jpg; last_login_channel=email; pv:login:user:7794675:20220825=26; sign=email; user_basic_info_cookie=%7B%22traffic_source%22%3A%22SEO%22%2C%22traffic_source_specific%22%3A%22%22%2C%22country%22%3A%22%5Cu8d8a%5Cu5357%22%2C%22created_at%22%3A%222021-05-18+13%3A38%3A10%22%7D; user_source_remark=%7B%22traffic_source%22%3A%22MEDIA%22%2C%22country%22%3A%22%5Cu8d8a%5Cu5357%22%2C%22device%22%3A0%2C%22traffic_source_specific%22%3A%22pikbest.com%22%7D; user_time_7794675=ecyxJpjhcpmVhdGVfdGltZSI6IjE2MjEzMTI2OTAifQO0O0OO0O0O'
    };

    var options = {
        'method': 'GET',
        'url': 'https://pikbest.com/?m=downVarify&a=verifyCaptcha&callback='+id,
        'headers': headers
    };

    request(options, function (error, response) {
        console.log(response.body,"B");
    })

    var options1 = {
        'method': 'GET',
        'url': 'https://pikbest.com/?m=AjaxDownload&a=verify&id='+id+'&flag=1&sp=0&free_zone=0',
        'headers': headers
    };
    request(options1, function (error, response) {
        //console.log(response.body,"C");
        const res_data = JSON.parse(response.body);
        if(res_data.status==200){
            var options2 = {
                'method': 'GET',
                'url': 'https://pikbest.com/?m=download&id='+id+'&flag=1&free_zone=0',
                'headers': headers
            };
            request(options2, function (error, response) {
                if (error) throw new Error(error);
                const restoken = response.body.split("var token = '")[1];
                const token=restoken.split("';")[0];
                const headers1 = {
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
                    'x-requested-with': 'XMLHttpRequest',
                    'Cookie': cookiestr+' affiliate_id_7794675=0; bind_account_7794675=EMAIL; bt_guid=e212c7812ad3398567ad7957f8bc0c45; country=29eeb04d53afd13c6b7e3e41dbbfe1f1; create_time_7794675=1621312690; head_7794675=https%3A%2F%2Flh3.googleusercontent.com%2F-XdUIqdMkCWA%2FAAAAAAAAAAI%2FAAAAAAAAAAA%2F4252rscbv5M%2Fphoto.jpg; last_login_channel=email; pv:login:user:7794675:20220825=26; sign=email; user_basic_info_cookie=%7B%22traffic_source%22%3A%22SEO%22%2C%22traffic_source_specific%22%3A%22%22%2C%22country%22%3A%22%5Cu8d8a%5Cu5357%22%2C%22created_at%22%3A%222021-05-18+13%3A38%3A10%22%7D; user_source_remark=%7B%22traffic_source%22%3A%22MEDIA%22%2C%22country%22%3A%22%5Cu8d8a%5Cu5357%22%2C%22device%22%3A0%2C%22traffic_source_specific%22%3A%22pikbest.com%22%7D; user_time_7794675=ecyxJpjhcpmVhdGVfdGltZSI6IjE2MjEzMTI2OTAifQO0O0OO0O0O'
                };

                var options3 = {
                    'method': 'GET',
                    'url': 'https://pikbest.com/?m=AjaxDownload&a=open&id='+id+'&__hash__='+token+'&flag=1&free_zone=0',
                    'headers': headers1
                };

                request(options3, function (error, response) {
                    const res_data = JSON.parse(response.body);
                    if(res_data.status==200){

                    }else{
                        console.log(res_data);
                    }
                })
            })
        }else{
            console.log("error");
        }
    })
}
app.listen(3001, () => {
    console.log('index.js dang chay tai port 3001')
});
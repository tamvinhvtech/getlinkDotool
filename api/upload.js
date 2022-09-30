require('dotenv').config();

const {google} = require('googleapis');
const fs = require('fs');
const path = require('path');
const request = require('request');

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;


const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials({refresh_token: REFRESH_TOKEN});

const drive = google.drive({
    version: 'v3',
    auth: oauth2Client
})

var that = module.exports = {
    setFilePublic: async(fileId) =>{
        try {
            await drive.permissions.create({
                fileId,
                requestBody: {
                    role: 'reader',
                    type: 'anyone'
                }
            })

            const getUrl = await drive.files.get({
                fileId,
                fields: 'webViewLink, webContentLink'
            })

            return getUrl;
        } catch (error) {
            console.error(error,"error");
        }
    },
    uploadFile: async ({shared}) => {
        try {
            const createFile = await drive.files.create({
                requestBody: {
                    name: "liverpool.jpg",
                    mimeType: 'image/jpg'
                },
                media: {
                    mimeType: 'image/jpg',
                    body: fs.createReadStream(path.join(__dirname, '/../images2208396_1.jpg'))
                }
            })
            const fileId = createFile.data.id;
            console.log(createFile.data)
            const getUrl = await that.setFilePublic(fileId);

            console.log(getUrl.data);

        } catch (error) {
            console.error(error);
        }
    },
    deleteFile: async (fileId) => {
        try {
            console.log('Delete File:::', fileId);
            const deleteFile = await drive.files.delete({
                fileId: fileId
            })
            console.log(deleteFile.data, deleteFile.status)
        } catch (error) {
            console.error(error);
        }
    },
    getFile: async(url) => {console.log(url);
        return new Promise(function(resolve, reject) {
          request(
            {
              method: "GET",
              url: url,
              encoding: null // <- this one is important !
            },
            function(error, response, body) { //console.log(response,"response");
                //console.log(body,"body");
              if (error && response.statusCode != 200) {
                reject(error);
                return;
              }
              resolve(body);
            }
          );
        });
    },
      
    uploadFileUrl: async(url) => {
        return new Promise(async function(resolve, reject) {
            const stream = require("stream"); // In this script, use this module
            const uri=encodeURI(url);
            await that.getFile(uri).then(body => {
                const bs = new stream.PassThrough();//https://proxy-tx.ibaotu.com/ibt/19/55/15/5f685c810cf87.zip?st=7ZINLUKqNAPEdBDHeVepzw&e=1662715135
                var arname= (url.split('?')[0]).split('/');
                const name = arname[arname.length - 1];
                bs.end(body);
                //const drive = google.drive({ version: "v3", auth });
                var fileMetadata = {
                name: name
                };
                var media = {
                    mimeType: "application/zip",
                    body: bs // Modified
                };
                drive.files.create(
                {
                    resource: fileMetadata,
                    media: media,
                    fields: "id"
                },
                async function(err, res) {
                    if (err) {
                        reject(err);
                        return;
                    } else {console.log("B");
                        const fileId = res.data.id;
                        const getUrl = await that.setFilePublic(fileId);
                        resolve(getUrl.data);
                        //console.log(getUrl.data,"A");
                    }
                }
                );
            });
        });
    }
}
import { REST } from '/DSA-webapps/dsa/restapi.mjs';
import { DSA_INSTANCE_URL } from '/DSA-webapps/config.mjs';

export class DigitalSlideArchiveAPI extends REST{
    constructor(baseurl='',apiurl='/api/v1'){
        console.log("DSA REST")
        super(baseurl+apiurl);
        let dsa = this;
        this.baseurl = baseurl;
        this.LoginSystem = new LoginSystem(this, baseurl);
        console.log("Created API");
        // this.LoginSystem.autologin;

        dsa.LinkedSVS = function(folderId, name, metadata){
            const formData = new FormData()
            formData.append('metadata',JSON.stringify(metadata));
            
            return dsa.post('item',{
                params:{
                    folderId:folderId,
                    name:name,
                },
                data:formData
            })
        }
        dsa.LinkedURL = function(folderId, name, url){
            const formData = new FormData()
            formData.append('metadata',JSON.stringify({type:'linked-url',url:url}));
            
            return dsa.post('item',{
                params:{
                    folderId:folderId,
                    name:name,
                },
                data:formData
            })
        }
        
        

        dsa.uploadFile = function(blob, params){
            //Require params in the following format:
            // {
            //    parentType:'folder' or 'item',
            //    parentId:'id_from_dsa',
            //    name: 'desired file name'
            // }
            if(['folder','item'].includes(params.parentType)===false){ error('params must in include "parentType" which must be "folder" or "item"'); return;}
            if(!params.parentId){ error('params must include "parentId"'); return;}
            if(!params.name){ error('params must include "name"'); return;}
            //TO DO: upload in chunks if over 100M in size 
            // const formData = new FormData();
            // formData.append('file',blob);
            return dsa.post('file',{
                data:blob,
                params:{
                    parentType:params.parentType,
                    parentId:params.parentId,
                    name:params.name,
                    size:blob.size,
                    mimeType:blob.type
                },
                headers:{
                    'Content-Type':blob.type,
                }
            });
        }

        dsa.updateFile = function(file, blob){
            return dsa.put(`file/${file._id}/contents`,{
                data:blob,
                params:{
                    size:blob.size,
                },
            });
        }


        function LinkedFile(){

        }

        dsa.utils = {
            statsxml2array:function(xml){
                let x = $(xml);
                let images = x.find('image').map((index,im)=>{
                    return $(im).children().toArray().reduce((o,n)=>{
                        o[n.nodeName]=n.textContent.trim();
                        return o;
                    }, {} );
                }).toArray();
                return images;
            }
        }

    }

}

class LoginSystem{
    constructor(dsa, baseurl=""){
        var loginScreen = $(this._loginHTML());
        this.baseurl = baseurl; 
        this.getLoginScreen = function(){return loginScreen;}
        this.login = function(){
            var str = btoa($('#username').val() + ':' + $('#password').val());
            loginScreen.removeClass('login-error')
            return dsa.setbasicauth(str).get('user/authentication').then(_onlogin).catch(d=>{
                loginScreen.removeClass('logged-in').addClass('login-error');
            });
        }
        this.logout = function(){
            dsa.delete('user/authentication').then(function(){
                dsa.setbasicauth(null).settoken(null);
                loginScreen.removeClass('logged-in');
                window.localStorage.removeItem('dsa-auth');
            }).catch(function(d){
                console.log('Error logging out',d)
            })
            
        }
        this.autologin = async function(){
            console.log("autologin");


            let cookie=document.cookie.split(';').filter(function(c){return c.trim().startsWith('girderToken=')})[0];
            if(cookie){
                dsa.settoken(cookie.split('=')[1]);
            }

            const currentUrl = window.location.href;
            const queryString = currentUrl.split('#')[1];
            // Create a URLSearchParams object from the query string
            const params = new URLSearchParams(queryString);
            console.log('==============');
            console.log(params);
            const dsaValue = params.get('dsa') || DSA_INSTANCE_URL;
            console.log(dsaValue);


            if ((window.localStorage.getItem('dsa-auth') !== null) && (window.localStorage.getItem('dsa-url') == dsaValue)){
                let json= JSON.parse(window.localStorage.getItem('dsa-auth'));
                dsa.settoken(json.authToken && json.authToken.token);
            } else if (!dsa.gettoken() || (window.localStorage.getItem('dsa-url') != dsaValue)) {
                const response = await this.getOAuthRedirect();
                if (response['Microsoft']){
                    window.location.href = response['Microsoft'];
                }    
            }
            if(dsa.gettoken()){
                dsa.get('user/authentication').then(_onlogin).catch(e=>{
                    dsa.LoginSystem.getLoginScreen().trigger('login-failed');
                    dsa.LoginSystem.getLoginScreen().trigger('login-returned',[{success:false}]);
                });
            }
            
            
        }

        this.getOAuthRedirect = async function () {
            try {
                const currentUrl = window.location.href;
                const queryString = currentUrl.split('#')[1];
                // Create a URLSearchParams object from the query string
                const params = new URLSearchParams(queryString);
                const dsaValue = params.get('dsa') || DSA_INSTANCE_URL;
                
                const response = await fetch(`${dsaValue}/api/v1/oauth/provider?redirect=https://dsahub.ai.uky.edu/annotations#${queryString}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }
                window.localStorage.removeItem('dsa-auth');
                window.localStorage.setItem('dsa-url', dsaValue);
                const data = await response.json();
                return data; 
            } catch (error) {
                console.error('Error fetching data:', error);
                throw error; 
            }
        }

        loginScreen.find('#login-button').on('click',this.login);
        loginScreen.find('#logout-button').on('click',this.logout);
        loginScreen.find('#username,#password').on('keyup',function(ev){
            if(ev.which==13){loginScreen.find('#login-button').trigger('click'); }
        });

        function _onlogin(d){
            console.log("OnLogin called: ", d);
            dsa.settoken(d.authToken.token);
            loginScreen.addClass('logged-in');
            loginScreen.find('#firstname').text(d.user.firstName);
            loginScreen.find('#lastname').text(d.user.lastName);
            loginScreen.find('#loginname').text(d.user.login).attr('href',dsa.baseurl+'#useraccount/'+d.user._id+'/info');
            window.localStorage.setItem('dsa-auth',JSON.stringify(d));
            dsa.userinfo = d;
            dsa.LoginSystem.getLoginScreen().trigger('logged-in');
            dsa.LoginSystem.getLoginScreen().trigger('login-returned',[{success:true}]);
        }
    }
    
    
    _loginHTML(){
        return `
        <div id='dsa-login-screen'>
            <div class='dsa-intro'>Built using the <a href='${this.baseurl}' target='_blank'>Digital Slide Archive</a> engine.</div>
            <div class='right logged-out'>
                <input type='text' id='username' placeholder='Username'>
                <input type='password' id='password' placeholder='Password'>
                <button id='login-button'>Login</button>
            </div>
            <div class='right logged-in'>
                Welcome, <span id='firstname'></span> <span id='lastname'></span> (<a id='loginname' target='_blank'></a>) <button id='logout-button'>Log out</button>
            </div>
        </div>
        `
    }

    
    
};





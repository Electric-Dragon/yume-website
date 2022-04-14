require('dotenv').config();
const _supabase = require('@supabase/supabase-js');
const nAPI = require('./neo4jAPI');

const supabase = _supabase.createClient(process.env.API_URL, process.env.SERVICE_ROLE);

var SibApiV3Sdk = require('sib-api-v3-sdk');
SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = process.env.SENDINBLUE_API_KEY;

module.exports.signUp = async function signUp({email, password, username}) {

    return await supabase.auth.api.createUser({
        email: email,
        password: password,
        data: {
			username: username,
			premium: false,
		 	credits: 0,
			revenue: 0.00,
			creator: false}
      }).then(async ({user,error}) => {
        if (error) {
            return {error: error.message}
        } else {
            return await supabase.auth.api.generateLink(
                'invite',
                email
            ).then(async ({data, error}) => {
                if (error) {
                    return {error: error.message}
                } else {
                    return await supabase.from('public_profile').update(
                        { username: username})
                        .match({id: user.id}).then(async ({_data, error}) => {
                        if(error) {
                            return {error: error.message}
                        } else {
                            await nAPI.createUserNode(user.id, username);

                            return new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail(
                                  {
                                    'subject':'Verify your account for Yume!',
                                    'sender' : {'email':'site.yume@gmail.com', 'name':'Yume No reply'},
                                    'replyTo' : {'email':'site.yume@gmail.com', 'name':'Yume No reply'},
                                    'to' : [{'name': username, 'email': email}],
                                    'htmlContent' : '<html><body><h1>To verify your account for Yume, click this <a href="{{params.link}}">link</a>. </h1></body></html>',
                                    'params' : {'link':data.action_link}
                                  }
                                ).then(function(data) {
                                    console.log(data);
                                    return {success: true}
                                }, function(error) {
                                  console.error(error);
                                    return {error: error}
                                });

							// return {link: data.action_link}
						}
                    });                    
                }

            })
        }
        
      })

}

module.exports.createSeries = async function createSeries({id, genre1, genre2}) {

    return await supabase.from('series')
                         .select('title,cover,novel,adaptation,status,mature,creator')
                         .eq('id', id)
                         .then(async ({data, error}) => {
                                if (error) {
                                    return {error: error.message}
                                } else {

                                    let result = await nAPI.createSeriesNode({id, genre1, genre2},data[0]);
                                    return result

                                }
                         })

}

module.exports.followSeries = async function followSeries({id, access_token, follows}) {

    const {user, data, error} = await supabase.auth.api.getUser(access_token);
    if (error) {
        return {error: error.message}
    } else {
        follows = (follows === 'true');
        if (!follows) {
            let nRes = await nAPI.followSeries({seriesid: id, userid: user.id});
            if (nRes.error) {
                return {error: 'An error occured'}
            } else {
                const { data, error } = await supabase
                    .from('series_follows')
                    .insert([
                        { series: id, user: user.id }
                    ])
                if (error) {
                    return {error: error.message}
                } else {
                    return {success: true}
                }
            }
        } else {
            let nRes = await nAPI.unfollowSeries({seriesid: id, userid: user.id});
            if (nRes.error) {
                return {error: 'An error occured'}
            } else {
                const { data, error } = await supabase
                    .from('series_follows')
                    .delete()
                    .match({ series: id, user: user.id })
                if (error) {
                    return {error: error.message}
                } else {
                    return {success: true}
                }
            }
        }
    }

}

module.exports.readChapter = async function readChapter({id, access_token}) {

    const {user, data, error} = await supabase.auth.api.getUser(access_token);
    if (error) {
        return {error: error.message}
    } else {
        let nRes = await nAPI.readChapter({seriesid: id, userid: user.id});
        if (nRes.error) {
            return {error: 'An error occured'}
        } else {
            return {success: true}
        }
    }

}

module.exports.createAdaptation = async function createAdaptation({id, access_token}) {

    const {user, data, error} = await supabase.auth.api.getUser(access_token);
    if (error) {
        return {error: error.message}
    } else {

        const { data, error } = await supabase
            .from('adaptation_notifications')
            .select('id,series(id,title,summary,cover,novel,mature,genre1,genre2)')
            .eq('series', id)
            .eq('from', user.id)
            .eq('status','a')

        if (error) {
            return {error: error.message}
        } else {

            if (data.length === 0) {
                return {error: 'An error occured'}
            } else {

                let {id, series} = data[0];
                let {id:ogId, title, summary, cover, novel, mature, genre1, genre2} = series;

                let isNovel = novel ? false : true;

                const { data:seriesInfo, error } = await supabase
                .from('series')
                .insert([
                    { title: title, summary: summary, cover: cover, novel: isNovel, mature: mature, genre1: genre1, genre2: genre2, creator: user.id, adaptation: ogId }
                ])

                if (error) {
                    return {error: error.message}
                } else {

                    let response = await nAPI.createSeriesNode({id:seriesInfo[0].id, genre1: genre1, genre2: genre2},{title: title, summary: summary, cover: cover, novel: isNovel,adaptation: ogId, mature: mature, creator: user.id});

                    if (response.error) {
                        return response;
                    } else {
                        const { data, error } = await supabase
                            .from('adaptation_notifications')
                            .delete()
                            .match({ id: id })

                        if (error) {
                            return {error: error.message}
                        } else {
                            return {success: seriesInfo[0].id}
                        }
                    }

                }

            }

        }

    }

}
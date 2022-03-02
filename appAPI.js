require('dotenv').config();
const _supabase = require('@supabase/supabase-js');
const nAPI = require('./neo4jAPI');

const supabase = _supabase.createClient(process.env.API_URL, process.env.SERVICE_ROLE)

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
                    return await supabase.from('usernames').insert([
                        { id: username}
                    ]).then(async ({_data, error}) => {
                        if(error) {
                            return {error: error.message}
                        } else {
                            await nAPI.createUserNode(user.id, username);
							return {link: data.action_link}
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

                                    // console.log(data.length);
                                    // console.log(data[0]);

                                    let result = await nAPI.createSeriesNode({id, genre1, genre2},data[0]);
                                    // result = {success: true};
                                    return result

                                }
                         })

}

module.exports.likeChapter = async function likeChapter({id, access_token}) {

    const {user, data, error} = await supabase.auth.api.getUser(access_token);
    if (error) {
        return {error: error.message}
    } else {
        console.log(user.id);
    }

}

// (async () => {
//     console.log(await signUp({email: 'atharvawasekar@icloud.com',password: 'password',username:'atharvawasekar'}))
// })()
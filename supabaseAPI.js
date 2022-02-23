require('dotenv').config();
const _supabase = require('@supabase/supabase-js')

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
                    ]).then(({_data, error}) => {
                        if(error) {
                            return {error: error.message}
                        } else {
							return {link: data.action_link}
						}
                    });                    
                }

            })
        }
        
      })

}

// (async () => {
//     console.log(await signUp({email: 'atharvawasekar@icloud.com',password: 'password',username:'atharvawasekar'}))
// })()


// module.exports {
//     signUp
// }
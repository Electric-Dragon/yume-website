require('dotenv').config();
const _supabase = require('@supabase/supabase-js');
const nAPI = require('./neo4jAPI');

const supabase = _supabase.createClient(process.env.API_URL, process.env.SERVICE_ROLE);

var SibApiV3Sdk = require('sib-api-v3-sdk');
SibApiV3Sdk.ApiClient.instance.authentications['api-key'].apiKey = process.env.SENDINBLUE_API_KEY;

const stripe = require("stripe")(process.env.STRIPE_KEY);
const advertisingPriceID = process.env.ADVERTISING_PRICE_ID;

const endpointSecret = process.env.ENDPOINT_SECRET;

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

                            try {
                                const customer = await stripe.customers.create({
                                    email: email,
                                    metadata: {
                                        id: user.id
                                    }
                                });
                                const {data:stripeInfo, error:stripeInfoError} = await supabase.from('customers').insert([
                                    {
                                        id: user.id,
                                        stripe_customer_id: customer.id,
                                    }
                                ])
                                if (stripeInfoError) {
                                    console.log(stripeInfoError.message);
                                    return {error: stripeInfoError.message}
                                }
                            } catch (error) {
                                return {error: error}
                            }

                            return new SibApiV3Sdk.TransactionalEmailsApi().sendTransacEmail(
                                  {
                                    'subject':'Verify your account for Yume!',
                                    'sender' : {'email':'site.yume@gmail.com', 'name':'Yume No reply'},
                                    'replyTo' : {'email':'site.yume@gmail.com', 'name':'Yume No reply'},
                                    'to' : [{'name': username, 'email': email}],
                                    'htmlContent' : `<html><body><h1>To verify your account for Yume, click this <a href="{{params.link}}">link</a>. </h1> Link not working? <h3>Copy-paste this link in the browser: {{params.link}}<h3></body></html>`,
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
                        { target_series: id, user: user.id }
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

module.exports.getRecommendations = async function getRecommendations({access_token}) {

    const {user, data, error} = await supabase.auth.api.getUser(access_token);
    if (error) {
        return {error: error.message}
    } else {
        let nRes = await nAPI.getRecommendations({userid: user.id});
        if (nRes.error) {
            return {error: 'An error occured'}
        } else {
            return nRes
        }
    }

}

module.exports.createAdvertisement = async function createAdvertisement({id, access_token, startDate, endDate, numberOfDays, path}) {

    const {user, data, error} = await supabase.auth.api.getUser(access_token);
    if (error) {
        return {error: error.message}
    } else {

        startDate = new Date(startDate);
        endDate = new Date(endDate);

        const { data:createAd, error:createAdError } = await supabase
            .from('advertisements')
            .insert([
                { target_series: id, startDate: `${startDate.getFullYear()},${startDate.getMonth()+1},${startDate.getDate()}`, endDate: `${endDate.getFullYear()},${endDate.getMonth()+1},${endDate.getDate()}` }
            ])

        if (createAdError) {
            console.log(createAdError.message);
            return {error: createAdError.message}
        }

        let adID = createAd[0].id;

        let newPath = `${user.id}/${adID}/bannerIMG.jpg`;

        const { data:moveIMG, error:moveIMGError } = await supabase
            .storage
            .from('advertisements')
            .move(path, newPath)

        if (moveIMGError) {
            console.log(moveIMGError.message);
            return {error: moveIMGError.message, adID: adID}
        }
        
        const { publicURL, error:error_ } = supabase
            .storage
            .from('advertisements')
            .getPublicUrl(newPath);

        if (error_) {
            console.log(error_.message);
            return {error: error_.message, adID: adID}
        }

        const { data:updateAdInfo, error:updateAdInfoError } = await supabase
            .from('advertisements')
            .update({ bannerURL: publicURL })
            .match({ id: adID })

        if (updateAdInfoError) {
            console.log(updateAdInfoError.message);
            return {error: updateAdInfoError.message,adID: adID}
        }

        const paymentLink = await stripe.paymentLinks.create({
            line_items: [
              {
                price: advertisingPriceID,
                quantity: numberOfDays,
              },
            ],
            metadata: {
                adID: adID,
                userID: user.id,
            }
        });

        return {success: true, link: paymentLink.url, adID: adID}
        
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
            .eq('target_series', id)
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

module.exports.addFingerprint = async function addFingerprint({id, fingerprint}) {

    const { data:exists, error:existsError } = await supabase
    .from('chapter_reads')
    .select('id')
    .match({ chapterid: id, fingerprint: fingerprint });

    if (!existsError) {
        if (exists.length === 0) {
            const { data, error } = await supabase
            .from('chapter_reads')
            .insert([
                { chapterid: id, fingerprint: fingerprint }
            ]);
            if (error) {
                console.log(error.message);
            }
        }
    } else {
        console.log(existsError.message);
    }

};

module.exports.handleWebhook = async function handleWebhook({type, event}) {

    let response = {};

    switch (type) {
        // case 'payment_intent.succeeded':
            // console.log(event);
            // await stripe.paymentLinks.update(event.data.object.id,{active: false});
        case 'checkout.session.completed':

          console.log(event.data.object.metadata);
          let metadata = event.data.object.metadata;

          const { data, error } = await supabase
            .from('advertisements')
            .update({ payment_fulfilled: true })
            .match({ id: metadata.adID })

          if (error) {
            console.log(error.message);
            response.error = error.message;
            return response;
          } else {
            response.success = true;
            response.adID = metadata.adID;
            return response;
          }

        default:
          console.log(`Unhandled event type ${type}`);
    }

    response.success = true;

}
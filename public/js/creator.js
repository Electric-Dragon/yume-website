import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let creatorUsername = window.location.pathname.split( '/' ).pop()
$('#title').text(`${creatorUsername}'s Profile`)
$('#pageHeading').text(`${creatorUsername}'s Profile`)
$('#username').text(creatorUsername)

$('#sampleArtsContainer').hide();

let supabase,user,creatorId;

var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

let usernames = [];

let creatorType = {
    'a': 'Artist',
    'w': 'Writer'
}

$('#instagram').hide();
$('#discord').hide();
$('#youtube').hide();
$('#workedWith').hide();

$.ajax({
    url: "/keys",
    success: async function( result ) {
  
        result = JSON.parse(result);
  
        supabase = createClient(result.link, result.anon_key);

        user = await supabase.auth.user();

        const { data, error } = await supabase
            .from('public_profile')
            .select()
            .eq('username', creatorUsername)

        if (error) {
            erroralert(error.message);
        } else if (data.length === 0) {
            window.location = "/404";
        } else {

            let {id, pfp, username, description, instagram, reddit, youtube, banner, sample_arts} = data[0];

            creatorId = id;

            $('#userPfp').attr('src', pfp)
            $('#banner').attr('src', banner)
            $('#description').text(description)

            $('#userPfp').on('load', async function() {
                let hexcode = await getProminentColour(pfp);
                $('#userPfp').css('box-shadow', ` 0 20px 40px -20px ${hexcode}`);
                // $('#bigBox').css('box-shadow', ` 0 20px 40px -20px ${hexcode}`);
            });

            $('#banner').on('load', async function() {
                let hexcode = await getProminentColour(banner);
                // $('#userPfp').css('box-shadow', ` 0 20px 40px -20px ${hexcode}`);
                $('#bigBox').css('box-shadow', ` 0 20px 40px -20px ${hexcode}`);
            });

            if (instagram) {
                $('#instagram').show();
                $('#instagram').attr('href', `https://www.instagram.com/${instagram}`);
            }
            
            if (reddit) {
                $('#discord').show();
                $('#discord').click(() => {
                    navigator.clipboard.writeText(reddit).then(() => {
                        successalert('Copied to clipboard!');
                    }).catch(err => {
                        erroralert(err);
                    });
                })
            }

            if (youtube) {
                $('#youtube').show();
                $('#youtube').attr('href', `https://www.youtube.com/c/${youtube}`);
            }

            if (sample_arts) {

                $('#sampleArtsContainer').show();

                $('#templateStep').attr("x-for",`i in ${sample_arts.length}`);

                sample_arts.forEach((art,i) => {
                    $(`#artSample${i+1}`).attr('src', art);
                });

            }

            const { data:series, error:error_ } = await supabase
                .from('series')
                .select('cover,title,id, genre1, genre2, novel, updatedat')
                .order('updatedat', { ascending: false })
                .eq('creator', id)
                .neq('status', 'd')
                .limit(3)

            if (error_) {
                erroralert(error_.message);
            } else {
                series.forEach(showElement)
            }

            const {data:mostPopularSeries, error:mostPopularSeriesError} = await supabase
                .from('series_popularity')
                .select('series!inner(cover,title,id,genre1,genre2,updatedat)')
                .order('popularity_score', { ascending: false })
                .eq('series.creator', id)
                .neq('series.status', 'd')
                .limit(1)

            if (mostPopularSeriesError) {
                erroralert(mostPopularSeriesError.message);
            } else {

                let {id, title, cover, genre1, genre2, updatedat} = mostPopularSeries[0].series;

                $('#mostPopularSeriesCover').attr('src', cover);
                $('#mostPopularSeriesTitle').text(title);
                $('#mostPopularSeriesTItle').attr('href', `/series/${id}`);
                $('#mostPopularSeriesGenres').text(`${genre1}, ${genre2}`);
                $('#mostPopularSeriesLastUpdated').text(`${days[new Date(updatedat).getDay()]}, ${new Date(updatedat).getDate()}/${new Date(updatedat).getMonth()+1}/${new Date(updatedat).getFullYear()}`);

                let {data:seriesTotalLikes, error:seriesTotalLikesError} = await supabase
                    .from('series_total_likes')
                    .select('count')
                    .eq('seriesid', id);

                if (seriesTotalLikesError) {
                    erroralert(seriesTotalLikesError.message);
                } else {
                    $('#mostPopularSeriesLikes').text(seriesTotalLikes[0].count);
                }

                const { data:seriesFollows, error:seriesFollowsError } = await supabase
                    .rpc('get_series_follows', { seriesid: id });

                if (seriesFollowsError) {
                    erroralert(seriesFollowsError.message);
                } else {
                    $('#mostPopularSeriesFollows').text(seriesFollows);
                }

            }

            const {data:workedWith, error:error_2} = await supabase
                .from('series')
                .select('adaptation(creator(username,pfp,creator_type))')
                .eq('creator', id)
                .neq('status', 'd')

            
            if (error_2) {
                erroralert(error_2.message);
            } else {
                workedWith.forEach(val=> {

                    let {adaptation} = val

                    if (adaptation) {

                        $('#workedWith').show();

                        let {username, pfp, creator_type} = adaptation.creator;

                        if (!usernames.includes(username) && username !== creatorUsername) {
                            usernames.push(username);

                            let types = '';

                            if (creator_type) {
                                creator_type.forEach((type,index)=> {
                                types+=creatorType[type];
                                if (index === 0 && creator_type.length > 1) {
                                    types+=' & ';
                                }
                                })
                            }

                            let element =  `<div class="group relative dark:text-white">
                                                    <div class="shadow-lg object-cover aspect-square rounded-full bg-gray-200 aspect-w-1 aspect-h-1 overflow-hidden group-hover:opacity-75">
                                                        <img class=" aspect-square object-cover h-full" src="${pfp}" class=" object-center object-cover">
                                                    </div>
                                                    <div class="mt-4 flex justify-between">
                                                        <div>
                                                            <h3 class="text-sm">
                                                            <a href="/user/${username}" class="text-gray-700 font-bold dark:text-gray-100">
                                                                <span aria-hidden="true" class="absolute inset-0"></span>
                                                                ${username}
                                                            </a>
                                                            <br>
                                                            <a href="/user/${username}">
                                                            <span aria-hidden="true" class="text-xs absolute inset-0 text-gray-300"></span>
                                                            </a>
                                                            <p class="text-xs text-gray-500 dark:text-gray-500">${types}</p>
                                                            </h3>
                                                        </div>
                                                    </div>
                                            </div>`

                                $('#workedWithContainer').append(element);
                        }

                    }
                })
            }

        }
       
}});

async function showElement (val) {

        let {id, title, cover, genre1, genre2, novel, updatedat} = val;

        let date = new Date(updatedat);

        let type = novel ? 'Web Novel' : 'Web Comic';

        const { data:seriesFollows, error:seriesFollowsError } = await supabase
            .rpc('get_series_follows', { seriesid: id });

        if (seriesFollowsError) {
            erroralert(seriesFollowsError.message);
        }

        let element =  `
                        <tr class="text-gray-700 dark:text-gray-400">
                            <td class="px-4 py-3">
                                <div class="flex items-center text-sm">
                                    <div class="relative hidden w-8 h-8 mr-3 rounded-full md:block">
                                        <img
                                            class="object-cover w-full h-full rounded-sm"
                                            src="${cover}"
                                            alt="${title}'s cover image"
                                            loading="lazy" />
                                    <div
                                        class="absolute inset-0 rounded-full shadow-inner"
                                        aria-hidden="true">
                                    </div>
                                    </div>
                                    <div>
                                        <a href="/series/${id}">
                                            <p class="font-semibold">${title}</p>
                                        </a>
                                        <p class="text-xs text-gray-600 dark:text-gray-400">
                                            ${genre1}, ${genre2}
                                        </p>
                                    </div>
                                </div>
                                </td>
                                <td class="px-4 py-3 text-sm">
                                ${type}
                                </td>
                                <td class="px-4 py-3 text-sm">
                                ${seriesFollows}
                                </td>
                                <td class="px-4 py-3 text-sm">
                                    ${days[date.getDay()]}, ${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}
                                </td>
                        </tr>`


        $('#seriesContainer').append(element);

}

window.viewAll = async function viewAll() {

    const { data:series, error:error_ } = await supabase
                .from('series')
                .select('cover,title,id, genre1, genre2, novel, updatedat')
                .order('updatedat', { ascending: false })
                .eq('creator', creatorId)
                .neq('status', 'd')

    if (error_) {
        erroralert(error_.message);
    } else {

        $('#seriesContainer').empty();
        $('#btnViewAll').hide();

        series.forEach(showElement)
    }

}
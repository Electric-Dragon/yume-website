import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let creatorUsername = window.location.pathname.split( '/' ).pop()
$('#title').text(`${creatorUsername}'s Profile`)
$('#pageHeading').text(`${creatorUsername}'s Profile`)
$('#username').text(creatorUsername)

$('#sampleArtsContainer').hide();
$('#btnDonate').hide();

let supabase,user,creatorId,selectSeriesId;

let following = false;

var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

let usernames = [];
let seriesElements = [];

let creatorType = {
    'a': 'Artist',
    'w': 'Writer'
}

let adapteeType = {
    'a': 'Web Comic',
    'w': 'Web Novel'
}

$('#instagram').hide();
$('#discord').hide();
$('#youtube').hide();
$('#workedWith').hide();

for (let i = 0; i < 7; i++) {
    $(`#artSample${i}`).hide();
}

dayjs.extend(window.dayjs_plugin_relativeTime);

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

            let {id, pfp, username, description, instagram, reddit, youtube, banner, sample_arts, creator_type, verified} = data[0];

            creatorId = id;

            if (!user || id === user.id) {
                $('#btnRequest').hide();
            }

            $('#userPfp').attr('src', pfp)
            $('#banner').attr('src', banner)
            $('#description').text(description)
            $('#adaptee').text(adapteeType[creator_type])

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

            if (verified) {
                $('#verified').show();
                $("#btnDonate").show();
            }
            
            if (sample_arts.length > 0) {

                $('#sampleArtsContainer').show();

                sample_arts.forEach((art,i) => {
                    $(`#artSample${i}`).show();
                    $(`#artSample${i}`).attr('src', art);
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
                .select('series!inner(cover,title,id,genre1,genre2,summary)')
                .order('popularity_score', { ascending: false })
                .eq('series.creator', id)
                .neq('series.status', 'd')
                .limit(1)

            if (mostPopularSeriesError) {
                erroralert(mostPopularSeriesError.message);
            } else {

                let {id, title, cover, genre1, genre2, summary} = mostPopularSeries[0].series;

                var words = summary.split(" ");

                if (words.length > 50) {
                  summary = "";
                  for (let i = 0; i < 50; i++) {
                    summary += words[i] + " ";
                  }
                  summary += "...";
                }

                $('#mostPopularCover').attr('src', cover);
                $('#mostPopularTitle').text(title);
                $('#mostPopularTitle').attr('href', `/series/${id}`);
                $('#mostPopularSummary').text(summary);
                $('#mostPopularGenre1').text(genre1);
                $('#mostPopularGenre2').text(genre2);

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

            const {data:creatorTotalLikeCount, error:creatorTotalLikeCountError} = await supabase
                .from('creator_total_likes')
                .select('total_likes')
                .eq('creator_id', id)
                .single();
            
            if (creatorTotalLikeCountError) {
                erroralert(creatorTotalLikeCountError.message);
            } else {
                $('#creatorTotalLikeCount').text(creatorTotalLikeCount.total_likes);
            }

            const { data:seriesCountForCreator, error:seriesCountForCreatorError } = await supabase
                .rpc('get_series_count_for_user', { userid: id })


            if (seriesCountForCreatorError) {
                erroralert(seriesCountForCreatorError.message);
            } else {
                $('#creatorTotalSeriesCount').text(seriesCountForCreator);
            }

            const {data: followingCreator, error:followingError} = await supabase
                .from('creator_follows')
                .select('id')
                .eq('follower', user.id)
                .eq('following', id)
                .maybeSingle();
            
            if (followingError) {
                erroralert(followingError.message);
            } else {

                $('#btnFollowCreator').on('click',function() {
                    toggleFollow(id)
                })

                if (followingCreator) {
                    following = true;
                    $('#btnFollowCreator').text('Unfollow');
                } else {
                    following = false;
                    $('#btnFollowCreator').text('Follow');
                }
            }

            const { data:feed, error:feedError } = await supabase
            .from('feed')
            .select('created_at,message')
            .order('created_at', { ascending: false })
            .eq('creator', id)
            .limit(3)

            if (feedError) {
                erroralert(feedError.message);
            } else {

                if (feed.length === 0) {
                    $('#feedContainer').append(`<p class="text-gray-500 text-lg mb-2 mt-10">No posts by creator</p>`)
                }


                feed.forEach((comment) => {

                    let {created_at, message} = comment;

                    let date = new Date(created_at);

                    let element = `<div class="flex justify-center">
                                        <div class="min-w-full">
                                            <div class="block rounded-lg  bg-white mt-6 shadow-md shadow-cyan-300">
                                                <div class="md:flex md:flex-row">
                                                    <div class="md:ml-6 md:mr-6">
                                                        <p class="text-gray-500 font-light mb-2 text-md mt-2">
                                                       ${message}
                                                        </p>
                                                        <p class="text-gray-500 text-xs mb-2">${dayjs(date).fromNow()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>`

                    $('#feedContainer').append(element);

                })

            }

            const {data:workedWith, error:error_2} = await supabase
                .from('series')
                .select('adaptation(creator:public_profile!series_creator_fkey(username,pfp,creator_type))')
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

$('#searchBar').on('input', async function() {

    let search = $('#searchBar').val();
    let query = '';
  
    if (search.length > 0) {
      let splitSearch = search.split(' ');
  
      splitSearch.forEach(word => {
  
        if (word!=='') {
          if(query === '') {
            query = `'${word}'`;
          } else {
            query = `${query} | '${word}'`;
          }
        }
  
      });
  
      const { data, error } = await supabase
      .from('series')
      .select('id,title,novel,cover')
      .eq('creator', user.id)
      .textSearch('fts', query)
  
      if (error) {
        erroralert(error.message);
      } else {
  
        if (data.length === 0) {
          $('#seriesHolder').empty();
          $('#seriesHolder').append(`<p class="text-center text-gray-500 text-lg">No results found</p>`);
          return;
        }
  
        $('#seriesHolder').empty();

        seriesElements = [];
  
        data.forEach(appendElement)
  
      }
  
    }
  
})

$('#btnClearSelection').on('click', function () {

    $('#searchBar').val('');
    $('#seriesHolder').empty();
    seriesElements = [];
    selectSeriesId = null;

});
  
function appendElement(val,index) {
      let {id, title, novel, cover} = val;
      
      let type = novel ? 'Novel' : 'Comic';
    
      let element = `<div onclick="selectSeries('${id}',${index})" class="flex items-center bg-gray-200 border-2  cursor-pointer rounded-md p-2 hover:border-light-blue-1">
                        <img class="aspect-square object-cover w-1/5" src="${cover}" alt="">
                        <div class="flex flex-col">
                            <p class="text-md pl-7 font-poppins font-bold">${title}</p>
                            <p class="text-md pl-7 font-poppins">Web ${type}</p>
                        </div>
                    </div>`
    
      $('#seriesHolder').append(element);
      seriesElements.push(element);
  }

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

window.selectSeries = function selectSeries(id, index) {

    $('#seriesHolder').empty();
    $('#seriesHolder').append(seriesElements[index]);
    $('#searchBar').val('');
    
    selectSeriesId = id;

}

window.updateCharCount = function updateCharCount(e)  {

    let {value} = e.target;

    $('#shortMessageHeading').text(`Short Message (${70-value.length} characters left)`);

}

window.sendRequest = async function sendRequest(e) {

    e.preventDefault();

    if (creatorId === user.id) {
        erroralert('Use the series page to create an adaptation');
        return;
    }

    $('#btnSendRequest').text('Sending...');
    $('#btnSendRequest').attr('disabled', true);

    let msg = $('#shortMessage').val();

    if (!selectSeriesId) {
        erroralert('Please select a series');
        $('#btnSendRequest').text('Send');
        $('#btnSendRequest').attr('disabled', false);
        return;
    }else if (!msg) {
        erroralert('Please enter a short message');
        $('#btnSendRequest').text('Send');
        $('#btnSendRequest').attr('disabled', false);
        return;
    } else {

        const { data, error } = await supabase
        .from('adaptation_notifications')
        .insert([
          { from_id: user.id, to_id: creatorId, target_series: selectSeriesId, status: 'p', message: msg, is_own: true }
        ])

        if (error) {
            erroralert(error.message);
        } else {
            $('#btnSendRequest').text('Sent');
            successalert('Request Sent', function() {
            window.location.reload();
            });
        }

    }

}

async function toggleFollow(id) {

    if (user.id === id) {
        erroralert('You cannot follow yourself');
        return;
    }

    $('#btnFollow').attr('disabled', true);

    if (following) {

        $('#btnFollow').text('Unfollowing...');

        const {data, error} = await supabase
            .from('creator_follows')
            .delete()
            .match({follower: user.id, following: id})

        if (error) {
            erroralert(error.message);
            $('#btnFollow').attr('disabled', false);
            $('#btnFollow').text('Unfollow');
            return;
        }

        $('#btnFollow').text('Follow');
        $('#btnFollow').attr('disabled', false);
        following = false;

 
    } else {

        $('#btnFollow').text('Following...');

        const {data, error} = await supabase
            .from('creator_follows')
            .insert([{follower: user.id, following: id}])

        if (error) {
            erroralert(error.message);
            $('#btnFollow').attr('disabled', false);
            $('#btnFollow').text('Follow');
            return;
        }

        $('#btnFollow').text('Unfollow');
        $('#btnFollow').attr('disabled', false);
        following = true;

    }
    
}
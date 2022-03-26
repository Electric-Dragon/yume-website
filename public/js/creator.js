import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';
// import * as Vibrant from "/js/vibrant.min.js";

let username = window.location.pathname.split( '/' ).pop()
$('#title').text(`${username}'s Profile`)
$('#username').text(username)

let supabase,user;

var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

$('#instagram').hide();
$('#discord').hide();
$('#youtube').hide();

$.ajax({
    url: "/keys",
    success: async function( result ) {
  
        result = JSON.parse(result);
  
        supabase = createClient(result.link, result.anon_key);

        user = await supabase.auth.user();

        const { data, error } = await supabase
            .from('public_profile')
            .select()
            .eq('username', username)

        if (error) {
            erroralert(error.message);
        } else if (data.length === 0) {
            window.location = "/404";
        } else {

            let {id, pfp, username, description, instagram, reddit, youtube, banner} = data[0];

            $('#userPfp').attr('src', pfp)
            $('#banner').attr('src', banner)
            $('#description').text(description)

            $('#userPfp').on('load', async function() {
                let hexcode = await getProminentColour(pfp);
                $('#userPfp').css('box-shadow', ` 0 20px 40px -20px ${hexcode}`);
                // $('#bigBox').css('box-shadow', ` 0 20px 40px -20px ${hexcode}`);
                console.log(hexcode);
            });

            $('#banner').on('load', async function() {
                let hexcode = await getProminentColour(banner);
                // $('#userPfp').css('box-shadow', ` 0 20px 40px -20px ${hexcode}`);
                $('#bigBox').css('box-shadow', ` 0 20px 40px -20px ${hexcode}`);
                console.log(hexcode);
            });

            if (instagram) {
                $('#instagram').show();
                $('#instagram').attr('href', `https://www.instagram.com/${instagram}`);
            }
            
            if (reddit) {
                $('#discord').show();
                $('#discord').click(() => {
                    successalert(reddit);
                })
            }

            if (youtube) {
                $('#youtube').show();
                $('#youtube').attr('href', `https://www.youtube.com/c/${youtube}`);
            }

            const { data:series, error:error_ } = await supabase
                .from('series')
                .select('cover,title,id, genre1, genre2, publicchapcount, like_count, updatedat')
                .order('updatedat', { ascending: false })
                .eq('creator', id)
                .neq('status', 'd')
                .limit(3)

            if (error_) {
                erroralert(error_.message);
            } else {

                series.forEach(val=> {

                    let {id, title, cover, genre1, genre2, publicchapcount, like_count, updatedat} = val;

                    let date = new Date(updatedat);

                    let element =  `
                                    <tr class="text-gray-700 dark:text-gray-400">
                                        <td class="px-4 py-3">
                                            <div class="flex items-center text-sm">
                                                <div class="relative hidden w-8 h-8 mr-3 rounded-full md:block">
                                                    <img
                                                        class="object-cover w-full h-full rounded-sm"
                                                        src="${cover}"
                                                        alt=""
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
                                            ${publicchapcount}
                                            </td>
                                            <td class="px-4 py-3 text-sm">
                                            ${like_count}
                                            </td>
                                            <td class="px-4 py-3 text-sm">
                                                ${days[date.getDay()]}, ${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}
                                            </td>
                                    </tr>`


                    $('#seriesContainer').append(element);

                })


            }

        }
       
}});
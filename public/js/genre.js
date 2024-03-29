import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let supabase,user;

let genre = window.location.pathname.split( '/' ).pop();

$.ajax({
    url: "/keys",
    success: async function( result ) {
  
        result = JSON.parse(result);
  
        supabase = createClient(result.link, result.anon_key);
  
        user = supabase.auth.user();
  
        const { data, error } = await supabase
          .from('series')
          .select('id,title,cover,creator:public_profile!series_creator_fkey(username)')
          .neq('status', 'd')
          .order('updatedat', { ascending: false })
          .or(`genre1.eq.${genre},genre2.eq.${genre}`)
          .limit(10)
  
        if (error) {
          erroralert(error.message);
        } else {
  
          data.forEach(val=> {
  
            let {id, title, cover, creator:{username}} = val;
  
            let element = `<div class="group relative dark:text-white">
                                <div class="object-cover aspect-square bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75">
                                    <img class="aspect-square object-cover h-full" src="${cover}" class=" object-center object-cover">
                                </div>
                                <div class="mt-4 flex justify-between">
                                    <div>
                                        <h3 class="text-sm">
                                        <a href="/series/${id}" class="text-gray-700 font-bold dark:text-gray-100">
                                            <span aria-hidden="true" class="absolute inset-0"></span>
                                            ${title}
                                        </a>
                                        <br>
                                        <a href="/series/${id}">
                                        <span aria-hidden="true" class="text-xs absolute inset-0 text-gray-300"></span>
                                        <p class="text-xs text-gray-500 dark:text-gray-500">by ${username}</p>
                                        </a>
                                        </h3>
                                    </div>
                                </div>
                           </div>`
  
            $('#recentlyPub').append(element);
  
          });
  
        }

        const {data:popularSeries, error:popularSeriesError} = await supabase
                .from('series_popularity')
                // .select('series!inner(cover,title,id,creator:public_profile!series_creator_fkey(username))')
                .select('series_id')
                .order('popularity_score', { ascending: false })
                .or(`genre1.eq.${genre},genre2.eq.${genre}`)
                .neq('status', 'd')
                .limit(6)
        if (popularSeriesError) {
          erroralert(popularSeriesError.message);
          console.log(popularSeriesError);
        } else {

          let seriesInfos = [];

          for (const series of popularSeries) {

            const {data:seriesInfo, error:seriesInfoError} = await supabase
                .from('series')
                .select('cover,title,id,creator:public_profile!series_creator_fkey(username)')
                .eq('id', series.series_id)
                .limit(1)
                .maybeSingle();
            
            if (seriesInfoError) {
              erroralert(seriesInfoError.message);
            } else {
              seriesInfos.push(seriesInfo);
            }

          }

          seriesInfos.forEach(val=> {

            let {id, title, cover, creator:{username}} = val;

            let element = `<div class="group relative dark:text-white">
                    <div class="object-cover aspect-square bg-gray-200 aspect-w-1 aspect-h-1 rounded-md overflow-hidden group-hover:opacity-75">
                        <img class="aspect-square object-cover h-full" src="${cover}" class=" object-center object-cover>
                    </div>
                    <div class="mt-4 flex justify-between">
                        <div>
                            <h3 class="text-sm">
                            <a href="/series/${id}" class="text-gray-700 font-bold dark:text-gray-100">
                                <span aria-hidden="true" class="absolute inset-0"></span>
                                ${title}
                            </a>
                            <br>
                            <a href="/series/${id}">
                            <span aria-hidden="true" class="text-xs absolute inset-0 text-gray-300"></span>
                            <p class="text-xs text-gray-500 dark:text-gray-500">by ${username}</p>
                            </a>
                            </h3>
                        </div>
                    </div>
                </div>`
  
            $('#popularSeries').append(element);

          });

        }
  
  }});
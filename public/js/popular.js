import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let supabase,user;

let popular = {
  all: null,
  novels: null,
  comics: null
}

$.ajax({
    url: "/keys",
    success: async function( result ) {
  
        result = JSON.parse(result);
  
        supabase = createClient(result.link, result.anon_key);
  
        user = supabase.auth.user();

        const { data, error } = await supabase
            .from('series_popularity')
            // .select('series(id,title,cover,summary,genre1,genre2,creator:public_profile!series_creator_fkey(username))')
            .select('series_id')
            .order('popularity_score', { ascending: false })
            .limit(10)

        if (error) {
            erroralert(error.message);
            console.log(error);
            console.log(error.hint);
        } else {
            popular.all = data;
            receivedData(data);
        }

        $('#filterAll').click(async function () {

          if (!popular.all) {
            const { data, error } = await supabase
            .from('series_popularity')
            .select('series_id')
            .order('popularity_score', { ascending: false })
            .limit(10)

            if (error) {
                erroralert(error.message);
            } else {
                popular.all = data;
                receivedData(data);
            }
          } else {
            receivedData(popular.all);
          }

        });

        $('#filterNovels').click(async function () {

          if (!popular.novels) {
            const { data, error } = await supabase
            .from('series_popularity')
            .select('series_id')
            .eq('novel',true)
            .order('popularity_score', { ascending: false })
            .limit(10)

            if (error) {
                erroralert(error.message);
            } else {
                popular.novels = data;
                receivedData(data);
            }
          } else {
            receivedData(popular.novels);
          }

        });

        $('#filterComics').click(async function () {
            
            if (!popular.comics) {
              const { data, error } = await supabase
              .from('series_popularity')
              .select('series_id')
              .eq('novel',false)
              .order('popularity_score', { ascending: false })
              .limit(10)
  
              if (error) {
                  erroralert(error.message);
              } else {
                  popular.comics = data;
                  receivedData(data);
              }
            } else {
              receivedData(popular.comics);
            }
  
        });
  
}});

async function receivedData(data) {

  let series = [];

  for (const seriesid of data) {

    const { data:seriesInfo, error } = await supabase
            .from('series')
            .select('id,title,cover,summary,genre1,genre2,creator:public_profile!series_creator_fkey(username))')
            .eq('id',seriesid.series_id)
            .limit(1)
            .maybeSingle();

    if (error) {
        erroralert(error.message);
    } else {
        series.push(seriesInfo);
    }

  }
  
  let {id, title, cover, summary, genre1, genre2, creator} = series[0];

  var words = summary.split(" ");

  if (words.length > 50) {
    summary = "";
    for (let i = 0; i < 50; i++) {
      summary += words[i] + " ";
    }
    summary += "...";
  }

  $('#mostPopularTitle').text(title);
  $('#mostPopularTitle').attr('href', `/series/${id}`);
  $('#mostPopularCover').attr('src', cover);
  $('#mostPopularSummary').text(summary);
  $('#mostPopularGenre1').text(genre1);
  $('#mostPopularGenre2').text(genre2);
  $('#mostPopularCreatorUsername').text(`By ${creator.username}`);
  $('#mostPopularCreatorUsername').attr('href', `/user/${creator.username}`);

  let first = series.shift();

  $('#seriesContainer').empty();

  series.forEach(showSeries);

  series.unshift(first);
}

async function showSeries(val, index) {

  let {id, title, cover, genre1, genre2, creator} = val;

  let element = `
                  <tr class="text-gray-700 dark:text-gray-400">
                    <td class="px-4 py-3">
                      <div class="flex items-center text-sm">
                        <div
                          class="relative  w-8 h-8 mr-3 rounded-full md:block"
                        >
                          <img
                            class="object-cover w-full h-full rounded-sm"
                            src="${cover}"
                            alt=""
                          />
                          <div
                            class="absolute inset-0 rounded-full shadow-inner"
                            aria-hidden="true"
                          ></div>
                        </div>
                        <div>
                          <a href="/series/${id}" class="font-semibold"><span class="mr-3 ml-2">${index+2}.</span>${title}</a> 
                          <p class="text-xs text-gray-600 dark:text-gray-400 ml-8">
                            ${genre1}, ${genre2}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-sm">
                      <a href="/user/${creator.username}">
                        ${creator.username}
                      </a>
                    </td>
                  </tr>
  `;

  $('#seriesContainer').append(element);

}
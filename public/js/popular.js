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
            .select('series!inner(id,title,cover,summary,genre1,genre2,creator(username))')
            .order('popularity_score', { ascending: false })
            .limit(10)

        if (error) {
            erroralert(error.message);
        } else {
            popular.all = data;
            receivedData(data);
        }

        $('#filterAll').click(async function () {

          if (!popular.all) {
            const { data, error } = await supabase
            .from('series_popularity')
            .select('series!inner(id,title,cover,summary,genre1,genre2,creator(username))')
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
            .select('series!inner(id,title,cover,summary,genre1,genre2,creator(username))')
            .eq('series.novel',true)
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
              .select('series!inner(id,title,cover,summary,genre1,genre2,creator(username))')
              .eq('series.novel',false)
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
  
  let {id, title, cover, summary, genre1, genre2, creator} = data[0].series;

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
  $('#mostPopularCreator').text(creator.username);

  let first = data.shift();

  $('#seriesContainer').empty();

  data.forEach(showSeries);

  data.unshift(first);
}

async function showSeries(val, index) {

  let {id, title, cover, genre1, genre2, creator} = val.series;

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
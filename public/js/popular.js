import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let supabase,user;

let filter = '';

$.ajax({
    url: "/keys",
    success: async function( result ) {
  
        result = JSON.parse(result);
  
        supabase = createClient(result.link, result.anon_key);
  
        user = supabase.auth.user();

        const { data, error } = await supabase
            .from('series_popularity')
            .select('seriesid')
            .order('popularity_score', { ascending: false })
            .limit(10)

        if (error) {
            erroralert(error.message);
        } else {

            const { data:mostPopular, error: mostPopularError} = await supabase
            .from('series')
            .select('title,cover,summary,genre1,genre2,creator(username)')
            .eq('id', data[0].seriesid)
            .limit(1)
            .single();

            if (mostPopularError) {
                erroralert(mostPopularError.message);
            } else {

                let {title, cover, summary, genre1, genre2, creator} = mostPopular;

                $('#mostPopularTitle').text(title);
                $('#mostPopularCover').attr('src', cover);
                $('#mostPopularSummary').text(summary);
                $('#mostPopularGenre1').text(genre1);
                $('#mostPopularGenre2').text(genre2);
                $('#mostPopularCreator').text(creator.username);

            }

            data.shift();

            data.forEach(async (val,index) => {

                let {seriesid} = val;

                const { data:series, error: seriesError} = await supabase
                    .from('series')
                    .select('title,cover,genre1,genre2,creator(username)')
                    .eq('id', val.seriesid)
                    .limit(1)
                    .single();

                if (seriesError) {
                    erroralert(seriesError.message);
                } else {

                    let {title, cover, genre1, genre2, creator} = series;

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
                                            <p class="font-semibold"><span class="mr-3 ml-2">${index+2}.</span>${title}</p> 
                                            <p class="text-xs text-gray-600 dark:text-gray-400 ml-8">
                                              ${genre1}, ${genre2}
                                            </p>
                                          </div>
                                        </div>
                                      </td>
                                      <td class="px-4 py-3 text-sm">
                                        ${creator.username}
                                      </td>
                                    </tr>
                    `;

                    $('#seriesContainer').append(element);

                }

            });

        }
  
}});
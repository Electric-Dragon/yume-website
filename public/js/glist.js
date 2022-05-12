import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let supabase, user;

let genres = [];

$.ajax({
    url: "/keys",
    success: async function( result ) {
  
        result = JSON.parse(result);
  
        supabase = createClient(result.link, result.anon_key);
  
        user = supabase.auth.user();

        const { data, error } = await supabase
        .from('genres')
        .select()
  
        if (error) {
          erroralert(error.message);
        } else {

            $("#genresContainer").empty();
            
            data.forEach(g => {

              g = g.id
              genres.push(g);

              createGenresElement(g);
               
            });

            $('#searchBar').on('input', function() {
                let search = $(this).val();

                if (search !== "") {
                    let match = genres.filter(g => g.includes(capitalizeFirstLetter(search)));
                    $("#genresContainer").empty();
                    match.forEach(createGenresElement);
                } else {
                    $("#genresContainer").empty();
                    genres.forEach(createGenresElement);
                }

            })
  
        }
  
}});

function createGenresElement(g) {
    $('#genresContainer').append(`<a href="/genre/${g}" class="rounded-md text-center px-3 text-xl font-bold uppercase hover:underline cursor-pointer bg-black dark:bg-white text-white dark:text-black">${g}</a>`)
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}
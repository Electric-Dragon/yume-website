import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let supabase,user;

$.ajax({
    url: "/keys",
    success: async function( result ) {
  
        result = JSON.parse(result);
  
        supabase = createClient(result.link, result.anon_key);
  
        user = supabase.auth.user();
  
}});

$('#searchBar').on('input', async function() {

    let search = $('#searchBar').val();
  
    if (search.length > 0) {

      const { data, error } = await supabase
        .from('public_profile')
        .select('id,pfp,username,description')
        .ilike('username', `${search}%`)
        .limit(7);
  
      if (error) {
        erroralert(error.message);
      } else {
  
        if (data.length === 0) {
          $('#searchResults').empty();
          $('#searchResults').append(`<p class="text-center text-gray-500 text-xl">No users found</p>`);
          return;
        } else {
          $('#searchResults').empty();
          data.forEach(user => {
            showElement(user)
          });
        }
  
      }
  
    } else {
        $('#searchResults').empty();
        $('#searchResults').append(`<p class="text-center text-gray-500 text-xl">Search for users</p>`);
    }
  
});

async function showElement(user) {

    let {id, pfp, username, description} = user;

    const { data:seriesCount, error } = await supabase
        .rpc('get_series_count_for_user', { userid: id })

    if (error) {
        erroralert(error.message);
    }

    let element = `<a href="http://localhost:7001/user/${username}">
                        <div class="max-w-3xl w-full mx-auto z-10">
                            <div class="flex flex-col">
                                <div class="bg-white border border-white shadow-lg  rounded-3xl p-4 m-4">
                                    <div class="flex-none sm:flex">
                                        <div class=" relative h-32 w-32   sm:mb-0 mb-3">
                                            <img src="${pfp}" class=" w-32 h-32 object-cover rounded-2xl" alt="Profile picture">
                                        </div>
                                        <div class="flex-auto sm:ml-5 justify-evenly">
                                            <div class="flex items-center justify-between sm:mt-2">
                                                <div class="flex items-center">
                                                    <div class="flex flex-col">
                                                    <span class="mr-3  font-bold text-blue-500 ">Artist</span>
                                                        <div class="w-full flex-none text-lg text-gray-800 font-bold leading-none">${username}</div>
                                                        <div class="flex-auto text-gray-500 my-1">
                                                            <span class="mr-3 ">${description}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                                <div class="flex pt-2  text-sm text-gray-500">
                                                    <div class="flex-1 inline-flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20"
                                                            fill="currentColor">
                                                            <path
                                                                d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z">
                                                            </path>
                                                        </svg>
                                                        <p class="">1.2k Followers</p>
                                                    </div>
                                                    <div class="flex-1 inline-flex items-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" viewBox="0 0 20 20"
                                                            fill="currentColor">
                                                            <path fill-rule="evenodd"
                                                                d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                                                                clip-rule="evenodd"></path>
                                                        </svg>
                                                        <p class="">${seriesCount} Works</p>
                                                    </div>

                                                    <button  class="flex-no-shrink bg-green-400 hover:bg-green-500 px-5 ml-4 py-2 text-xs shadow-sm hover:shadow-lg font-medium tracking-wider border-2 border-green-300 hover:border-green-500 text-white rounded-full transition ease-in duration-300">Request</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </a>`

    $('#searchResults').append(element);

}
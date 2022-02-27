import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let supabase,user;

$.ajax({
    url: "/keys",
    success: async function( result ) {
  
        result = JSON.parse(result);
  
        supabase = createClient(result.link, result.anon_key);
  
        user = supabase.auth.user();
  
        if (!user) {
          window.location = "/signin";
        }
  
        const { data, error } = await supabase
          .from('series')
          .select('id,title,chapcount,cover')
          .eq('creator', user.id)
          .order('updatedat', { ascending: false })
  
        if (error) {
          erroralert(error.message);
        } else {
  
          data.forEach(val=> {
              
            let {id, title, chapcount, cover} = val;

            let element = `<a href="/dashboard/series/${id}" class="block ">
                  
                                <img
                                alt="Series Cover Illustration"
                                src="${cover}"
                                class="object-cover w-full -mt-3 h-96 transition-shadow ease-in-out duration-300 shadow-none hover:shadow-xl hover:shadow-green-500"
                                />
                        
                                <p class="mt-1 text-lg text-black font-bold dark:text-white">
                                    ${title}
                                </p>
                        
                                <div class="flex items-center justify-between font-bold text-gray-700 dark:text-gray-400">
                                <p class="text-sm">
                                    ${chapcount} eps
                                </p>
                                </div>
                            </a>`

            $('#seriesHolder').append(element);
  
          })
  
        }
  
  }});
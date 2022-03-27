import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let supabase, user;
let size = 0;

let arr = window.location.pathname.split( '/' )
let chapterid = arr[arr.length - 2];
let seriesid = arr[arr.length - 3];

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
        .from('chapters')
        .select('title,seriesid(title)')
        .eq('id', chapterid)
        .single()
  
        if (error) {
          erroralert(error.message);
        } else {
            
            let {title, seriesid} = data;

            $('#seriesTitle').text(seriesid.title);
            $('#title').val(title);
  
        }
  
}});

window.previewPanels = function (e) {

    if (e.target.files.length > 0) {

        let panels = [...e.target.files];

        panels.sort(function(a, b) {
            a = Number(a.name.split('.')[0]);
            b = Number(b.name.split('.')[0]);
            return a - b
        });

        panels.forEach(file => {

            let link = URL.createObjectURL(file);

            size+=(file.size/1000000);

            let element = `
                            <div class="w-full p-4 lg:w-50 lg:h-full">
                                <div class=" bg-white border rounded shadow-sm ">
                                    <div class="relative">
                                        <img class="h-60 object-cover " src="${link}" alt="${file.name}">
                                        <p class="text-gray-600">${file.name}</p>
                                    </div>                          
                                </div>
                            </div>`

            $('#panelPreviewContainer').append(element);

        });

        $('#totalSize').text(`${size.toFixed(2)} MB / 20 MB`);

    }

}
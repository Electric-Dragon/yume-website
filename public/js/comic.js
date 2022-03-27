import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';

let supabase, user;
let size = 0;
let panels, publicURLS = [];

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
        .select('title,images,seriesid(title)')
        .eq('id', chapterid)
        .single()
  
        if (error) {
          erroralert(error.message);
        } else {
            
            let {title,images, seriesid} = data;

            $('#seriesTitle').text(seriesid.title);
            $('#title').val(title);

            images.forEach(image => {
                let element = `
                            <div class="w-full p-4 lg:w-50 lg:h-full">
                                <div class=" bg-white border rounded shadow-sm ">
                                    <div class="relative">
                                        <img class="h-60 object-cover " src="${image}">
                                    </div>                          
                                </div>
                            </div>`

                $('#panelPreviewContainer').append(element);
            })
  
        }
  
}});

window.previewPanels = function (e) {

    if (e.target.files.length > 0) {

        panels = [...e.target.files];

        panels.sort(function(a, b) {
            a = Number(a.name.split('.')[0]);
            b = Number(b.name.split('.')[0]);
            return a - b
        });

        panels.forEach((file,index) => {

            let link = URL.createObjectURL(file);

            size+=(file.size/1000000);

            let element = `
                            <div class="w-full p-4 lg:w-50 lg:h-full">
                                <div class=" bg-white border rounded shadow-sm ">
                                    <div class="relative">
                                        <div onclick="deleteOne(${index})" class=" top-0 right-0 p-0 m-0 absolute">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"  fill="currentColor" class="text-red-500  " viewBox="0 0 0.1 9">
                                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
                                            </svg>
                                        </div>
                                    </div>
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

window.saveChanges = async function saveChanges(publish) {

    let title = $('#title').val();

    if (size > 20) {
        erroralert('Total size of uploaded files is greater than 20 MB');
        return;
    }
    if (panels.length === 0) {
        erroralert('Please upload at least one panel');
        return;
    }

    if (!title) {
        erroralert('Please fill in the title');
        return;
    }

    $('#btnSaveDraft').prop('disabled', true);
    $('#btnPublish').prop('disabled', true);

    for (const file of panels) {

        let route = `${user.id}/series/${seriesid}/chapters/${chapterid}/${file.name}`;

        const { data, error } = await supabase
        .storage
        .from('users')
        .upload(route, file, {
            cacheControl: '3600',
            upsert: true
        });

        if (error) {
            erroralert(error.message);
            $('#btnSaveDraft').prop('disabled', false);
            $('#btnPublish').prop('disabled', false);
        } else {
            const { publicURL, error:error_ } = supabase
                .storage
                .from('users')
                .getPublicUrl(route);
            
            if (error_) {
                erroralert(error_.message);
                $('#btnSaveDraft').prop('disabled', false);
                $('#btnPublish').prop('disabled', false);
            } else {
                publicURLS.push(publicURL);
            }
            
        }   
    }

    const {data:data_, error:error_} = await supabase.from('chapters')
            .update({ title: title, images: publicURLS, is_published: publish })
            .match({ id: chapterid });

    if (error_) {
        erroralert(error.message);
        $('#btnSaveDraft').prop('disabled', false);
        $('#btnPublish').prop('disabled', false);
    } else {
        let text = publish ? 'published' : 'saved as draft';
        successalert(`Chapter ${text} successfully`, function() {
            window.location = `/dashboard/series/${seriesid}`;
        });
    }

}

window.deleteAll = function() {
    $('#panelPreviewContainer').empty();
    $('#totalSize').text('0 MB / 20 MB');
    size = 0;
    panels = [];
    $('#panels').prop('files', []);
}

window.deleteOne = function(index) {
    console.log(index);
    $('#panelPreviewContainer').children().eq(index).remove();
}
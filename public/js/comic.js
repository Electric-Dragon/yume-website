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

        panels = [...e.target.files];

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
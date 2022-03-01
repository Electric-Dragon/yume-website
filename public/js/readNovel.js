import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";
import {erroralert, successalert} from '/js/salert.js';
let supabase, editor;

let arr = window.location.pathname.split( '/' )
let chapterid = arr[arr.length - 1];
let seriesid = arr[arr.length - 2];

$.ajax({
    url: "/keys",
    success: async function( result ) {
  
        result = JSON.parse(result);
  
        supabase = createClient(result.link, result.anon_key);

        const {data, error} = await supabase
          .from('chapters')
          .select('title,body,createdat,chapternum')
          .eq('id', chapterid)
          .single();
        if (error) {
            erroralert(error.message);
        } else {

            let {title, body, createdat, chapternum} = data;

            $('#chapTitle').text(title);
            $('#title').text(title);

            let date = new Date(createdat);
            console.log(date.getMonth());
            $('#chapDate').text(`${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`);

            editor = new EditorJS({
                holder:'editorjs',
                placeholder: 'Write your next masterpiece!',
                tools: {
                    header: {
                        class: Header,
                        shortcut: 'CMD+SHIFT+H',
                        inlineToolbar: ['link'],
                        levels: [2, 3, 4],
                        defaultLevel: 3
                    }
                },
                readOnly: true,
                data: body
            });
        }
}});
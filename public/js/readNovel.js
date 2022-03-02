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
          .select('title,body,createdat,chapternum,seriesid(id,genre1,genre2)')
          .eq('id', chapterid)
          .single();
        if (error) {
            erroralert(error.message);
        } else {

            let {title, body, createdat, chapternum, seriesid} = data;

            $('#chapTitle').text(title);
            $('#title').text(title);

            let date = new Date(createdat);
            $('#chapDate').text(`${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`);

            $('#genre1').attr('href',`/genres/${seriesid.genre1}`);
            $('#genre1').text(seriesid.genre1);

            $('#genre2').attr('href',`/genres/${seriesid.genre2}`);
            $('#genre2').text(seriesid.genre2);

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

            const {data:prevChap, error} = await supabase
                .from('chapters')
                .select('id,title')
                .match({seriesid:seriesid.id,chapternum:chapternum-1})
                .maybeSingle()

            const {data:nextChap, _} = await supabase
                .from('chapters')
                .select('id,title')
                .match({seriesid:seriesid.id,chapternum:chapternum+1})
                .maybeSingle()

            if (prevChap) {
                $('#prevChap').attr('href',`/read/novel/${seriesid.id}/${prevChap.id}`);
                $('#prevChap').text(`< ${prevChap.title}`);
            }

            if (nextChap) {
                $('#nextChap').attr('href',`/read/novel/${seriesid.id}/${nextChap.id}`);
                $('#nextChap').text(`${nextChap.title} >`);
            }

        }
}});